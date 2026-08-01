/**
 * AURA Relationship & Personalization Engine — Signal Evaluator
 * Evaluates behavioral relationship signals (curiosity, gratitude, openness, engagement, humor, respect, dependence).
 * Pure domain evaluator: Contains ZERO database, ZERO Gemini API, and ZERO side effects.
 */

import { RelationshipSignals } from '../types/index.js';
import { EmotionalContext } from '../../emotion/types/index.js';

export class SignalEvaluator {
  /**
   * Deterministically evaluates and updates RelationshipSignals clamped strictly to [0, 10].
   */
  public evaluateSignals(
    currentSignals: RelationshipSignals,
    text: string,
    emotionalContext?: EmotionalContext
  ): RelationshipSignals {
    const lowerText = (text || '').toLowerCase().trim();

    if (!lowerText) {
      return { ...currentSignals };
    }

    // 1. Curiosity Signal (0-10)
    let curiosity = currentSignals.curiosity ?? 5;
    const isQuestion = lowerText.includes('?') || /\b(why|how|what|explain|tell me|who|where)\b/.test(lowerText);
    if (isQuestion) curiosity = Math.min(10, curiosity + 1);

    // 2. Gratitude Signal (0-10)
    let gratitude = currentSignals.gratitude ?? 3;
    if (/\b(thanks|thank you|appreciate|grateful|helped me)\b/.test(lowerText)) {
      gratitude = Math.min(10, gratitude + 2);
    }

    // 3. Openness Signal (0-10)
    let openness = currentSignals.openness ?? 4;
    if (/\b(feel|think|believe|my goal|my secret|honestly|in my opinion|struggle)\b/.test(lowerText)) {
      openness = Math.min(10, openness + 1.5);
    }

    // 4. Engagement Signal (0-10)
    let engagement = currentSignals.engagement ?? 5;
    if (lowerText.length > 40) {
      engagement = Math.min(10, engagement + 1);
    } else if (lowerText.length < 5) {
      engagement = Math.max(0, engagement - 0.5);
    }

    // 5. Humor Signal (0-10)
    let humor = currentSignals.humor ?? 2;
    if (/\b(haha|lol|funny|joke|lmao|rofl)\b/.test(lowerText) || /[\u{1F600}-\u{1F64F}]/u.test(lowerText)) {
      humor = Math.min(10, humor + 2);
    }

    // 6. Respect Signal (0-10)
    let respect = currentSignals.respect ?? 6;
    if (/\b(please|kindly|respect|understand|appreciate your time)\b/.test(lowerText)) {
      respect = Math.min(10, respect + 1);
    }

    // 7. Dependence Signal (0-10)
    let dependence = currentSignals.dependence ?? 2;
    if (/\b(need you|don't leave|only you understand|rely on you|always here)\b/.test(lowerText)) {
      dependence = Math.min(10, dependence + 1.5);
    }

    return {
      curiosity: Math.round(curiosity * 10) / 10,
      gratitude: Math.round(gratitude * 10) / 10,
      openness: Math.round(openness * 10) / 10,
      engagement: Math.round(engagement * 10) / 10,
      humor: Math.round(humor * 10) / 10,
      respect: Math.round(respect * 10) / 10,
      dependence: Math.round(dependence * 10) / 10,
    };
  }
}

/** Singleton export for SignalEvaluator */
export const signalEvaluator = new SignalEvaluator();
