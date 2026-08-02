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

// ─────────────────────────────────────────────────────────────────────────────
// Phase 5 Additions — Multimodal Emotion Types
// All types below are ADDITIVE. EmotionalContext (v1) above is unchanged.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Per-modality detection breakdown included in MultimodalEmotionContext.
 * Provides full provenance and traceability of each signal source.
 */
export interface ModalEmotionResult {
  /** Source modality tag identifying the detector that produced this result */
  source: DetectorSource;
  /** Primary emotion detected by this modality */
  primaryEmotion: EmotionCategory;
  /** Full emotion distribution from this modality */
  emotions: EmotionScore[];
  /** Detector confidence and processing metadata */
  detector: DetectorMetadata;
}

/**
 * Version 2 extended EmotionalContext — Phase 5 multimodal output.
 * Extends the standard v1 EmotionalContext with per-modality breakdown.
 *
 * Downstream consumers still receive EmotionalContext (v1) from existing
 * EmotionAnalyzer. MultimodalEmotionContext is opt-in via MultimodalEmotionAnalyzer
 * when richer provenance information is required (e.g. diagnostics, avatar rendering).
 */
export interface MultimodalEmotionContext extends EmotionalContext {
  version: 1; // preserves v1 compatibility — fusedResult is valid as EmotionalContext
  /** Per-modality breakdown of all signals that contributed to the fused result */
  modalResults: ModalEmotionResult[];
  /** Count of modalities that actively contributed to this turn's fusion */
  activeModalityCount: number;
}
