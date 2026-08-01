/**
 * AURA Emotional Intelligence Engine — Emotion Context Builder
 * Pure constructor assembling version 1 EmotionalContext payloads from domain components.
 * Performs ZERO calculations or state mutations.
 */

import {
  EmotionResult,
  AIResponseTone,
  ShortTermEmotionalState,
  EmotionalContext,
} from '../types/index.js';

export class EmotionContextBuilder {
  /**
   * Constructs a version 1 EmotionalContext payload.
   * @param emotionResult EmotionResult output from detector
   * @param aiTone AIResponseTone output from policy
   * @param emotionalState ShortTermEmotionalState output from tracker
   */
  public buildContext(
    emotionResult: EmotionResult,
    aiTone: AIResponseTone,
    emotionalState: ShortTermEmotionalState
  ): EmotionalContext {
    return {
      version: 1,
      primaryEmotion: emotionResult.primaryEmotion,
      detectedEmotions: emotionResult.emotions,
      aiTone,
      shortTermState: emotionalState,
      detectorMetadata: emotionResult.detector,
      timestamp: new Date(),
    };
  }
}

/** Singleton export for EmotionContextBuilder */
export const emotionContextBuilder = new EmotionContextBuilder();
