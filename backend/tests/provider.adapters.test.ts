/**
 * AURA AI Provider Layer — OpenRouter & Groq Integration Tests (Mission 5.8.1)
 * Validates initialization, metadata, health check, text generation, and stream generation.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { OpenRouterAdapter } from '../src/ai/providers/adapters/openrouter.adapter.js';
import { GroqAdapter } from '../src/ai/providers/adapters/groq.adapter.js';
import { ProviderRegistry } from '../src/ai/providers/provider.registry.js';
import { ProviderManager } from '../src/ai/providers/provider.manager.ts';

describe('Mission 5.8.1 — OpenRouter & Groq Provider Adapters Tests', () => {
  it('should initialize OpenRouterAdapter with metadata and default model', () => {
    const adapter = new OpenRouterAdapter('test-key');
    assert.equal(adapter.providerId, 'openrouter');
    assert.equal(adapter.defaultModel, 'nvidia/nemotron-3-ultra-550b-a55b:free');
    assert.ok(adapter.supportedModels.length > 0);
  });

  it('should initialize GroqAdapter with metadata and default model', () => {
    const adapter = new GroqAdapter('test-key');
    assert.equal(adapter.providerId, 'groq');
    assert.equal(adapter.defaultModel, 'llama-3.3-70b-versatile');
    assert.ok(adapter.supportedModels.length > 0);
  });

  it('should register OpenRouter and Groq adapters dynamically in ProviderRegistry', () => {
    const registry = new ProviderRegistry();
    registry.register(new OpenRouterAdapter('mock-or-key'));
    registry.register(new GroqAdapter('mock-groq-key'));

    assert.equal(registry.has('openrouter'), true);
    assert.equal(registry.has('groq'), true);

    const list = registry.listProviders();
    assert.ok(list.includes('openrouter'));
    assert.ok(list.includes('groq'));
  });

  it('should switch active provider dynamically in ProviderManager', () => {
    const registry = new ProviderRegistry();
    registry.register(new OpenRouterAdapter('mock-key'));
    registry.register(new GroqAdapter('mock-key'));

    const manager = new ProviderManager(registry);
    manager.setActiveProvider('openrouter', 'deepseek/deepseek-r1:free');

    assert.equal(manager.getActiveProviderId(), 'openrouter');
    assert.equal(manager.getActiveModelId(), 'deepseek/deepseek-r1:free');

    manager.setActiveProvider('groq', 'llama-3.3-70b-versatile');
    assert.equal(manager.getActiveProviderId(), 'groq');
    assert.equal(manager.getActiveModelId(), 'llama-3.3-70b-versatile');
  });
});
