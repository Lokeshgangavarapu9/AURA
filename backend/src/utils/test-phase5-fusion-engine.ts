/**
 * AURA Phase 5 — MultimodalEmotionFusionEngine Unit Tests
 * Tests confidence-weighted fusion math across single, dual, and triple modality combinations.
 */

import { MultimodalEmotionFusionEngine, ModalDetectorResult } from '../emotion/fusion/fusion.engine.js';
import { EmotionResult } from '../emotion/types/index.js';
import { logger } from './logger.js';

const engine = new MultimodalEmotionFusionEngine();
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

// ─── Helper factory ───────────────────────────────────────────────────────────

function makeResult(
  primaryEmotion: string,
  confidence: number,
  source: 'rule-based' | 'voice' | 'vision' | 'fusion' | 'gemini'
): EmotionResult {
  return {
    primaryEmotion: primaryEmotion as any,
    emotions: [
      { emotion: primaryEmotion as any, confidence, intensity: 8 },
    ],
    reasoning: `Mock ${source} result`,
    detector: { source, confidence, processingTimeMs: 1 },
    timestamp: new Date(),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

logger.info('🧪 Running MultimodalEmotionFusionEngine Unit Tests...');

// Test 1: Empty input → neutral fallback
const result1 = engine.fuse([]);
assert(result1.primaryEmotion === 'neutral', 'T1: Empty input → neutral fallback', {
  primary: result1.primaryEmotion,
});

// Test 2: Single input passthrough — source relabeled to 'fusion'
const singleInput: ModalDetectorResult[] = [
  { source: 'rule-based', result: makeResult('happy', 0.85, 'rule-based') },
];
const result2 = engine.fuse(singleInput);
assert(result2.primaryEmotion === 'happy', 'T2: Single input passthrough preserves primaryEmotion', {
  primary: result2.primaryEmotion,
});
assert(result2.detector.source === 'fusion', 'T3: Single input passthrough relabels source to "fusion"', {
  source: result2.detector.source,
});

// Test 4: Dual modality — same emotion, both agree → high confidence fusion
const agreedInputs: ModalDetectorResult[] = [
  { source: 'rule-based', result: makeResult('sad', 0.85, 'rule-based') },
  { source: 'voice', result: makeResult('sad', 0.78, 'voice') },
];
const result4 = engine.fuse(agreedInputs);
assert(result4.primaryEmotion === 'sad', 'T4: Dual modality agreement → agreed emotion wins', {
  primary: result4.primaryEmotion,
});
assert(result4.detector.source === 'fusion', 'T5: Fused source is "fusion"');

// Test 6: Dual modality — conflicting emotions, text outweighs vision
const conflictInputs: ModalDetectorResult[] = [
  { source: 'rule-based', result: makeResult('happy', 0.90, 'rule-based') }, // text weight 0.50
  { source: 'vision',     result: makeResult('sad',   0.75, 'vision') },    // vision weight 0.20
];
const result6 = engine.fuse(conflictInputs);
assert(
  result6.primaryEmotion === 'happy',
  'T6: Conflicting signals — higher-weighted text (0.50) beats vision (0.20)',
  { primary: result6.primaryEmotion }
);

// Test 7: Triple modality — all three agree → strong fusion result
const tripleInputs: ModalDetectorResult[] = [
  { source: 'rule-based', result: makeResult('excited', 0.80, 'rule-based') },
  { source: 'voice',      result: makeResult('excited', 0.82, 'voice') },
  { source: 'vision',     result: makeResult('excited', 0.76, 'vision') },
];
const result7 = engine.fuse(tripleInputs);
assert(result7.primaryEmotion === 'excited', 'T7: Triple modality agreement → excited', {
  primary: result7.primaryEmotion,
});
assert(result7.detector.source === 'fusion', 'T8: Triple fusion source is "fusion"');

// Test 9: Low-confidence signal is discounted
const lowConfInputs: ModalDetectorResult[] = [
  { source: 'rule-based', result: makeResult('calm', 0.85, 'rule-based') },
  {
    source: 'voice',
    result: {
      primaryEmotion: 'angry',
      emotions: [{ emotion: 'angry', confidence: 0.90, intensity: 9 }],
      reasoning: 'Mock low-confidence angry',
      detector: { source: 'voice', confidence: 0.20, processingTimeMs: 1 }, // below threshold
      timestamp: new Date(),
    },
  },
];
const result9 = engine.fuse(lowConfInputs);
assert(
  result9.primaryEmotion === 'calm',
  'T9: Low-confidence signal discounted — high-confidence text wins',
  { primary: result9.primaryEmotion }
);

// Test 10: EmotionResult structure is complete
assert(
  typeof result7.primaryEmotion === 'string' &&
  Array.isArray(result7.emotions) &&
  result7.emotions.length > 0 &&
  typeof result7.reasoning === 'string' &&
  result7.timestamp instanceof Date,
  'T10: Fused EmotionResult structure is complete and valid'
);

// Test 11: Confidence clamped to 0.95 max
const allFusedResults = [result1, result2, result4, result6, result7, result9];
assert(
  allFusedResults.every((r) => r.detector.confidence <= 0.95),
  'T11: All fused confidences clamped to max 0.95'
);

// Test 12: Emotions array has at most MAX_FUSION_CANDIDATES entries
assert(
  result7.emotions.length <= 5,
  'T12: Fused emotions array respects MAX_FUSION_CANDIDATES (max 5)',
  { count: result7.emotions.length }
);

// ─── Summary ─────────────────────────────────────────────────────────────────

logger.info(`\n📊 MultimodalEmotionFusionEngine Tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  logger.error('❌ Some FusionEngine tests FAILED');
  process.exit(1);
}
logger.info('🎉 All MultimodalEmotionFusionEngine unit tests passed!');
