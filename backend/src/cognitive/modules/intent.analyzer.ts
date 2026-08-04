/**
 * AURA Cognitive Intelligence Engine — IntentAnalyzer
 * Analyzes user inputs and turn signals to determine primary intent, conversation type, and subsystem requirements.
 */

import {
  IntentCategory,
  TaskType,
  ContextPriorityLevel,
  ResponseMode,
  IntentAnalysisResult,
  CognitivePlan,
  CognitiveEngineInput,
} from '../types/cognitive.types.js';
import { logger } from '../../utils/logger.js';

export class IntentAnalyzer {
  /**
   * Analyzes input message and produces intent classification and confidence breakdown.
   */
  public analyzeIntent(input: CognitiveEngineInput): IntentAnalysisResult {
    const text = input.userMessage.trim().toLowerCase();
    const scores: Array<{ intent: IntentCategory; confidence: number }> = [];

    // 1. Greeting Detection
    if (/^(hi|hello|hey|good morning|good evening|greetings|howdy|sup)\b/i.test(text)) {
      scores.push({ intent: IntentCategory.GREETING, confidence: 0.95 });
      scores.push({ intent: IntentCategory.CONVERSATION, confidence: 0.7 });
    }

    // 2. Emotional Support Detection
    if (/(feel|feeling|sad|depressed|stressed|worried|anxious|upset|heartbroken|lonely|hurt)/i.test(text)) {
      scores.push({ intent: IntentCategory.EMOTIONAL_SUPPORT, confidence: 0.9 });
      scores.push({ intent: IntentCategory.CONVERSATION, confidence: 0.8 });
    }

    // 3. Coding Detection
    if (/(code|function|bug|error|typescript|javascript|react|python|html|css|api|database|sql|prisma|fix this)/i.test(text)) {
      scores.push({ intent: IntentCategory.CODING, confidence: 0.92 });
      scores.push({ intent: IntentCategory.TASK_REQUEST, confidence: 0.85 });
    }

    // 4. Command / Task Request Detection
    if (/^(create|make|build|run|execute|set|delete|update|add|remove|show|list)\b/i.test(text)) {
      scores.push({ intent: IntentCategory.COMMAND, confidence: 0.88 });
      scores.push({ intent: IntentCategory.TASK_REQUEST, confidence: 0.85 });
    }

    // 5. Question & Info Request Detection
    if (text.includes('?') || /^(what|why|how|who|where|when|can you|could you|is there|are there)\b/i.test(text)) {
      scores.push({ intent: IntentCategory.QUESTION, confidence: 0.9 });
      scores.push({ intent: IntentCategory.INFO_REQUEST, confidence: 0.85 });
    }

    // 6. Creative Request Detection
    if (/(story|poem|write|generate|imagine|design|compose|create a name)/i.test(text)) {
      scores.push({ intent: IntentCategory.CREATIVE, confidence: 0.87 });
    }

    // 7. Planning Request Detection
    if (/(plan|schedule|roadmap|strategy|organize|steps|guide)/i.test(text)) {
      scores.push({ intent: IntentCategory.PLANNING_REQUEST, confidence: 0.86 });
    }

    // 8. Research Request Detection
    if (/(research|explain|deep dive|study|summary|compare|overview)/i.test(text)) {
      scores.push({ intent: IntentCategory.RESEARCH_REQUEST, confidence: 0.84 });
    }

    // Default fallback
    if (scores.length === 0) {
      scores.push({ intent: IntentCategory.CONVERSATION, confidence: 0.6 });
      scores.push({ intent: IntentCategory.UNKNOWN, confidence: 0.4 });
    }

    // Sort by confidence descending
    scores.sort((a, b) => b.confidence - a.confidence);

    const primary = scores[0].intent;
    const confidence = scores[0].confidence;

    // Detect if this is a follow-up question based on history or pronouns
    const isFollowUp = Boolean(
      (input.history && input.history.length > 0 && /^(that|it|this|also|what about|and)\b/i.test(text))
    );

    // Determine broad conversation type
    let conversationType: IntentAnalysisResult['conversationType'] = 'casual';
    if (primary === IntentCategory.CODING || primary === IntentCategory.TASK_REQUEST || primary === IntentCategory.COMMAND) {
      conversationType = 'technical';
    } else if (primary === IntentCategory.EMOTIONAL_SUPPORT) {
      conversationType = 'emotional';
    } else if (primary === IntentCategory.QUESTION || primary === IntentCategory.INFO_REQUEST || primary === IntentCategory.RESEARCH_REQUEST) {
      conversationType = 'informational';
    }

    return {
      primaryIntent: primary,
      confidence,
      allIntents: scores,
      conversationType,
      isFollowUp,
    };
  }

