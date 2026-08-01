/**
 * AURA Relationship & Personalization Engine — Relationship Weight Calculator
 * Calculates deterministic relationship weight factor W_rel (0.8 <= W_rel <= 1.3) for Memory Engine scoring.
 * Pure mathematical logic: Contains ZERO database, ZERO Gemini, and ZERO state dependencies.
 */

import { RELATIONSHIP_CONFIG } from '../config/relationship.config.js';

export class RelationshipWeightCalculator {
  /**
   * Calculates deterministic relationship weight factor W_rel clamped strictly to [0.8, 1.3].
   * @param trustScore Current TrustScore (0-100)
   * @param relationshipHealth Current RelationshipHealth (0-100)
   */
  public calculateWeight(trustScore: number = 0, relationshipHealth: number = 0): number {
    const safeTrust = Math.max(0, Math.min(100, trustScore ?? 0));
    const safeHealth = Math.max(0, Math.min(100, relationshipHealth ?? 0));

    // Base 0.85 + (Trust/100 * 0.25) + (Health/100 * 0.20)
    const rawWeight = 0.85 + (safeTrust / 100) * 0.25 + (safeHealth / 100) * 0.2;

    const bounds = RELATIONSHIP_CONFIG.WEIGHT_BOUNDS;
    const clampedWeight = Math.max(bounds.MIN_W_REL, Math.min(bounds.MAX_W_REL, rawWeight));

    return Math.round(clampedWeight * 100) / 100;
  }
}

/** Singleton export for RelationshipWeightCalculator */
export const relationshipWeightCalculator = new RelationshipWeightCalculator();
