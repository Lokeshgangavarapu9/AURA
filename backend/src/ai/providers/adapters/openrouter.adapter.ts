/**
 * AURA AI Provider Layer — OpenRouter Adapter
 * Integrates OpenRouter API (OpenAI-compatible multi-model gateway).
 * Supports any OpenRouter model dynamically via environment configuration.
 */

import { BaseProviderAdapter } from './base.adapter.js';
import { ProviderRequest, ProviderResponse, StreamChunk, IAuraFunctionSchema, ProviderToolCall } from '../types.js';
import { ProviderAuthError, ProviderRateLimitError, ProviderUnavailableError } from '../errors/provider.error.js';
import { env } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';

export class OpenRouterAdapter extends BaseProviderAdapter {
  public readonly providerId = 'openrouter';
  public readonly defaultModel = 'nvidia/nemotron-3-ultra-550b-a55b:free';
  public readonly supportedModels = [
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'deepseek/deepseek-r1:free',
    'qwen/qwen3-235b-a22b:free',
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.3-70b-instruct:free',
  ];

  private apiKey: string | null = null;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || env.OPENROUTER_API_KEY || null;
  }

  public async checkHealth(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

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

  public async generateText(request: ProviderRequest): Promise<ProviderResponse> {
    if (!this.apiKey) {
      throw new ProviderAuthError('OpenRouter API Key is missing. Set OPENROUTER_API_KEY in backend/.env');
    }

    const modelName = request.model || env.ACTIVE_AI_MODEL || this.defaultModel;
    const timeoutMs = request.timeoutMs || 20000;

    return this.executeWithTimeout(async (signal) => {
      const messages = this.buildOpenAIMessages(request);
      const payload: Record<string, unknown> = {
        model: modelName,
        messages,
        temperature: request.temperature ?? env.AI_TEMPERATURE ?? 0.8,
        max_tokens: request.maxTokens ?? env.AI_MAX_TOKENS ?? 4096,
      };

      if (request.responseFormat === 'json') {
        payload.response_format = { type: 'json_object' };
      }

      if (request.tools && request.tools.length > 0) {
        payload.tools = this.translateToolSchema(request.tools);
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://github.com/Lokeshgangavarapu9/AURA',
          'X-Title': 'AURA AI Companion OS',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 401 || response.status === 403) {
          throw new ProviderAuthError(`OpenRouter Auth Failed: ${errText}`);
        }
        if (response.status === 429) {
          throw new ProviderRateLimitError(`OpenRouter Rate Limit Exceeded: ${errText}`);
        }
        throw new ProviderUnavailableError(`OpenRouter API Error [${response.status}]: ${errText}`);
      }

      const data = (await response.json()) as any;
      const choice = data.choices?.[0];
      const text = choice?.message?.content || '';
      const toolCalls = this.extractToolCalls(choice?.message?.tool_calls);

      logger.info({ provider: this.providerId, model: modelName, textLength: text.length }, '⚡ OpenRouter text generation completed');

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

  public async *generateStream(request: ProviderRequest): AsyncIterable<StreamChunk> {
    if (!this.apiKey) {
      throw new ProviderAuthError('OpenRouter API Key is missing');
    }

    const modelName = request.model || env.ACTIVE_AI_MODEL || this.defaultModel;
    const messages = this.buildOpenAIMessages(request);
    const payload = {
      model: modelName,
      messages,
      temperature: request.temperature ?? env.AI_TEMPERATURE ?? 0.8,
      max_tokens: request.maxTokens ?? env.AI_MAX_TOKENS ?? 4096,
      stream: true,
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://github.com/Lokeshgangavarapu9/AURA',
        'X-Title': 'AURA AI Companion OS',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new ProviderUnavailableError(`OpenRouter Stream Error [${response.status}]: ${errText}`);
    }

    if (!response.body) return;
    const reader = response.body.getReader();
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
              const json = JSON.parse(trimmed.substring(6));
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
              // Ignore partial chunk parse
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private buildOpenAIMessages(request: ProviderRequest): any[] {
    const msgs: any[] = [];
    if (request.systemInstruction) {
      msgs.push({ role: 'system', content: request.systemInstruction });
    }
    if (request.history && request.history.length > 0) {
      for (const msg of request.history) {
        msgs.push({ role: msg.role, content: msg.content });
      }
    }
    msgs.push({ role: 'user', content: request.prompt });
    return msgs;
  }

  private extractToolCalls(rawCalls: any[]): ProviderToolCall[] {
    if (!rawCalls || !Array.isArray(rawCalls)) return [];
    return rawCalls.map((call) => ({
      id: call.id || `call-${Date.now()}`,
      name: call.function?.name || '',
      arguments: typeof call.function.arguments === 'string' ? JSON.parse(call.function.arguments) : call.function.arguments,
    }));
  }
}
