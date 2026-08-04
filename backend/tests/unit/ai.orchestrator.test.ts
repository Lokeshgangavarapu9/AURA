/**
 * Mission 5.9.2 — Intelligent AI Orchestrator Integration Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AIOrchestrator, aiOrchestrator } from '../../src/ai/orchestrator/ai.orchestrator.js';

describe('Mission 5.9.2 — Intelligent AI Orchestrator Integration Tests', () => {

  it('should correctly classify CODING prompt intent and recommend OpenAI', () => {
    const classification = aiOrchestrator.classifyRequest('Can you help me debug this TypeScript function?');
    assert.equal(classification.category, 'CODING');
    assert.equal(classification.recommendedProvider, 'openai');
  });

  it('should correctly classify FAST_RESPONSE prompt intent and recommend Groq', () => {
    const classification = aiOrchestrator.classifyRequest('hi');
    assert.equal(classification.category, 'FAST_RESPONSE');
    assert.equal(classification.recommendedProvider, 'groq');
  });

  it('should correctly classify RESEARCH prompt intent and recommend OpenRouter', () => {
    const classification = aiOrchestrator.classifyRequest('Perform a deep dive research analysis into quantum computing algorithms.');
    assert.equal(classification.category, 'RESEARCH');
    assert.equal(classification.recommendedProvider, 'openrouter');
  });

  it('should correctly classify GENERAL_CONVERSATION prompt intent and recommend Gemini', () => {
    const classification = aiOrchestrator.classifyRequest('How are you feeling today Shizuka?');
    assert.equal(classification.category, 'GENERAL_CONVERSATION');
    assert.equal(classification.recommendedProvider, 'gemini');
  });

  it('should record routing telemetry on turn execution', async () => {
    const orchestrator = new AIOrchestrator();
    const result = await orchestrator.executeOrchestratedTurn({
      prompt: 'Hello Shizuka!',
      responseFormat: 'text',
    });

    assert.ok(result.text);
    const telemetry = orchestrator.getTelemetryHistory();
    assert.ok(telemetry.length > 0);
    assert.equal(telemetry[telemetry.length - 1].taskCategory, 'GENERAL_CONVERSATION');
  });
});
