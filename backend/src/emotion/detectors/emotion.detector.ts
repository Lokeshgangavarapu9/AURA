/**
 * AURA Emotional Intelligence Engine — Emotion Detector Strategy Contract
 * Pure interface for emotion detection strategies (RuleBased, Gemini, Voice, Vision, Fusion).
 * Completely decoupled from database, Gemini, and Express.
 */

import { EmotionResult } from '../types/index.js';

export interface IEmotionDetector {
  /**
   * Analyzes input text/media turn and returns a structured EmotionResult.
   * Pure function signature with zero side effects.
   * @param text Input text string to classify
   */
  detectEmotion(text: string): EmotionResult;
}
