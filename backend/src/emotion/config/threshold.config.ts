/**
 * AURA Emotional Intelligence Engine — Threshold Configuration
 * Centralized constants governing confidence boundaries, intensity scales, and schema versions.
 */

export const EMOTION_THRESHOLDS = {
  /** Confidence >= 0.90: Accepted immediately without secondary reasoning */
  CONFIDENCE_HIGH: 0.9,

  /** 0.40 <= Confidence < 0.90: Allows multi-emotion weighting & contextual reasoning */
  CONFIDENCE_MEDIUM: 0.4,

  /** Confidence < 0.40: Ignored or treated as neutral baseline */
  CONFIDENCE_LOW: 0.4,

  /** Minimum emotion intensity level */
  INTENSITY_MIN: 1,

  /** Maximum emotion intensity level */
  INTENSITY_MAX: 10,

  /** Default version tag for EmotionalContext schema */
  SCHEMA_VERSION: 1,
} as const;
