/**
 * AURA Relationship & Personalization Engine — Health Evaluator
 * Pure evaluator computing high-level relationshipHealth score (0 to 100).
 * Completely independent: Reads trust, affinity, and signals, but MODIFIES NOTHING.
 */

import { RelationshipSignals } from '../types/index.js';
import { RELATIONSHIP_CONFIG } from '../config/relationship.config.js';

export class HealthEvaluator {
  /**
   * Deterministically calculates relationship health score (0-100).
   * @param trustScore Current TrustScore (0-100)
   * @param affinityScore Current AffinityScore (0-100)
   * @param signals RelationshipSignals
   * @param totalTurns Total conversation turns count
   */
  public evaluateHealth(
    trustScore: number,
    affinityScore: number,
    signals: RelationshipSignals,
    totalTurns: number = 1
  ): number {
    const safeTrust = Math.max(0, Math.min(100, trustScore ?? 10));
    const safeAffinity = Math.max(0, Math.min(100, affinityScore ?? 10));

    const opennessNorm = Math.max(0, Math.min(10, signals?.openness ?? 5)) * 10;
    const engagementNorm = Math.max(0, Math.min(10, signals?.engagement ?? 5)) * 10;
    const consistencyScore = Math.min(100, Math.max(0, totalTurns * 2));

    const weights = RELATIONSHIP_CONFIG.HEALTH_WEIGHTS;

    const rawHealth =
      safeTrust * weights.TRUST +
      safeAffinity * weights.AFFINITY +
      opennessNorm * weights.OPENNESS +
      engagementNorm * weights.ENGAGEMENT +
      consistencyScore * weights.CONSISTENCY;

    const clampedHealth = Math.max(0, Math.min(100, rawHealth));
    return Math.round(clampedHealth * 10) / 10;
  }
}

/** Singleton export for HealthEvaluator */
export const healthEvaluator = new HealthEvaluator();
