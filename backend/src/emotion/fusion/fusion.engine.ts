/**
 * AURA Emotional Intelligence Engine — Multimodal Emotion Fusion Engine
 * Phase 5: Confidence-weighted signal aggregation across emotion detector results.
 *
 * Design:
 *  - Accepts an array of ModalDetectorResult entries (source + EmotionResult).
 *  - Does NOT depend on any specific detector implementation — only on EmotionResult[].
 *  - Uses confidence-weighted voting across all emotion candidates from all modalities.
 *  - Returns a single fused EmotionResult with source: 'fusion'.
 *  - Adding new modalities (wearable, typing, gesture) requires zero changes to this engine.
 *
 * Fusion Algorithm:
 *  1. Retrieve the per-modality base weight from FUSION_CONFIG.MODALITY_WEIGHTS.
 *  2. Apply a low-confidence discount if detector.confidence < MIN_CONFIDENCE_THRESHOLD.
 *  3. For each emotion score in each modality's distribution, accumulate:
 *       fused[emotion] += (score.confidence × score.intensity × effectiveModalityWeight)
 *  4. Normalize accumulated fused scores to [0.0, 1.0].
 *  5. Sort by fused score descending; select primaryEmotion as top candidate.
 *  6. Clamp final output confidence to [0.0, 0.95].
 *
 * Completely decoupled from database, Gemini API, Express, and React.
 * Pure mathematical logic: zero state, zero side effects.
 */

import { EmotionCategory, EmotionResult, EmotionScore, DetectorSource } from '../types/index.js';
import { FUSION_CONFIG } from './fusion.config.js';

/**
 * Carries a modality source tag alongside its detector output.
 * The FusionEngine uses the source to look up the correct modality weight.
 */
export interface ModalDetectorResult {
  /** Source modality tag identifying the originating detector */
  source: DetectorSource;
  /** Full EmotionResult produced by the modality's detector */
  result: EmotionResult;
}

