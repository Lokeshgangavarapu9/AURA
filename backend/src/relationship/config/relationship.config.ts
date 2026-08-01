/**
 * AURA Relationship & Personalization Engine — Configuration & Thresholds
 * Pure domain rules: Contains ZERO Prisma, ZERO SQLite, ZERO Gemini, and ZERO Express imports.
 */

import { RelationshipLevel, RelationshipBoundaries } from '../types/index.js';

export const RELATIONSHIP_CONFIG = {
  /** Relationship Level Threshold Rules */
  LEVEL_THRESHOLDS: {
    stranger: { minTrust: 0, minTurns: 0, minMilestones: 0 },
    acquaintance: { minTrust: 20, minTurns: 5, minMilestones: 0 },
    companion: { minTrust: 40, minTurns: 20, minMilestones: 0 },
    close_friend: { minTrust: 65, minTurns: 50, minMilestones: 1 },
    confidant: { minTrust: 85, minTurns: 100, minMilestones: 3 },
  } as Record<RelationshipLevel, { minTrust: number; minTurns: number; minMilestones: number }>,

  /** Relationship Weight Factor W_rel bounds for Memory Engine */
  WEIGHT_BOUNDS: {
    MIN_W_REL: 0.8,
    MAX_W_REL: 1.3,
    DEFAULT_W_REL: 1.0,
  },

  /** Default Safety Boundaries (Strictly enforced) */
  DEFAULT_BOUNDARIES: {
    professional: true,
    romantic: false,
    medical: 'strict_disclaimer',
    financial: 'strict_disclaimer',
    mentalHealthEscalation: true,
  } as RelationshipBoundaries,

  /** Scoring Coefficients */
  HEALTH_WEIGHTS: {
    TRUST: 0.3,
    AFFINITY: 0.25,
    OPENNESS: 0.15,
    ENGAGEMENT: 0.15,
    CONSISTENCY: 0.15,
  },
} as const;
