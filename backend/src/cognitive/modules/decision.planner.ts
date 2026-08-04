/**
 * AURA Cognitive Intelligence Engine — DecisionPlanner
 * Determines subsystem execution plan, provider posture suggestions, risk assessment, and reasoning paths.
 */

import {
  SubsystemPlan,
  CognitivePlanSuggestions,
  TaskType,
  IntentCategory,
  CognitiveEngineInput,
} from '../types/cognitive.types.js';

export class DecisionPlanner {
  /**
   * Constructs the subsystem execution plan based on task type and primary intent.
   */
  public planSubsystems(taskType: TaskType, primaryIntent: IntentCategory): SubsystemPlan {
    const isTechnical = taskType === TaskType.CODING || taskType === TaskType.TROUBLESHOOTING || taskType === TaskType.INSTRUCTION;
    const isEmotional = taskType === TaskType.EMOTIONAL_CONVERSATION || primaryIntent === IntentCategory.EMOTIONAL_SUPPORT;

    return {
      requiresMemory: true,
      requiresEmotion: isEmotional || primaryIntent === IntentCategory.CONVERSATION,
      requiresRelationship: true,
      requiresCapability: isTechnical || primaryIntent === IntentCategory.COMMAND,
      requiresLearning: true,
      requiresLongTermUpdate: isEmotional || taskType === TaskType.PLANNING,
      requiresFileAnalysis: isTechnical,
      requiresVision: false,
      requiresVoice: false,
      requiresExternalTool: isTechnical,
    };
  }

  /**
   * Generates response posture and provider suggestions.
   */
  public generateSuggestions(taskType: TaskType, primaryIntent: IntentCategory): CognitivePlanSuggestions {
    let suggestedResponseStyle = 'balanced';
    let suggestedProvider: 'gemini' | 'openai' | 'auto' = 'gemini';
    let priority: 'low' | 'normal' | 'high' = 'normal';
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    if (taskType === TaskType.CODING || taskType === TaskType.TROUBLESHOOTING) {
      suggestedResponseStyle = 'direct_technical';
      priority = 'high';
    } else if (taskType === TaskType.EMOTIONAL_CONVERSATION) {
      suggestedResponseStyle = 'empathetic_gentle';
      priority = 'high';
      riskLevel = 'medium';
    } else if (taskType === TaskType.PLANNING) {
      suggestedResponseStyle = 'structured_motivational';
    }

    return {
      suggestedProvider,
      suggestedResponseStyle,
      priority,
      riskLevel,
    };
  }

  /**
   * Builds step-by-step reasoning path explanation.
   */
  public buildReasoningPath(taskType: TaskType, primaryIntent: IntentCategory): string[] {
    return [
      `Classified primary intent as [${primaryIntent}]`,
      `Identified task pattern as [${taskType}]`,
      `Formulated subsystem execution requirement plan`,
      `Derived response posture and priority suggestions`,
    ];
  }
}

/** Singleton instance export for DecisionPlanner */
export const decisionPlanner = new DecisionPlanner();
