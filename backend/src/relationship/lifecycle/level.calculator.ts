/**
 * AURA Relationship & Personalization Engine — Level Calculator
 * Deterministically evaluates RelationshipLevel tier from metrics and milestones.
 * Pure domain logic: Produces RelationshipLevel ONLY; modifies zero external state.
 */

import { RelationshipLevel } from '../types/index.js';
import { RELATIONSHIP_CONFIG } from '../config/relationship.config.js';

export class LevelCalculator {
  /**
   * Deterministically calculates RelationshipLevel tier based on trust, health, turns, and milestone count.
   * @param trustScore Current TrustScore (0-100)
   * @param relationshipHealth Current RelationshipHealth (0-100)
   * @param totalTurns Total turns count
   * @param milestoneCount Total unique milestones awarded count
   */
  public calculateLevel(
    trustScore: number,
    relationshipHealth: number,
    totalTurns: number,
    milestoneCount: number
  ): RelationshipLevel {
    const rules = RELATIONSHIP_CONFIG.LEVEL_THRESHOLDS;

    // Check Confidant (Tier 5)
    if (
      trustScore >= rules.confidant.minTrust &&
      totalTurns >= rules.confidant.minTurns &&
      milestoneCount >= rules.confidant.minMilestones &&
      relationshipHealth >= 80
    ) {
      return 'confidant';
    }

    // Check Close Friend (Tier 4)
    if (
      trustScore >= rules.close_friend.minTrust &&
      totalTurns >= rules.close_friend.minTurns &&
      milestoneCount >= rules.close_friend.minMilestones &&
      relationshipHealth >= 60
    ) {
      return 'close_friend';
    }

    // Check Companion (Tier 3)
    if (
      trustScore >= rules.companion.minTrust &&
      totalTurns >= rules.companion.minTurns &&
      relationshipHealth >= 40
    ) {
      return 'companion';
    }

    // Check Acquaintance (Tier 2)
    if (
      trustScore >= rules.acquaintance.minTrust &&
      totalTurns >= rules.acquaintance.minTurns &&
      relationshipHealth >= 20
    ) {
      return 'acquaintance';
    }

    // Default: Stranger (Tier 1)
    return 'stranger';
  }
}

/** Singleton export for LevelCalculator */
export const levelCalculator = new LevelCalculator();
