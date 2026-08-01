/**
 * AURA Emotional Intelligence Engine — Memory Emotional Weight Calculator
 * Calculates deterministic emotional weight factor W_e (0.5 <= W_e <= 2.0) consumed by the Memory Engine.
 * Pure mathematical logic: Contains ZERO database, ZERO Gemini, and ZERO state dependencies.
 */

import { EmotionCategory, EmotionResult, ShortTermEmotionalState } from '../types/index.js';

/** Base emotional weights per primary emotion category */
const BASE_EMOTION_WEIGHTS: Record<EmotionCategory, number> = {
  neutral: 1.0,
  calm: 0.95,
  happy: 1.05,
  excited: 1.1,
  curious: 1.0,
  thinking: 1.0,
  confident: 1.1,
  empathetic: 1.05,
  surprised: 1.2,
  confused: 1.25,
  worried: 1.35,
  sad: 1.45,
  frustrated: 1.6,
  angry: 1.8,
};

export class WeightCalculator {
  /**
   * Calculates deterministic emotional weight factor W_e clamped strictly to [0.5, 2.0].
   * @param emotionResult Current turn EmotionResult
   * @param emotionalState ShortTermEmotionalState
   */
  public calculateWeight(
    emotionResult: EmotionResult,
    emotionalState: ShortTermEmotionalState
  ): number {
    const primary = emotionResult?.primaryEmotion || 'neutral';
    const baseWeight = BASE_EMOTION_WEIGHTS[primary] ?? 1.0;

    // Intensity adjustment (-0.20 to +0.25)
    const primaryScore = emotionResult?.emotions?.[0];
    const intensity = primaryScore?.intensity ?? 5;
    const intensityDelta = (intensity - 5) / 20;

    // Stress level adjustment (-0.15 to +0.30)
    const stress = emotionalState?.stressLevel ?? 4;
    const stressDelta = (stress - 4) / 20;

    // Compute combined raw weight
    const rawWeight = baseWeight + intensityDelta + stressDelta;

    // Clamp strictly within [0.5, 2.0]
    const clampedWeight = Math.max(0.5, Math.min(2.0, rawWeight));

    return Math.round(clampedWeight * 100) / 100;
  }
}

/** Singleton export for WeightCalculator */
export const weightCalculator = new WeightCalculator();
