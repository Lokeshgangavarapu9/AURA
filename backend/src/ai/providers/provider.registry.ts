/**
 * AURA AI Provider Layer — Provider Registry
 * Registry pattern for discovering, registering, and retrieving IAIProviderAdapter instances.
 * Dynamically registers adapters based on environment API key availability.
 */

import { IAIProviderAdapter } from './types.js';
import { GeminiAdapter } from './adapters/gemini.adapter.js';
import { OpenAIAdapter } from './adapters/openai.adapter.js';
import { OpenRouterAdapter } from './adapters/openrouter.adapter.js';
import { GroqAdapter } from './adapters/groq.adapter.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';

export class ProviderRegistry {
  private adapters: Map<string, IAIProviderAdapter> = new Map();

  constructor() {
    this.initializeFromEnv();
  }

  /**
   * Reads environment configuration and registers all available adapters.
   */
  public initializeFromEnv(): void {
    // 1. Google Gemini Adapter
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0) {
      this.register(new GeminiAdapter());
    } else {
      logger.warn('✗ Gemini Provider skipped (Missing GEMINI_API_KEY)');
    }

    // 2. OpenAI Adapter
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim().length > 0) {
      this.register(new OpenAIAdapter());
    } else {
      logger.warn('✗ OpenAI Provider skipped (Missing OPENAI_API_KEY)');
    }

    // 3. OpenRouter Adapter
    if (env.OPENROUTER_API_KEY && env.OPENROUTER_API_KEY.trim().length > 0) {
      this.register(new OpenRouterAdapter());
    } else {
      logger.warn('✗ OpenRouter Provider skipped (Missing OPENROUTER_API_KEY)');
    }

    // 4. Groq Adapter
    if (env.GROQ_API_KEY && env.GROQ_API_KEY.trim().length > 0) {
      this.register(new GroqAdapter());
    } else {
      logger.warn('✗ Groq Provider skipped (Missing GROQ_API_KEY)');
    }

    // Prepared future providers (Cerebras, Hugging Face, Together AI)
    if (!env.CEREBRAS_API_KEY) logger.warn('✗ Cerebras Provider skipped (Missing CEREBRAS_API_KEY)');
    if (!env.HUGGINGFACE_API_KEY) logger.warn('✗ HuggingFace Provider skipped (Missing HUGGINGFACE_API_KEY)');
    if (!env.TOGETHER_API_KEY) logger.warn('✗ Together AI Provider skipped (Missing TOGETHER_API_KEY)');
  }

  /**
   * Registers a provider adapter instance.
   */
  public register(adapter: IAIProviderAdapter): void {
    const key = adapter.providerId.toLowerCase();
    if (this.adapters.has(key)) {
      logger.warn({ providerId: adapter.providerId }, `⚠️ Duplicate registration attempt for provider [${adapter.providerId}] ignored`);
      return;
    }
    this.adapters.set(key, adapter);
    logger.info(
      { providerId: adapter.providerId, defaultModel: adapter.defaultModel },
      `🔌 Registered AI Provider Adapter: [${adapter.providerId}]`
    );
  }

  /**
   * Retrieves a registered adapter by provider ID.
   */
  public get(providerId: string): IAIProviderAdapter | undefined {
    return this.adapters.get(providerId.toLowerCase());
  }

  /**
   * Checks if a provider is registered.
   */
  public has(providerId: string): boolean {
    return this.adapters.has(providerId.toLowerCase());
  }

  /**
   * Returns a list of all registered provider IDs.
   */
  public listProviders(): string[] {
    return Array.from(this.adapters.keys());
  }
}

/** Singleton instance export for ProviderRegistry */
export const providerRegistry = new ProviderRegistry();
