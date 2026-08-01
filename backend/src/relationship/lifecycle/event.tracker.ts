/**
 * AURA Relationship & Personalization Engine — Event Tracker
 * Detects and appends immutable historical RelationshipEvent records.
 * Pure domain logic: Append-only array operations; never edits or deletes past events.
 */

import { RelationshipEvent, RelationshipEventType } from '../types/index.js';
import { EmotionalContext } from '../../emotion/types/index.js';

export class EventTracker {
  /**
   * Evaluates current turn input and appends newly detected immutable RelationshipEvent items.
   * @param existingEvents Existing array of RelationshipEvent items
   * @param text Input message text
   * @param turnId Unique turn identifier
   * @param emotionalContext Optional EmotionalContext
   * @param lastInteractionAt Optional timestamp of previous turn
   */
  public evaluateEvents(
    existingEvents: RelationshipEvent[] = [],
    text: string,
    turnId: string = `turn-${Date.now()}`,
    emotionalContext?: EmotionalContext,
    lastInteractionAt?: Date
  ): RelationshipEvent[] {
    const lowerText = (text || '').toLowerCase().trim();
    if (!lowerText) {
      return [...existingEvents]; // Return copy, never mutate
    }

    const newEvents: RelationshipEvent[] = [];
    const now = new Date();

    // 1. Long Absence / Return After Break Check (e.g. > 7 days since last turn)
    if (lastInteractionAt) {
      const daysDiff = (now.getTime() - new Date(lastInteractionAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff >= 7) {
        newEvents.push({
          id: `evt-${Date.now()}-break`,
          turnId,
          type: 'return_after_break',
          impact: 5,
          description: `User returned after a ${Math.round(daysDiff)}-day break`,
          timestamp: now,
        });
      }
    }

    // 2. Vulnerability / Deep Conversation Check
    if (/\b(worried|scared|secret|fear|struggle|confess|vulnerable|depressed)\b/.test(lowerText)) {
      newEvents.push({
        id: `evt-${Date.now()}-vuln`,
        turnId,
        type: 'vulnerability',
        impact: 8,
        description: 'User shared personal vulnerability or emotional distress',
        timestamp: now,
      });
    }

    // 3. Goal Shared / Goal Completed Check
    if (/\b(my goal is|i want to achieve|aiming to|dream of)\b/.test(lowerText)) {
      newEvents.push({
        id: `evt-${Date.now()}-goal-shared`,
        turnId,
        type: 'goal_shared',
        impact: 6,
        description: 'User expressed an active goal or aspiration',
        timestamp: now,
      });
    } else if (/\b(i finished|i completed|finally passed|achieved my goal|i did it)\b/.test(lowerText)) {
      newEvents.push({
        id: `evt-${Date.now()}-goal-completed`,
        turnId,
        type: 'goal_completed',
        impact: 10,
        description: 'User achieved or completed a key goal',
        timestamp: now,
      });
    }

    // 4. Gratitude Check
    if (/\b(thanks|thank you|grateful|appreciate your help|helped me so much)\b/.test(lowerText)) {
      newEvents.push({
        id: `evt-${Date.now()}-gratitude`,
        turnId,
        type: 'gratitude',
        impact: 5,
        description: 'User expressed explicit gratitude or appreciation',
        timestamp: now,
      });
    }

    // Append newly detected events to existing array (Strictly append-only)
    return [...existingEvents, ...newEvents];
  }
}

/** Singleton export for EventTracker */
export const eventTracker = new EventTracker();
