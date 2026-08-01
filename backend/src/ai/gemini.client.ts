import { GoogleGenAI } from '@google/genai';
import { env } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * Reusable Google GenAI SDK Singleton Client
 * Handles connection setup using GEMINI_API_KEY from environment config.
 */
class GeminiClientManager {
  private client: GoogleGenAI | null = null;

  /**
   * Returns initialized GoogleGenAI instance or creates one
   */
  public getClient(): GoogleGenAI {
    if (!this.client) {
      const apiKey = env.GEMINI_API_KEY;

      if (!apiKey) {
        logger.warn('⚠️ GEMINI_API_KEY is missing or empty in .env file. AI fallback mode active.');
      }

      this.client = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_INITIALIZATION' });
    }

    return this.client;
  }
}

export const geminiClient = new GeminiClientManager();
