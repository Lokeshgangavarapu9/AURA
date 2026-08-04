/**
 * AURA Cognitive Intelligence Engine — Phase 5.7b Test Suite
 * Validates GoalReasoner, TaskUnderstandingEngine, DecisionPlanner, Confidence Engine,
 * Planning Metadata, and Enhanced CognitivePlan generation.
 */

import {
  goalReasoner,
  taskUnderstandingEngine,
  decisionPlanner,
  cognitiveEngine,
  IntentCategory,
  TaskType,
} from '../cognitive/index.js';
import { conversationManager } from '../conversation/manager/conversation.manager.js';
import { logger } from './logger.js';

async function runPhase57bTests() {
  logger.info('🧪 Starting Phase 5.7b Cognitive Reasoning Engine Tests...\n');

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
    // T1: GoalReasoner Goal Inference
    const examGoals = goalReasoner.inferGoals(
      { userMessage: 'Help me study and pass tomorrow\'s math exam.' },
      IntentCategory.QUESTION
    );

    assert(Boolean(examGoals.immediateGoal), 'T1: GoalReasoner infers immediate turn goal');
    assert(Boolean(examGoals.sessionGoal), 'T2: GoalReasoner infers session thread goal');
    assert(Boolean(examGoals.longTermGoal && (examGoals.longTermGoal.includes('academic') || examGoals.longTermGoal.includes('exam'))), 'T3: GoalReasoner infers long-term user goal when keywords present');

    // T2: TaskUnderstandingEngine Classification
    const codingTaskType = taskUnderstandingEngine.determineTaskType(
      { userMessage: 'I am getting a syntax error in my React TypeScript component' },
      IntentCategory.CODING
    );
    assert(codingTaskType === TaskType.TROUBLESHOOTING, 'T4: TaskUnderstandingEngine detects TROUBLESHOOTING task type for bug prompts');

    const planningTaskType = taskUnderstandingEngine.determineTaskType(
      { userMessage: 'Let\'s create a 4-week roadmap to learn Rust' },
      IntentCategory.PLANNING_REQUEST
    );
    assert(planningTaskType === TaskType.PLANNING, 'T5: TaskUnderstandingEngine detects PLANNING task type');

    // T3: DecisionPlanner Subsystem Planning & Suggestions
    const subsystemPlan = decisionPlanner.planSubsystems(TaskType.CODING, IntentCategory.CODING);
    assert(subsystemPlan.requiresCapability === true, 'T6: DecisionPlanner requires capabilities for coding tasks');
    assert(subsystemPlan.requiresFileAnalysis === true, 'T7: DecisionPlanner requires file analysis for technical tasks');

    const suggestions = decisionPlanner.generateSuggestions(TaskType.EMOTIONAL_CONVERSATION, IntentCategory.EMOTIONAL_SUPPORT);
    assert(suggestions.suggestedResponseStyle === 'empathetic_gentle', 'T8: DecisionPlanner suggests empathetic_gentle posture for emotional tasks');
    assert(suggestions.riskLevel === 'medium', 'T9: DecisionPlanner sets risk level to medium for emotional support tasks');

    // T4: Enriched CognitivePlan Generation via CognitiveEngine
    const enrichedPlan = cognitiveEngine.planTurn({
      userMessage: 'Help me prepare for my software engineering job interview next week.',
      sessionId: 'test-session-57b',
    });

    assert(Boolean(enrichedPlan.planId), 'T10: CognitiveEngine generates enriched CognitivePlan with planId');
    assert(Boolean(enrichedPlan.goals.immediateGoal), 'T11: Enriched CognitivePlan contains inferred goals');
    assert(enrichedPlan.reasoningConfidence > 0, 'T12: Enriched CognitivePlan contains reasoning confidence score');
    assert(enrichedPlan.reasoningPath.length >= 4, 'T13: Enriched CognitivePlan includes step-by-step reasoning path');
    assert(Boolean(enrichedPlan.metadata.timestamp), 'T14: Enriched CognitivePlan includes planning metadata timestamp');
    assert(enrichedPlan.metadata.version === '1.5.0', 'T15: Enriched CognitivePlan metadata version is 1.5.0');

    // T5: End-to-End ConversationManager Compatibility
    const convResult = await conversationManager.processConversation({
      userMessage: 'Verifying ConversationManager compatibility with enriched CognitivePlan',
    });

    assert(Boolean(convResult.aiResponse.text), 'T16: ConversationManager routes turn smoothly with enriched CognitivePlan', `AI Response: ${convResult.aiResponse.text.substring(0, 60)}...`);

    logger.info(`\n📊 Phase 5.7b Cognitive Reasoning Tests: ${passed} passed, ${failed} failed`);
    if (failed === 0) {
      logger.info('🎉 All Cognitive Reasoning Engine (Goal Reasoner & Decision Planner) tests passed successfully!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    logger.error({ err }, '❌ Phase 5.7b test suite threw an unhandled error');
    process.exit(1);
  }
}

runPhase57bTests();
