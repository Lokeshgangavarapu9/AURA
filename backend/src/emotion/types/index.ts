/**
 * AURA Emotional Intelligence Engine — Pure Domain Types & Contracts
 * Single Source of Truth for all emotion-related types and versioned schemas.
 * Contains ZERO runtime code, ZERO database dependencies, and ZERO external framework imports.
 */

/** Primary emotion taxonomy supported by the engine */
export type EmotionCategory =
  | 'neutral'
  | 'happy'
  | 'excited'
  | 'curious'
  | 'thinking'
  | 'confident'
  | 'calm'
  | 'empathetic'
  | 'surprised'
  | 'confused'
  | 'worried'
  | 'sad'
  | 'frustrated'
  | 'angry';

/** Origin classification for detection algorithms and sensors */
export type DetectorSource = 'rule-based' | 'gemini' | 'voice' | 'vision' | 'fusion';

/** Metadata produced by emotion detection algorithms */
export interface DetectorMetadata {
  source: DetectorSource;
  confidence: number; // 0.0 to 1.0
  processingTimeMs: number;
}

/** Score representation for an individual emotion within a distribution */
export interface EmotionScore {
  emotion: EmotionCategory;
  confidence: number; // 0.0 to 1.0
  intensity: number; // Scale 1 to 10
}

/** Detailed detection result produced per input text/media turn */
export interface EmotionResult {
  primaryEmotion: EmotionCategory;
  emotions: EmotionScore[];
  reasoning: string;
  detector: DetectorMetadata;
  timestamp: Date;
}

/** AI companion internal emotional stance */
export type AIEmotionCategory =
  | 'empathetic'
  | 'happy'
  | 'thinking'
  | 'calm'
  | 'surprised'
  | 'soothing';

/** Independent response delivery style driving PromptBuilder, Voice & Avatar */
export type ResponseStyle =
  | 'gentle'
  | 'supportive'
  | 'playful'
  | 'focused'
  | 'reassuring'
  | 'celebratory'
  | 'patient'
  | 'direct';

/** Combined AI emotional stance and delivery style */
export interface AIResponseTone {
  aiEmotion: AIEmotionCategory;
  responseStyle: ResponseStyle;
}

/** Short-term emotional state tracking across recent conversation turns */
export interface ShortTermEmotionalState {
  currentMood: EmotionCategory;
  previousMood: EmotionCategory | null;
  stressLevel: number; // Scale 1 to 10
  confidenceLevel: number; // Scale 1 to 10
  engagementLevel: number; // Scale 1 to 10
  frustrationLevel: number; // Scale 1 to 10
  moodTrend: 'improving' | 'declining' | 'stable' | 'fluctuating';
  moodDurationTurns: number;
  lastUpdated: Date;
}

/** Version 1 unified EmotionalContext payload passed across core engines */
export interface EmotionalContext {
  version: 1;
  primaryEmotion: EmotionCategory;
  detectedEmotions: EmotionScore[];
  aiTone: AIResponseTone;
  shortTermState: ShortTermEmotionalState;
  detectorMetadata: DetectorMetadata;
  timestamp: Date;
}
