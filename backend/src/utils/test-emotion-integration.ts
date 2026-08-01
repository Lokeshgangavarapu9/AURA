import { conversationManager } from '../conversation/manager/conversation.manager.js';
import { emotionAnalyzer } from '../emotion/analyzer/emotion.analyzer.js';
import { PromptBuilder } from '../ai/prompt.builder.js';
import { MemoryScorer } from '../memory/scoring/scorer.js';
import { MemoryFactEntity } from '../memory/types/index.js';
import { sessionManager } from '../conversation/session/session.manager.js';
import { logger } from './logger.js';

async function runEmotionIntegrationTests() {
  logger.info('🧪 Running Emotion Engine Integration Test Suite...');

  // 1. Verify EmotionAnalyzer Execution
  const text = 'I am feeling overwhelmed and worried about my exam';
  const emotionalContext = emotionAnalyzer.analyze(text);
  logger.info({ primary: emotionalContext.primaryEmotion, aiTone: emotionalContext.aiTone }, '✅ Test 1: EmotionAnalyzer executed');

  if (emotionalContext.primaryEmotion !== 'worried' || emotionalContext.aiTone.responseStyle !== 'gentle') {
    throw new Error('Test 1 failed: EmotionAnalyzer output mismatch!');
  }

  // 2. Verify PromptBuilder Emotional Guidance Injection
  const promptInstruction = PromptBuilder.buildSystemInstruction(undefined, undefined, emotionalContext);
  logger.info('✅ Test 2: PromptBuilder generated instruction containing guidance');

  if (!promptInstruction.includes('gentle') || !promptInstruction.includes('empathetic')) {
    throw new Error('Test 2 failed: PromptBuilder missing responseStyle guidance!');
  }

  // 3. Verify MemoryScorer W_e Consumption
  const dummyFact: MemoryFactEntity = {
    id: 'fact-1',
    category: 'fact',
    key: 'exam',
    value: 'Computer Science Final Exam',
    confidence: 1.0,
    importance: 8,
    frequency: 3,
    lastUsedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const baseScore = MemoryScorer.scoreMemory(dummyFact, ['exam']);
  const weightedScore = MemoryScorer.scoreMemory(dummyFact, ['exam'], new Date(), 1.5);
  logger.info({ baseScore: baseScore.finalScore, weightedScore: weightedScore.finalScore }, '✅ Test 3: MemoryScorer W_e scaling verified');

  if (weightedScore.finalScore <= baseScore.finalScore) {
    throw new Error('Test 3 failed: MemoryScorer W_e scaling failed!');
  }

  // 4. Verify ConversationManager Integration
  const convResult = await conversationManager.processConversation({
    userMessage: 'I am so happy and excited today!',
  });

  logger.info(
    {
      sessionId: convResult.sessionId,
      aiEmotion: convResult.aiResponse.emotion,
      responseStyle: convResult.responseStyle,
    },
    '✅ Test 4: ConversationManager returned emotional response'
  );

  if (convResult.aiResponse.emotion !== 'happy' || convResult.responseStyle !== 'celebratory') {
    throw new Error('Test 4 failed: ConversationManager emotional payload mismatch!');
  }

  // Clean up test session
  await sessionManager.endSession(convResult.sessionId);

  logger.info('🎉 Emotion Engine Integration Test Suite Passed Successfully!');
}

runEmotionIntegrationTests();
