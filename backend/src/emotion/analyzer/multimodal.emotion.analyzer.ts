/**
 * AURA Emotional Intelligence Engine — Multimodal Emotion Analyzer Facade
 * Phase 5: Extended analyzer orchestrating multi-modality detection and fusion.
 *
 * Design:
 *  - Parallel to existing EmotionAnalyzer — does NOT modify or replace it.
 *  - Accepts EmotionInput (text? + voice? + vision?) and routes to available detectors.
 *  - Fuses all available signals via MultimodalEmotionFusionEngine.
 *  - Routes the fused EmotionResult through the SAME existing pipeline:
 *      ResponsePolicy → EmotionalStateTracker → EmotionContextBuilder
 *  - Returns the standard EmotionalContext (v1) — downstream contracts unchanged.
 *  - Fully backward compatible: ConversationManager can upgrade at any time by
 *    swapping emotionAnalyzer.analyze(text) for multimodalEmotionAnalyzer.analyze(input).
 *
 * Dependency injection pattern mirrors EmotionAnalyzer for testability.
 * Completely decoupled from database, Gemini API, Express, and React.
 */

import { IEmotionDetector } from '../detectors/emotion.detector.js';
import { ruleBasedEmotionDetector } from '../detectors/rule.detector.js';
import { IModalDetector } from '../detectors/modal.detector.js';
import { VoiceFeatures } from '../detectors/voice/voice.features.js';
import { VisionFeatures } from '../detectors/vision/vision.features.js';
import { voiceEmotionDetector } from '../detectors/voice/voice.detector.js';
import { visionEmotionDetector } from '../detectors/vision/vision.detector.js';
import {
  MultimodalEmotionFusionEngine,
  ModalDetectorResult,
  multimodalEmotionFusionEngine,
} from '../fusion/fusion.engine.js';
import { ResponsePolicy, responsePolicy } from '../policy/response.policy.js';
import { EmotionalStateTracker, emotionalStateTracker } from '../tracker/state.tracker.js';
import { EmotionContextBuilder, emotionContextBuilder } from '../context/context.builder.js';
import { EmotionInput } from '../input/emotion.input.js';
import { EmotionalContext } from '../types/index.js';

export class MultimodalEmotionAnalyzer {
  private textDetector: IEmotionDetector;
  private voiceDetector: IModalDetector<VoiceFeatures>;
  private visionDetector: IModalDetector<VisionFeatures>;
  private fusionEngine: MultimodalEmotionFusionEngine;
  private policy: ResponsePolicy;
  private tracker: EmotionalStateTracker;
  private contextBuilder: EmotionContextBuilder;

  constructor(
    textDet: IEmotionDetector = ruleBasedEmotionDetector,
    voiceDet: IModalDetector<VoiceFeatures> = voiceEmotionDetector,
    visionDet: IModalDetector<VisionFeatures> = visionEmotionDetector,
    fusion: MultimodalEmotionFusionEngine = multimodalEmotionFusionEngine,
    pol: ResponsePolicy = responsePolicy,
    trk: EmotionalStateTracker = emotionalStateTracker,
    builder: EmotionContextBuilder = emotionContextBuilder
  ) {
    this.textDetector = textDet;
    this.voiceDetector = voiceDet;
    this.visionDetector = visionDet;
    this.fusionEngine = fusion;
    this.policy = pol;
    this.tracker = trk;
    this.contextBuilder = builder;
  }

  /**
   * Master multimodal analysis pipeline.
   * Accepts any combination of text, voice, and vision signals for a single turn.
   * Returns the standard EmotionalContext (v1) — identical contract to EmotionAnalyzer.
   *
   * @param input EmotionInput value object (at least one modality should be provided)
   */
  public analyze(input: EmotionInput): EmotionalContext {
    // 1. Collect available modal results
    const modalResults: ModalDetectorResult[] = [];

    if (input.text !== undefined && input.text.trim().length > 0) {
      const textResult = this.textDetector.detectEmotion(input.text);
      modalResults.push({ source: textResult.detector.source, result: textResult });
    }

    if (input.voice !== undefined) {
      const voiceResult = this.voiceDetector.detect(input.voice);
      modalResults.push({ source: voiceResult.detector.source, result: voiceResult });
    }

    if (input.vision !== undefined) {
      const visionResult = this.visionDetector.detect(input.vision);
      modalResults.push({ source: visionResult.detector.source, result: visionResult });
    }

    // 2. Fuse all available signals (handles 0, 1, or N inputs gracefully)
    const fusedResult = this.fusionEngine.fuse(modalResults);

    // 3. Determine AI response tone (AIEmotion & ResponseStyle) — same as EmotionAnalyzer
    const aiTone = this.policy.determineResponseTone(fusedResult);

    // 4. Update short-term emotional state tracker — same as EmotionAnalyzer
    const emotionalState = this.tracker.updateState(fusedResult);

    // 5. Assemble & return version 1 EmotionalContext — same contract as EmotionAnalyzer
    return this.contextBuilder.buildContext(fusedResult, aiTone, emotionalState);
  }

  /**
   * Convenience overload: accepts a plain text string.
   * Allows gradual migration from EmotionAnalyzer.analyze(text) syntax.
   * @param text Plain text user message
   */
  public analyzeText(text: string): EmotionalContext {
    return this.analyze({ text });
  }

  /**
   * Resets short-term emotional state tracker to neutral baseline.
   */
  public resetState(): void {
    this.tracker.reset();
  }
}

/** Singleton export for MultimodalEmotionAnalyzer */
export const multimodalEmotionAnalyzer = new MultimodalEmotionAnalyzer();
