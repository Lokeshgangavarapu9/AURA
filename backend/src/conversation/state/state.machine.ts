/**
 * AURA Conversation Intelligence Engine — State Machine
 * Enforces deterministic lifecycle state transitions for conversation turns.
 * Rejects invalid transition paths to guarantee state machine consistency.
 */

import { ConversationStateEnum } from '../types/index.js';
import { logger } from '../../utils/logger.js';

/** Valid state transition mapping table */
const VALID_TRANSITIONS: Record<ConversationStateEnum, ConversationStateEnum[]> = {
  IDLE: ['LISTENING', 'ERROR'],
  LISTENING: ['THINKING', 'WAITING', 'ERROR', 'IDLE'],
  THINKING: ['RESPONDING', 'WAITING', 'EXECUTING', 'ERROR'],
  RESPONDING: ['IDLE', 'ERROR'],
  WAITING: ['THINKING', 'LISTENING', 'ERROR', 'IDLE'],
  EXECUTING: ['RESPONDING', 'THINKING', 'ERROR'],
  ERROR: ['IDLE'],
};

export class ConversationStateMachine {
  private currentState: ConversationStateEnum;

  constructor(initialState: ConversationStateEnum = 'IDLE') {
    this.currentState = initialState;
  }

  /**
   * Gets the active conversation state.
   */
  public getState(): ConversationStateEnum {
    return this.currentState;
  }

  /**
   * Attempts to transition to a new target state.
   * Throws Error if the transition is invalid.
   */
  public transitionTo(targetState: ConversationStateEnum): ConversationStateEnum {
    const allowed = VALID_TRANSITIONS[this.currentState];

    if (!allowed || !allowed.includes(targetState)) {
      const errorMsg = `Invalid state transition from '${this.currentState}' to '${targetState}'`;
      logger.error({ from: this.currentState, to: targetState }, `❌ StateMachine: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    logger.debug({ from: this.currentState, to: targetState }, '🔄 StateMachine: Transitioned state');
    this.currentState = targetState;
    return this.currentState;
  }

  /**
   * Checks whether a transition to targetState is valid without performing the transition.
   */
  public canTransitionTo(targetState: ConversationStateEnum): boolean {
    const allowed = VALID_TRANSITIONS[this.currentState];
    return allowed ? allowed.includes(targetState) : false;
  }

  /**
   * Resets state back to IDLE safely.
   */
  public reset(): ConversationStateEnum {
    this.currentState = 'IDLE';
    return this.currentState;
  }
}
