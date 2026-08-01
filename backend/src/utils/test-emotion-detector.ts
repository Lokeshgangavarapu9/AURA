import { ruleBasedEmotionDetector } from '../emotion/detectors/rule.detector.js';

function runEmotionDetectorTests() {
  console.log('🧪 Testing RuleBasedEmotionDetector Strategy...');

  // 1. Happy Test
  const happyRes = ruleBasedEmotionDetector.detectEmotion("I am very happy and glad today");
  console.log('\n--- Test 1: Happy ---');
  console.log('Primary Emotion:', happyRes.primaryEmotion);
  console.log('Confidence:', happyRes.detector.confidence);
  console.log('Reasoning:', happyRes.reasoning);

  if (happyRes.primaryEmotion !== 'happy') throw new Error('Expected happy!');

  // 2. Sad Test
  const sadRes = ruleBasedEmotionDetector.detectEmotion("I feel lonely and sad");
  console.log('\n--- Test 2: Sad ---');
  console.log('Primary Emotion:', sadRes.primaryEmotion);
  console.log('Confidence:', sadRes.detector.confidence);

  if (sadRes.primaryEmotion !== 'sad') throw new Error('Expected sad!');

  // 3. Angry Test
  const angryRes = ruleBasedEmotionDetector.detectEmotion("I am furious and mad about this error");
  console.log('\n--- Test 3: Angry ---');
  console.log('Primary Emotion:', angryRes.primaryEmotion);

  if (angryRes.primaryEmotion !== 'angry') throw new Error('Expected angry!');

  // 4. Worried Test
  const worriedRes = ruleBasedEmotionDetector.detectEmotion("I am nervous and stressed about my exam");
  console.log('\n--- Test 4: Worried ---');
  console.log('Primary Emotion:', worriedRes.primaryEmotion);

  if (worriedRes.primaryEmotion !== 'worried') throw new Error('Expected worried!');

  // 5. Neutral Test
  const neutralRes = ruleBasedEmotionDetector.detectEmotion("I am okay");
  console.log('\n--- Test 5: Neutral ---');
  console.log('Primary Emotion:', neutralRes.primaryEmotion);
  console.log('Confidence:', neutralRes.detector.confidence);

  if (neutralRes.primaryEmotion !== 'neutral') throw new Error('Expected neutral!');

  // 6. Mixed Emotions Test
  const mixedRes = ruleBasedEmotionDetector.detectEmotion("I am excited about my internship but nervous");
  console.log('\n--- Test 6: Mixed Emotions ---');
  console.log('Primary Emotion:', mixedRes.primaryEmotion);
  console.log('Emotions Distribution:', mixedRes.emotions);

  if (mixedRes.emotions.length < 2) throw new Error('Expected multiple detected emotions for mixed input!');

  // 7. Empty Input Test
  const emptyRes = ruleBasedEmotionDetector.detectEmotion("");
  console.log('\n--- Test 7: Empty Input ---');
  console.log('Primary Emotion:', emptyRes.primaryEmotion);

  if (emptyRes.primaryEmotion !== 'neutral') throw new Error('Expected neutral for empty input!');

  // 8. Unknown Text Test
  const unknownRes = ruleBasedEmotionDetector.detectEmotion("The quick brown fox jumps over the lazy dog");
  console.log('\n--- Test 8: Unknown Text ---');
  console.log('Primary Emotion:', unknownRes.primaryEmotion);
  console.log('Confidence:', unknownRes.detector.confidence);

  if (unknownRes.primaryEmotion !== 'neutral') throw new Error('Expected neutral fallback for unknown text!');

  console.log('\n🎉 RuleBasedEmotionDetector Unit Test Suite Passed Successfully!');
}

runEmotionDetectorTests();
