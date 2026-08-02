/**
 * AURA Phase 5 — MultimodalEmotionAnalyzer Integration Tests
 * Tests the full multimodal pipeline: EmotionInput → detection → fusion → EmotionalContext.
 * Also verifies backward compatibility by confirming EmotionAnalyzer still works unchanged.
 */

import { MultimodalEmotionAnalyzer } from '../emotion/analyzer/multimodal.emotion.analyzer.js';
import { emotionAnalyzer } from '../emotion/analyzer/emotion.analyzer.js';
import { EmotionInput } from '../emotion/input/emotion.input.js';
import { VoiceFeatures } from '../emotion/detectors/voice/voice.features.js';
import { VisionFeatures } from '../emotion/detectors/vision/vision.features.js';
import { logger } from './logger.js';

const analyzer = new MultimodalEmotionAnalyzer();
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

logger.info('🧪 Running MultimodalEmotionAnalyzer Integration Tests...');

// ─── Test 1: Text-only EmotionInput ──────────────────────────────────────────

const textOnlyInput: EmotionInput = {
  text: 'I am so worried and stressed about my exam tomorrow',
};

const ctx1 = analyzer.analyze(textOnlyInput);
assert(
  ctx1.primaryEmotion === 'worried',
  'T1: Text-only input → worried detected',
  { primary: ctx1.primaryEmotion }
);
assert(
  ctx1.aiTone.responseStyle === 'gentle',
  'T2: Worried emotion → response style is "gentle"',
  { responseStyle: ctx1.aiTone.responseStyle }
);

// ─── Test 2: analyzeText() convenience overload ───────────────────────────────

const ctx2 = analyzer.analyzeText('I am so happy and excited today!');
assert(
  ctx2.primaryEmotion === 'happy' || ctx2.primaryEmotion === 'excited',
  'T3: analyzeText() convenience overload → happy or excited',
  { primary: ctx2.primaryEmotion }
);

// ─── Test 3: Voice-only EmotionInput ─────────────────────────────────────────

const sadVoice: VoiceFeatures = {
  pitchHz: 95, energyDb: -40, speechRateWpm: 90, jitter: 0.5, shimmer: 0.5, pauseRatio: 0.4,
};

const ctx3 = analyzer.analyze({ voice: sadVoice });
assert(
  ctx3.primaryEmotion === 'sad',
  'T4: Voice-only → sad detected',
  { primary: ctx3.primaryEmotion }
);

// ─── Test 4: Vision-only EmotionInput ────────────────────────────────────────

const happyFace: VisionFeatures = {
  smileScore: 0.85, browTension: 0.1, eyeOpenness: 0.65, mouthOpenness: 0.2, headTilt: 3,
};

const ctx4 = analyzer.analyze({ vision: happyFace });
assert(
  ctx4.primaryEmotion === 'happy',
  'T5: Vision-only → happy detected',
  { primary: ctx4.primaryEmotion }
);

// ─── Test 5: Full trimodal input ─────────────────────────────────────────────

const excitedVoice: VoiceFeatures = {
  pitchHz: 220, energyDb: -15, speechRateWpm: 200, jitter: 0.2, shimmer: 0.2, pauseRatio: 0.1,
};
const excitedFace: VisionFeatures = {
  smileScore: 0.75, browTension: 0.1, eyeOpenness: 0.90, mouthOpenness: 0.55, headTilt: 0,
};

const ctx5 = analyzer.analyze({
  text: 'I am absolutely thrilled and pumped about this!',
  voice: excitedVoice,
  vision: excitedFace,
});

assert(
  ctx5.primaryEmotion === 'excited' || ctx5.primaryEmotion === 'happy',
  'T6: Trimodal excited input → excited or happy',
  { primary: ctx5.primaryEmotion }
);
assert(
  ctx5.version === 1,
  'T7: Returns EmotionalContext v1 (backward compatible)',
  { version: ctx5.version }
);

// ─── Test 6: EmotionalContext structure is complete ───────────────────────────

assert(
  typeof ctx5.primaryEmotion === 'string' &&
  Array.isArray(ctx5.detectedEmotions) &&
  ctx5.detectedEmotions.length > 0 &&
  ctx5.aiTone !== undefined &&
  ctx5.shortTermState !== undefined &&
  ctx5.detectorMetadata !== undefined &&
  ctx5.detectorMetadata.source === 'fusion' &&
  ctx5.timestamp instanceof Date,
  'T8: Trimodal EmotionalContext structure is complete; detectorMetadata.source is "fusion"'
);

// ─── Test 7: Short-term state tracking persists across turns ─────────────────

const ctx6a = analyzer.analyze({ text: 'I feel so frustrated and stuck' });
const ctx6b = analyzer.analyze({ text: 'I am still frustrated' });

assert(
  ctx6a.shortTermState.currentMood === 'frustrated',
  'T9: State tracker updates after first turn → frustrated',
  { currentMood: ctx6a.shortTermState.currentMood }
);
assert(
  ctx6b.shortTermState.moodDurationTurns >= 2,
  'T10: State tracker increments moodDurationTurns for consecutive same mood',
  { moodDurationTurns: ctx6b.shortTermState.moodDurationTurns }
);

// ─── Test 8: resetState() works ──────────────────────────────────────────────

analyzer.resetState();
const ctx7 = analyzer.analyzeText('');
assert(
  ctx7.shortTermState.currentMood === 'neutral',
  'T11: After resetState() + empty input → state resets to neutral',
  { currentMood: ctx7.shortTermState.currentMood }
);

// ─── Test 9: Backward compatibility — existing EmotionAnalyzer still works ───

const legacyCtx = emotionAnalyzer.analyze('I am feeling overwhelmed and worried about my exam');
assert(
  legacyCtx.primaryEmotion === 'worried' && legacyCtx.aiTone.responseStyle === 'gentle',
  'T12: BACKWARD COMPAT — Existing EmotionAnalyzer.analyze(text) still works correctly',
  { primary: legacyCtx.primaryEmotion, style: legacyCtx.aiTone.responseStyle }
);

// ─── Summary ─────────────────────────────────────────────────────────────────

logger.info(`\n📊 MultimodalEmotionAnalyzer Tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  logger.error('❌ Some MultimodalEmotionAnalyzer tests FAILED');
  process.exit(1);
}
logger.info('🎉 All MultimodalEmotionAnalyzer integration tests passed!');
logger.info('🎯 Phase 5 Perception Layer is OPERATIONAL and backward compatible!');
