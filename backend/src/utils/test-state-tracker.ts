import { EmotionalStateTracker } from '../emotion/tracker/state.tracker.js';
import { EmotionCategory, EmotionResult } from '../emotion/types/index.js';

function makeResult(primaryEmotion: EmotionCategory): EmotionResult {
  return {
    primaryEmotion,
    emotions: [{ emotion: primaryEmotion, confidence: 0.9, intensity: 7 }],
    reasoning: 'Test',
    detector: { source: 'rule-based', confidence: 0.9, processingTimeMs: 1 },
    timestamp: new Date(),
  };
}

function testEmotionalStateTrackerPipeline() {
  console.log('🧪 Testing EmotionalStateTracker Pipeline...');
  const tracker = new EmotionalStateTracker();

  // 1. Initial State
  const initial = tracker.getCurrentState();
  console.log('\n--- Test 1: Initial State ---');
  console.log('Current Mood:', initial.currentMood);
  if (initial.currentMood !== 'neutral') throw new Error('Expected initial mood neutral!');

  // 2. Stable Trend Test (Happy -> Happy -> Happy)
  tracker.updateState(makeResult('happy'));
  tracker.updateState(makeResult('happy'));
  const stableState = tracker.updateState(makeResult('happy'));
  console.log('\n--- Test 2: Stable Trend ---');
  console.log('Mood:', stableState.currentMood, 'Duration:', stableState.moodDurationTurns, 'Trend:', stableState.moodTrend);

  if (stableState.moodTrend !== 'stable' || stableState.moodDurationTurns !== 3) {
    throw new Error('Expected stable trend with duration 3!');
  }

  // 3. Declining Trend Test (Worried -> Sad)
  tracker.reset();
  tracker.updateState(makeResult('worried'));
  const decliningState = tracker.updateState(makeResult('sad'));
  console.log('\n--- Test 3: Declining Trend ---');
  console.log('Mood:', decliningState.currentMood, 'Stress:', decliningState.stressLevel, 'Trend:', decliningState.moodTrend);

  if (decliningState.moodTrend !== 'declining' || decliningState.stressLevel !== 8) {
    throw new Error('Expected declining trend with stress level 8!');
  }

  // 4. Improving Trend Test (Sad -> Calm)
  tracker.reset();
  tracker.updateState(makeResult('sad'));
  const improvingState = tracker.updateState(makeResult('calm'));
  console.log('\n--- Test 4: Improving Trend ---');
  console.log('Mood:', improvingState.currentMood, 'Stress:', improvingState.stressLevel, 'Trend:', improvingState.moodTrend);

  if (improvingState.moodTrend !== 'improving' || improvingState.stressLevel !== 2) {
    throw new Error('Expected improving trend with stress level 2!');
  }

  // 5. Fluctuating Trend Test (Happy -> Worried -> Excited)
  tracker.reset();
  tracker.updateState(makeResult('happy'));
  tracker.updateState(makeResult('worried'));
  const fluctuatingState = tracker.updateState(makeResult('excited'));
  console.log('\n--- Test 5: Fluctuating Trend ---');
  console.log('Mood:', fluctuatingState.currentMood, 'Trend:', fluctuatingState.moodTrend);

  if (fluctuatingState.moodTrend !== 'fluctuating') {
    throw new Error('Expected fluctuating trend!');
  }

  // 6. Reset Test
  const resetState = tracker.reset();
  console.log('\n--- Test 6: Reset State ---');
  console.log('Mood after reset:', resetState.currentMood, 'Stress:', resetState.stressLevel);

  if (resetState.currentMood !== 'neutral' || resetState.stressLevel !== 4) {
    throw new Error('Expected reset state to be neutral baseline!');
  }

  console.log('\n🎉 EmotionalStateTracker Unit Test Suite Passed Successfully!');
}

testEmotionalStateTrackerPipeline();
