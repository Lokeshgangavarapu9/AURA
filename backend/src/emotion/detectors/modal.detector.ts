/**
 * AURA Emotional Intelligence Engine — Generic Modal Detector Strategy Contract
 * Phase 5: Extends the detector pattern to typed non-text inputs (voice, vision, future sensors).
 *
 * Design:
 *  - IModalDetector<TInput> is PARALLEL to IEmotionDetector — it does NOT replace it.
 *  - IEmotionDetector (text: string) is preserved 100% for RuleBasedEmotionDetector.
 *  - IModalDetector accepts a typed domain value object (e.g. VoiceFeatures, VisionFeatures).
 *  - The `modality` property lets the FusionEngine identify the signal source.
 *
 * Completely decoupled from database, Gemini API, Express, and React.
 */

import { EmotionResult } from '../types/index.js';
import { DetectorSource } from '../types/index.js';

/**
 * Generic strategy interface for typed, non-text emotion detectors.
 * @template TInput - The domain value object representing the raw sensor/media input.
 */
export interface IModalDetector<TInput> {
  /**
   * Analyzes a typed input payload and returns a structured EmotionResult.
   * Pure function: no side effects, deterministic for equivalent inputs.
   * @param input Typed input value object (e.g. VoiceFeatures, VisionFeatures)
   */
  detect(input: TInput): EmotionResult;

  /**
   * Identifies the signal modality this detector handles.
   * Used by MultimodalEmotionFusionEngine for provenance tracking.
   */
  readonly modality: DetectorSource;
}
