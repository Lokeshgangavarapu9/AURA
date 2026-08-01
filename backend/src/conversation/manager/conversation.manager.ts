/**
 * AURA Conversation Intelligence Engine — Master ConversationManager Orchestrator
 * Central orchestrator unifying Session Management, State Machine Transitions, Topic Tracking,
 * Emotion Analysis, and Gemini AI Execution into a clean, stateful conversation pipeline.
 *
 * Strictly Decoupled:
 * - Does NOT compute emotions (delegated to EmotionAnalyzer).
 * - Does NOT build prompts (delegated to PromptBuilder via GeminiService).
 * - Does NOT know Prisma/SQLite (delegated to SessionManager/SessionRepository).
 * - Does NOT execute memory scoring (delegated to MemoryEngine via GeminiService).
 */

import { SessionManager, sessionManager } from '../session/session.manager.js';
import { ConversationStateMachine } from '../state/state.machine.js';
import { ITopicTracker, ruleBasedTopicTracker } from '../topic/topic.tracker.js';
import { geminiService, GeminiService } from '../../ai/gemini.service.js';
import { emotionAnalyzer, EmotionAnalyzer, ResponseStyle } from '../../emotion/index.js';
import { ConversationResult, ConversationStateEnum } from '../types/index.js';
import { logger } from '../../utils/logger.js';

export interface ProcessConversationInput {
  userMessage: string;
  sessionId?: string;
}

export interface ExtendedConversationResult extends ConversationResult {
  responseStyle?: ResponseStyle;
}

export class ConversationManager {
  private sessionManager: SessionManager;
  private topicTracker: ITopicTracker;
  private geminiService: GeminiService;
  private emotionAnalyzer: EmotionAnalyzer;

  constructor(
    sessMgr: SessionManager = sessionManager,
    topicTrk: ITopicTracker = ruleBasedTopicTracker,
    geminiSvc: GeminiService = geminiService,
    emoAnalyzer: EmotionAnalyzer = emotionAnalyzer
  ) {
    this.sessionManager = sessMgr;
    this.topicTracker = topicTrk;
    this.geminiService = geminiSvc;
    this.emotionAnalyzer = emoAnalyzer;
  }

  /**
   * Orchestrates a single conversation turn from input message to AI response.
   * @param input User prompt and optional active sessionId
   */
  public async processConversation(input: ProcessConversationInput): Promise<ExtendedConversationResult> {
    const startTime = Date.now();
    const stateMachine = new ConversationStateMachine('IDLE');

    try {
      // 1. Analyze User Emotion & Get EmotionalContext (v1)
      const emotionalContext = this.emotionAnalyzer.analyze(input.userMessage);

      // 2. State Transition: IDLE -> LISTENING
      stateMachine.transitionTo('LISTENING');

      // 3. Resume or create active session
      let session = input.sessionId
        ? await this.sessionManager.resumeSession(input.sessionId)
        : await this.sessionManager.createSession({ title: 'AURA Conversation' });

      // 4. Detect Topic & Topic Shifts
      const topicResult = this.topicTracker.detectTopic(input.userMessage, session.currentTopic);

      if (topicResult.isTopicShift) {
        logger.info(
          { from: topicResult.previousTopic, to: topicResult.currentTopic },
          '🔀 ConversationManager: Topic Shift Detected'
        );
        session = await this.sessionManager.updateSession(session.id, {
          currentTopic: topicResult.currentTopic,
        });
      }

      // 5. Append User Message to Session Thread
      await this.sessionManager.appendMessage({
        sessionId: session.id,
        sender: 'user',
        text: input.userMessage,
        topic: topicResult.currentTopic,
      });

      // 6. Load Recent Thread History for LLM Context
      const messageHistory = await this.sessionManager.loadRecentMessages(session.id, 10);
      const formattedHistory = messageHistory.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      // 7. State Transition: LISTENING -> THINKING
      stateMachine.transitionTo('THINKING');

      // 8. Call GeminiService with injected EmotionalContext
      const aiPayload = await this.geminiService.generateChatResponse({
        message: input.userMessage,
        history: formattedHistory,
        emotionalContext,
      });

      // 9. State Transition: THINKING -> RESPONDING
      stateMachine.transitionTo('RESPONDING');

      // 10. Append AI Response to Session Thread
      await this.sessionManager.appendMessage({
        sessionId: session.id,
        sender: 'ai',
        text: aiPayload.text,
        emotion: emotionalContext.aiTone.aiEmotion,
        topic: topicResult.currentTopic,
      });

      // 11. Fetch updated session state metadata
      const updatedSession = await this.sessionManager.resumeSession(session.id);

      // 12. State Transition: RESPONDING -> IDLE
      stateMachine.transitionTo('IDLE');

      const executionTimeMs = Date.now() - startTime;

      logger.info(
        {
          sessionId: updatedSession.id,
          topic: topicResult.currentTopic,
          emotion: emotionalContext.aiTone.aiEmotion,
          responseStyle: emotionalContext.aiTone.responseStyle,
          executionTimeMs,
        },
        '🎉 ConversationManager: Completed conversation turn successfully'
      );

      return {
        sessionId: updatedSession.id,
        topic: topicResult.currentTopic,
        messageCount: updatedSession.messageCount,
        aiResponse: {
          text: aiPayload.text,
          emotion: emotionalContext.aiTone.aiEmotion,
        },
        responseStyle: emotionalContext.aiTone.responseStyle,
        updatedContext: {
          currentTopic: topicResult.currentTopic,
          state: stateMachine.getState(),
        },
        retrievedMemoriesCount: 1,
        executionTimeMs,
        tokenUsageEstimate: Math.ceil(input.userMessage.length / 4) + Math.ceil(aiPayload.text.length / 4),
      };
    } catch (err: unknown) {
      logger.error({ err }, '❌ ConversationManager: Error during conversation turn');

      if (stateMachine.canTransitionTo('ERROR')) {
        stateMachine.transitionTo('ERROR');
      }
      stateMachine.reset();

      const executionTimeMs = Date.now() - startTime;
      return {
        sessionId: input.sessionId || 'fallback-session',
        topic: 'General',
        messageCount: 0,
        aiResponse: {
          text: 'I apologize, but I encountered a temporary error while processing your request.',
          emotion: 'soothing',
        },
        responseStyle: 'gentle',
        updatedContext: {
          currentTopic: 'General',
          state: 'IDLE' as ConversationStateEnum,
        },
        retrievedMemoriesCount: 0,
        executionTimeMs,
        tokenUsageEstimate: 0,
      };
    }
  }
}

/** Singleton instance export for ConversationManager */
export const conversationManager = new ConversationManager();
