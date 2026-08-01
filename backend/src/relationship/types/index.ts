/**
 * AURA Relationship & Personalization Engine — Domain Types & Interfaces
 * Pure domain contracts: Contains ZERO Prisma, ZERO SQLite, ZERO Gemini, and ZERO Express imports.
 */

import { EmotionalContext } from '../../emotion/types/index.js';

export type RelationshipLevel =
  | 'stranger'      // Tier 1: Initial interactions, formal boundaries (Trust 0-19)
  | 'acquaintance'  // Tier 2: Basic familiarity, polite warmth (Trust 20-39)
  | 'companion'     // Tier 3: Consistent rapport, comfortable engagement (Trust 40-64)
  | 'close_friend'  // Tier 4: High trust, humor, deep empathy (Trust 65-84)
  | 'confidant';    // Tier 5: Complete trust, intimate support, shared milestones (Trust 85-100)

export type RelationshipEventType =
  | 'deep_conversation'
  | 'goal_shared'
  | 'goal_completed'
  | 'gratitude'
  | 'vulnerability'
  | 'humor'
  | 'long_absence'
  | 'return_after_break'
  | 'milestone';

/** Immutable, append-only historical event log */
export interface RelationshipEvent {
  readonly id: string;
  readonly turnId: string;
  readonly type: RelationshipEventType;
  readonly impact: number; // -10 to +10
  readonly description: string;
  readonly timestamp: Date;
}

export interface UserCommunicationProfile {
  preferredFormality: 'formal' | 'balanced' | 'casual';
  preferredResponseLength: 'concise' | 'balanced' | 'detailed';
  preferredHumor: 'none' | 'subtle' | 'frequent';
  preferredExplanationStyle: 'direct' | 'guided' | 'analogy_based';
  preferredTechnicalDepth: 'simplified' | 'standard' | 'expert';
  preferredEmojiUsage: 'none' | 'minimal' | 'expressive';
  questioningPreference: 'low' | 'moderate' | 'high';
}

export interface RelationshipSignals {
  curiosity: number;    // 0 to 10
  gratitude: number;    // 0 to 10
  openness: number;     // 0 to 10
  engagement: number;   // 0 to 10
  humor: number;        // 0 to 10
  respect: number;      // 0 to 10
  dependence: number;   // 0 to 10
}

export interface RelationshipBoundaries {
  professional: boolean;
  romantic: boolean;
  medical: 'strict_disclaimer' | 'cautious' | 'open';
  financial: 'strict_disclaimer' | 'cautious' | 'open';
  mentalHealthEscalation: boolean;
}

export type MilestoneCategory =
  | 'conversation'
  | 'relationship'
  | 'memory'
  | 'emotion'
  | 'goal'
  | 'achievement';

export interface MilestoneRecord {
  readonly id: string;
  readonly category: MilestoneCategory;
  readonly name: string;
  readonly description: string;
  readonly achievedAt: Date;
}

export interface RelationshipHistoryItem {
  readonly turnId: string;
  readonly previousLevel: RelationshipLevel;
  readonly newLevel: RelationshipLevel;
  readonly trustDelta: number;
  readonly affinityDelta: number;
  readonly reason: string;
  readonly timestamp: Date;
}

export interface RelationshipMetrics {
  trustScore: number;         // 0 to 100
  affinityScore: number;      // 0 to 100
  relationshipHealth: number; // 0 to 100
  interactionDepth: number;   // 0 to 100
  totalTurnsCount: number;
}

/** Stateless, turn-transient directive (NEVER persisted to DB) */
export interface PersonalityDirective {
  summaryPrompt: string;      // e.g. "Speak warm & casual like a close friend. Use subtle humor."
  rules: string[];           // Concise array of actionable instruction strings
  safetyNotice: string;
}

/** Persistent domain state */
export interface RelationshipState {
  readonly version: 1;
  readonly userId: string;
  level: RelationshipLevel;
  metrics: RelationshipMetrics;
  signals: RelationshipSignals;
  communicationProfile: UserCommunicationProfile;
  boundaries: RelationshipBoundaries;
  milestones: MilestoneRecord[];
  events: RelationshipEvent[];        // Append-only
  history: RelationshipHistoryItem[]; // Append-only
  lastInteractionAt: Date;
}

/** Immutable, frozen snapshot value object */
export interface RelationshipContext {
  readonly version: 1;
  readonly userId: string;
  readonly level: RelationshipLevel;
  readonly metrics: RelationshipMetrics;
  readonly signals: RelationshipSignals;
  readonly communicationProfile: UserCommunicationProfile;
  readonly boundaries: RelationshipBoundaries;
  readonly milestones: MilestoneRecord[];
  readonly relationshipWeight: number; // W_rel (0.8 - 1.3)
  readonly directive: PersonalityDirective; // Dynamic, turn-transient
  readonly timestamp: Date;
}

/** Input contract for analyzing a conversation turn */
export interface AnalyzeRelationshipInput {
  userId: string;
  userMessage: string;
  currentState?: RelationshipState;
  emotionalContext?: EmotionalContext;
  turnId?: string;
}

/** Output contract returned by RelationshipAnalyzer */
export interface AnalyzeRelationshipResult {
  updatedState: RelationshipState;
  context: RelationshipContext;
}

/** Abstract Repository Interface (Infrastructure agnostic) */
export interface IRelationshipRepository {
  load(userId: string): Promise<RelationshipState | null>;
  save(state: RelationshipState): Promise<void>;
}
