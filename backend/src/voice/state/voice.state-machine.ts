/**
 * AURA Voice Foundation — Voice State Machine
 * Manages states: IDLE -> LISTENING -> TRANSCRIBING -> THINKING -> SPEAKING -> COMPLETED
 * Supports instant interruption handling & error recovery.
 */

import { EventEmitter } from 'events';
import { VoiceState, VALID_VOICE_TRANSITIONS } from '../types/voice.types.js';
import { logger } from '../../utils/logger.js';

export class VoiceStateMachine extends EventEmitter {
  private currentState: VoiceState = VoiceState.IDLE;

  constructor(initialState: VoiceState = VoiceState.IDLE) {
    super();
    this.currentState = initialState;
  }

  public getState(): VoiceState {
    return this.currentState;
  }

  public canTransitionTo(nextState: VoiceState): boolean {
    const validTransitions = VALID_VOICE_TRANSITIONS[this.currentState] || [];
    return validTransitions.includes(nextState);
  }

  public transitionTo(nextState: VoiceState, reason?: string): boolean {
    if (this.currentState === nextState) {
      return true;
    }

    if (!this.canTransitionTo(nextState)) {
      logger.warn(
        { from: this.currentState, to: nextState, reason },
        `⚠️ VoiceStateMachine: Invalid state transition requested`
      );
      return false;
    }

    const previousState = this.currentState;
    this.currentState = nextState;

    logger.info(
      { from: previousState, to: nextState, reason },
      `🎙️ VoiceStateMachine: Transited from ${previousState} -> ${nextState}`
    );

    this.emit('stateChanged', {
      previousState,
      currentState: nextState,
      reason,
      timestamp: new Date(),
    });

    this.emit(nextState, { previousState, reason });
    return true;
  }

  /**
   * Handle user speech interruption (barging in while AI is SPEAKING or THINKING)
   */
  public interrupt(reason: string = 'User barge-in detected'): boolean {
    logger.info({ currentState: this.currentState, reason }, '⚡ VoiceStateMachine: Interruption triggered');
    
    // Force transition to LISTENING or IDLE
    if (this.canTransitionTo(VoiceState.LISTENING)) {
      return this.transitionTo(VoiceState.LISTENING, `Interrupted: ${reason}`);
    } else {
      this.currentState = VoiceState.LISTENING;
      this.emit('stateChanged', {
        previousState: this.currentState,
        currentState: VoiceState.LISTENING,
        reason: `Forced interruption: ${reason}`,
        timestamp: new Date(),
      });
      return true;
    }
  }

  public reset(): void {
    const prev = this.currentState;
    this.currentState = VoiceState.IDLE;
    this.emit('stateChanged', {
      previousState: prev,
      currentState: VoiceState.IDLE,
      reason: 'State machine reset',
      timestamp: new Date(),
    });
  }
}