export class MultimodalEmotionFusionEngine {
  /**
   * Fuses one or more modal detector results into a single authoritative EmotionResult.
   *
   * @param inputs Array of ModalDetectorResult entries (at least one required).
   *               Order does not affect the output; weights are source-keyed.
   * @returns A fused EmotionResult with source: 'fusion' representing unified emotional state.
   */
  public fuse(inputs: ModalDetectorResult[]): EmotionResult {
    const startTime = Date.now();

    // Guard: single input passthrough (no fusion math needed)
    if (inputs.length === 0) {
      return this.buildNeutralResult(Date.now() - startTime, 'No modal inputs provided for fusion');
    }

    if (inputs.length === 1) {
      return this.wrapSingleResult(inputs[0], Date.now() - startTime);
    }

    // Step 1: Compute effective weights per modality (re-normalize based on present modalities)
    const effectiveWeights = this.computeEffectiveWeights(inputs);

    // Step 2: Accumulate weighted emotion scores across all modalities
    const accumulatedScores: Map<EmotionCategory, number> = new Map();

    for (const input of inputs) {
      const baseWeight = effectiveWeights.get(input.source) ?? 0;

      // Apply low-confidence discount if detector confidence is below threshold
      const confidenceMultiplier =
        input.result.detector.confidence < FUSION_CONFIG.MIN_CONFIDENCE_THRESHOLD
          ? FUSION_CONFIG.LOW_CONFIDENCE_DISCOUNT
          : 1.0;

      const effectiveWeight = baseWeight * confidenceMultiplier;

      // Accumulate each emotion score from this modality
      for (const emotionScore of input.result.emotions) {
        const current = accumulatedScores.get(emotionScore.emotion) ?? 0;
        // Weighted contribution: confidence × (intensity/10) × effective modality weight
        const contribution = emotionScore.confidence * (emotionScore.intensity / 10) * effectiveWeight;
        accumulatedScores.set(emotionScore.emotion, current + contribution);
      }
    }

    // Step 3: Normalize accumulated scores to [0.0, 1.0]
    const maxScore = Math.max(...accumulatedScores.values());
    if (maxScore === 0) {
      return this.buildNeutralResult(Date.now() - startTime, 'All modality signals produced zero scores');
    }

    // Step 4: Build normalized EmotionScore distribution, filter below threshold
    const fusedScores: EmotionScore[] = [];

    for (const [emotion, rawScore] of accumulatedScores.entries()) {
      const normalizedScore = rawScore / maxScore;
      if (normalizedScore >= FUSION_CONFIG.MIN_SCORE_FOR_INCLUSION) {
        // Reconstruct intensity from the source detectors (take max intensity seen for this emotion)
        const maxIntensity = this.getMaxIntensityForEmotion(emotion, inputs);
        fusedScores.push({
          emotion,
          confidence: Math.round(normalizedScore * 100) / 100,
          intensity: maxIntensity,
        });
      }
    }

    // Step 5: Sort by fused confidence descending, cap at MAX_FUSION_CANDIDATES
    fusedScores.sort((a, b) => b.confidence - a.confidence);
    const topScores = fusedScores.slice(0, FUSION_CONFIG.MAX_FUSION_CANDIDATES);

    if (topScores.length === 0) {
      return this.buildNeutralResult(Date.now() - startTime, 'All fusion candidates pruned below minimum threshold');
    }

    const primaryEmotion = topScores[0].emotion;
    const primaryConfidence = Math.min(0.95, topScores[0].confidence);
    const processingTimeMs = Date.now() - startTime;

    const sourcesUsed = inputs.map((i) => i.source).join('+');
    const emotionList = topScores.map((s) => s.emotion).join(', ');

    return {
      primaryEmotion,
      emotions: topScores,
      reasoning: `Fused emotions [${emotionList}] from modalities [${sourcesUsed}] via confidence-weighted voting`,
      detector: {
        source: 'fusion',
        confidence: Math.round(primaryConfidence * 100) / 100,
        processingTimeMs,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Computes re-normalized effective weights for the specific set of modalities present.
   * Only modalities with recognized sources are weighted; unknowns receive equal share.
   */
  private computeEffectiveWeights(inputs: ModalDetectorResult[]): Map<DetectorSource, number> {
    const weights = FUSION_CONFIG.MODALITY_WEIGHTS;
    const effectiveWeights = new Map<DetectorSource, number>();

    let totalWeight = 0;
    for (const input of inputs) {
      const source = input.source;
      const baseWeight =
        source === 'rule-based' || source === 'gemini'
          ? weights.text   // treat text-based detectors as text modality
          : source === 'voice'
            ? weights.voice
            : source === 'vision'
              ? weights.vision
              : 1.0; // unknown modality: equal weight

      effectiveWeights.set(source, baseWeight);
      totalWeight += baseWeight;
    }

    // Re-normalize so weights sum to 1.0 for the present modalities
    if (totalWeight > 0) {
      for (const [source, weight] of effectiveWeights.entries()) {
        effectiveWeights.set(source, weight / totalWeight);
      }
    }

    return effectiveWeights;
  }

  /**
   * Finds the maximum intensity seen for a given emotion across all modal inputs.
   * Used to preserve intensity fidelity in the fused output.
   */
  private getMaxIntensityForEmotion(emotion: EmotionCategory, inputs: ModalDetectorResult[]): number {
    let maxIntensity = 5; // sensible default
    for (const input of inputs) {
      for (const score of input.result.emotions) {
        if (score.emotion === emotion && score.intensity > maxIntensity) {
          maxIntensity = score.intensity;
        }
      }
    }
    return maxIntensity;
  }

  /**
   * Wraps a single-modality result as a fusion passthrough.
   * Relabels source to 'fusion' to signal it passed through this engine.
   */
  private wrapSingleResult(input: ModalDetectorResult, processingTimeMs: number): EmotionResult {
    return {
      ...input.result,
      reasoning: `Single-modality passthrough [${input.source}]: ${input.result.reasoning}`,
      detector: {
        source: 'fusion',
        confidence: input.result.detector.confidence,
        processingTimeMs: input.result.detector.processingTimeMs + processingTimeMs,
      },
    };
  }

  /** Constructs a neutral EmotionResult for fallback edge cases */
  private buildNeutralResult(processingTimeMs: number, reasoning: string): EmotionResult {
    return {
      primaryEmotion: 'neutral',
      emotions: [{ emotion: 'neutral', confidence: 0.5, intensity: 4 }],
      reasoning,
      detector: {
        source: 'fusion',
        confidence: 0.5,
        processingTimeMs,
      },
      timestamp: new Date(),
    };
  }
}

/** Singleton export for MultimodalEmotionFusionEngine */
export const multimodalEmotionFusionEngine = new MultimodalEmotionFusionEngine();
