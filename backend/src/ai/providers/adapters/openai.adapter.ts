/**
 * AURA AI Provider Layer — OpenAI Adapter
 * Concrete implementation of IAIProviderAdapter for OpenAI API models (GPT-4o, GPT-4o-mini, GPT-5).
 */

import { BaseProviderAdapter } from './base.adapter.js';
import { ProviderRequest, ProviderResponse, StreamChunk, IAuraFunctionSchema, ProviderToolCall } from '../types.js';
import { ProviderAuthError, ProviderRateLimitError, ProviderUnavailableError } from '../errors/provider.error.js';
import { logger } from '../../../utils/logger.js';

export class OpenAIAdapter extends BaseProviderAdapter {
  readonly providerId = 'openai';
  readonly defaultModel = 'gpt-4o-mini';
  readonly supportedModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-5'];

  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || null;
  }

  /**
   * Health check pings OpenAI models endpoint or verifies key presence.
   */
  public async checkHealth(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  /**
   * Translates AURA normalized IAuraFunctionSchema list to OpenAI tools format.
   */
  public translateToolSchema(tools: IAuraFunctionSchema[]): any {
    if (!tools || tools.length === 0) return undefined;

    return tools.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));
  }

  /**
   * Generates a complete text response from OpenAI.
   */
  public async generateText(request: ProviderRequest): Promise<ProviderResponse> {
    if (!this.apiKey) {
      throw new ProviderAuthError('OpenAI API key is missing or unconfigured');
    }

    const modelName = request.model || this.defaultModel;
    const timeoutMs = request.timeoutMs || 20000;

    return this.executeWithTimeout(async (signal) => {
      const messages = this.buildOpenAIMessages(request);
      const payload: Record<string, unknown> = {
        model: modelName,
        messages,
        temperature: request.temperature ?? 0.7,
      };

      if (request.maxTokens) {
        payload.max_tokens = request.maxTokens;
      }

      if (request.responseFormat === 'json') {
        payload.response_format = { type: 'json_object' };
      }

      if (request.tools && request.tools.length > 0) {
        payload.tools = this.translateToolSchema(request.tools);
      }

      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 401) throw new ProviderAuthError(`OpenAI Auth Error: ${errorText}`, 401);
        if (res.status === 429) throw new ProviderRateLimitError(`OpenAI Rate Limit Exceeded: ${errorText}`, 429);
        if (res.status >= 500) throw new ProviderUnavailableError(`OpenAI Server Error: ${errorText}`, res.status);
        throw new Error(`OpenAI API error (${res.status}): ${errorText}`);
      }

      const data = await res.json() as any;
      const choice = data.choices?.[0];
      const text = choice?.message?.content || '';
      const toolCalls = this.extractOpenAIToolCalls(choice?.message?.tool_calls);

      logger.debug(
        { provider: this.providerId, model: modelName, textLength: text.length },
        '🤖 OpenAIAdapter generateText complete'
      );

      return {
        text,
        modelUsed: data.model || modelName,
        providerId: this.providerId,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        finishReason: choice?.finish_reason || 'stop',
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
        rawResponse: data,
      };
    }, timeoutMs, request.abortSignal);
  }

  /**
   * Generates a streaming text response from OpenAI via SSE.
   */
  public async *generateStream(request: ProviderRequest): AsyncIterable<StreamChunk> {
    if (!this.apiKey) {
      throw new ProviderAuthError('OpenAI API key is missing or unconfigured');
    }

    const modelName = request.model || this.defaultModel;
    const messages = this.buildOpenAIMessages(request);

    const payload: Record<string, unknown> = {
      model: modelName,
      messages,
      stream: true,
      temperature: request.temperature ?? 0.7,
    };

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw this.mapGenericError(new Error(`OpenAI stream error (${res.status}): ${errorText}`));
    }

    if (!res.body) {
      throw new Error('OpenAI response body is null');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          if (trimmed === 'data: [DONE]') {
            yield {
              delta: '',
              isComplete: true,
              modelUsed: modelName,
              providerId: this.providerId,
              finishReason: 'stop',
            };
            return;
          }

          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json.choices?.[0]?.delta?.content || '';
              if (delta) {
                yield {
                  delta,
                  isComplete: false,
                  modelUsed: modelName,
                  providerId: this.providerId,
                };
              }
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /** Formats messages array for OpenAI Chat Completion API */
  private buildOpenAIMessages(request: ProviderRequest): any[] {
    const messages: any[] = [];

    if (request.systemInstruction) {
      messages.push({ role: 'system', content: request.systemInstruction });
    }

    if (request.history && request.history.length > 0) {
      for (const msg of request.history) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    messages.push({ role: 'user', content: request.prompt });
    return messages;
  }

  /** Extracts tool calls from OpenAI tool_calls response payload */
  private extractOpenAIToolCalls(rawCalls: any[]): ProviderToolCall[] {
    if (!rawCalls || !Array.isArray(rawCalls)) return [];

    return rawCalls.map((call) => {
      let parsedArgs = {};
      try {
        parsedArgs = typeof call.function.arguments === 'string'
          ? JSON.parse(call.function.arguments)
          : call.function.arguments;
      } catch {
        // Fallback
      }

      return {
        id: call.id || `call-${Date.now()}`,
        name: call.function?.name || '',
        arguments: parsedArgs,
      };
    });
  }
}
