/**
 * AURA Phase 5 — VoiceEmotionDetector Unit Tests
 * Tests deterministic acoustic heuristic rules across emotion categories and edge cases.
 */

import { VoiceEmotionDetector } from '../emotion/detectors/voice/voice.detector.js';
import { VoiceFeatures } from '../emotion/detectors/voice/voice.features.js';
import { logger } from './logger.js';

const detector = new VoiceEmotionDetector();
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

const excitedVoice: VoiceFeatures = {
  pitchHz: 220, energyDb: -15, speechRateWpm: 200, jitter: 0.2, shimmer: 0.2, pauseRatio: 0.1,
};

const sadVoice: VoiceFeatures = {
  pitchHz: 95, energyDb: -40, speechRateWpm: 90, jitter: 0.5, shimmer: 0.5, pauseRatio: 0.4,
};

const calmVoice: VoiceFeatures = {
  pitchHz: 130, energyDb: -32, speechRateWpm: 140, jitter: 0.1, shimmer: 0.1, pauseRatio: 0.2,
};

const angryVoice: VoiceFeatures = {
  pitchHz: 200, energyDb: -12, speechRateWpm: 190, jitter: 0.5, shimmer: 0.3, pauseRatio: 0.1,
};

const worriedVoice: VoiceFeatures = {
  pitchHz: 170, energyDb: -28, speechRateWpm: 130, jitter: 0.55, shimmer: 0.5, pauseRatio: 0.35,
};

const thinkingVoice: VoiceFeatures = {
  pitchHz: 140, energyDb: -35, speechRateWpm: 100, jitter: 0.2, shimmer: 0.15, pauseRatio: 0.50,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

logger.info('🧪 Running VoiceEmotionDetector Unit Tests...');

// Test 1: Modality tag
const result1 = detector.detect(excitedVoice);
assert(detector.modality === 'voice', 'T1: modality tag is "voice"', { modality: detector.modality });

// Test 2: Excited voice
assert(result1.primaryEmotion === 'excited', 'T2: High-pitch/high-energy/fast speech → excited', {
  primary: result1.primaryEmotion, confidence: result1.detector.confidence,
});

// Test 3: Sad voice
const result3 = detector.detect(sadVoice);
assert(result3.primaryEmotion === 'sad', 'T3: Low-pitch/low-energy/slow speech → sad', {
  primary: result3.primaryEmotion,
});

// Test 4: Calm voice
const result4 = detector.detect(calmVoice);
assert(result4.primaryEmotion === 'calm', 'T4: Stable/moderate features → calm', {
  primary: result4.primaryEmotion,
});

// Test 5: Angry voice
const result5 = detector.detect(angryVoice);
assert(
  result5.primaryEmotion === 'angry' || result5.primaryEmotion === 'excited',
  'T5: High-energy/high-pitch/high-jitter → angry or excited',
  { primary: result5.primaryEmotion }
);

// Test 6: Worried voice
const result6 = detector.detect(worriedVoice);
assert(
  result6.primaryEmotion === 'worried' || result6.primaryEmotion === 'frustrated',
  'T6: High-jitter/high-pause → worried or frustrated',
  { primary: result6.primaryEmotion }
);

// Test 7: Thinking voice
const result7 = detector.detect(thinkingVoice);
assert(
  result7.primaryEmotion === 'thinking' || result7.primaryEmotion === 'confused',
  'T7: Slow-rate/high-pause → thinking or confused',
  { primary: result7.primaryEmotion }
);

// Test 8: Detector source label
assert(result1.detector.source === 'voice', 'T8: detector.source is "voice"', { source: result1.detector.source });

// Test 9: EmotionResult structure is complete
assert(
  typeof result1.primaryEmotion === 'string' &&
  Array.isArray(result1.emotions) &&
  result1.emotions.length > 0 &&
  typeof result1.reasoning === 'string' &&
  result1.timestamp instanceof Date,
  'T9: EmotionResult structure is complete and valid'
);

// Test 10: Confidence clamped to max 0.95
const allResults = [result1, result3, result4, result5, result6, result7];
const allConfidencesValid = allResults.every((r) => r.detector.confidence >= 0 && r.detector.confidence <= 0.95);
assert(allConfidencesValid, 'T10: All detector confidences are clamped within [0.0, 0.95]');

// Test 11: Emotions array sorted by confidence descending
const emotionsSorted = result1.emotions.every((e, i, arr) =>
  i === 0 || arr[i - 1].confidence >= e.confidence
);
assert(emotionsSorted, 'T11: Emotions array is sorted by confidence descending');

// Test 12: processingTimeMs is a valid non-negative number
assert(
  typeof result1.detector.processingTimeMs === 'number' && result1.detector.processingTimeMs >= 0,
  'T12: processingTimeMs is a valid non-negative number',
  { processingTimeMs: result1.detector.processingTimeMs }
);

// ─── Summary ─────────────────────────────────────────────────────────────────

logger.info(`\n📊 VoiceEmotionDetector Tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  logger.error('❌ Some VoiceEmotionDetector tests FAILED');
  process.exit(1);
}
logger.info('🎉 All VoiceEmotionDetector unit tests passed!');
