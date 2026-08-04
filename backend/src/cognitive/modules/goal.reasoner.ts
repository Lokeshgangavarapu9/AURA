/**
 * AURA Cognitive Intelligence Engine — GoalReasoner
 * Infers user immediate, session, and long-term goals from prompt context and intent.
 */

import { GoalInference, IntentCategory, CognitiveEngineInput } from '../types/cognitive.types.js';

export class GoalReasoner {
  /**
   * Infers goal hierarchy based on prompt content and primary intent.
   */
  public inferGoals(input: CognitiveEngineInput, primaryIntent: IntentCategory): GoalInference {
    const text = input.userMessage.trim();

    // 1. Immediate Goal Inference
    let immediateGoal = `Address user request: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`;
    if (primaryIntent === IntentCategory.CODING) {
      immediateGoal = 'Resolve technical programming request or debug code issue';
    } else if (primaryIntent === IntentCategory.EMOTIONAL_SUPPORT) {
      immediateGoal = 'Provide empathetic, supportive emotional grounding';
    } else if (primaryIntent === IntentCategory.GREETING) {
      immediateGoal = 'Acknowledge greeting and establish positive companion rapport';
    } else if (primaryIntent === IntentCategory.QUESTION || primaryIntent === IntentCategory.INFO_REQUEST) {
      immediateGoal = 'Provide clear, accurate factual answer to question';
    }

    // 2. Session Goal Inference
    let sessionGoal = 'Maintain supportive, engaging conversation thread';
    if (primaryIntent === IntentCategory.CODING || primaryIntent === IntentCategory.TASK_REQUEST) {
      sessionGoal = 'Complete active technical task efficiently';
    } else if (primaryIntent === IntentCategory.PLANNING_REQUEST) {
      sessionGoal = 'Construct structured actionable roadmap';
    } else if (primaryIntent === IntentCategory.EMOTIONAL_SUPPORT) {
      sessionGoal = 'Help user navigate feelings and regain balance';
    }

    // 3. Long-Term Goal Inference
    let longTermGoal: string | undefined;
    if (text.toLowerCase().includes('exam') || text.toLowerCase().includes('study')) {
      longTermGoal = 'Improve academic performance & exam mastery';
    } else if (text.toLowerCase().includes('job') || text.toLowerCase().includes('career') || text.toLowerCase().includes('interview')) {
      longTermGoal = 'Advance professional career & job growth';
    } else if (text.toLowerCase().includes('health') || text.toLowerCase().includes('habit') || text.toLowerCase().includes('fitness')) {
      longTermGoal = 'Enhance personal wellness and daily habits';
    }

    return {
      immediateGoal,
      sessionGoal,
      longTermGoal,
    };
  }
}

/** Singleton instance export for GoalReasoner */
export const goalReasoner = new GoalReasoner();
