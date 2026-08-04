/**
 * AURA Cognitive Intelligence Engine — Pure Domain Contracts & Types
 * Single source of truth for Cognitive States, Intent Categories, Goals, Context Strategy,
 * Response Strategy, Working Workspace, Learning Decisions, and CognitivePlan objects.
 */

export type CognitiveState =
  | 'IDLE'
  | 'OBSERVING'
  | 'UNDERSTANDING'
  | 'PLANNING'
  | 'COMPLETED';

export enum IntentCategory {
  QUESTION = 'QUESTION',
  COMMAND = 'COMMAND',
  CONVERSATION = 'CONVERSATION',
  FOLLOW_UP = 'FOLLOW_UP',
  GREETING = 'GREETING',
  INFO_REQUEST = 'INFO_REQUEST',
  TASK_REQUEST = 'TASK_REQUEST',
  CREATIVE = 'CREATIVE',
  CODING = 'CODING',
  EMOTIONAL_SUPPORT = 'EMOTIONAL_SUPPORT',
  PLANNING_REQUEST = 'PLANNING_REQUEST',
  RESEARCH_REQUEST = 'RESEARCH_REQUEST',
  UNKNOWN = 'UNKNOWN',
}

export enum TaskType {
  QUESTION = 'QUESTION',
  INSTRUCTION = 'INSTRUCTION',
  PROBLEM_SOLVING = 'PROBLEM_SOLVING',
  PLANNING = 'PLANNING',
  LEARNING = 'LEARNING',
  CODING = 'CODING',
  RESEARCH = 'RESEARCH',
  DECISION_MAKING = 'DECISION_MAKING',
  CREATIVE_THINKING = 'CREATIVE_THINKING',
  TROUBLESHOOTING = 'TROUBLESHOOTING',
  EMOTIONAL_CONVERSATION = 'EMOTIONAL_CONVERSATION',
  GENERAL_DISCUSSION = 'GENERAL_DISCUSSION',
}

export enum ContextPriorityLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  IGNORE = 'IGNORE',
}

export enum ResponseMode {
  TECHNICAL = 'TECHNICAL',
  EDUCATIONAL = 'EDUCATIONAL',
  PROFESSIONAL = 'PROFESSIONAL',
  FRIENDLY = 'FRIENDLY',
  EMPATHETIC = 'EMPATHETIC',
  MOTIVATIONAL = 'MOTIVATIONAL',
  CREATIVE = 'CREATIVE',
  ANALYTICAL = 'ANALYTICAL',
  CONCISE = 'CONCISE',
  DETAILED = 'DETAILED',
  STEP_BY_STEP = 'STEP_BY_STEP',
  TUTOR_MODE = 'TUTOR_MODE',
  ARCHITECT_MODE = 'ARCHITECT_MODE',
  CODE_REVIEW_MODE = 'CODE_REVIEW_MODE',
  RESEARCH_MODE = 'RESEARCH_MODE',
}

export interface IntentAnalysisResult {
  primaryIntent: IntentCategory;
  confidence: number; // 0.0 to 1.0
  allIntents: Array<{ intent: IntentCategory; confidence: number }>;
  conversationType: 'casual' | 'task' | 'emotional' | 'technical' | 'informational';
  isFollowUp: boolean;
}

export interface GoalInference {
  immediateGoal: string;
  sessionGoal: string;
  longTermGoal?: string;
}

export interface SubsystemPlan {
  requiresMemory: boolean;
  requiresEmotion: boolean;
  requiresRelationship: boolean;
  requiresCapability: boolean;
  requiresLearning: boolean;
  requiresLongTermUpdate: boolean;
  requiresFileAnalysis: boolean;
  requiresVision: boolean;
  requiresVoice: boolean;
  requiresExternalTool: boolean;
}

