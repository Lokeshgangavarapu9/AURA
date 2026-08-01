import { MemoryScorer } from '../memory/scoring/scorer.js';
import { MemoryFactEntity } from '../memory/types/index.js';

function testPhase41AffinityScoring() {
  console.log('🧪 Testing Phase 4.1 MemoryEmotionAffinity Refinement...');

  const examMemory: MemoryFactEntity = {
    id: 'mem-exam',
    category: 'goal',
    key: 'Final Exam Deadline',
    value: 'Computer Science exam tomorrow',
    confidence: 1.0,
    importance: 8,
    frequency: 2,
    lastUsedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const foodMemory: MemoryFactEntity = {
    id: 'mem-food',
    category: 'preference',
    key: 'Favorite Pizza',
    value: 'Loves Pepperoni Pizza with extra cheese',
    confidence: 1.0,
    importance: 8,
    frequency: 2,
    lastUsedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const queryKeywords = ['exam', 'worried'];
  const worriedGlobalWeight = 1.5; // Worried emotion W_e

  // 1. Calculate Affinity Scores
  const examAffinity = MemoryScorer.calculateMemoryEmotionAffinity(examMemory, queryKeywords);
  const foodAffinity = MemoryScorer.calculateMemoryEmotionAffinity(foodMemory, queryKeywords);

  console.log(`Exam Memory Affinity: ${examAffinity} | Food Memory Affinity: ${foodAffinity}`);

  if (examAffinity <= foodAffinity) {
    throw new Error('Expected exam memory affinity to be significantly higher than food memory affinity!');
  }

  // 2. Score Both Memories under Worried Emotional Context
  const examScore = MemoryScorer.scoreMemory(examMemory, queryKeywords, new Date(), worriedGlobalWeight);
  const foodScore = MemoryScorer.scoreMemory(foodMemory, queryKeywords, new Date(), worriedGlobalWeight);

  console.log(`Exam Final Score: ${examScore.finalScore} | Food Final Score: ${foodScore.finalScore}`);

  if (examScore.finalScore <= foodScore.finalScore) {
    throw new Error('Expected exam memory to rank higher than food memory under worried context!');
  }

  // 3. Verify Unrelated Memory Remains Almost Unchanged
  const foodUnweightedScore = MemoryScorer.scoreMemory(foodMemory, queryKeywords, new Date());
  const scoreDelta = foodScore.finalScore - foodUnweightedScore.finalScore;

  console.log(`Food Unweighted Score: ${foodUnweightedScore.finalScore} | Food Delta: ${scoreDelta.toFixed(3)}`);

  if (scoreDelta > 0.15) {
    throw new Error('Expected unrelated memory score to remain almost unchanged!');
  }

  console.log('\n🎉 Phase 4.1 MemoryEmotionAffinity Refinement Unit Test Passed Successfully!');
}

testPhase41AffinityScoring();
