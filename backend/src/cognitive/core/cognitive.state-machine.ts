/**
 * AURA Cognitive Intelligence Engine — Cognitive State Machine
 * Deterministic state machine governing the 5-stage cognitive planning turn lifecycle.
 */

import { CognitiveState } from '../types/cognitive.types.js';
import { logger } from '../../utils/logger.js';

export class CognitiveStateMachine {
  private currentState: CognitiveState;
  private readonly validTransitions: Record<CognitiveState, CognitiveState[]> = {
    IDLE: ['OBSERVING'],
    OBSERVING: ['UNDERSTANDING', 'COMPLETED'],
    UNDERSTANDING: ['PLANNING', 'COMPLETED'],
    PLANNING: ['COMPLETED'],
    COMPLETED: ['IDLE'],
  };

  constructor(initialState: CognitiveState = 'IDLE') {
    this.currentState = initialState;
  }

  public getCurrentState(): CognitiveState {
    return this.currentState;
  }

  /**
   * Transitions state machine safely.
   */
  public transitionTo(nextState: CognitiveState): void {
    const allowed = this.validTransitions[this.currentState];

    if (!allowed || !allowed.includes(nextState)) {
      logger.warn(
        { from: this.currentState, to: nextState },
        `⚠️ CognitiveStateMachine: Invalid transition attempted: [${this.currentState}] -> [${nextState}]`
      );
      this.currentState = nextState === 'IDLE' ? 'IDLE' : 'COMPLETED';
      return;
    }

    logger.debug(
      { from: this.currentState, to: nextState },
      `🧠 Cognitive State Machine: [${this.currentState}] ➔ [${nextState}]`
    );

    this.currentState = nextState;
  }
}