export interface WorkingCognitiveContext {
  activeAssumptions: string[];
  openQuestions: string[];
  intermediateReasoning: string[];
  temporaryFacts: string[];
  selectedEvidence: string[];
  planningNotes: string[];
}

export interface ContextPrioritization {
  memory: ContextPriorityLevel;
  emotion: ContextPriorityLevel;
  relationship: ContextPriorityLevel;
  profile: ContextPriorityLevel;
  history: ContextPriorityLevel;
  capabilities: ContextPriorityLevel;
  files: ContextPriorityLevel;
}

export interface DynamicTokenBudget {
  memoryTokens: number;
  emotionTokens: number;
  relationshipTokens: number;
  historyTokens: number;
  capabilityTokens: number;
  systemTokens: number;
  totalAllocatedTokens: number;
}

export interface ResponseStrategy {
  mode: ResponseMode;
  depth: 'concise' | 'standard' | 'deep_dive';
  tone: 'professional' | 'warm' | 'empathetic' | 'direct' | 'encouraging';
  explanation: string;
}

export interface ClarificationPlan {
  requiresClarification: boolean;
  clarificationReason?: string;
  suggestedQuestions?: string[];
  missingDetails?: string[];
}

export interface LearningPlan {
  shouldStoreMemory: boolean;
  memoryCandidate?: string;
  importanceScore: number; // 0.0 to 1.0
  isDuplicateMemory: boolean;

  shouldUpdatePreferences: boolean;
  preferenceUpdates: Array<{ key: string; value: string }>;

  shouldUpdateHabits: boolean;
  habitUpdates: string[];

  shouldUpdateGoals: boolean;
  goalUpdates: string[];

  shouldUpdateRelationship: boolean;
  relationshipUpdates: { trustIncrement: number; closenessIncrement: number };

  learningExplanation: string;
}

export interface CognitivePlanSuggestions {
  suggestedProvider: 'gemini' | 'openai' | 'auto';
  suggestedResponseStyle: string;
  priority: 'low' | 'normal' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
}

export interface CognitivePlanMetadata {
  timestamp: Date;
  durationMs: number;
  decisionSource: 'rule_heuristics' | 'ml_classifier' | 'hybrid';
  triggeredRules: string[];
  version: string;
}

/** Master Enriched Immutable CognitivePlan (Phase 5.7d) */
export interface CognitivePlan {
  readonly planId: string;
  readonly createdAt: Date;
  readonly userMessage: string;
  readonly sessionId: string;

  // Intent & Task Understanding
  readonly intent: IntentAnalysisResult;
  readonly taskType: TaskType;

  // Goal Reasoning
  readonly goals: GoalInference;

  // Reasoning Confidence & Path
  readonly reasoningConfidence: number;
  readonly isLowConfidence: boolean;
  readonly reasoningPath: string[];

  // Working Context Workspace
  readonly workingContext: WorkingCognitiveContext;

  // Context Strategy & Token Budgeting
  readonly contextPriorities: ContextPrioritization;
  readonly dynamicBudget: DynamicTokenBudget;
  readonly discardedContext: string[];

  // Response & Clarification Intelligence
  readonly responseStrategy: ResponseStrategy;
  readonly clarificationPlan: ClarificationPlan;

  // Learning & Memory Evolution Plan
  readonly learningPlan: LearningPlan;

  // Subsystem Execution Plan
  readonly subsystemPlan: SubsystemPlan;

  // Backward Compatible Legacy Flags
  readonly requiresMemory: boolean;
  readonly requiresEmotion: boolean;
  readonly requiresRelationship: boolean;
  readonly requiresCapability: boolean;
  readonly requiresLearningUpdate: boolean;

  // Posture Suggestions & Metadata
  readonly suggestions: CognitivePlanSuggestions;
  readonly metadata: CognitivePlanMetadata;
  readonly version: string;
}

export interface CognitiveEngineInput {
  userMessage: string;
  sessionId?: string;
  history?: Array<{ sender: string; text: string }>;
}
