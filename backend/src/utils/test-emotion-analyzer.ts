import { emotionAnalyzer } from '../emotion/analyzer/emotion.analyzer.js';
import { weightCalculator } from '../emotion/weight/weight.calculator.js';
import { ruleBasedEmotionDetector } from '../emotion/detectors/rule.detector.js';

function testEmotionAnalyzerPipeline() {
  console.log('🧪 Testing Master EmotionAnalyzer Facade & WeightCalculator...');
  emotionAnalyzer.resetState();

  // 1. Neutral Input Test
  const neutralCtx = emotionAnalyzer.analyze('I am feeling okay today');
  console.log('\n--- Test 1: Neutral Input ---');
  console.log('Version:', neutralCtx.version);
  console.log('Primary Emotion:', neutralCtx.primaryEmotion);
  console.log('AI Emotion:', neutralCtx.aiTone.aiEmotion, '| Response Style:', neutralCtx.aiTone.responseStyle);
  console.log('Stress Level:', neutralCtx.shortTermState.stressLevel);

  if (neutralCtx.primaryEmotion !== 'neutral' || neutralCtx.version !== 1) {
    throw new Error('Expected neutral input with schema version 1!');
  }

  // 2. Happy Input Test
  const happyCtx = emotionAnalyzer.analyze('I am very happy and delighted!');
  console.log('\n--- Test 2: Happy Input ---');
  console.log('Primary Emotion:', happyCtx.primaryEmotion);
  console.log('AI Tone:', happyCtx.aiTone);

  if (happyCtx.primaryEmotion !== 'happy' || happyCtx.aiTone.responseStyle !== 'celebratory') {
    throw new Error('Expected happy primary emotion with celebratory response style!');
  }

  // 3. Sad Input Test
  const sadCtx = emotionAnalyzer.analyze('I am so sad and heartbroken about this news');
  console.log('\n--- Test 3: Sad Input ---');
  console.log('Primary Emotion:', sadCtx.primaryEmotion);
  console.log('Stress Level:', sadCtx.shortTermState.stressLevel);
  console.log('AI Tone:', sadCtx.aiTone);

  if (sadCtx.primaryEmotion !== 'sad' || sadCtx.aiTone.aiEmotion !== 'empathetic') {
    throw new Error('Expected sad emotion with empathetic AI stance!');
  }

  // 4. Angry Input Test
  const angryCtx = emotionAnalyzer.analyze('I am furious and angry!');
  console.log('\n--- Test 4: Angry Input ---');
  console.log('Primary Emotion:', angryCtx.primaryEmotion);
  console.log('AI Tone:', angryCtx.aiTone);
  console.log('Mood Trend:', angryCtx.shortTermState.moodTrend);

  if (angryCtx.primaryEmotion !== 'angry' || angryCtx.aiTone.aiEmotion !== 'calm') {
    throw new Error('Expected angry emotion with calm AI stance!');
  }

  // 5. Mixed Emotion Input Test
  const mixedCtx = emotionAnalyzer.analyze('I am excited for my new project but worried about deadline');
  console.log('\n--- Test 5: Mixed Emotion Input ---');
  console.log('Primary Emotion:', mixedCtx.primaryEmotion);
  console.log('Emotions Count:', mixedCtx.detectedEmotions.length);

  if (mixedCtx.detectedEmotions.length < 2) {
    throw new Error('Expected multi-emotion distribution for mixed input!');
  }

  // 6. WeightCalculator W_e Calculation Test
  console.log('\n--- Test 6: WeightCalculator W_e Verification ---');
  const happyResult = ruleBasedEmotionDetector.detectEmotion('I am super thrilled and excited!');
  const happyWeight = weightCalculator.calculateWeight(happyResult, happyCtx.shortTermState);

  const angryResult = ruleBasedEmotionDetector.detectEmotion('I am furious and enrage angry');
  const angryWeight = weightCalculator.calculateWeight(angryResult, angryCtx.shortTermState);

  console.log(`Happy W_e: ${happyWeight} | Angry W_e: ${angryWeight}`);

  if (angryWeight <= happyWeight || angryWeight > 2.0 || happyWeight < 0.5) {
    throw new Error('Invalid W_e calculation boundaries!');
  }

  console.log('\n🎉 Master EmotionAnalyzer Facade Unit Test Suite Passed Successfully!');
}

testEmotionAnalyzerPipeline();
