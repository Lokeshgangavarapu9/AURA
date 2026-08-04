/**
 * AURA Core Runtime — Internal Runtime Event Bus
 * Strongly-typed internal pub/sub event bus driving post-processing telemetry and learning feedback loops.
 */

import { EventEmitter } from 'events';
import { logger } from '../../utils/logger.js';

export type RuntimeEventType =
  | 'ConversationCompleted'
  | 'MemoryStored'
  | 'RelationshipUpdated'
  | 'LearningUpdated'
  | 'EmotionUpdated'
  | 'CapabilityExecuted'
  | 'ProviderInvoked';

export interface RuntimeEventPayload<T = unknown> {
  eventType: RuntimeEventType;
  timestamp: Date;
  sessionId: string;
  data: T;
}

export class RuntimeEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  /**
   * Publishes an internal event to subscribers.
   */
  public publish<T>(type: RuntimeEventType, sessionId: string, data: T): void {
    const payload: RuntimeEventPayload<T> = {
      eventType: type,
      timestamp: new Date(),
      sessionId,
      data,
    };

    logger.debug({ eventType: type, sessionId }, `📡 RuntimeEventBus: Event published [${type}]`);
    this.emitter.emit(type, payload);
    this.emitter.emit('*', payload);
  }

  /**
   * Subscribes to a specific runtime event type.
   */
  public subscribe<T>(type: RuntimeEventType | '*', listener: (payload: RuntimeEventPayload<T>) => void): void {
    this.emitter.on(type, listener);
  }

  /**
   * Unsubscribes from an event.
   */
  public unsubscribe<T>(type: RuntimeEventType | '*', listener: (payload: RuntimeEventPayload<T>) => void): void {
    this.emitter.off(type, listener);
  }
}

/** Singleton instance export for RuntimeEventBus */
export const runtimeEventBus = new RuntimeEventBus();
