/**
 * AURA Cognitive Intelligence Engine — Phase 5.7c Test Suite
 * Validates WorkingCognitiveContext, ContextStrategyEngine, ResponseStrategyEngine, Dynamic Token Budgeting,
 * Clarification Strategy, and Enriched CognitivePlan generation.
 */

import {
  WorkingCognitiveContextManager,
  contextStrategyEngine,
  responseStrategyEngine,
  cognitiveEngine,
  IntentCategory,
  TaskType,
  ContextPriorityLevel,
  ResponseMode,
} from '../cognitive/index.js';
import { conversationManager } from '../conversation/manager/conversation.manager.js';
import { logger } from './logger.js';

async function runPhase57cTests() {
  logger.info('🧪 Starting Phase 5.7c Cognitive Context Strategy & Response Intelligence Tests...\n');

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
    // T1: WorkingCognitiveContext Lifecycle
    const workspace = new WorkingCognitiveContextManager();
    workspace.addAssumption('User is asking for TypeScript help');
    workspace.addPlanningNote('Verify code syntax precision');
    const snapshot = workspace.getContextSnapshot();

    assert(snapshot.activeAssumptions.length === 1, 'T1: WorkingCognitiveContext stores active assumptions');
    assert(snapshot.planningNotes.length === 1, 'T2: WorkingCognitiveContext stores planning notes');

    workspace.clear();
    const emptySnapshot = workspace.getContextSnapshot();
    assert(emptySnapshot.activeAssumptions.length === 0, 'T3: WorkingCognitiveContext clears workspace successfully');

    // T2: ContextStrategyEngine Prioritization & Dynamic Budgeting
    const codingPriorities = contextStrategyEngine.prioritizeContext(TaskType.CODING, IntentCategory.CODING);
    assert(codingPriorities.capabilities === ContextPriorityLevel.CRITICAL, 'T4: ContextStrategyEngine assigns CRITICAL priority to capabilities for coding');
    assert(codingPriorities.files === ContextPriorityLevel.CRITICAL, 'T5: ContextStrategyEngine assigns CRITICAL priority to files for coding');

    const codingBudget = contextStrategyEngine.calculateDynamicBudget(codingPriorities);
    assert(codingBudget.capabilityTokens >= 1000, 'T6: ContextStrategyEngine allocates larger capability token budget for coding');
    assert(codingBudget.totalAllocatedTokens > 2000, 'T7: ContextStrategyEngine calculates total allocated token budget');

    const discarded = contextStrategyEngine.getDiscardedContext(codingPriorities);
    assert(discarded.length > 0, 'T8: ContextStrategyEngine tracks explicitly discarded context layers');

    // T3: ResponseStrategyEngine Postures & Clarification Plan
    const codeResp = responseStrategyEngine.determineResponseStrategy(TaskType.CODING, IntentCategory.CODING);
    assert(codeResp.mode === ResponseMode.CODE_REVIEW_MODE, 'T9: ResponseStrategyEngine selects CODE_REVIEW_MODE for coding task');

    const emoResp = responseStrategyEngine.determineResponseStrategy(TaskType.EMOTIONAL_CONVERSATION, IntentCategory.EMOTIONAL_SUPPORT);
    assert(emoResp.mode === ResponseMode.EMPATHETIC, 'T10: ResponseStrategyEngine selects EMPATHETIC mode for emotional support');

    const lowConfClarification = responseStrategyEngine.evaluateClarification(
      { userMessage: 'xyz' },
      0.4,
      IntentCategory.UNKNOWN
    );
    assert(lowConfClarification.requiresClarification === true, 'T11: ResponseStrategyEngine generates clarification plan for low-confidence turns');
    assert((lowConfClarification.suggestedQuestions?.length || 0) > 0, 'T12: Clarification plan includes suggested clarification questions');

    // T4: Enriched CognitivePlan Generation via CognitiveEngine
    const enrichedPlan = cognitiveEngine.planTurn({
      userMessage: 'Can you help me design a microservices architecture for real-time video streaming?',
      sessionId: 'test-session-57c',
    });

    assert(Boolean(enrichedPlan.planId), 'T13: CognitiveEngine generates enriched Phase 5.7c CognitivePlan with planId');
    assert(Boolean(enrichedPlan.workingContext), 'T14: Enriched CognitivePlan contains workingContext snapshot');
    assert(Boolean(enrichedPlan.dynamicBudget.totalAllocatedTokens), 'T15: Enriched CognitivePlan contains dynamic token budget');
    assert(Boolean(enrichedPlan.responseStrategy.mode), 'T16: Enriched CognitivePlan contains responseStrategy mode');
    assert(enrichedPlan.metadata.version === '1.7.0', 'T17: Enriched CognitivePlan version updated to 1.7.0');

    // T5: End-to-End ConversationManager Compatibility
    const convResult = await conversationManager.processConversation({
      userMessage: 'Verifying ConversationManager compatibility with Phase 5.7c CognitivePlan',
    });

    assert(Boolean(convResult.aiResponse.text), 'T18: ConversationManager routes turn smoothly with Phase 5.7c CognitivePlan', `AI Response: ${convResult.aiResponse.text.substring(0, 60)}...`);

    logger.info(`\n📊 Phase 5.7c Cognitive Context & Strategy Tests: ${passed} passed, ${failed} failed`);
    if (failed === 0) {
      logger.info('🎉 All Cognitive Context Strategy & Response Intelligence tests passed successfully!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    logger.error({ err }, '❌ Phase 5.7c test suite threw an unhandled error');
    process.exit(1);
  }
}

runPhase57cTests();
