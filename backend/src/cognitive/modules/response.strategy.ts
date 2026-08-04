/**
 * AURA Cognitive Intelligence Engine — ResponseStrategyEngine
 * Determines response mode, posture tone, depth, and constructs clarification plans for ambiguous turns.
 */

import {
  ResponseStrategy,
  ResponseMode,
  ClarificationPlan,
  TaskType,
  IntentCategory,
  CognitiveEngineInput,
} from '../types/cognitive.types.js';

export class ResponseStrategyEngine {
  /**
   * Formulates response posture strategy based on task type and primary intent.
   */
  public determineResponseStrategy(taskType: TaskType, primaryIntent: IntentCategory): ResponseStrategy {
    if (taskType === TaskType.CODING) {
      return {
        mode: ResponseMode.CODE_REVIEW_MODE,
        depth: 'deep_dive',
        tone: 'direct',
        explanation: 'Coding task requires precision, exact syntax, and code review posture.',
      };
    }

    if (taskType === TaskType.TROUBLESHOOTING) {
      return {
        mode: ResponseMode.ARCHITECT_MODE,
        depth: 'deep_dive',
        tone: 'direct',
        explanation: 'Troubleshooting task requires root cause isolation and structural solution.',
      };
    }

    if (taskType === TaskType.EMOTIONAL_CONVERSATION || primaryIntent === IntentCategory.EMOTIONAL_SUPPORT) {
      return {
        mode: ResponseMode.EMPATHETIC,
        depth: 'standard',
        tone: 'empathetic',
        explanation: 'Emotional context requires warm, active listening posture.',
      };
    }

    if (taskType === TaskType.LEARNING) {
      return {
        mode: ResponseMode.TUTOR_MODE,
        depth: 'standard',
        tone: 'encouraging',
        explanation: 'Learning task requires structured tutor posture with step-by-step guidance.',
      };
    }

    if (taskType === TaskType.RESEARCH) {
      return {
        mode: ResponseMode.RESEARCH_MODE,
        depth: 'deep_dive',
        tone: 'professional',
        explanation: 'Research task requires comprehensive comparative synthesis.',
      };
    }

    // Default friendly posture
    return {
      mode: ResponseMode.FRIENDLY,
      depth: 'standard',
      tone: 'warm',
      explanation: 'General conversation uses warm, approachable companion posture.',
    };
  }

  /**
   * Generates clarification plan if reasoning confidence is low (< 0.6).
   */
  public evaluateClarification(
    input: CognitiveEngineInput,
    confidence: number,
    primaryIntent: IntentCategory
  ): ClarificationPlan {
    const text = input.userMessage.trim();

    if (confidence < 0.6 || primaryIntent === IntentCategory.UNKNOWN) {
      return {
        requiresClarification: true,
        clarificationReason: 'User prompt is ambiguous or brief with low confidence scoring.',
        suggestedQuestions: [
          'Could you clarify what outcome you would like to achieve?',
          'Do you have a specific technology, topic, or context in mind?',
        ],
        missingDetails: ['Target context', 'Specific user objective'],
      };
    }

    return {
      requiresClarification: false,
    };
  }
}

/** Singleton instance export for ResponseStrategyEngine */
export const responseStrategyEngine = new ResponseStrategyEngine();
