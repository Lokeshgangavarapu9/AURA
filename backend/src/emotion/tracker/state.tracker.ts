/**
 * AURA Emotional Intelligence Engine — Emotional State Tracker
 * Remembers HOW the user's short-term emotional state evolves across conversation turns.
 * Strictly Decoupled: Contains 0 database queries, 0 long-term profile code, and 0 ResponsePolicy code.
 */

import { EmotionCategory, EmotionResult, ShortTermEmotionalState } from '../types/index.js';

/** Deterministic stress level ratings per emotion category (1 to 10 scale) */
const STRESS_LEVEL_MAP: Record<EmotionCategory, number> = {
  happy: 2,
  excited: 3,
  calm: 2,
  neutral: 4,
  curious: 4,
  thinking: 4,
  confident: 3,
  empathetic: 3,
  surprised: 5,
  confused: 6,
  worried: 7,
  sad: 8,
  frustrated: 8,
  angry: 9,
};

/** Deterministic frustration ratings per emotion category (1 to 10 scale) */
const FRUSTRATION_LEVEL_MAP: Record<EmotionCategory, number> = {
  frustrated: 9,
  angry: 10,
  confused: 7,
  worried: 6,
  sad: 6,
  neutral: 2,
  happy: 1,
  excited: 1,
  curious: 2,
  thinking: 2,
  confident: 1,
  calm: 1,
  empathetic: 1,
  surprised: 3,
};

/** Emotion polarity valuation score (+1 = Positive, 0 = Neutral, -1 = Negative) */
function getEmotionValuation(emotion: EmotionCategory): number {
  switch (emotion) {
    case 'happy':
    case 'excited':
    case 'confident':
    case 'calm':
    case 'empathetic':
      return 1;
    case 'neutral':
    case 'curious':
    case 'thinking':
    case 'surprised':
      return 0;
    case 'worried':
    case 'sad':
    case 'frustrated':
    case 'angry':
    case 'confused':
      return -1;
    default:
      return 0;
  }
}

export class EmotionalStateTracker {
  private state: ShortTermEmotionalState;
  private recentHistory: EmotionCategory[] = [];

  constructor() {
    this.state = this.createInitialState();
  }

  /**
   * Resets short-term emotional state back to initial neutral baseline.
   */
  public reset(): ShortTermEmotionalState {
    this.state = this.createInitialState();
    this.recentHistory = [];
    return { ...this.state };
  }

  /**
   * Returns a copy of the active short-term emotional state.
   */
  public getCurrentState(): ShortTermEmotionalState {
    return { ...this.state };
  }

  /**
   * Updates state per turn using deterministic mood trend and stress calculations.
   * @param emotionResult Incoming turn EmotionResult
   */
  public updateState(emotionResult: EmotionResult): ShortTermEmotionalState {
    const newEmotion = emotionResult?.primaryEmotion || 'neutral';
    const prevEmotion = this.state.currentMood;

    // 1. Mood Duration Calculation
    const durationTurns = newEmotion === prevEmotion ? this.state.moodDurationTurns + 1 : 1;

    // 2. Track recent history window (up to 4 turns)
    this.recentHistory.push(newEmotion);
    if (this.recentHistory.length > 4) {
      this.recentHistory.shift();
    }

    // 3. Deterministic Mood Trend Calculation
    const trend = this.calculateMoodTrend(newEmotion, prevEmotion);

    // 4. Update Levels
    const stressLevel = STRESS_LEVEL_MAP[newEmotion] ?? 4;
    const frustrationLevel = FRUSTRATION_LEVEL_MAP[newEmotion] ?? 2;
    const confidenceLevel = Math.round((emotionResult?.detector?.confidence ?? 0.7) * 10);
    const engagementLevel = newEmotion === 'neutral' ? 5 : 8;

    this.state = {
      currentMood: newEmotion,
      previousMood: prevEmotion,
      stressLevel,
      confidenceLevel,
      engagementLevel,
      frustrationLevel,
      moodTrend: trend,
      moodDurationTurns: durationTurns,
      lastUpdated: new Date(),
    };

    return { ...this.state };
  }

  /**
   * Calculates deterministic mood trend based on polarity valuations, stress intensity, and recent turn history.
   */
  private calculateMoodTrend(
    newEmotion: EmotionCategory,
    prevEmotion: EmotionCategory
  ): 'improving' | 'declining' | 'stable' | 'fluctuating' {
    // Check for stable trend first
    if (newEmotion === prevEmotion) {
      return 'stable';
    }

    // Check for fluctuating trend across 3+ recent turns
    if (this.recentHistory.length >= 3) {
      let polarityReversals = 0;
      for (let i = 1; i < this.recentHistory.length; i++) {
        const val1 = getEmotionValuation(this.recentHistory[i - 1]);
        const val2 = getEmotionValuation(this.recentHistory[i]);
        if (val1 !== 0 && val2 !== 0 && val1 !== val2) {
          polarityReversals++;
        }
      }
      if (polarityReversals >= 2) {
        return 'fluctuating';
      }
    }

    // Polarity Valuation Delta & Stress Level Delta
    const prevVal = getEmotionValuation(prevEmotion);
    const newVal = getEmotionValuation(newEmotion);
    const prevStress = STRESS_LEVEL_MAP[prevEmotion] ?? 4;
    const newStress = STRESS_LEVEL_MAP[newEmotion] ?? 4;

    if (newVal > prevVal || newStress < prevStress) {
      return 'improving';
    } else if (newVal < prevVal || newStress > prevStress) {
      return 'declining';
    }

    return 'stable';
  }

  /** Helper to create clean initial state */
  private createInitialState(): ShortTermEmotionalState {
    return {
      currentMood: 'neutral',
      previousMood: null,
      stressLevel: 4,
      confidenceLevel: 7,
      engagementLevel: 5,
      frustrationLevel: 2,
      moodTrend: 'stable',
      moodDurationTurns: 0,
      lastUpdated: new Date(),
    };
  }
}

/** Singleton export for EmotionalStateTracker */
export const emotionalStateTracker = new EmotionalStateTracker();
