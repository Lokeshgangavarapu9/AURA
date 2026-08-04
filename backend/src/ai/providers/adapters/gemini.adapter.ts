/**
 * AURA AI Provider Layer — Google Gemini Adapter
 * Concrete implementation of IAIProviderAdapter for Google GenAI Models.
 */

import { GoogleGenAI } from '@google/genai';
import { BaseProviderAdapter } from './base.adapter.js';
import { ProviderRequest, ProviderResponse, StreamChunk, IAuraFunctionSchema, ProviderToolCall } from '../types.js';
import { logger } from '../../../utils/logger.js';

export class GeminiAdapter extends BaseProviderAdapter {
  readonly providerId = 'gemini';
  readonly defaultModel = 'gemini-2.5-flash';
  readonly supportedModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'];

  private aiClient: GoogleGenAI | null = null;

  constructor(apiKey?: string) {
    super();
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (key) {
      this.aiClient = new GoogleGenAI({ apiKey: key });
    }
  }

  /**
   * Health check pings the model API or verifies key presence.
   */
  public async checkHealth(): Promise<boolean> {
    return Boolean(this.aiClient);
  }

  /**
   * Translates AURA normalized IAuraFunctionSchema list to Gemini FunctionDeclaration list.
   */
  public translateToolSchema(tools: IAuraFunctionSchema[]): any {
    if (!tools || tools.length === 0) return undefined;

    const functionDeclarations = tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));

    return [{ functionDeclarations }];
  }

  /**
   * Generates a complete text response from Google Gemini.
   */
  public async generateText(request: ProviderRequest): Promise<ProviderResponse> {
    if (!this.aiClient) {
      throw this.mapGenericError(new Error('Gemini API key is missing or unconfigured'));
    }

    const modelName = request.model || this.defaultModel;
    const timeoutMs = request.timeoutMs || 20000;

    return this.executeWithTimeout(async () => {
      const contents = this.buildGeminiContents(request);
      const config: Record<string, unknown> = {};

      if (request.systemInstruction) {
        config.systemInstruction = request.systemInstruction;
      }

      if (request.temperature !== undefined) {
        config.temperature = request.temperature;
      }

      if (request.maxTokens !== undefined) {
        config.maxOutputTokens = request.maxTokens;
      }

      if (request.responseFormat === 'json') {
        config.responseMimeType = 'application/json';
      }

      if (request.tools && request.tools.length > 0) {
        config.tools = this.translateToolSchema(request.tools);
      }

      const response = await this.aiClient!.models.generateContent({
        model: modelName,
        contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      const text = response.text || '';
      const toolCalls = this.extractGeminiToolCalls(response);

      logger.debug(
        { provider: this.providerId, model: modelName, textLength: text.length },
        '🤖 GeminiAdapter generateText complete'
      );

      return {
        text,
        modelUsed: modelName,
        providerId: this.providerId,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        finishReason: 'stop',
        rawResponse: response,
      };
    }, timeoutMs, request.abortSignal);
  }

  /**
   * Generates a streaming text response from Google Gemini.
   */
  public async *generateStream(request: ProviderRequest): AsyncIterable<StreamChunk> {
    if (!this.aiClient) {
      throw this.mapGenericError(new Error('Gemini API key is missing or unconfigured'));
    }

    const modelName = request.model || this.defaultModel;
    const contents = this.buildGeminiContents(request);
    const config: Record<string, unknown> = {};

    if (request.systemInstruction) {
      config.systemInstruction = request.systemInstruction;
    }

    if (request.temperature !== undefined) {
      config.temperature = request.temperature;
    }

    try {
      const streamResponse = await this.aiClient.models.generateContentStream({
        model: modelName,
        contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      for await (const chunk of streamResponse) {
        const textDelta = chunk.text || '';
        yield {
          delta: textDelta,
          isComplete: false,
          modelUsed: modelName,
          providerId: this.providerId,
        };
      }

      yield {
        delta: '',
        isComplete: true,
        modelUsed: modelName,
        providerId: this.providerId,
        finishReason: 'stop',
      };
    } catch (err) {
      throw this.mapGenericError(err);
    }
  }

  /** Formats prompt and history for Gemini SDK */
  private buildGeminiContents(request: ProviderRequest): any {
    const contents: any[] = [];

    if (request.history && request.history.length > 0) {
      for (const msg of request.history) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: request.prompt }],
    });

    return contents;
  }

  /** Extracts tool calls from Gemini raw response if present */
  private extractGeminiToolCalls(response: any): ProviderToolCall[] {
    const toolCalls: ProviderToolCall[] = [];
    try {
      const candidates = response.candidates || [];
      if (candidates.length > 0) {
        const parts = candidates[0].content?.parts || [];
        for (const part of parts) {
          if (part.functionCall) {
            toolCalls.push({
              id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name: part.functionCall.name,
              arguments: part.functionCall.args || {},
            });
          }
        }
      }
    } catch {
      // Ignore extraction errors
    }
    return toolCalls;
  }
}
