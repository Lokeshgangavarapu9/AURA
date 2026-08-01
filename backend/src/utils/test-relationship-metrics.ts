import { trustEvaluator } from '../relationship/metrics/trust.evaluator.js';
import { affinityEvaluator } from '../relationship/metrics/affinity.evaluator.js';
import { signalEvaluator } from '../relationship/metrics/signal.evaluator.js';
import { healthEvaluator } from '../relationship/metrics/health.evaluator.js';
import { RelationshipSignals } from '../relationship/types/index.js';

function testRelationshipMetricsSuite() {
  console.log('🧪 Testing Relationship & Personalization Engine — Step 2 Metrics Evaluators...');

  // 1. Trust Evaluator Unit Tests
  console.log('\n--- Test 1: Trust Evaluator (Positive vs Negative) ---');
  const initialTrust = 20;

  const posTrust = trustEvaluator.evaluateTrust(initialTrust, 'I am worried about my exam, but I trust you with my dream goal');
  console.log(`Initial: ${initialTrust} | Positive Delta: +${posTrust.delta} | New Trust: ${posTrust.newTrustScore}`);
  if (posTrust.newTrustScore <= initialTrust || posTrust.delta <= 0) {
    throw new Error('Test 1 Failed: Expected trust to increase after positive vulnerability sharing!');
  }

  const negTrust = trustEvaluator.evaluateTrust(initialTrust, 'You are a fake liar and a stupid bot');
  console.log(`Initial: ${initialTrust} | Negative Delta: ${negTrust.delta} | New Trust: ${negTrust.newTrustScore}`);
  if (negTrust.newTrustScore >= initialTrust || negTrust.delta >= 0) {
    throw new Error('Test 1 Failed: Expected trust to decrease after hostile interaction!');
  }

  // 2. Affinity Evaluator Unit Tests (Independent of Trust)
  console.log('\n--- Test 2: Affinity Evaluator (Independent Evolution) ---');
  const initialAffinity = 30;

  const posAffinity = affinityEvaluator.evaluateAffinity(initialAffinity, 'I really love chatting with you, thank you so much!');
  console.log(`Initial: ${initialAffinity} | Positive Affinity: ${posAffinity.newAffinityScore}`);
  if (posAffinity.newAffinityScore <= initialAffinity) {
    throw new Error('Test 2 Failed: Expected affinity to increase with praise/warmth!');
  }

  // Verify independence: Trust evaluator does not change when affinity runs
  const unchangedTrustCheck = trustEvaluator.evaluateTrust(20, 'Simple conversation');
  if (unchangedTrustCheck.newTrustScore !== 20.2) {
    throw new Error('Test 2 Failed: Trust evaluator mutated by unexpected side effect!');
  }

  // 3. Signal Evaluator Unit Tests
  console.log('\n--- Test 3: Signal Evaluator ---');
  const baselineSignals: RelationshipSignals = {
    curiosity: 5,
    gratitude: 3,
    openness: 4,
    engagement: 5,
    humor: 2,
    respect: 6,
    dependence: 2,
  };

  const updatedSignals = signalEvaluator.evaluateSignals(
    baselineSignals,
    'Why is AI so interesting? Thank you for helping me, haha that joke was funny! I honestly feel great about my goal.'
  );

  console.log('Updated Signals:', updatedSignals);
  if (
    updatedSignals.curiosity <= baselineSignals.curiosity ||
    updatedSignals.gratitude <= baselineSignals.gratitude ||
    updatedSignals.humor <= baselineSignals.humor
  ) {
    throw new Error('Test 3 Failed: Signals failed to update correctly!');
  }

  // 4. Health Evaluator Unit Tests (Clamped strictly 0 to 100)
  console.log('\n--- Test 4: Health Evaluator ---');
  const lowHealth = healthEvaluator.evaluateHealth(0, 0, baselineSignals, 0);
  const highHealth = healthEvaluator.evaluateHealth(100, 100, { curiosity: 10, gratitude: 10, openness: 10, engagement: 10, humor: 10, respect: 10, dependence: 10 }, 100);

  console.log(`Low Health Score: ${lowHealth} | High Health Score: ${highHealth}`);
  if (lowHealth < 0 || lowHealth > 100 || highHealth < 0 || highHealth > 100) {
    throw new Error('Test 4 Failed: Health score boundaries violated!');
  }

  // 5. Determinism Verification (Same Input -> Same Output)
  console.log('\n--- Test 5: Determinism Verification ---');
  const run1 = trustEvaluator.evaluateTrust(50, 'I struggle with math exams');
  const run2 = trustEvaluator.evaluateTrust(50, 'I struggle with math exams');

  if (run1.newTrustScore !== run2.newTrustScore || run1.delta !== run2.delta) {
    throw new Error('Test 5 Failed: Non-deterministic evaluator output!');
  }

  // 6. Edge Case Handling (Empty Message, First Interaction, Max/Min Values)
  console.log('\n--- Test 6: Edge Cases ---');
  const emptyTurnTrust = trustEvaluator.evaluateTrust(50, '');
  if (emptyTurnTrust.delta !== 0 || emptyTurnTrust.newTrustScore !== 50) {
    throw new Error('Test 6 Failed: Empty message turn handling failed!');
  }

  const maxTrust = trustEvaluator.evaluateTrust(100, 'I trust you completely with my goal secret');
  if (maxTrust.newTrustScore > 100) {
    throw new Error('Test 6 Failed: Trust exceeded max limit 100!');
  }

  const minTrust = trustEvaluator.evaluateTrust(0, 'You are a fake liar stupid bot');
  if (minTrust.newTrustScore < 0) {
    throw new Error('Test 6 Failed: Trust fell below min limit 0!');
  }

  console.log('\n🎉 Phase 4.2 Step 2 Metrics Evaluator Suite Passed Successfully!');
}

testRelationshipMetricsSuite();
