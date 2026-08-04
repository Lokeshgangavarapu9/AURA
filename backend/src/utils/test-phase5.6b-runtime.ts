/**
 * AURA Core Runtime Layer — Phase 5.6b Test Suite
 * Validates Runtime State Machine, ContextAssemblyPipeline token budgeting,
 * RuntimeLifecycleOrchestrator execution, failure recovery, and ConversationManager routing.
 */

import {
  RuntimeStateMachine,
  contextAssemblyPipeline,
  runtimeOrchestrator,
  RuntimeContext,
} from '../runtime/index.js';
import { conversationManager } from '../conversation/manager/conversation.manager.js';
import { logger } from './logger.js';

async function runPhase56bTests() {
  logger.info('🧪 Starting Phase 5.6b Runtime Lifecycle & Context Assembly Pipeline Tests...\n');

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
    // T1: State Machine Initialization & Valid Transitions
    const sm = new RuntimeStateMachine('IDLE');
    assert(sm.getCurrentState() === 'IDLE', 'T1: RuntimeStateMachine initializes in IDLE state');

    sm.transitionTo('PERCEIVING');
    assert(sm.getCurrentState() === 'PERCEIVING', 'T2: Valid transition IDLE -> PERCEIVING succeeds');

    sm.transitionTo('ASSEMBLING_CONTEXT');
    assert(sm.getCurrentState() === 'ASSEMBLING_CONTEXT', 'T3: Valid transition PERCEIVING -> ASSEMBLING_CONTEXT succeeds');

    sm.transitionTo('ROUTING');
    assert(sm.getCurrentState() === 'ROUTING', 'T4: Valid transition ASSEMBLING_CONTEXT -> ROUTING succeeds');

    sm.transitionTo('LLM_EXECUTION');
    assert(sm.getCurrentState() === 'LLM_EXECUTION', 'T5: Valid transition ROUTING -> LLM_EXECUTION succeeds');

    sm.transitionTo('POST_PROCESSING');
    assert(sm.getCurrentState() === 'POST_PROCESSING', 'T6: Valid transition LLM_EXECUTION -> POST_PROCESSING succeeds');

    sm.transitionTo('IDLE');
    assert(sm.getCurrentState() === 'IDLE', 'T7: Valid transition POST_PROCESSING -> IDLE succeeds');

    // T2: Invalid Transition Guard Recovery
    sm.transitionTo('POST_PROCESSING'); // Invalid from IDLE
    assert(sm.getCurrentState() === 'FALLBACK_RECOVERY', 'T8: Invalid transition triggers recovery state guard');

    // T3: ContextAssemblyPipeline Aggregation & Dynamic Token Budgeting
    const assembledContext: RuntimeContext = await contextAssemblyPipeline.assembleContext(
      { userMessage: 'Hello AURA, how are you feeling today?' },
      'test-session-123'
    );

    assert(Boolean(assembledContext.id), 'T9: ContextAssemblyPipeline produces valid context ID');
    assert(assembledContext.sessionId === 'test-session-123', 'T10: ContextAssemblyPipeline preserves sessionId');
    assert(Boolean(assembledContext.emotionalContext), 'T11: ContextAssemblyPipeline includes EmotionalContext');
    assert(Boolean(assembledContext.relationshipContext), 'T12: ContextAssemblyPipeline includes RelationshipContext');
    assert(Boolean(assembledContext.workingMemory), 'T13: ContextAssemblyPipeline includes WorkingMemory');
    assert(assembledContext.tokenBudget.totalCeiling === 4000, 'T14: ContextAssemblyPipeline total ceiling is 4000 tokens');
    assert(assembledContext.tokenBudget.allocatedTokens > 0, 'T15: ContextAssemblyPipeline token allocation calculation > 0');

    // T4: RuntimeLifecycleOrchestrator Execution
    const orchestratorResult = await runtimeOrchestrator.executeTurn({
      userMessage: 'Testing core runtime orchestrator turn execution',
    });

    assert(Boolean(orchestratorResult.responseText), 'T16: RuntimeLifecycleOrchestrator produces non-empty responseText');
    assert(Boolean(orchestratorResult.emotion), 'T17: RuntimeLifecycleOrchestrator produces emotion classification');
    assert(orchestratorResult.executionTimeMs > 0, 'T18: RuntimeLifecycleOrchestrator calculates execution time ms');

    // T5: End-to-End ConversationManager Routing
    const convResult = await conversationManager.processConversation({
      userMessage: 'Checking ConversationManager routing to RuntimeLifecycleOrchestrator',
    });

    assert(Boolean(convResult.aiResponse.text), 'T19: ConversationManager routes turn smoothly through RuntimeLifecycleOrchestrator', `AI Response: ${convResult.aiResponse.text.substring(0, 60)}...`);

    logger.info(`\n📊 Phase 5.6b Runtime Tests: ${passed} passed, ${failed} failed`);
    if (failed === 0) {
      logger.info('🎉 All Core Runtime & Context Assembly Pipeline tests passed successfully!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    logger.error({ err }, '❌ Phase 5.6b test suite threw an unhandled error');
    process.exit(1);
  }
}

runPhase56bTests();
