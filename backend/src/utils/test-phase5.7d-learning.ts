/**
 * AURA Cognitive Intelligence Engine — Phase 5.7d Test Suite
 * Validates LearningDecisionEngine, memory candidacy, importance scoring, duplicate detection,
 * preference/habit evolution, relationship update planning, and complete CognitivePlan integration.
 */

import {
  learningDecisionEngine,
  cognitiveEngine,
  IntentCategory,
  TaskType,
} from '../cognitive/index.js';
import { conversationManager } from '../conversation/manager/conversation.manager.js';
import { logger } from './logger.js';

async function runPhase57dTests() {
  logger.info('🧪 Starting Phase 5.7d Learning Decision Engine & Cognitive Integration Tests...\n');

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
    // T1: Memory Candidate Extraction & Importance Scoring
    const memoryLearning = learningDecisionEngine.evaluateLearning(
      { userMessage: 'My name is Lokesh and I work as a software architect' },
      TaskType.GENERAL_DISCUSSION,
      IntentCategory.CONVERSATION
    );

    assert(memoryLearning.shouldStoreMemory === true, 'T1: LearningDecisionEngine identifies personal memory candidate');
    assert(memoryLearning.importanceScore >= 0.8, 'T2: Personal memory candidate receives high importance score');

    // T2: Duplicate Candidate Memory Detection
    const duplicateLearning = learningDecisionEngine.evaluateLearning(
      {
        userMessage: 'My name is Lokesh and I work as a software architect',
        history: [{ sender: 'user', text: 'My name is Lokesh and I work as a software architect' }],
      },
      TaskType.GENERAL_DISCUSSION,
      IntentCategory.CONVERSATION
    );

    assert(duplicateLearning.isDuplicateMemory === true, 'T3: LearningDecisionEngine detects duplicate candidate memory from history');
    assert(duplicateLearning.shouldStoreMemory === false, 'T4: LearningDecisionEngine skips storing duplicate candidate memories');

    // T3: Preference & Habit Evolution Planning
    const prefLearning = learningDecisionEngine.evaluateLearning(
      { userMessage: 'I prefer detailed code examples and dark mode' },
      TaskType.GENERAL_DISCUSSION,
      IntentCategory.CONVERSATION
    );

    assert(prefLearning.shouldUpdatePreferences === true, 'T5: LearningDecisionEngine detects user preference evolution signal');
    assert(prefLearning.preferenceUpdates.length > 0, 'T6: LearningDecisionEngine extracts preference key-value updates');

    const habitLearning = learningDecisionEngine.evaluateLearning(
      { userMessage: 'I study algorithms every morning at 7am' },
      TaskType.PLANNING,
      IntentCategory.PLANNING_REQUEST
    );

    assert(habitLearning.shouldUpdateHabits === true, 'T7: LearningDecisionEngine detects habit pattern evolution signal');
    assert(habitLearning.habitUpdates.length > 0, 'T8: LearningDecisionEngine extracts habit update descriptions');

    // T4: Relationship Metric Update Planning
    const emoLearning = learningDecisionEngine.evaluateLearning(
      { userMessage: 'I feel really stressed about my upcoming presentation' },
      TaskType.EMOTIONAL_CONVERSATION,
      IntentCategory.EMOTIONAL_SUPPORT
    );

    assert(emoLearning.relationshipUpdates.trustIncrement > 0.1, 'T9: LearningDecisionEngine plans higher trust increment for emotional support turns');
    assert(emoLearning.relationshipUpdates.closenessIncrement > 0.1, 'T10: LearningDecisionEngine plans higher closeness increment for emotional support turns');

    // T5: Enriched Phase 5.7 Final CognitivePlan Generation
    const finalPlan = cognitiveEngine.planTurn({
      userMessage: 'I want to master Rust programming this year. My goal is to build a high performance web server.',
      sessionId: 'test-session-57d',
    });

    assert(Boolean(finalPlan.planId), 'T11: CognitiveEngine generates final Phase 5.7 CognitivePlan');
    assert(Boolean(finalPlan.learningPlan), 'T12: Final CognitivePlan contains LearningPlan');
    assert(finalPlan.learningPlan.shouldUpdateGoals === true, 'T13: LearningPlan identifies goal evolution signal');
    assert(finalPlan.metadata.version === '2.0.0', 'T14: Final CognitivePlan metadata version is 2.0.0');

    // T6: End-to-End ConversationManager Compatibility
    const convResult = await conversationManager.processConversation({
      userMessage: 'Verifying ConversationManager compatibility with complete Phase 5.7 CognitivePlan',
    });

    assert(Boolean(convResult.aiResponse.text), 'T15: ConversationManager routes turn smoothly with complete Phase 5.7 CognitivePlan', `AI Response: ${convResult.aiResponse.text.substring(0, 60)}...`);

    logger.info(`\n📊 Phase 5.7d Learning Decision Engine Tests: ${passed} passed, ${failed} failed`);
    if (failed === 0) {
      logger.info('🎉 All Learning Decision Engine & Cognitive Integration tests passed successfully!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    logger.error({ err }, '❌ Phase 5.7d test suite threw an unhandled error');
    process.exit(1);
  }
}

runPhase57dTests();
