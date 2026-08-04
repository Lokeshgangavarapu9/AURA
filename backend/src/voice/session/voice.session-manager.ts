/**
 * AURA Voice Foundation — Voice Session Manager
 * Orchestrates session lifecycle: start, stop, pause, resume, cancel, active mic/speaker routing.
 */

import { EventEmitter } from 'events';
import { VoiceSessionInfo, VoiceState, VoiceSessionStatus } from '../types/voice.types.js';
import { VoiceStateMachine } from '../state/voice.state-machine.js';
import { logger } from '../../utils/logger.js';

export interface CreateVoiceSessionInput {
  sessionId?: string;
  conversationSessionId?: string;
  activeMicrophoneId?: string;
  activeSpeakerId?: string;
}

export class VoiceSessionManager extends EventEmitter {
  private activeSessions: Map<string, VoiceSessionInfo> = new Map();
  private stateMachines: Map<string, VoiceStateMachine> = new Map();

  /**
   * Start a new voice session
   */
  public startSession(input: CreateVoiceSessionInput = {}): VoiceSessionInfo {
    const id = input.sessionId || `vsess-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const sessionInfo: VoiceSessionInfo = {
      sessionId: id,
      conversationSessionId: input.conversationSessionId,
      status: 'active',
      voiceState: VoiceState.IDLE,
      activeMicrophoneId: input.activeMicrophoneId || 'default-mic',
      activeSpeakerId: input.activeSpeakerId || 'default-speaker',
      startedAt: new Date(),
      lastActiveAt: new Date(),
      metrics: {
        inputAudioDurationMs: 0,
        outputAudioDurationMs: 0,
        turnsCount: 0,
        interruptionsCount: 0,
      },
    };

    const stateMachine = new VoiceStateMachine(VoiceState.IDLE);
    stateMachine.on('stateChanged', ({ currentState }) => {
      const sess = this.activeSessions.get(id);
      if (sess) {
        sess.voiceState = currentState;
        sess.lastActiveAt = new Date();
        this.emit('sessionStateChanged', { sessionId: id, state: currentState });
      }
    });

    this.activeSessions.set(id, sessionInfo);
    this.stateMachines.set(id, stateMachine);

    logger.info({ sessionId: id, input }, '🎙️ VoiceSessionManager: Started voice session');
    this.emit('sessionStarted', sessionInfo);

    return sessionInfo;
  }

  public getSession(sessionId: string): VoiceSessionInfo | undefined {
    return this.activeSessions.get(sessionId);
  }

  public getStateMachine(sessionId: string): VoiceStateMachine | undefined {
    return this.stateMachines.get(sessionId);
  }

  public pauseSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== 'active') return false;

    session.status = 'paused';
    session.lastActiveAt = new Date();

    const sm = this.stateMachines.get(sessionId);
    if (sm && sm.getState() !== VoiceState.IDLE) {
      sm.transitionTo(VoiceState.IDLE, 'Session paused');
    }

    logger.info({ sessionId }, '⏸️ VoiceSessionManager: Paused voice session');
    this.emit('sessionPaused', session);
    return true;
  }

  public resumeSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== 'paused') return false;

    session.status = 'active';
    session.lastActiveAt = new Date();

    logger.info({ sessionId }, '▶️ VoiceSessionManager: Resumed voice session');
    this.emit('sessionResumed', session);
    return true;
  }

  public cancelSession(sessionId: string, reason: string = 'User cancelled'): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    const sm = this.stateMachines.get(sessionId);
    if (sm) {
      sm.interrupt(reason);
      sm.reset();
    }

    session.status = 'stopped';
    session.metrics.interruptionsCount += 1;
    session.lastActiveAt = new Date();

    logger.info({ sessionId, reason }, '🛑 VoiceSessionManager: Cancelled voice session');
    this.emit('sessionCancelled', { sessionId, reason });
    return true;
  }

  public stopSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    const sm = this.stateMachines.get(sessionId);
    if (sm) {
      if (sm.canTransitionTo(VoiceState.COMPLETED)) {
        sm.transitionTo(VoiceState.COMPLETED, 'Session stopped');
      }
      sm.reset();
    }

    session.status = 'stopped';
    session.lastActiveAt = new Date();

    logger.info({ sessionId }, '⏹️ VoiceSessionManager: Stopped voice session');
    this.emit('sessionStopped', session);

    // Cleanup resources
    this.activeSessions.delete(sessionId);
    this.stateMachines.delete(sessionId);
    return true;
  }

  public setActiveMicrophone(sessionId: string, micId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;
    session.activeMicrophoneId = micId;
    return true;
  }

  public setActiveSpeaker(sessionId: string, speakerId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;
    session.activeSpeakerId = speakerId;
    return true;
  }

  public listActiveSessions(): VoiceSessionInfo[] {
    return Array.from(this.activeSessions.values());
  }
}

export const voiceSessionManager = new VoiceSessionManager();
