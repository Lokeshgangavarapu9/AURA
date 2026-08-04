/**
 * AURA Cognitive Intelligence Engine — Central Domain Index
 * Re-exports cognitive types, state machine, intent analyzer, and CognitiveEngine facade.
 */

export * from './types/cognitive.types.js';
export * from './core/cognitive.state-machine.js';
export * from './modules/intent.analyzer.js';
export * from './modules/goal.reasoner.js';
export * from './modules/task.understanding.js';
export * from './modules/decision.planner.js';
export * from './modules/context.strategy.js';
export * from './modules/response.strategy.js';
export * from './workspace/working.context.js';
export * from './modules/learning.decision.js';
export * from './core/cognitive.engine.js';
