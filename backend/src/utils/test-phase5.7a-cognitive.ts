/**
 * AURA Cognitive Intelligence Engine — Phase 5.7a Test Suite
 * Validates CognitiveStateMachine, IntentAnalyzer classification, confidence scoring,
 * CognitivePlan generation, and non-breaking ConversationManager integration.
 */

import {
  CognitiveStateMachine,
  intentAnalyzer,
  cognitiveEngine,
  IntentCategory,
} from '../cognitive/index.js';
import { conversationManager } from '../conversation/manager/conversation.manager.js';
import { logger } from './logger.js';

async function runPhase57aTests() {
  logger.info('🧪 Starting Phase 5.7a Cognitive State Machine & Intent Analyzer Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      logger.info(`✅ ${testName}${detail ? ` (${detail})` : ''}`);
      passed++;
    } else {
      logger.error(`❌ ${testName}${detail ? ` (${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // T1: CognitiveStateMachine Transitions
    const sm = new CognitiveStateMachine('IDLE');
    assert(sm.getCurrentState() === 'IDLE', 'T1: CognitiveStateMachine initializes in IDLE state');

    sm.transitionTo('OBSERVING');
    assert(sm.getCurrentState() === 'OBSERVING', 'T2: Valid transition IDLE -> OBSERVING succeeds');

    sm.transitionTo('UNDERSTANDING');
    assert(sm.getCurrentState() === 'UNDERSTANDING', 'T3: Valid transition OBSERVING -> UNDERSTANDING succeeds');

    sm.transitionTo('PLANNING');
    assert(sm.getCurrentState() === 'PLANNING', 'T4: Valid transition UNDERSTANDING -> PLANNING succeeds');

    sm.transitionTo('COMPLETED');
    assert(sm.getCurrentState() === 'COMPLETED', 'T5: Valid transition PLANNING -> COMPLETED succeeds');

    sm.transitionTo('IDLE');
    assert(sm.getCurrentState() === 'IDLE', 'T6: Valid transition COMPLETED -> IDLE succeeds');

    // T2: Intent Classification & Confidence Scoring
    const greetingRes = intentAnalyzer.analyzeIntent({ userMessage: 'Hello AURA!' });
    assert(greetingRes.primaryIntent === IntentCategory.GREETING, 'T7: IntentAnalyzer classifies greeting prompt correctly');
    assert(greetingRes.confidence >= 0.8, 'T8: Greeting prompt has high confidence score');

    const codingRes = intentAnalyzer.analyzeIntent({ userMessage: 'Can you help me fix a TypeScript bug in React?' });
    assert(codingRes.primaryIntent === IntentCategory.CODING, 'T9: IntentAnalyzer classifies coding prompt correctly');

    const emotionRes = intentAnalyzer.analyzeIntent({ userMessage: 'I feel really stressed and anxious today.' });
    assert(emotionRes.primaryIntent === IntentCategory.EMOTIONAL_SUPPORT, 'T10: IntentAnalyzer classifies emotional support prompt correctly');

    // T3: CognitivePlan Generation
    const plan = cognitiveEngine.planTurn({
      userMessage: 'How do I optimize SQL queries in Prisma?',
      sessionId: 'test-session-57a',
    });

    assert(Boolean(plan.planId), 'T11: CognitiveEngine generates valid planId');
    assert(plan.sessionId === 'test-session-57a', 'T12: CognitiveEngine preserves sessionId');
    assert(plan.intent.primaryIntent === IntentCategory.QUESTION || plan.intent.primaryIntent === IntentCategory.CODING, 'T13: CognitivePlan contains analyzed intent result');
    assert(plan.requiresMemory === true, 'T14: CognitivePlan enables memory requirement flag');

    // T4: Non-Breaking ConversationManager Integration
    const convResult = await conversationManager.processConversation({
      userMessage: 'Testing cognitive engine integration with conversation manager',
    });

    assert(Boolean(convResult.aiResponse.text), 'T15: ConversationManager routes turn smoothly through CognitiveEngine facade', `AI Response: ${convResult.aiResponse.text.substring(0, 60)}...`);

    logger.info(`\n📊 Phase 5.7a Cognitive Tests: ${passed} passed, ${failed} failed`);
    if (failed === 0) {
      logger.info('🎉 All Cognitive State Machine & Intent Analyzer tests passed successfully!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    logger.error({ err }, '❌ Phase 5.7a test suite threw an unhandled error');
    process.exit(1);
  }
}

runPhase57aTests();
