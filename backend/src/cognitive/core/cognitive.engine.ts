/**
 * AURA Cognitive Intelligence Engine — Master CognitiveEngine Facade
 * Central facade orchestrating turn analysis, state machine transitions, intent classification,
 * goal reasoning, task understanding, decision planning, context strategy, response strategy,
 * working context workspace, learning decision evolution, and enriched CognitivePlan generation.
 */

import { CognitiveStateMachine } from './cognitive.state-machine.js';
import { IntentAnalyzer, intentAnalyzer } from '../modules/intent.analyzer.js';
import { GoalReasoner, goalReasoner } from '../modules/goal.reasoner.js';
import { TaskUnderstandingEngine, taskUnderstandingEngine } from '../modules/task.understanding.js';
import { DecisionPlanner, decisionPlanner } from '../modules/decision.planner.js';
import { ContextStrategyEngine, contextStrategyEngine } from '../modules/context.strategy.js';
import { ResponseStrategyEngine, responseStrategyEngine } from '../modules/response.strategy.js';
import { LearningDecisionEngine, learningDecisionEngine } from '../modules/learning.decision.js';
import { WorkingCognitiveContextManager } from '../workspace/working.context.js';
import { CognitiveEngineInput, CognitivePlan } from '../types/cognitive.types.js';
import { logger } from '../../utils/logger.js';

export class CognitiveEngine {
  private analyzer: IntentAnalyzer;
  private goalReasoner: GoalReasoner;
  private taskEngine: TaskUnderstandingEngine;
  private planner: DecisionPlanner;
  private contextStrategy: ContextStrategyEngine;
  private responseStrategy: ResponseStrategyEngine;
  private learningEngine: LearningDecisionEngine;

  constructor(
    analyzer?: IntentAnalyzer,
    goalReasonerInst?: GoalReasoner,
    taskEngine?: TaskUnderstandingEngine,
    planner?: DecisionPlanner,
    contextStrategy?: ContextStrategyEngine,
    responseStrategy?: ResponseStrategyEngine,
    learningEngine?: LearningDecisionEngine
  ) {
    this.analyzer = analyzer || intentAnalyzer;
    this.goalReasoner = goalReasonerInst || goalReasoner;
    this.taskEngine = taskEngine || taskUnderstandingEngine;
    this.planner = planner || decisionPlanner;
    this.contextStrategy = contextStrategy || contextStrategyEngine;
    this.responseStrategy = responseStrategy || responseStrategyEngine;
    this.learningEngine = learningEngine || learningDecisionEngine;
  }

  /**
   * Evaluates incoming user input and generates an enriched, immutable CognitivePlan.
   */
  public planTurn(input: CognitiveEngineInput): CognitivePlan {
    const startTime = Date.now();
    const sm = new CognitiveStateMachine('IDLE');
    const activeSessionId = input.sessionId || `session-${Date.now()}`;
    const workspace = new WorkingCognitiveContextManager();

    // 1. IDLE -> OBSERVING
    sm.transitionTo('OBSERVING');
    workspace.addPlanningNote(`Observed incoming prompt: "${input.userMessage.substring(0, 50)}..."`);

    // 2. OBSERVING -> UNDERSTANDING
    sm.transitionTo('UNDERSTANDING');
    const intentResult = this.analyzer.analyzeIntent(input);
    const goals = this.goalReasoner.inferGoals(input, intentResult.primaryIntent);
    const taskType = this.taskEngine.determineTaskType(input, intentResult.primaryIntent);

    workspace.addAssumption(`Turn intent is ${intentResult.primaryIntent}`);
    workspace.addFact(`Immediate goal: ${goals.immediateGoal}`);

    // 3. UNDERSTANDING -> PLANNING
    sm.transitionTo('PLANNING');
    const subsystemPlan = this.planner.planSubsystems(taskType, intentResult.primaryIntent);
    const suggestions = this.planner.generateSuggestions(taskType, intentResult.primaryIntent);
    const reasoningPath = this.planner.buildReasoningPath(taskType, intentResult.primaryIntent);

    const contextPriorities = this.contextStrategy.prioritizeContext(taskType, intentResult.primaryIntent);
    const dynamicBudget = this.contextStrategy.calculateDynamicBudget(contextPriorities);
    const discardedContext = this.contextStrategy.getDiscardedContext(contextPriorities);

    const respStrategy = this.responseStrategy.determineResponseStrategy(taskType, intentResult.primaryIntent);
    const reasoningConfidence = Number((intentResult.confidence * 0.95).toFixed(2));
    const isLowConfidence = reasoningConfidence < 0.6;
    const clarificationPlan = this.responseStrategy.evaluateClarification(input, reasoningConfidence, intentResult.primaryIntent);

    const learningPlan = this.learningEngine.evaluateLearning(input, taskType, intentResult.primaryIntent);

    if (clarificationPlan.requiresClarification) {
      workspace.addOpenQuestion('Ambiguous prompt detected — clarification plan formulated');
    }

    if (learningPlan.shouldStoreMemory) {
      workspace.addPlanningNote(`Memory candidate identified: "${learningPlan.memoryCandidate?.substring(0, 30)}..."`);
    }

    workspace.addIntermediateReasoning(`Selected response mode [${respStrategy.mode}] with depth [${respStrategy.depth}]`);
    const workingSnapshot = workspace.getContextSnapshot();

    // Destroy ephemeral context workspace
    workspace.clear();

    const durationMs = Date.now() - startTime;

    const cognitivePlan: CognitivePlan = {
      planId: `cogplan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date(),
      userMessage: input.userMessage,
      sessionId: activeSessionId,

      intent: intentResult,
      taskType,
      goals,

      reasoningConfidence,
      isLowConfidence,
      reasoningPath,

      workingContext: workingSnapshot,
      contextPriorities,
      dynamicBudget,
      discardedContext,

      responseStrategy: respStrategy,
      clarificationPlan,
      learningPlan,

      subsystemPlan,
      requiresMemory: subsystemPlan.requiresMemory,
      requiresEmotion: subsystemPlan.requiresEmotion,
      requiresRelationship: subsystemPlan.requiresRelationship,
      requiresCapability: subsystemPlan.requiresCapability,
      requiresLearningUpdate: subsystemPlan.requiresLearning,

      suggestions,
      metadata: {
        timestamp: new Date(),
        durationMs,
        decisionSource: 'hybrid',
        triggeredRules: ['rule_intent_match', 'heuristic_goal_inference', 'dynamic_budget_strategy', 'learning_decision_rule'],
        version: '2.0.0',
      },
      version: '2.0.0',
    };

    // 4. PLANNING -> COMPLETED
    sm.transitionTo('COMPLETED');
    sm.transitionTo('IDLE');

    logger.info(
      {
        planId: cognitivePlan.planId,
        intent: intentResult.primaryIntent,
        taskType,
        mode: respStrategy.mode,
        shouldStoreMemory: learningPlan.shouldStoreMemory,
        allocatedTokens: dynamicBudget.totalAllocatedTokens,
        planningTimeMs: durationMs,
      },
      '🧠 CognitiveEngine: Complete Phase 5.7 CognitivePlan created successfully'
    );

    return cognitivePlan;
  }
}

/** Singleton instance export for CognitiveEngine */
export const cognitiveEngine = new CognitiveEngine();
