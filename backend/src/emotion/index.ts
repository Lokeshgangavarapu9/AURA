/**
 * AURA Emotional Intelligence Engine — Module Entry Point
 * Public exports for external consumption (ConversationManager & MemoryEngine).
 *
 * Phase 4 exports (unchanged):
 *  - All types, config, EmotionAnalyzer, WeightCalculator
 *
 * Phase 5 additions:
 *  - IModalDetector<TInput>, EmotionInput, VoiceFeatures, VisionFeatures
 *  - VoiceEmotionDetector, VisionEmotionDetector
 *  - MultimodalEmotionFusionEngine, ModalDetectorResult, FUSION_CONFIG
 *  - MultimodalEmotionAnalyzer
 */

// Phase 4 — unchanged exports
export * from './types/index.js';
export * from './config/threshold.config.js';
export * from './analyzer/emotion.analyzer.js';
export * from './weight/weight.calculator.js';

// Phase 5 — new exports (additive)
export * from './detectors/modal.detector.js';
export * from './input/emotion.input.js';
export * from './detectors/voice/voice.features.js';
export * from './detectors/voice/voice.detector.js';
export * from './detectors/vision/vision.features.js';
export * from './detectors/vision/vision.detector.js';
export * from './fusion/fusion.config.js';
export * from './fusion/fusion.engine.js';
export * from './analyzer/multimodal.emotion.analyzer.js';

