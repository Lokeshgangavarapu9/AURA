/**
 * AURA Emotional Intelligence Engine — Response Policy Layer
 * Decides HOW AURA should respond based on detected user emotions.
 * Pure mapping policy: Contains ZERO state, ZERO database queries, and ZERO LLM calls.
 */

import {
  EmotionCategory,
  EmotionResult,
  AIResponseTone,
  AIEmotionCategory,
  ResponseStyle,
} from '../types/index.js';

/** Centralized mapping dictionary linking user emotions to AI emotion and response style */
const RESPONSE_POLICY_MAP: Record<EmotionCategory, AIResponseTone> = {
  happy: { aiEmotion: 'happy', responseStyle: 'celebratory' },
  excited: { aiEmotion: 'happy', responseStyle: 'playful' },
  curious: { aiEmotion: 'thinking', responseStyle: 'focused' },
  thinking: { aiEmotion: 'thinking', responseStyle: 'focused' },
  confident: { aiEmotion: 'happy', responseStyle: 'supportive' },
  calm: { aiEmotion: 'calm', responseStyle: 'gentle' },
  empathetic: { aiEmotion: 'empathetic', responseStyle: 'supportive' },
  surprised: { aiEmotion: 'surprised', responseStyle: 'playful' },
  confused: { aiEmotion: 'calm', responseStyle: 'patient' },
  worried: { aiEmotion: 'empathetic', responseStyle: 'gentle' },
  sad: { aiEmotion: 'empathetic', responseStyle: 'supportive' },
  frustrated: { aiEmotion: 'calm', responseStyle: 'patient' },
  angry: { aiEmotion: 'calm', responseStyle: 'reassuring' },
  neutral: { aiEmotion: 'calm', responseStyle: 'direct' },
};

export class ResponsePolicy {
  /**
   * Pure mapping method determining AI emotional stance and delivery style.
   * @param emotion Detected user EmotionResult
   */
  public determineResponseTone(emotion: EmotionResult): AIResponseTone {
    const primary = emotion?.primaryEmotion || 'neutral';
    const mapped = RESPONSE_POLICY_MAP[primary];

    return (
      mapped || {
        aiEmotion: 'calm',
        responseStyle: 'direct',
      }
    );
  }
}

/** Singleton export for ResponsePolicy */
export const responsePolicy = new ResponsePolicy();
