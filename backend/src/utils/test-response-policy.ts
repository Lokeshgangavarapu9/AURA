import { responsePolicy } from '../emotion/policy/response.policy.js';
import { EmotionCategory, EmotionResult } from '../emotion/types/index.js';

function testResponsePolicyMappings() {
  console.log('🧪 Testing ResponsePolicy Mappings...');

  const emotionsToTest: { emotion: EmotionCategory; expectedAI: string; expectedStyle: string }[] = [
    { emotion: 'happy', expectedAI: 'happy', expectedStyle: 'celebratory' },
    { emotion: 'excited', expectedAI: 'happy', expectedStyle: 'playful' },
    { emotion: 'curious', expectedAI: 'thinking', expectedStyle: 'focused' },
    { emotion: 'thinking', expectedAI: 'thinking', expectedStyle: 'focused' },
    { emotion: 'confused', expectedAI: 'calm', expectedStyle: 'patient' },
    { emotion: 'worried', expectedAI: 'empathetic', expectedStyle: 'gentle' },
    { emotion: 'sad', expectedAI: 'empathetic', expectedStyle: 'supportive' },
    { emotion: 'frustrated', expectedAI: 'calm', expectedStyle: 'patient' },
    { emotion: 'angry', expectedAI: 'calm', expectedStyle: 'reassuring' },
    { emotion: 'neutral', expectedAI: 'calm', expectedStyle: 'direct' },
  ];

  for (const item of emotionsToTest) {
    const dummyResult: EmotionResult = {
      primaryEmotion: item.emotion,
      emotions: [{ emotion: item.emotion, confidence: 0.9, intensity: 7 }],
      reasoning: 'Test',
      detector: { source: 'rule-based', confidence: 0.9, processingTimeMs: 1 },
      timestamp: new Date(),
    };

    const tone = responsePolicy.determineResponseTone(dummyResult);
    console.log(`User: ${item.emotion} -> AI: ${tone.aiEmotion}, Style: ${tone.responseStyle}`);

    if (tone.aiEmotion !== item.expectedAI || tone.responseStyle !== item.expectedStyle) {
      throw new Error(`Mapping mismatch for ${item.emotion}! Got AI:${tone.aiEmotion}, Style:${tone.responseStyle}`);
    }
  }

  console.log('\n🎉 ResponsePolicy Mappings Unit Test Passed Successfully!');
}

testResponsePolicyMappings();
