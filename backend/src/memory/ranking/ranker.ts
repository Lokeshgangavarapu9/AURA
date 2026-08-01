/**
 * AURA Memory Engine — Memory Ranking & Top-K Selection Engine
 * Pure sorting, filtering, and Top-K selection module.
 * Receives pre-scored memory tuples and orders them deterministically.
 */

import { MemoryFactEntity } from '../types/index.js';
import { MemoryScore, MemoryScorer } from '../scoring/scorer.js';

export interface ScoredMemoryItem {
  fact: MemoryFactEntity;
  score: MemoryScore;
}

export interface RankingOptions {
  /** Maximum number of top memories to select */
  topK?: number;
  /** Minimum final score threshold required for inclusion (0.0 to 1.0) */
  minScoreThreshold?: number;
  /** Filter by category if specified */
  categoryFilter?: string;
}

export class MemoryRanker {
  /**
   * Scores, sorts, and selects Top-K memories from a candidate list.
   * @param candidateFacts List of candidate MemoryFactEntity objects
   * @param queryKeywords Optional search query keywords for context scoring
   * @param options Ranking options (topK, minScoreThreshold, categoryFilter)
   */
  public static rankMemories(
    candidateFacts: MemoryFactEntity[],
    queryKeywords: string[] = [],
    options: RankingOptions = {}
  ): ScoredMemoryItem[] {
    if (!candidateFacts || candidateFacts.length === 0) {
      return [];
    }

    const { topK = 5, minScoreThreshold = 0.0, categoryFilter } = options;

    // 1. Score every candidate memory fact using MemoryScorer
    let scoredItems: ScoredMemoryItem[] = candidateFacts.map((fact) => ({
      fact,
      score: MemoryScorer.scoreMemory(fact, queryKeywords),
    }));

    // 2. Filter by category if requested
    if (categoryFilter) {
      scoredItems = scoredItems.filter((item) => item.fact.category === categoryFilter);
    }

    // 3. Filter by minimum final score threshold
    if (minScoreThreshold > 0) {
      scoredItems = scoredItems.filter((item) => item.score.finalScore >= minScoreThreshold);
    }

    // 4. Deterministically sort by finalScore descending (with tie-breaking by lastUsedAt and ID)
    scoredItems.sort((a, b) => {
      // Primary sort: finalScore descending
      if (b.score.finalScore !== a.score.finalScore) {
        return b.score.finalScore - a.score.finalScore;
      }

      // Tie-breaker 1: Pinned memories first
      if (a.score.isPinned !== b.score.isPinned) {
        return a.score.isPinned ? -1 : 1;
      }

      // Tie-breaker 2: Recency timestamp descending
      const timeA = new Date(a.fact.lastUsedAt || a.fact.createdAt).getTime();
      const timeB = new Date(b.fact.lastUsedAt || b.fact.createdAt).getTime();
      if (timeB !== timeA) {
        return timeB - timeA;
      }

      // Tie-breaker 3: Deterministic ID lexicographical order
      return a.fact.id.localeCompare(b.fact.id);
    });

    // 5. Slice and return Top-K scored memory items
    return scoredItems.slice(0, topK);
  }
}