  /**
   * Builds initial immutable CognitivePlan based on intent analysis.
   */
  public buildCognitivePlan(input: CognitiveEngineInput, intent: IntentAnalysisResult): CognitivePlan {
    const activeSessionId = input.sessionId || `session-${Date.now()}`;

    // Subsystem requirement flags
    const requiresMemory = true; // Always evaluate memory relevance
    const requiresEmotion = intent.conversationType === 'emotional' || intent.primaryIntent === IntentCategory.EMOTIONAL_SUPPORT || intent.primaryIntent === IntentCategory.CONVERSATION;
    const requiresRelationship = true;
    const requiresCapability = intent.primaryIntent === IntentCategory.COMMAND || intent.primaryIntent === IntentCategory.CODING || intent.primaryIntent === IntentCategory.TASK_REQUEST;
    const requiresLearningUpdate = true;

    const plan: CognitivePlan = {
      planId: `cogplan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date(),
      userMessage: input.userMessage,
      sessionId: activeSessionId,
      intent,
      taskType: TaskType.GENERAL_DISCUSSION,
      goals: {
        immediateGoal: `Address user request`,
        sessionGoal: `Maintain conversation`,
      },
      reasoningConfidence: Number((intent.confidence * 0.95).toFixed(2)),
      isLowConfidence: intent.confidence < 0.6,
      reasoningPath: [`Intent analyzed as ${intent.primaryIntent}`],
      workingContext: {
        activeAssumptions: [],
        openQuestions: [],
        intermediateReasoning: [],
        temporaryFacts: [],
        selectedEvidence: [],
        planningNotes: [],
      },
      contextPriorities: {
        memory: ContextPriorityLevel.HIGH,
        emotion: ContextPriorityLevel.MEDIUM,
        relationship: ContextPriorityLevel.HIGH,
        profile: ContextPriorityLevel.MEDIUM,
        history: ContextPriorityLevel.HIGH,
        capabilities: ContextPriorityLevel.LOW,
        files: ContextPriorityLevel.IGNORE,
      },
      dynamicBudget: {
        memoryTokens: 600,
        emotionTokens: 300,
        relationshipTokens: 300,
        historyTokens: 1200,
        capabilityTokens: 400,
        systemTokens: 1200,
        totalAllocatedTokens: 4000,
      },
      discardedContext: [],
      responseStrategy: {
        mode: ResponseMode.FRIENDLY,
        depth: 'standard',
        tone: 'warm',
        explanation: 'Default fallback posture',
      },
      clarificationPlan: {
        requiresClarification: false,
      },
      learningPlan: {
        shouldStoreMemory: false,
        importanceScore: 0.3,
        isDuplicateMemory: false,
        shouldUpdatePreferences: false,
        preferenceUpdates: [],
        shouldUpdateHabits: false,
        habitUpdates: [],
        shouldUpdateGoals: false,
        goalUpdates: [],
        shouldUpdateRelationship: true,
        relationshipUpdates: { trustIncrement: 0.1, closenessIncrement: 0.1 },
        learningExplanation: 'Default fallback learning decision',
      },
      subsystemPlan: {
        requiresMemory,
        requiresEmotion,
        requiresRelationship,
        requiresCapability,
        requiresLearning: requiresLearningUpdate,
        requiresLongTermUpdate: false,
        requiresFileAnalysis: false,
        requiresVision: false,
        requiresVoice: false,
        requiresExternalTool: false,
      },
      requiresMemory,
      requiresEmotion,
      requiresRelationship,
      requiresCapability,
      requiresLearningUpdate,
      suggestions: {
        suggestedProvider: 'gemini',
        suggestedResponseStyle: 'balanced',
        priority: 'normal',
        riskLevel: 'low',
      },
      metadata: {
        timestamp: new Date(),
        durationMs: 0,
        decisionSource: 'rule_heuristics',
        triggeredRules: ['intent_rule'],
        version: '1.7.0',
      },
      version: '1.7.0',
    };

    logger.debug(
      { planId: plan.planId, primaryIntent: intent.primaryIntent, confidence: intent.confidence },
      '🧠 IntentAnalyzer: Built initial CognitivePlan'
    );

    return plan;
  }
}

/** Singleton instance export for IntentAnalyzer */
export const intentAnalyzer = new IntentAnalyzer();
