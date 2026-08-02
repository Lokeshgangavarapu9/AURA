/**
 * AURA Emotional Intelligence Engine — Multimodal Fusion Configuration
 * Phase 5: Centralized weight coefficients and fusion policy constants.
 *
 * These values control HOW MUCH each modality's emotion signal contributes to the
 * fused output. Weights must sum to 1.0 for a valid probability distribution.
 *
 * Rationale for defaults:
 *  - Text (0.50): Highest weight — AURA is a language-first companion and text carries
 *    the most precise semantic and emotional information in most conversational contexts.
 *  - Voice (0.30): Strong secondary signal — acoustic features are highly correlated with
 *    emotional arousal (excitement, sadness, anger) and add significant fidelity.
 *  - Vision (0.20): Tertiary signal — facial expressions provide useful confirmatory
 *    data but are more context-dependent and prone to neutral resting faces.
 *
 * Adjustable without touching any detector or analyzer code.
 */

export const FUSION_CONFIG = {
  /**
   * Modality weight coefficients (must sum to 1.0 across active modalities).
   * These are RELATIVE weights — they are re-normalized at runtime based on
   * which modalities are actually present in a given turn.
   */
  MODALITY_WEIGHTS: {
    /** Weight for text-based emotion signal */
    text: 0.50,
    /** Weight for voice/acoustic emotion signal */
    voice: 0.30,
    /** Weight for vision/facial expression emotion signal */
    vision: 0.20,
  } as const,

  /**
   * Minimum detector confidence threshold.
   * Results with detector.confidence below this value are downweighted in fusion.
   * This prevents low-confidence signals from distorting the fused output.
   */
  MIN_CONFIDENCE_THRESHOLD: 0.40,

  /**
   * Confidence discount factor applied to signals below MIN_CONFIDENCE_THRESHOLD.
   * The signal is still included but at reduced weight.
   */
  LOW_CONFIDENCE_DISCOUNT: 0.50,

  /**
   * Minimum emotion score contribution for inclusion in the fused output distribution.
   * Scores below this are pruned from the final EmotionScore[] array.
   */
  MIN_SCORE_FOR_INCLUSION: 0.05,

  /**
   * Maximum number of emotion candidates retained in the fused output distribution.
   * Keeps the payload concise and downstream consumers focused.
   */
  MAX_FUSION_CANDIDATES: 5,
} as const;
