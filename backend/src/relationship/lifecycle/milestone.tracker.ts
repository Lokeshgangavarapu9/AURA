/**
 * AURA Relationship & Personalization Engine — Milestone Tracker
 * Evaluates and awards unique categorized relational milestones.
 * Pure domain logic: Prevents duplicate milestones; assigns unique IDs.
 */

import { MilestoneRecord, MilestoneCategory, RelationshipEvent } from '../types/index.js';

export class MilestoneTracker {
  /**
   * Evaluates relationship state and awards new unique MilestoneRecord items.
   * @param existingMilestones Currently awarded milestones
   * @param trustScore Current TrustScore (0-100)
   * @param totalTurns Total conversation turns count
   * @param events Append-only relationship events list
   */
  public evaluateMilestones(
    existingMilestones: MilestoneRecord[] = [],
    trustScore: number = 0,
    totalTurns: number = 1,
    events: RelationshipEvent[] = []
  ): MilestoneRecord[] {
    const existingIds = new Set(existingMilestones.map((m) => m.id));
    const newMilestones: MilestoneRecord[] = [];
    const now = new Date();

    // Helper to add milestone only if unique ID doesn't exist
    const addIfUnique = (id: string, category: MilestoneCategory, name: string, description: string) => {
      if (!existingIds.has(id)) {
        existingIds.add(id);
        newMilestones.push({
          id,
          category,
          name,
          description,
          achievedAt: now,
        });
      }
    };

    // 1. First Turn Milestone
    if (totalTurns >= 1) {
      addIfUnique('ms-first-turn', 'conversation', 'First Conversation', 'Started your journey with AURA');
    }

    // 2. 50 Turns Milestone
    if (totalTurns >= 50) {
      addIfUnique('ms-50-turns', 'conversation', '50 Conversation Turns', 'Reached 50 shared conversation turns');
    }

    // 3. 100 Turns Milestone
    if (totalTurns >= 100) {
      addIfUnique('ms-100-turns', 'conversation', 'Centurion Companion', 'Reached 100 shared conversation turns');
    }

    // 4. High Trust Shared (Trust >= 50)
    if (trustScore >= 50) {
      addIfUnique('ms-trust-50', 'relationship', 'Deep Trust Built', 'Earned 50+ trust rating with AURA');
    }

    // 5. High Trust Shared (Trust >= 85)
    if (trustScore >= 85) {
      addIfUnique('ms-trust-85', 'relationship', 'Confidant Status', 'Reached elite 85+ trust level');
    }

    // 6. Goal Shared Event Milestone
    if (events.some((e) => e.type === 'goal_shared')) {
      addIfUnique('ms-goal-shared', 'goal', 'Shared Aspiration', 'Shared a key life goal with AURA');
    }

    // 7. Goal Completed Event Milestone
    if (events.some((e) => e.type === 'goal_completed')) {
      addIfUnique('ms-goal-completed', 'achievement', 'Goal Achieved', 'Successfully completed a shared goal');
    }

    return [...existingMilestones, ...newMilestones];
  }
}

/** Singleton export for MilestoneTracker */
export const milestoneTracker = new MilestoneTracker();
