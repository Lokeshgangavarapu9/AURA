/**
 * AURA Cognitive Intelligence Engine — ContextStrategyEngine
 * Computes context layer priorities, dynamic token budgeting, and discarded context layers.
 */

import {
  ContextPrioritization,
  ContextPriorityLevel,
  DynamicTokenBudget,
  TaskType,
  IntentCategory,
} from '../types/cognitive.types.js';

export class ContextStrategyEngine {
  /**
   * Prioritizes context layers based on task type and primary intent.
   */
  public prioritizeContext(taskType: TaskType, primaryIntent: IntentCategory): ContextPrioritization {
    if (taskType === TaskType.CODING || taskType === TaskType.TROUBLESHOOTING) {
      return {
        memory: ContextPriorityLevel.HIGH,
        emotion: ContextPriorityLevel.LOW,
        relationship: ContextPriorityLevel.LOW,
        profile: ContextPriorityLevel.MEDIUM,
        history: ContextPriorityLevel.HIGH,
        capabilities: ContextPriorityLevel.CRITICAL,
        files: ContextPriorityLevel.CRITICAL,
      };
    }

    if (taskType === TaskType.EMOTIONAL_CONVERSATION || primaryIntent === IntentCategory.EMOTIONAL_SUPPORT) {
      return {
        memory: ContextPriorityLevel.HIGH,
        emotion: ContextPriorityLevel.CRITICAL,
        relationship: ContextPriorityLevel.CRITICAL,
        profile: ContextPriorityLevel.HIGH,
        history: ContextPriorityLevel.MEDIUM,
        capabilities: ContextPriorityLevel.IGNORE,
        files: ContextPriorityLevel.IGNORE,
      };
    }

    if (primaryIntent === IntentCategory.GREETING) {
      return {
        memory: ContextPriorityLevel.LOW,
        emotion: ContextPriorityLevel.HIGH,
        relationship: ContextPriorityLevel.HIGH,
        profile: ContextPriorityLevel.MEDIUM,
        history: ContextPriorityLevel.LOW,
        capabilities: ContextPriorityLevel.IGNORE,
        files: ContextPriorityLevel.IGNORE,
      };
    }

    if (taskType === TaskType.RESEARCH || taskType === TaskType.PLANNING) {
      return {
        memory: ContextPriorityLevel.CRITICAL,
        emotion: ContextPriorityLevel.LOW,
        relationship: ContextPriorityLevel.MEDIUM,
        profile: ContextPriorityLevel.MEDIUM,
        history: ContextPriorityLevel.HIGH,
        capabilities: ContextPriorityLevel.HIGH,
        files: ContextPriorityLevel.MEDIUM,
      };
    }

    // Default general discussion
    return {
      memory: ContextPriorityLevel.HIGH,
      emotion: ContextPriorityLevel.MEDIUM,
      relationship: ContextPriorityLevel.HIGH,
      profile: ContextPriorityLevel.MEDIUM,
      history: ContextPriorityLevel.HIGH,
      capabilities: ContextPriorityLevel.LOW,
      files: ContextPriorityLevel.IGNORE,
    };
  }

  /**
   * Computes dynamic token allocation per context layer.
   */
  public calculateDynamicBudget(priorities: ContextPrioritization): DynamicTokenBudget {
    let memoryTokens = 600;
    let emotionTokens = 300;
    let relationshipTokens = 300;
    let historyTokens = 1200;
    let capabilityTokens = 400;
    let systemTokens = 1200;

    if (priorities.emotion === ContextPriorityLevel.CRITICAL) {
      emotionTokens = 1000;
      historyTokens = 600;
      capabilityTokens = 0;
    }

    if (priorities.capabilities === ContextPriorityLevel.CRITICAL) {
      capabilityTokens = 1200;
      emotionTokens = 100;
      relationshipTokens = 100;
    }

    if (priorities.memory === ContextPriorityLevel.CRITICAL) {
      memoryTokens = 1200;
    }

    const totalAllocatedTokens =
      memoryTokens + emotionTokens + relationshipTokens + historyTokens + capabilityTokens + systemTokens;

    return {
      memoryTokens,
      emotionTokens,
      relationshipTokens,
      historyTokens,
      capabilityTokens,
      systemTokens,
      totalAllocatedTokens,
    };
  }

  /**
   * Identifies context layers explicitly ignored or skipped.
   */
  public getDiscardedContext(priorities: ContextPrioritization): string[] {
    const discarded: string[] = [];
    if (priorities.emotion === ContextPriorityLevel.IGNORE || priorities.emotion === ContextPriorityLevel.LOW) {
      discarded.push('emotion_details (irrelevant to technical/factual request)');
    }
    if (priorities.capabilities === ContextPriorityLevel.IGNORE) {
      discarded.push('capabilities (no tools needed for casual conversation)');
    }
    if (priorities.files === ContextPriorityLevel.IGNORE) {
      discarded.push('file_attachments (no file input provided)');
    }
    return discarded;
  }
}

/** Singleton instance export for ContextStrategyEngine */
export const contextStrategyEngine = new ContextStrategyEngine();
