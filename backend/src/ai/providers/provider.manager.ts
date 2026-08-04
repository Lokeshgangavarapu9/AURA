/**
 * AURA AI Provider Layer — Master ProviderManager Orchestrator
 * Single entry point for all LLM executions. Manages active provider/model selection,
 * startup validation, dynamic provider switching, health monitoring, and automatic fallback routing.
 */

import { ProviderRegistry, providerRegistry } from './provider.registry.js';
import { IAIProviderAdapter, ProviderRequest, ProviderResponse, StreamChunk } from './types.js';
import { ProviderUnavailableError, ProviderRateLimitError } from './errors/provider.error.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';

export class ProviderManager {
  private registry: ProviderRegistry;
  private activeProviderId: string;
  private activeModelId: string;

  // Standard Automatic Fallback Priority Chain
  private readonly fallbackChain: string[] = ['gemini', 'groq', 'openrouter', 'openai'];

  constructor(registry: ProviderRegistry = providerRegistry) {
    this.registry = registry;
    this.activeProviderId = (env.ACTIVE_AI_PROVIDER || 'gemini').toLowerCase();
    this.activeModelId = env.ACTIVE_AI_MODEL || 'gemini-2.5-flash';

    this.validateAndLogStartup();
  }

  /**
   * Startup Validation & Logging Report
   */
  public validateAndLogStartup(): void {
    const allProviders = [
      { name: 'Gemini', key: 'gemini', envKey: env.GEMINI_API_KEY },
      { name: 'OpenAI', key: 'openai', envKey: env.OPENAI_API_KEY },
      { name: 'Groq', key: 'groq', envKey: env.GROQ_API_KEY },
      { name: 'OpenRouter', key: 'openrouter', envKey: env.OPENROUTER_API_KEY },
      { name: 'Cerebras', key: 'cerebras', envKey: env.CEREBRAS_API_KEY },
      { name: 'HuggingFace', key: 'huggingface', envKey: env.HUGGINGFACE_API_KEY },
      { name: 'Together AI', key: 'together', envKey: env.TOGETHER_API_KEY },
    ];

    logger.info('================================================');
    logger.info('AURA Provider Manager');
    logger.info('Registered Providers:');

    for (const p of allProviders) {
      const isRegistered = this.registry.has(p.key);
      if (isRegistered) {
        logger.info(`  ✓ ${p.name}`);
      } else {
        logger.info(`  ✗ ${p.name} (Missing API Key)`);
      }
    }

    // Validate Active Provider
    if (!this.registry.has(this.activeProviderId)) {
      const available = this.registry.listProviders();
      if (available.length > 0) {
        logger.warn(
          `⚠️ Configured ACTIVE_AI_PROVIDER [${this.activeProviderId}] is unavailable or missing API key. Switching active provider to [${available[0]}].`
        );
        this.activeProviderId = available[0];
        const adapter = this.registry.get(this.activeProviderId)!;
        this.activeModelId = adapter.defaultModel;
      } else {
        logger.error('❌ CRITICAL: No AI providers have valid API keys registered!');
      }
    }

    logger.info(`Active Provider:\n  ${this.activeProviderId}`);
    logger.info(`Model:\n  ${this.activeModelId}`);
    logger.info(`Streaming:\n  ${env.AI_STREAMING ? 'Enabled' : 'Disabled'}`);
    logger.info(`Fallback Chain:\n  ${this.fallbackChain.join(' ↓ ')}`);
    logger.info('================================================');
  }

  public getActiveProviderId(): string {
    return this.activeProviderId;
  }

  public getActiveModelId(): string {
    return this.activeModelId;
  }

  public getActiveProvider(): IAIProviderAdapter {
    const adapter = this.registry.get(this.activeProviderId);
    if (!adapter) {
      // Find first available registered provider
      const registered = this.registry.listProviders();
      if (registered.length > 0) {
        return this.registry.get(registered[0])!;
      }
      throw new ProviderUnavailableError(
        `Active provider [${this.activeProviderId}] is not available and no fallback registered adapters exist`
      );
    }
    return adapter;
  }

  public setActiveProvider(providerId: string, modelId?: string): void {
    const targetId = providerId.toLowerCase();
    if (!this.registry.has(targetId)) {
      throw new ProviderUnavailableError(`Cannot switch to provider [${providerId}] — provider not registered or missing API key`);
    }

    this.activeProviderId = targetId;
    const adapter = this.getActiveProvider();
    this.activeModelId = modelId || adapter.defaultModel;

    logger.info(
      { activeProvider: this.activeProviderId, activeModel: this.activeModelId },
      `🔄 ProviderManager: Active provider switched to [${this.activeProviderId}] (${this.activeModelId})`
    );
  }

  /**
   * Executes text generation with automatic multi-provider fallback.
   */
  public async generateText(request: ProviderRequest): Promise<ProviderResponse> {
    const primaryAdapter = this.getActiveProvider();
    const targetModel = request.model || this.activeModelId;

    const reqWithModel: ProviderRequest = {
      ...request,
      model: targetModel,
    };

    try {
      return await primaryAdapter.generateText(reqWithModel);
    } catch (err: any) {
      logger.warn(
        { primary: this.activeProviderId, error: err.message },
        `⚠️ Primary provider [${this.activeProviderId}] failed — Initiating fallback chain search...`
      );

      // Attempt automatic fallback down the priority chain
      for (const fallbackId of this.fallbackChain) {
        if (fallbackId === this.activeProviderId) continue; // Skip primary already failed

        const fallbackAdapter = this.registry.get(fallbackId);
        if (fallbackAdapter && (await fallbackAdapter.checkHealth())) {
          logger.info(
            { failed: this.activeProviderId, fallback: fallbackId },
            `🔄 Executing automatic fallback to provider [${fallbackId}]`
          );

          try {
            const fallbackReq: ProviderRequest = {
              ...request,
              model: fallbackAdapter.defaultModel,
            };
            return await fallbackAdapter.generateText(fallbackReq);
          } catch (fbErr: any) {
            logger.warn({ fallback: fallbackId, err: fbErr.message }, `⚠️ Fallback provider [${fallbackId}] also failed`);
          }
        }
      }

      throw err;
    }
  }

  /**
   * Executes a streaming request through the active provider.
   */
  public async *generateStream(request: ProviderRequest): AsyncIterable<StreamChunk> {
    const adapter = this.getActiveProvider();
    const targetModel = request.model || this.activeModelId;

    const reqWithModel: ProviderRequest = {
      ...request,
      model: targetModel,
    };

    yield* adapter.generateStream(reqWithModel);
  }

  public async checkHealth(): Promise<{ provider: string; model: string; healthy: boolean }> {
    const adapter = this.getActiveProvider();
    const healthy = await adapter.checkHealth();
    return {
      provider: this.activeProviderId,
      model: this.activeModelId,
      healthy,
    };
  }
}

/** Singleton instance export for ProviderManager */
export const providerManager = new ProviderManager();
