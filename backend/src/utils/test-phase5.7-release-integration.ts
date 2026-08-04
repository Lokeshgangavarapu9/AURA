/**
 * AURA AI Companion OS — Phase 5.7 Master Release Integration Test Suite
 * Validates the complete end-to-end execution pipeline across Cognitive Engine, Runtime,
 * Capability Router, Provider Layer, Post-Processing Engine, and Memory/Learning Evolution.
 */

import { cognitiveEngine, IntentCategory, TaskType } from '../cognitive/index.js';
import { conversationManager } from '../conversation/manager/conversation.manager.js';
import { runtimeOrchestrator } from '../runtime/index.js';
import { providerManager } from '../ai/providers/index.js';
import { capabilityRegistry } from '../capabilities/index.js';
import { logger } from './logger.js';

async function runPhase57ReleaseIntegrationTests() {
  logger.info('🚀 Starting Phase 5.7 Master Release Integration Benchmark...\n');

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
    // 1. Verify Subsystem Availability
    assert(Boolean(cognitiveEngine), 'T1: Cognitive Intelligence Engine facade is active');
    assert(Boolean(runtimeOrchestrator), 'T2: Core Runtime Orchestrator is active');
    assert(Boolean(providerManager), 'T3: Provider Manager is active');
    assert(capabilityRegistry.listAll().length >= 6, 'T4: Capability Registry has registered all internal capabilities');

    // 2. Direct Cognitive Engine Turn Planning (Phase 5.7 v2.0.0 Plan)
    const testPrompt = 'I want to build a high performance web server using Rust. Help me write the main function.';
    const cogPlan = cognitiveEngine.planTurn({
      userMessage: testPrompt,
      sessionId: 'release-integration-session',
    });

    assert(cogPlan.intent.primaryIntent === IntentCategory.CODING, 'T5: Cognitive Engine classifies primary intent as CODING');
    assert(cogPlan.taskType === TaskType.CODING, 'T6: Cognitive Engine classifies task type as CODING');
    assert(Boolean(cogPlan.goals.immediateGoal), 'T7: Cognitive Engine infers immediate turn goals');
    assert(Boolean(cogPlan.workingContext), 'T8: Cognitive Engine includes Working Context workspace snapshot');
    assert(Boolean(cogPlan.dynamicBudget.totalAllocatedTokens), 'T9: Cognitive Engine calculates dynamic token budget');
    assert(Boolean(cogPlan.responseStrategy.mode), 'T10: Cognitive Engine selects response posture mode');
    assert(Boolean(cogPlan.learningPlan), 'T11: Cognitive Engine formulates LearningPlan');
    assert(cogPlan.metadata.version === '2.0.0', 'T12: CognitivePlan version is 2.0.0');

    // 3. End-to-End Execution Pipeline (ConversationManager -> Cognitive -> Runtime -> Response)
    const startTurnTime = Date.now();
    const convResult = await conversationManager.processConversation({
      userMessage: testPrompt,
    });
    const turnDuration = Date.now() - startTurnTime;

    assert(Boolean(convResult.aiResponse.text), 'T13: Full end-to-end conversation turn returns AI response', `AI Response: ${convResult.aiResponse.text.substring(0, 60)}...`);
    assert(Boolean(convResult.sessionId), 'T14: Session ID maintained across turn');
    assert(turnDuration < 10000, 'T15: Turn completed within performance SLA', `Duration: ${turnDuration}ms`);

    // 4. Multi-Turn Sequential Flow & Memory Evolution
    const turn2Result = await conversationManager.processConversation({
      userMessage: 'My name is Lokesh and I am a software architect.',
      sessionId: convResult.sessionId,
    });

    assert(Boolean(turn2Result.aiResponse.text), 'T16: Turn 2 executes cleanly with active session memory context');

    logger.info(`\n📊 Phase 5.7 Release Integration Benchmark: ${passed} passed, ${failed} failed`);
    if (failed === 0) {
      logger.info('🎉 All Phase 5.7 Master Release Integration tests passed successfully!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    logger.error({ err }, '❌ Phase 5.7 release integration test suite threw an unhandled error');
    process.exit(1);
  }
}

runPhase57ReleaseIntegrationTests();
