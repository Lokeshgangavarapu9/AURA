/**
 * AURA Relationship & Personalization Engine — Master Relationship Analyzer Facade
 * The SINGLE public entry point orchestrating relationship evolution and personalization.
 * Domain-pure pipeline: Accepts current state + message, returns next state + immutable context.
 * Performs ZERO database operations, ZERO Prisma/SQLite calls, and ZERO Gemini API calls.
 */

import {
  AnalyzeRelationshipInput,
  AnalyzeRelationshipResult,
  RelationshipState,
} from '../types/index.js';
import { RELATIONSHIP_CONFIG } from '../config/relationship.config.js';
import { UserCommunicationProfileModel } from '../profile/profile.model.js';
import { trustEvaluator } from '../metrics/trust.evaluator.js';
import { affinityEvaluator } from '../metrics/affinity.evaluator.js';
import { signalEvaluator } from '../metrics/signal.evaluator.js';
import { healthEvaluator } from '../metrics/health.evaluator.js';
import { preferenceTracker } from '../profile/preference.tracker.js';
import { levelCalculator } from '../lifecycle/level.calculator.js';
import { eventTracker } from '../lifecycle/event.tracker.js';
import { milestoneTracker } from '../lifecycle/milestone.tracker.js';
import { historyTracker } from '../lifecycle/history.tracker.js';
import { relationshipWeightCalculator } from '../weight/weight.calculator.js';
import { personalityAdapter } from '../adapter/personality.adapter.js';
import { relationshipContextBuilder } from '../context/context.builder.js';

export class RelationshipAnalyzer {
  /**
   * Orchestrates complete analysis pipeline for a single conversation turn.
   */
  public analyze(input: AnalyzeRelationshipInput): AnalyzeRelationshipResult {
    const userId = input.userId || 'default-user';
    const turnId = input.turnId || `turn-${Date.now()}`;
    const currentState = input.currentState || this.createInitialState(userId);

    // 1. TrustEvaluator
    const trustResult = trustEvaluator.evaluateTrust(currentState.metrics.trustScore, input.userMessage, input.emotionalContext);

    // 2. AffinityEvaluator
    const affinityResult = affinityEvaluator.evaluateAffinity(currentState.metrics.affinityScore, input.userMessage, input.emotionalContext);

    // 3. SignalEvaluator
    const updatedSignals = signalEvaluator.evaluateSignals(currentState.signals, input.userMessage, input.emotionalContext);

    // 4. HealthEvaluator
    const newTurnsCount = currentState.metrics.totalTurnsCount + 1;
    const newHealth = healthEvaluator.evaluateHealth(trustResult.newTrustScore, affinityResult.newAffinityScore, updatedSignals, newTurnsCount);

    // 5. PreferenceTracker
    const updatedProfile = preferenceTracker.updateProfile(currentState.communicationProfile, input.userMessage, newTurnsCount);

    // 6. LevelCalculator
    const prevLevel = currentState.level;
    const currentMilestonesCount = currentState.milestones.length;
    const newLevel = levelCalculator.calculateLevel(trustResult.newTrustScore, newHealth, newTurnsCount, currentMilestonesCount);

    // 7. EventTracker (Append-only)
    const updatedEvents = eventTracker.evaluateEvents(
      currentState.events,
      input.userMessage,
      turnId,
      input.emotionalContext,
      currentState.lastInteractionAt
    );

    // 8. MilestoneTracker (Unique IDs, non-duplicate)
    const updatedMilestones = milestoneTracker.evaluateMilestones(
      currentState.milestones,
      trustResult.newTrustScore,
      newTurnsCount,
      updatedEvents
    );

    // 9. HistoryTracker (Meaningful transitions only)
    const healthDelta = newHealth - currentState.metrics.relationshipHealth;
    const updatedHistory = historyTracker.evaluateHistory(
      currentState.history,
      turnId,
      prevLevel,
      newLevel,
      trustResult.delta,
      affinityResult.delta,
      healthDelta
    );

    // Assemble updated state
    const updatedState: RelationshipState = {
      version: 1,
      userId,
      level: newLevel,
      metrics: {
        trustScore: trustResult.newTrustScore,
        affinityScore: affinityResult.newAffinityScore,
        relationshipHealth: newHealth,
        interactionDepth: Math.min(100, Math.round((updatedSignals.openness * 10) * 10) / 10),
        totalTurnsCount: newTurnsCount,
      },
      signals: updatedSignals,
      communicationProfile: updatedProfile,
      boundaries: { ...currentState.boundaries },
      milestones: updatedMilestones,
      events: updatedEvents,
      history: updatedHistory,
      lastInteractionAt: new Date(),
    };

    // 10. RelationshipWeightCalculator
    const relationshipWeight = relationshipWeightCalculator.calculateWeight(updatedState.metrics.trustScore, updatedState.metrics.relationshipHealth);

    // 11. PersonalityAdapter
    const directive = personalityAdapter.adaptPersonality(
      input.emotionalContext,
      updatedState.level,
      updatedState.communicationProfile,
      updatedState.boundaries,
      updatedState.metrics
    );

    // 12. RelationshipContextBuilder
    const context = relationshipContextBuilder.buildContext(updatedState, relationshipWeight, directive);

    return {
      updatedState,
      context,
    };
  }

  /**
   * Helper creating clean baseline initial RelationshipState
   */
  public createInitialState(userId: string = 'default-user'): RelationshipState {
    return {
      version: 1,
      userId,
      level: 'stranger',
      metrics: {
        trustScore: 10,
        affinityScore: 10,
        relationshipHealth: 15,
        interactionDepth: 20,
        totalTurnsCount: 0,
      },
      signals: {
        curiosity: 5,
        gratitude: 3,
        openness: 4,
        engagement: 5,
        humor: 2,
        respect: 6,
        dependence: 2,
      },
      communicationProfile: UserCommunicationProfileModel.createDefault(),
      boundaries: { ...RELATIONSHIP_CONFIG.DEFAULT_BOUNDARIES },
      milestones: [],
      events: [],
      history: [],
      lastInteractionAt: new Date(),
    };
  }
}

/** Singleton export for RelationshipAnalyzer */
export const relationshipAnalyzer = new RelationshipAnalyzer();
