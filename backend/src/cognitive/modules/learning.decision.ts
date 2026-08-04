/**
 * AURA Cognitive Intelligence Engine — LearningDecisionEngine
 * Evaluates memory candidacy, importance scoring, duplicate detection, preference updates,
 * habit tracking, goal evolution, and constructs immutable LearningPlan objects.
 */

import {
  LearningPlan,
  TaskType,
  IntentCategory,
  CognitiveEngineInput,
} from '../types/cognitive.types.js';

export class LearningDecisionEngine {
  /**
   * Evaluates prompt content and turn context to produce an immutable LearningPlan.
   */
  public evaluateLearning(
    input: CognitiveEngineInput,
    taskType: TaskType,
    primaryIntent: IntentCategory
  ): LearningPlan {
    const text = input.userMessage.trim();
    const lower = text.toLowerCase();

    // 1. Memory Candidacy & Importance Scoring
    let shouldStoreMemory = false;
    let memoryCandidate: string | undefined;
    let importanceScore = 0.3; // Default baseline

    if (/(my name is|i am a|i work as|i live in|i love|i hate|my favorite|i prefer|i have a|my goal is)/i.test(text)) {
      shouldStoreMemory = true;
      memoryCandidate = text;
      importanceScore = 0.85;
    } else if (/(exam|interview|job|deadline|project|bug|wedding|birthday)/i.test(lower)) {
      shouldStoreMemory = true;
      memoryCandidate = text;
      importanceScore = 0.75;
    }

    // 2. Duplicate Memory Detection
    let isDuplicateMemory = false;
    if (shouldStoreMemory && input.history && input.history.length > 0) {
      isDuplicateMemory = input.history.some(
        (h) => h.text.toLowerCase() === lower || (memoryCandidate && h.text.toLowerCase().includes(memoryCandidate.toLowerCase()))
      );
      if (isDuplicateMemory) {
        shouldStoreMemory = false; // Skip storing duplicate
      }
    }

    // 3. User Preference Evolution
    const preferenceUpdates: Array<{ key: string; value: string }> = [];
    if (/(i prefer|i like|always use|prefer concise|prefer detailed|use dark mode)/i.test(lower)) {
      preferenceUpdates.push({ key: 'user_preference_signal', value: text });
    }

    // 4. Habit Tracking Evolution
    const habitUpdates: string[] = [];
    if (/(every morning|every night|daily|weekly|schedule|routine)/i.test(lower)) {
      habitUpdates.push(`Detected habit pattern: "${text.substring(0, 50)}"`);
    }

    // 5. Goal Evolution
    const goalUpdates: string[] = [];
    if (/(my goal is|i want to learn|i want to achieve|aiming for)/i.test(lower)) {
      goalUpdates.push(`User stated goal: "${text.substring(0, 50)}"`);
    }

    // 6. Relationship Metrics Update Planning
    let trustIncrement = 0.1;
    let closenessIncrement = 0.1;
    if (primaryIntent === IntentCategory.EMOTIONAL_SUPPORT) {
      trustIncrement = 0.3;
      closenessIncrement = 0.4;
    } else if (primaryIntent === IntentCategory.GREETING) {
      trustIncrement = 0.05;
      closenessIncrement = 0.05;
    }

    const learningExplanation = shouldStoreMemory
      ? `Identified personal fact/event with importance score ${importanceScore}.`
      : 'Standard turn — no immediate long-term memory extraction candidate.';

    return {
      shouldStoreMemory,
      memoryCandidate,
      importanceScore,
      isDuplicateMemory,

      shouldUpdatePreferences: preferenceUpdates.length > 0,
      preferenceUpdates,

      shouldUpdateHabits: habitUpdates.length > 0,
      habitUpdates,

      shouldUpdateGoals: goalUpdates.length > 0,
      goalUpdates,

      shouldUpdateRelationship: true,
      relationshipUpdates: { trustIncrement, closenessIncrement },

      learningExplanation,
    };
  }
}

/** Singleton instance export for LearningDecisionEngine */
export const learningDecisionEngine = new LearningDecisionEngine();
