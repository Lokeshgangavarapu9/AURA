import { relationshipAnalyzer } from '../relationship/analyzer/relationship.analyzer.js';
import { relationshipWeightCalculator } from '../relationship/weight/weight.calculator.js';

function testRelationshipAnalyzerPipeline() {
  console.log('🧪 Testing Master RelationshipAnalyzer Facade & Pipeline...');

  // 1. Initial State & Turn 1 Analysis
  const turn1Result = relationshipAnalyzer.analyze({
    userId: 'user-101',
    userMessage: 'Hi, my goal is to pass my final exam and I am worried',
    turnId: 'turn-1',
  });

  console.log('\n--- Test 1: Turn 1 Analysis ---');
  console.log('Version:', turn1Result.context.version);
  console.log('Level:', turn1Result.context.level);
  console.log('Trust:', turn1Result.updatedState.metrics.trustScore);
  console.log('Health:', turn1Result.context.metrics.relationshipHealth);
  console.log('Events Count:', turn1Result.updatedState.events.length);
  console.log('Milestones Count:', turn1Result.context.milestones.length);

  if (turn1Result.context.version !== 1 || turn1Result.updatedState.events.length < 2) {
    throw new Error('Test 1 Failed: Turn 1 analysis pipeline mismatch!');
  }

  // 2. W_rel Calculation & Bounds Check (0.8 <= W_rel <= 1.3)
  console.log('\n--- Test 2: W_rel Weight Calculation & Bounds ---');
  const wLow = relationshipWeightCalculator.calculateWeight(0, 0);
  const wNormal = turn1Result.context.relationshipWeight;
  const wHigh = relationshipWeightCalculator.calculateWeight(100, 100);

  console.log(`Low W_rel: ${wLow} | Normal W_rel: ${wNormal} | High W_rel: ${wHigh}`);

  if (wLow < 0.8 || wHigh > 1.3 || wNormal < 0.8 || wNormal > 1.3) {
    throw new Error('Test 2 Failed: W_rel weight boundaries [0.8, 1.3] violated!');
  }

  // 3. Transient PersonalityDirective Generation
  console.log('\n--- Test 3: PersonalityDirective Generation ---');
  const directive = turn1Result.context.directive;
  console.log('Summary Prompt:', directive.summaryPrompt);
  console.log('Safety Notice:', directive.safetyNotice);

  if (!directive.summaryPrompt.includes('Relationship Tier') || !directive.rules) {
    throw new Error('Test 3 Failed: PersonalityDirective output missing required structure!');
  }

  // 4. Immutable Snapshot Check
  console.log('\n--- Test 4: Immutable RelationshipContext Snapshot ---');
  const isFrozen = Object.isFrozen(turn1Result.context);
  console.log('Context Object Frozen:', isFrozen);

  if (!isFrozen) {
    throw new Error('Test 4 Failed: RelationshipContext snapshot must be frozen and immutable!');
  }

  // 5. Append-Only Events & History Timeline Multi-Turn Progression
  console.log('\n--- Test 5: Multi-Turn History & Events Progression ---');
  let state = turn1Result.updatedState;

  // Turn 2
  const turn2Result = relationshipAnalyzer.analyze({
    userId: 'user-101',
    userMessage: 'Thank you so much for listening to me, haha that was awesome!',
    currentState: state,
    turnId: 'turn-2',
  });

  state = turn2Result.updatedState;
  console.log('Turn 2 Events Total:', state.events.length);
  console.log('Turn 2 History Total:', state.history.length);

  if (state.events.length <= turn1Result.updatedState.events.length) {
    throw new Error('Test 5 Failed: Append-only event tracking failed!');
  }

  // 6. Deterministic Execution Check
  console.log('\n--- Test 6: Deterministic Execution Check ---');
  const det1 = relationshipAnalyzer.analyze({ userId: 'u1', userMessage: 'Hello AURA', currentState: turn1Result.updatedState });
  const det2 = relationshipAnalyzer.analyze({ userId: 'u1', userMessage: 'Hello AURA', currentState: turn1Result.updatedState });

  if (
    det1.updatedState.metrics.trustScore !== det2.updatedState.metrics.trustScore ||
    det1.context.relationshipWeight !== det2.context.relationshipWeight
  ) {
    throw new Error('Test 6 Failed: Non-deterministic analyzer output!');
  }

  console.log('\n🎉 Master RelationshipAnalyzer Facade Unit Test Suite Passed Successfully!');
}

testRelationshipAnalyzerPipeline();
