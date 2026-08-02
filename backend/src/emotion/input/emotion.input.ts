/**
 * AURA Emotional Intelligence Engine — EmotionInput Domain Value Object
 * Phase 5: Typed multimodal input contract for MultimodalEmotionAnalyzer.
 *
 * EmotionInput is a plain value object that carries one or more modality payloads
 * for a single conversation turn. All modalities are optional — the analyzer
 * gracefully handles any combination:
 *
 *   text only     → delegates to RuleBasedEmotionDetector
 *   voice only    → delegates to VoiceEmotionDetector
 *   vision only   → delegates to VisionEmotionDetector
 *   text + voice  → fuses two signals
 *   all three     → fuses all three signals (highest fidelity)
 *
 * Contains ZERO runtime code — pure TypeScript type definitions only.
 * Completely decoupled from database, Gemini API, Express, and React.
 */

import { VoiceFeatures } from '../detectors/voice/voice.features.js';
import { VisionFeatures } from '../detectors/vision/vision.features.js';

/**
 * Multimodal emotion analysis input for a single conversation turn.
 * At least one modality must be provided for meaningful analysis.
 * If no modalities are provided, the analyzer defaults to neutral.
 */
export interface EmotionInput {
  /**
   * Raw text message from the user.
   * When provided, the RuleBasedEmotionDetector analyzes this input.
   */
  text?: string;

  /**
   * Acoustic features extracted from a speech segment.
   * When provided, the VoiceEmotionDetector analyzes this input.
   */
  voice?: VoiceFeatures;

  /**
   * Facial expression features extracted from a camera frame.
   * When provided, the VisionEmotionDetector analyzes this input.
   */
  vision?: VisionFeatures;
}
