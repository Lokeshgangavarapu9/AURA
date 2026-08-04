/**
 * AURA AI Provider Layer — Abstract Base Provider Adapter
 * Encapsulates common logging, execution timeouts, retry logic, and error wrapping.
 */

import { IAIProviderAdapter, ProviderRequest, ProviderResponse, StreamChunk, IAuraFunctionSchema } from '../types.js';
import {
  AuraProviderError,
  ProviderTimeoutError,
  ProviderNetworkError,
  ProviderRateLimitError,
  ProviderAuthError,
  ProviderUnavailableError,
  ProviderInvalidResponseError,
} from '../errors/provider.error.js';
import { logger } from '../../../utils/logger.js';

export abstract class BaseProviderAdapter implements IAIProviderAdapter {
  abstract readonly providerId: string;
  abstract readonly defaultModel: string;
  abstract readonly supportedModels: string[];

  abstract generateText(request: ProviderRequest): Promise<ProviderResponse>;
  abstract generateStream(request: ProviderRequest): AsyncIterable<StreamChunk>;
  abstract translateToolSchema(tools: IAuraFunctionSchema[]): unknown;
  abstract checkHealth(): Promise<boolean>;

  /**
   * Wraps an execution promise with a configurable timeout.
   */
  protected async executeWithTimeout<T>(
    promiseFn: (signal?: AbortSignal) => Promise<T>,
    timeoutMs = 15000,
    parentSignal?: AbortSignal
  ): Promise<T> {
    const controller = new AbortController();
    
    // Listen for parent abort signal if provided
    if (parentSignal) {
      parentSignal.addEventListener('abort', () => controller.abort());
    }

    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const result = await promiseFn(controller.signal);
      clearTimeout(timer);
      return result;
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError' || controller.signal.aborted) {
        throw new ProviderTimeoutError(`Provider [${this.providerId}] request timed out after ${timeoutMs}ms`, 408, err);
      }
      throw this.mapGenericError(err);
    }
  }

  /**
   * Generic error mapper converting raw vendor errors to domain AuraProviderErrors.
   */
  protected mapGenericError(err: unknown): AuraProviderError {
    if (err instanceof AuraProviderError) {
      return err;
    }

    const message = (err as Error)?.message || 'Unknown provider error';
    const status = (err as any)?.status || (err as any)?.statusCode || 500;

    if (status === 401 || status === 403 || message.includes('API key') || message.includes('UNAUTHENTICATED')) {
      return new ProviderAuthError(`Auth error from provider [${this.providerId}]: ${message}`, status, err);
    }

    if (status === 429 || message.includes('429') || message.includes('RESOURCE_EXHAUSTED') || message.includes('Rate limit')) {
      return new ProviderRateLimitError(`Rate limit exceeded for provider [${this.providerId}]: ${message}`, 429, err);
    }

    if (status >= 500 || message.includes('503') || message.includes('UNAVAILABLE')) {
      return new ProviderUnavailableError(`Provider [${this.providerId}] unavailable: ${message}`, status, err);
    }

    if (message.includes('fetch failed') || message.includes('ENOTFOUND') || message.includes('ECONNREFUSED')) {
      return new ProviderNetworkError(`Network error communicating with [${this.providerId}]: ${message}`, 503, err);
    }

    return new ProviderInvalidResponseError(`Invalid response from [${this.providerId}]: ${message}`, status, err);
  }
}
