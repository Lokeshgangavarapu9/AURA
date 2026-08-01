/**
 * AURA Memory Engine — Public Master Orchestrator Facade
 * High-level entry point unifying Memory Retrieval (before chat) and Background Memory Processing (after chat).
 */

import { memoryRetriever } from '../retrieval/retriever.js';
import { MemoryDetector } from '../processors/detector.js';
import { memoryExtractorService } from '../processors/extractor.service.js';
import { WorkingMemory } from '../types/index.js';
import { logger } from '../../utils/logger.js';

export class MemoryEngine {
  /**
   * Retrieves WorkingMemory payload before generating Gemini chat response
   * @param userMessage Active user prompt
   */
  public async getWorkingMemory(userMessage: string): Promise<WorkingMemory> {
    return memoryRetriever.getWorkingMemory(userMessage);
  }

  /**
   * Asynchronously inspects user message and extracts memories in background without blocking chat response.
   * Stage 1: Fast rule-based detector inspects message (0ms, 0 tokens).
   * Stage 2: If needsExtraction === true, Gemini structures candidates and persists to database.
   */
  public processMessageAsync(userMessage: string, _aiResponse?: string): void {
    setImmediate(async () => {
      try {
        // Stage 1: Detector check
        const detection = MemoryDetector.inspectMessage(userMessage);

        if (!detection.needsExtraction) {
          logger.debug({ userMessage }, '⚡ MemoryDetector: No memory extraction needed — skipping LLM call');
          return;
        }

        logger.info(
          { candidatesCount: detection.candidates.length },
          '🎯 MemoryDetector detected personal memory statements — triggering background extractor'
        );

        // Stage 2: Background Gemini extraction
        await memoryExtractorService.extractAndStore(detection.candidates);
      } catch (err) {
        logger.error({ err }, '❌ MemoryEngine background message processing failed');
      }
    });
  }
}

/** Singleton export for MemoryEngine */
export const memoryEngine = new MemoryEngine();
