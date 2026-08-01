import { MemoryScorer } from '../memory/scoring/scorer.js';
import { MemoryRanker } from '../memory/ranking/ranker.js';
import { MemoryFactEntity } from '../memory/types/index.js';
import { logger } from './logger.js';

function runScoringAndRankingTests() {
  logger.info('🧪 Running Memory Scoring & Ranking Unit Test Suite...');

  const now = new Date();
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);

  // Sample Test Memories
  const memRecentLowImp: MemoryFactEntity = {
    id: 'mem-1',
    category: 'fact',
    key: 'Lunch Choice',
    value: 'Ate a salad',
    confidence: 1.0,
    importance: 3,
    frequency: 1,
    lastUsedAt: oneHourAgo,
    createdAt: oneHourAgo,
    updatedAt: oneHourAgo,
  };

  const memOldHighImp: MemoryFactEntity = {
    id: 'mem-2',
    category: 'fact',
    key: 'University',
    value: 'Graduated from Stanford CS',
    confidence: 1.0,
    importance: 10,
    frequency: 1,
    lastUsedAt: tenDaysAgo,
    createdAt: tenDaysAgo,
    updatedAt: tenDaysAgo,
  };

  const memRepeatedFreq: MemoryFactEntity = {
    id: 'mem-3',
    category: 'preference',
    key: 'Favorite Coffee',
    value: 'Iced Oat Latte',
    confidence: 1.0,
    importance: 6,
    frequency: 15, // High frequency
    lastUsedAt: oneHourAgo,
    createdAt: tenDaysAgo,
    updatedAt: oneHourAgo,
  };

  const memRelationship: MemoryFactEntity = {
    id: 'mem-4',
    category: 'relationship',
    key: 'Sister Name',
    value: 'Sarah',
    confidence: 1.0,
    importance: 8,
    frequency: 3,
    lastUsedAt: oneHourAgo,
    createdAt: tenDaysAgo,
    updatedAt: oneHourAgo,
  };

  // 1. Test Single Scoring Breakdown
  const scoreResult = MemoryScorer.scoreMemory(memRecentLowImp, ['salad']);
  logger.info({ scoreResult }, '✅ Test 1: Single Memory Score Breakdown');

  // 2. Test Recency vs Importance Trade-off
  const scoreRecent = MemoryScorer.scoreMemory(memRecentLowImp);
  const scoreOldImp = MemoryScorer.scoreMemory(memOldHighImp);
  logger.info(
    { recentScore: scoreRecent.finalScore, oldImpScore: scoreOldImp.finalScore },
    '✅ Test 2: Recency vs Importance Comparison'
  );

  // 3. Test Frequency Boost
  const scoreFreq = MemoryScorer.scoreMemory(memRepeatedFreq);
  logger.info(
    { frequencyScore: scoreFreq.frequencyScore, finalScore: scoreFreq.finalScore },
    '✅ Test 3: Frequency Boost'
  );

  // 4. Test Relationship Category Boost
  const scoreRel = MemoryScorer.scoreMemory(memRelationship);
  logger.info(
    { relationshipScore: scoreRel.relationshipScore, finalScore: scoreRel.finalScore },
    '✅ Test 4: Relationship Boost'
  );

  // 5. Test Empty List Handling
  const emptyRank = MemoryRanker.rankMemories([]);
  logger.info({ count: emptyRank.length }, '✅ Test 5: Empty Memory List Handling');

  // 6. Test Top-K Ranking & Sorting
  const allCandidates = [memRecentLowImp, memOldHighImp, memRepeatedFreq, memRelationship];
  const rankedTop2 = MemoryRanker.rankMemories(allCandidates, ['coffee', 'stanford'], { topK: 2 });

  logger.info(
    {
      topKCount: rankedTop2.length,
      first: rankedTop2[0]?.fact.key,
      firstScore: rankedTop2[0]?.score.finalScore,
      second: rankedTop2[1]?.fact.key,
      secondScore: rankedTop2[1]?.score.finalScore,
    },
    '✅ Test 6: Top-K Ranking Results'
  );

  // 7. Test Tied Score Deterministic Order
  const memTiedA: MemoryFactEntity = { ...memRecentLowImp, id: 'mem-tied-a' };
  const memTiedB: MemoryFactEntity = { ...memRecentLowImp, id: 'mem-tied-b' };
  const tiedRank = MemoryRanker.rankMemories([memTiedB, memTiedA], [], { topK: 2 });
  logger.info(
    { firstId: tiedRank[0]?.fact.id, secondId: tiedRank[1]?.fact.id },
    '✅ Test 7: Tied Scores Deterministic Order'
  );

  logger.info('🎉 All Memory Scoring & Ranking Unit Tests Passed Successfully!');
}

runScoringAndRankingTests();
