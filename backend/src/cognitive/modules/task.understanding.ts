/**
 * AURA Cognitive Intelligence Engine — TaskUnderstandingEngine
 * Analyzes multi-intent patterns and classifies fine-grained TaskType.
 */

import { TaskType, IntentCategory, CognitiveEngineInput } from '../types/cognitive.types.js';

export class TaskUnderstandingEngine {
  /**
   * Maps intent signals to a fine-grained TaskType classification.
   */
  public determineTaskType(input: CognitiveEngineInput, primaryIntent: IntentCategory): TaskType {
    const text = input.userMessage.toLowerCase();

    if (primaryIntent === IntentCategory.CODING) {
      if (text.includes('bug') || text.includes('error') || text.includes('fix') || text.includes('failed')) {
        return TaskType.TROUBLESHOOTING;
      }
      return TaskType.CODING;
    }

    if (primaryIntent === IntentCategory.EMOTIONAL_SUPPORT) {
      return TaskType.EMOTIONAL_CONVERSATION;
    }

    if (primaryIntent === IntentCategory.PLANNING_REQUEST) {
      return TaskType.PLANNING;
    }

    if (primaryIntent === IntentCategory.RESEARCH_REQUEST) {
      return TaskType.RESEARCH;
    }

    if (primaryIntent === IntentCategory.CREATIVE) {
      return TaskType.CREATIVE_THINKING;
    }

    if (text.includes('how to solve') || text.includes('how can i fix') || text.includes('problem')) {
      return TaskType.PROBLEM_SOLVING;
    }

    if (text.includes('should i') || text.includes('decide') || text.includes('which option')) {
      return TaskType.DECISION_MAKING;
    }

    if (primaryIntent === IntentCategory.QUESTION || primaryIntent === IntentCategory.INFO_REQUEST) {
      return TaskType.QUESTION;
    }

    if (primaryIntent === IntentCategory.COMMAND || primaryIntent === IntentCategory.TASK_REQUEST) {
      return TaskType.INSTRUCTION;
    }

    return TaskType.GENERAL_DISCUSSION;
  }
}

/** Singleton instance export for TaskUnderstandingEngine */
export const taskUnderstandingEngine = new TaskUnderstandingEngine();
