/**
 * AURA Relationship & Personalization Engine — Context Builder
 * Assembles immutable version 1 RelationshipContext snapshots.
 * Pure constructor logic: Performs ZERO calculations, ZERO mutations, and ZERO side effects.
 */

import {
  RelationshipContext,
  RelationshipState,
  PersonalityDirective,
} from '../types/index.js';

export class RelationshipContextBuilder {
  /**
   * Constructs an immutable version 1 RelationshipContext payload.
   * @param state Active updated RelationshipState
   * @param relationshipWeight Calculated W_rel weight factor
   * @param directive Dynamically generated transient PersonalityDirective
   */
  public buildContext(
    state: RelationshipState,
    relationshipWeight: number,
    directive: PersonalityDirective
  ): RelationshipContext {
    return Object.freeze({
      version: 1,
      userId: state.userId,
      level: state.level,
      metrics: { ...state.metrics },
      signals: { ...state.signals },
      communicationProfile: { ...state.communicationProfile },
      boundaries: { ...state.boundaries },
      milestones: [...state.milestones],
      relationshipWeight,
      directive: { ...directive },
      timestamp: new Date(),
    });
  }
}

/** Singleton export for RelationshipContextBuilder */
export const relationshipContextBuilder = new RelationshipContextBuilder();
