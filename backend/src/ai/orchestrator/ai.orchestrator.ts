/**
 * AURA Intelligent AI Orchestrator Layer
 * Classifies turn intent and task requirements, dynamically selects the optimal AI Provider & Model,
 * evaluates health/availability, records performance telemetry, and seamlessly integrates with ProviderManager.
 */

import { providerRegistry, ProviderRegistry } from '../providers/provider.registry.js';
import { providerManager, ProviderManager } from '../providers/provider.manager.js';
import { ProviderRequest, ProviderResponse, StreamChunk } from '../providers/types.js';
import { logger } from '../../utils/logger.js';

export type TaskCategory =
  | 'GENERAL_CONVERSATION'
  | 'CODING'
  | 'DEBUGGING'
  | 'MATHEMATICS'
  | 'LOGICAL_REASONING'
  | 'RESEARCH'
  | 'LONG_DOCUMENT_ANALYSIS'
  | 'VISION'
  | 'CREATIVE_WRITING'
  | 'TRANSLATION'
  | 'SUMMARIZATION'
  | 'TOOL_CALLING'
  | 'FAST_RESPONSE';

export interface ClassificationResult {
  category: TaskCategory;
  confidence: number;
  reason: string;
  recommendedProvider: string;
}

export interface RoutingTelemetry {
  timestamp: string;
  taskCategory: TaskCategory;
  selectedProvider: string;
  modelUsed: string;
  reason: string;
  latencyMs: number;
  success: boolean;
  fallbacksAttempted: string[];
}

export class AIOrchestrator {
  private registry: ProviderRegistry;
  private manager: ProviderManager;
  private telemetryHistory: RoutingTelemetry[] = [];

  constructor(registry: ProviderRegistry = providerRegistry, manager: ProviderManager = providerManager) {
    this.registry = registry;
    this.manager = manager;
  }

  /**
   * Classifies user prompt into task category and determines optimal target provider.
   */
  public classifyRequest(prompt: string, toolsCount: number = 0, isVision: boolean = false): ClassificationResult {
    const p = prompt.toLowerCase();

    if (isVision || p.includes('look at') || p.includes('image') || p.includes('camera')) {
      return {
        category: 'VISION',
        confidence: 0.95,
        reason: 'Vision / Image analysis requirement detected',
        recommendedProvider: 'gemini',
      };
    }

    if (toolsCount > 0 || p.includes('run function') || p.includes('use tool')) {
      return {
        category: 'TOOL_CALLING',
        confidence: 0.90,
        reason: 'Tool / Function calling schema present',
        recommendedProvider: 'openai',
      };
    }

    if (
      p.includes('code') ||
      p.includes('function') ||
      p.includes('typescript') ||
      p.includes('python') ||
      p.includes('debug') ||
      p.includes('error') ||
      p.includes('fix bug')
    ) {
      return {
        category: 'CODING',
        confidence: 0.92,
        reason: 'Code synthesis or debugging intent identified',
        recommendedProvider: 'openai',
      };
    }

    if (p.includes('summarize') || p.includes('tldr') || p.includes('quick summary')) {
      return {
        category: 'SUMMARIZATION',
        confidence: 0.88,
        reason: 'Rapid summarization request',
        recommendedProvider: 'groq',
      };
    }

    if (
      p.includes('research') ||
      p.includes('deep dive') ||
      p.includes('explain quantum') ||
      p.includes('analyze document') ||
      p.length > 500
    ) {
      return {
        category: 'RESEARCH',
        confidence: 0.89,
        reason: 'Deep research / Long reasoning query',
        recommendedProvider: 'openrouter',
      };
    }

    if (p.length < 50 && (p.startsWith('hi') || p.startsWith('hello') || p.startsWith('hey') || p.includes('quick'))) {
      return {
        category: 'FAST_RESPONSE',
        confidence: 0.85,
        reason: 'Short query requiring low-latency response',
        recommendedProvider: 'groq',
      };
    }

    return {
      category: 'GENERAL_CONVERSATION',
      confidence: 0.80,
      reason: 'General empathetic companion turn',
      recommendedProvider: 'gemini',
    };
  }

  /**
   * Intelligently selects provider and executes text generation.
   */
  public async executeOrchestratedTurn(request: ProviderRequest): Promise<ProviderResponse> {
    const startTime = Date.now();
    const classification = this.classifyRequest(request.prompt, request.tools?.length || 0);

    let selectedProvider = classification.recommendedProvider;

    // Check provider registration & health; fallback to first available if unconfigured
    if (!this.registry.has(selectedProvider)) {
      const available = this.registry.listProviders();
      selectedProvider = available.length > 0 ? available[0] : 'gemini';
      logger.info(
        { recommended: classification.recommendedProvider, selected: selectedProvider },
        `🧠 AIOrchestrator: Recommended provider [${classification.recommendedProvider}] missing API key — Routing to [${selectedProvider}]`
      );
    }

    // Set active provider on Manager dynamically
    this.manager.setActiveProvider(selectedProvider);

    try {
      const result = await this.manager.generateText(request);
      const latencyMs = Date.now() - startTime;

      const record: RoutingTelemetry = {
        timestamp: new Date().toISOString(),
        taskCategory: classification.category,
        selectedProvider,
        modelUsed: result.modelUsed || this.manager.getActiveModelId(),
        reason: classification.reason,
        latencyMs,
        success: true,
        fallbacksAttempted: [],
      };

      this.telemetryHistory.push(record);

      logger.info(
        {
          taskCategory: classification.category,
          selectedProvider,
          modelUsed: record.modelUsed,
          latencyMs,
        },
        `🧠 AIOrchestrator: Successfully routed & executed request via [${selectedProvider}]`
      );

      return result;
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      this.telemetryHistory.push({
        timestamp: new Date().toISOString(),
        taskCategory: classification.category,
        selectedProvider,
        modelUsed: this.manager.getActiveModelId(),
        reason: classification.reason,
        latencyMs,
        success: false,
        fallbacksAttempted: [selectedProvider],
      });
      throw err;
    }
  }

  /**
   * Returns recent routing telemetry records for Developer Mode.
   */
  public getTelemetryHistory(): RoutingTelemetry[] {
    return [...this.telemetryHistory];
  }
}

export const aiOrchestrator = new AIOrchestrator();
