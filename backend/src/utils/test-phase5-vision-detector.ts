/**
 * AURA Phase 5 — VisionEmotionDetector Unit Tests
 * Tests deterministic FACS-grounded facial expression rules across emotion categories.
 */

import { VisionEmotionDetector } from '../emotion/detectors/vision/vision.detector.js';
import { VisionFeatures } from '../emotion/detectors/vision/vision.features.js';
import { logger } from './logger.js';

const detector = new VisionEmotionDetector();
let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: object): void {
  if (condition) {
    logger.info({ ...details }, `✅ ${testName}`);
    passed++;
  } else {
    logger.error({ ...details }, `❌ FAILED: ${testName}`);
    failed++;
  }
}

// ─── Test fixtures ────────────────────────────────────────────────────────────

const happyFace: VisionFeatures = {
  smileScore: 0.85, browTension: 0.1, eyeOpenness: 0.65, mouthOpenness: 0.2, headTilt: 3,
};

const excitedFace: VisionFeatures = {
  smileScore: 0.75, browTension: 0.1, eyeOpenness: 0.90, mouthOpenness: 0.55, headTilt: 0,
};

const angryFace: VisionFeatures = {
  smileScore: 0.05, browTension: 0.80, eyeOpenness: 0.25, mouthOpenness: 0.1, headTilt: 0,
};

const sadFace: VisionFeatures = {
  smileScore: 0.10, browTension: 0.55, eyeOpenness: 0.35, mouthOpenness: 0.05, headTilt: -5,
};

const surprisedFace: VisionFeatures = {
  smileScore: 0.30, browTension: 0.10, eyeOpenness: 0.95, mouthOpenness: 0.70, headTilt: 0,
};

const curiousFace: VisionFeatures = {
  smileScore: 0.30, browTension: 0.20, eyeOpenness: 0.60, mouthOpenness: 0.15, headTilt: 18,
};

const calmFace: VisionFeatures = {
  smileScore: 0.25, browTension: 0.12, eyeOpenness: 0.55, mouthOpenness: 0.05, headTilt: 2,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

logger.info('🧪 Running VisionEmotionDetector Unit Tests...');

// Test 1: Modality tag
assert(detector.modality === 'vision', 'T1: modality tag is "vision"', { modality: detector.modality });

// Test 2: Happy face
const result2 = detector.detect(happyFace);
assert(result2.primaryEmotion === 'happy', 'T2: High smile, relaxed brow → happy', {
  primary: result2.primaryEmotion,
});

// Test 3: Excited face
const result3 = detector.detect(excitedFace);
assert(
  result3.primaryEmotion === 'excited' || result3.primaryEmotion === 'happy',
  'T3: High smile, wide eyes, open mouth → excited or happy',
  { primary: result3.primaryEmotion }
);

// Test 4: Angry face
const result4 = detector.detect(angryFace);
assert(result4.primaryEmotion === 'angry', 'T4: High brow tension, narrow eyes, no smile → angry', {
  primary: result4.primaryEmotion,
});

// Test 5: Sad face
const result5 = detector.detect(sadFace);
assert(result5.primaryEmotion === 'sad', 'T5: Low smile, brow tension, low eye openness → sad', {
  primary: result5.primaryEmotion,
});

// Test 6: Surprised face
const result6 = detector.detect(surprisedFace);
assert(result6.primaryEmotion === 'surprised', 'T6: Wide eyes, open mouth, relaxed brow → surprised', {
  primary: result6.primaryEmotion,
});

// Test 7: Curious face (head tilt)
const result7 = detector.detect(curiousFace);
assert(
  result7.primaryEmotion === 'curious' || result7.primaryEmotion === 'calm',
  'T7: Head tilt + relaxed brow → curious or calm',
  { primary: result7.primaryEmotion }
);

// Test 8: Calm face
const result8 = detector.detect(calmFace);
assert(
  result8.primaryEmotion === 'calm' || result8.primaryEmotion === 'curious',
  'T8: Low brow tension, moderate expression → calm or curious',
  { primary: result8.primaryEmotion }
);

// Test 9: Detector source label
assert(result2.detector.source === 'vision', 'T9: detector.source is "vision"');

// Test 10: EmotionResult structure is complete
assert(
  typeof result2.primaryEmotion === 'string' &&
  Array.isArray(result2.emotions) &&
  result2.emotions.length > 0 &&
  typeof result2.reasoning === 'string' &&
  result2.timestamp instanceof Date,
  'T10: EmotionResult structure is complete and valid'
);

// Test 11: Confidence clamped to max 0.95
const allResults = [result2, result3, result4, result5, result6, result7, result8];
const allConfidencesValid = allResults.every((r) => r.detector.confidence >= 0 && r.detector.confidence <= 0.95);
assert(allConfidencesValid, 'T11: All detector confidences clamped within [0.0, 0.95]');

// Test 12: Emotions array sorted by confidence descending
const emotionsSorted = result2.emotions.every((e, i, arr) =>
  i === 0 || arr[i - 1].confidence >= e.confidence
);
assert(emotionsSorted, 'T12: Emotions array sorted by confidence descending');

// ─── Summary ─────────────────────────────────────────────────────────────────

logger.info(`\n📊 VisionEmotionDetector Tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  logger.error('❌ Some VisionEmotionDetector tests FAILED');
  process.exit(1);
}
logger.info('🎉 All VisionEmotionDetector unit tests passed!');
