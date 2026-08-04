/**
 * AURA Core Runtime Layer — Runtime State Machine
 * Deterministic state machine governing turn lifecycles across 8 lifecycle states.
 */

import { RuntimeState } from '../types/runtime.types.js';
import { logger } from '../../utils/logger.js';

export class RuntimeStateMachine {
  private currentState: RuntimeState;
  private readonly validTransitions: Record<RuntimeState, RuntimeState[]> = {
    IDLE: ['PERCEIVING', 'ASSEMBLING_CONTEXT'],
    PERCEIVING: ['ASSEMBLING_CONTEXT', 'FALLBACK_RECOVERY'],
    ASSEMBLING_CONTEXT: ['ROUTING', 'FALLBACK_RECOVERY'],
    ROUTING: ['LLM_EXECUTION', 'FALLBACK_RECOVERY'],
    LLM_EXECUTION: ['CAPABILITY_WAIT', 'POST_PROCESSING', 'FALLBACK_RECOVERY'],
    CAPABILITY_WAIT: ['LLM_EXECUTION', 'POST_PROCESSING', 'FALLBACK_RECOVERY'],
    FALLBACK_RECOVERY: ['POST_PROCESSING', 'IDLE'],
    POST_PROCESSING: ['IDLE'],
  };

  constructor(initialState: RuntimeState = 'IDLE') {
    this.currentState = initialState;
  }

  public getCurrentState(): RuntimeState {
    return this.currentState;
  }

  /**
   * Transitions the runtime state machine safely.
   */
  public transitionTo(nextState: RuntimeState): void {
    const allowed = this.validTransitions[this.currentState];

    if (!allowed || !allowed.includes(nextState)) {
      logger.warn(
        { from: this.currentState, to: nextState },
        `⚠️ RuntimeStateMachine Invalid transition attempted: [${this.currentState}] -> [${nextState}]`
      );
      // Fail-safe transition to FALLBACK_RECOVERY or IDLE
      if (nextState !== 'IDLE') {
        this.currentState = 'FALLBACK_RECOVERY';
      } else {
        this.currentState = 'IDLE';
      }
      return;
    }

    logger.debug(
      { from: this.currentState, to: nextState },
      `🔄 Runtime State Machine: [${this.currentState}] ➔ [${nextState}]`
    );

    this.currentState = nextState;
  }
}
