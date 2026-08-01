/**
 * AURA Relationship & Personalization Engine — Affinity Evaluator
 * Pure evaluator computing rapport and warmth affinity scores independently from trust.
 * Completely independent: Contains 0 database, 0 Gemini API, and 0 other evaluator calls.
 */

import { EmotionalContext } from '../../emotion/types/index.js';

export interface AffinityEvaluationResult {
  newAffinityScore: number;
  delta: number;
  reason: string;
}

export class AffinityEvaluator {
  /**
   * Deterministically evaluates affinity score delta and new score clamped to [0, 100].
   */
  public evaluateAffinity(
    currentAffinity: number,
    text: string,
    emotionalContext?: EmotionalContext
  ): AffinityEvaluationResult {
    const lowerText = (text || '').toLowerCase().trim();
    let delta = 0.1; // Baseline rapport stability
    let reason = 'Normal conversational rapport';

    if (!lowerText) {
      return {
        newAffinityScore: Math.max(0, Math.min(100, currentAffinity)),
        delta: 0,
        reason: 'Empty message turn',
      };
    }

    // 1. Cold / Dismissive check (Negative Delta)
    const dismissiveTerms = ['whatever', 'shut up', 'boring', 'leave me alone', 'go away', 'annoying'];
    let dismissiveMatches = 0;
    for (const term of dismissiveTerms) {
      if (lowerText.includes(term)) dismissiveMatches++;
    }

    if (dismissiveMatches > 0) {
      delta = -2.5 * dismissiveMatches;
      reason = 'Expressed dismissal or coldness';
    } else {
      // 2. Warmth / Praise terms check (Positive Delta)
      const warmthTerms = [
        'thank',
        'love',
        'awesome',
        'great',
        'happy',
        'like you',
        'appreciate',
        'wonderful',
        'best friend',
        'enjoy chatting',
      ];
      let warmthMatches = 0;
      for (const term of warmthTerms) {
        if (lowerText.includes(term)) warmthMatches++;
      }

      if (warmthMatches > 0) {
        delta += 1.5 * warmthMatches;
        reason = 'Expressed warmth, appreciation, or positive rapport';
      }

      // 3. Positive Emotion Context Boost
      if (emotionalContext) {
        const emo = emotionalContext.primaryEmotion;
        if (emo === 'happy' || emo === 'excited' || emo === 'confident') {
          delta += 1.0;
          reason += ' + Positive emotional alignment';
        }
      }
    }

    const roundedDelta = Math.round(delta * 10) / 10;
    const newAffinityScore = Math.max(0, Math.min(100, Math.round((currentAffinity + roundedDelta) * 10) / 10));

    return {
      newAffinityScore,
      delta: roundedDelta,
      reason,
    };
  }
}

/** Singleton export for AffinityEvaluator */
export const affinityEvaluator = new AffinityEvaluator();
