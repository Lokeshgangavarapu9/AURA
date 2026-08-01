import { geminiClient } from './gemini.client.js';
import { PromptBuilder, PromptBuildInput } from './prompt.builder.js';
import { memoryEngine } from '../memory/engine/memory.engine.js';
import { env, APP_CONSTANTS } from '../config/index.js';
import { logger } from '../utils/logger.js';

export interface GeminiResponsePayload {
  text: string;
  emotion: typeof APP_CONSTANTS.SUPPORTED_EMOTIONS[number];
}

/**
 * Gemini AI Service Layer
 * Coordinates memory retrieval, prompt building, Google AI Studio execution, and background memory extraction.
 */
export class GeminiService {
  private defaultModel = 'gemini-2.5-flash';

  /**
   * Generates AI companion response for a user chat input
   */
  public async generateChatResponse(input: PromptBuildInput): Promise<GeminiResponsePayload> {
    // If no API key is provided, return graceful fallback
    if (!env.GEMINI_API_KEY) {
      logger.info('ℹ️ GEMINI_API_KEY empty - returning offline fallback companion response');
      return {
        text: `I'm here with you! I received your message: "${input.message}". Add your GEMINI_API_KEY in backend/.env to unlock real-time Gemini AI conversations.`,
        emotion: 'happy',
      };
    }

    try {
      const ai = geminiClient.getClient();

      // 1. Retrieve Working Memory for active user message
      const workingMemory = await memoryEngine.getWorkingMemory(input.message);

      // 2. Build system instructions with injected WorkingMemory, EmotionalContext, and RelationshipContext guidance
      const systemInstruction = PromptBuilder.buildSystemInstruction(
        workingMemory,
        input.memoryContext,
        input.emotionalContext,
        input.relationshipContext
      );
      const contents = PromptBuilder.buildContents(input);

      logger.debug(
        { model: this.defaultModel, tokensEst: workingMemory.totalTokensEstimate },
        'Firing request to Google AI Studio Gemini API with working memory...'
      );

      const response = await ai.models.generateContent({
        model: this.defaultModel,
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = response.text || '';
      logger.debug({ responseText }, 'Received raw response from Gemini API');

      const parsedResult = this.parseJsonResponse(responseText, input.message);

      // 3. Asynchronously trigger background memory extraction (non-blocking)
      memoryEngine.processMessageAsync(input.message, parsedResult.text);

      return parsedResult;
    } catch (err: unknown) {
      logger.error({ err }, '❌ Gemini API call failed');
      return {
        text: `I heard what you said ("${input.message}"), but I encountered a momentary connection glitch. Let's keep chatting!`,
        emotion: 'soothing',
      };
    }
  }

  /**
   * Safely parses JSON response from Gemini model into GeminiResponsePayload
   */
  private parseJsonResponse(rawText: string, fallbackPrompt: string): GeminiResponsePayload {
    try {
      // Clean potential JSON markdown blocks if any exist
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);

      const text = typeof parsed.text === 'string' ? parsed.text : `I received: "${fallbackPrompt}"`;
      const rawEmotion = typeof parsed.emotion === 'string' ? parsed.emotion.toLowerCase() : 'neutral';

      const validEmotion = APP_CONSTANTS.SUPPORTED_EMOTIONS.includes(rawEmotion as any)
        ? (rawEmotion as typeof APP_CONSTANTS.SUPPORTED_EMOTIONS[number])
        : 'happy';

      return { text, emotion: validEmotion };
    } catch (parseError) {
      logger.warn({ parseError, rawText }, 'Failed to parse Gemini response as JSON - using text fallback');
      return {
        text: rawText || `I'm right here with you.`,
        emotion: 'neutral',
      };
    }
  }
}

export const geminiService = new GeminiService();
