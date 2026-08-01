/**
 * AURA Relationship & Personalization Engine — Trust Evaluator
 * Pure evaluator computing turn-by-turn trust score and delta.
 * Completely independent: Contains 0 database, 0 Gemini API, and 0 other evaluator calls.
 */

import { EmotionalContext } from '../../emotion/types/index.js';

export interface TrustEvaluationResult {
  newTrustScore: number;
  delta: number;
  reason: string;
}

export class TrustEvaluator {
  /**
   * Deterministically evaluates trust score delta and new score clamped to [0, 100].
   */
  public evaluateTrust(
    currentTrust: number,
    text: string,
    emotionalContext?: EmotionalContext
  ): TrustEvaluationResult {
    const lowerText = (text || '').toLowerCase().trim();
    let delta = 0.2; // Baseline turn-taking consistency bonus
    let reason = 'Consistent conversation turn';

    if (!lowerText) {
      return {
        newTrustScore: Math.max(0, Math.min(100, currentTrust)),
        delta: 0,
        reason: 'Empty message turn',
      };
    }

    // 1. Hostile / Distrustful terms check (Negative Delta)
    const hostileTerms = ['fake', 'liar', 'stupid', 'useless', 'bot', 'hate you', 'distrust'];
    let hostileMatches = 0;
    for (const term of hostileTerms) {
      if (lowerText.includes(term)) hostileMatches++;
    }

    if (hostileMatches > 0) {
      delta = -3.0 * hostileMatches;
      reason = 'Expressed skepticism or hostile terms';
    } else {
      // 2. Vulnerability & Deep sharing terms check (Positive Delta)
      const vulnerabilityTerms = [
        'worried',
        'scared',
        'secret',
        'goal',
        'dream',
        'fear',
        'struggle',
        'help me',
        'confess',
        'trust you',
        'honestly',
      ];
      let vulnMatches = 0;
      for (const term of vulnerabilityTerms) {
        if (lowerText.includes(term)) vulnMatches++;
      }

      if (vulnMatches > 0) {
        delta += 1.5 * vulnMatches;
        reason = 'Shared personal vulnerability or goals';
      }

      // 3. Emotional Resonance Bonus
      if (emotionalContext) {
        const emo = emotionalContext.primaryEmotion;
        if (emo === 'worried' || emo === 'sad' || emo === 'frustrated') {
          if (emotionalContext.aiTone.aiEmotion === 'empathetic' || emotionalContext.aiTone.aiEmotion === 'calm') {
            delta += 1.0;
            reason += ' + Empathetic emotional alignment';
          }
        }
      }
    }

    const roundedDelta = Math.round(delta * 10) / 10;
    const newTrustScore = Math.max(0, Math.min(100, Math.round((currentTrust + roundedDelta) * 10) / 10));

    return {
      newTrustScore,
      delta: roundedDelta,
      reason,
    };
  }
}

/** Singleton export for TrustEvaluator */
export const trustEvaluator = new TrustEvaluator();
