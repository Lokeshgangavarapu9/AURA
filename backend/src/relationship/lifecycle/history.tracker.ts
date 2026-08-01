/**
 * AURA Relationship & Personalization Engine — History Tracker
 * Appends immutable RelationshipHistoryItem records ONLY when meaningful state transitions occur.
 * Pure domain logic: Prevents noisy per-turn logging; appends only significant level or metric shifts.
 */

import { RelationshipHistoryItem, RelationshipLevel } from '../types/index.js';

export class HistoryTracker {
  /**
   * Appends a new RelationshipHistoryItem if a level transition or large metric delta occurred.
   * @param existingHistory Existing timeline array
   * @param turnId Current turn identifier
   * @param prevLevel Previous RelationshipLevel
   * @param newLevel New RelationshipLevel
   * @param trustDelta Calculated trust delta for turn
   * @param affinityDelta Calculated affinity delta for turn
   * @param healthDelta Calculated health delta for turn
   */
  public evaluateHistory(
    existingHistory: RelationshipHistoryItem[] = [],
    turnId: string,
    prevLevel: RelationshipLevel,
    newLevel: RelationshipLevel,
    trustDelta: number,
    affinityDelta: number,
    healthDelta: number = 0
  ): RelationshipHistoryItem[] {
    const isLevelChange = prevLevel !== newLevel;
    const isLargeTrustDelta = Math.abs(trustDelta) >= 5.0;
    const isLargeAffinityDelta = Math.abs(affinityDelta) >= 5.0;
    const isLargeHealthDelta = Math.abs(healthDelta) >= 10.0;

    // Do NOT create entry if change is minor
    if (!isLevelChange && !isLargeTrustDelta && !isLargeAffinityDelta && !isLargeHealthDelta) {
      return [...existingHistory];
    }

    let reason = 'Significant metric evolution';
    if (isLevelChange) {
      reason = `Promoted relationship level from ${prevLevel} to ${newLevel}`;
    } else if (isLargeTrustDelta) {
      reason = `Major trust score shift (${trustDelta > 0 ? '+' : ''}${trustDelta})`;
    } else if (isLargeAffinityDelta) {
      reason = `Major affinity score shift (${affinityDelta > 0 ? '+' : ''}${affinityDelta})`;
    }

    const newItem: RelationshipHistoryItem = {
      turnId,
      previousLevel: prevLevel,
      newLevel,
      trustDelta: Math.round(trustDelta * 10) / 10,
      affinityDelta: Math.round(affinityDelta * 10) / 10,
      reason,
      timestamp: new Date(),
    };

    return [...existingHistory, newItem];
  }
}

/** Singleton export for HistoryTracker */
export const historyTracker = new HistoryTracker();
