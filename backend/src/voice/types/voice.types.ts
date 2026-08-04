/**
 * AURA Voice Foundation Architecture — Domain Types & Contracts
 * Pure Domain Model: Zero external framework dependencies.
 */

import { EventEmitter } from 'events';

/**
 * 6. Voice State Machine States
 * IDLE -> LISTENING -> TRANSCRIBING -> THINKING -> SPEAKING -> COMPLETED (or ERROR)
 */
export enum VoiceState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  TRANSCRIBING = 'TRANSCRIBING',
  THINKING = 'THINKING',
  SPEAKING = 'SPEAKING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

/**
 * Allowed Voice State Transitions (Strict Control Flow)
 */
export const VALID_VOICE_TRANSITIONS: Record<VoiceState, VoiceState[]> = {
  [VoiceState.IDLE]: [VoiceState.LISTENING, [VoiceState.ERROR] as any].flat(),
  [VoiceState.LISTENING]: [VoiceState.TRANSCRIBING, VoiceState.IDLE, VoiceState.ERROR],
  [VoiceState.TRANSCRIBING]: [VoiceState.THINKING, VoiceState.IDLE, VoiceState.ERROR],
  [VoiceState.THINKING]: [VoiceState.SPEAKING, VoiceState.IDLE, VoiceState.ERROR],
  [VoiceState.SPEAKING]: [VoiceState.COMPLETED, VoiceState.LISTENING, VoiceState.IDLE, VoiceState.ERROR],
  [VoiceState.COMPLETED]: [VoiceState.IDLE, VoiceState.LISTENING, VoiceState.ERROR],
  [VoiceState.ERROR]: [VoiceState.IDLE],
};

/**
 * Voice Audio Format Details
 */
export interface VoiceAudioConfig {
  sampleRate: number;
  channels: number;
  encoding: 'pcm16' | 'opus' | 'flac' | 'wav' | 'aac';
  language: string;
}

/**
 * Voice Configuration System
 */
export interface VoiceConfig {
  sttProvider: string;
  ttsProvider: string;
  language: string;
  sampleRate: number;
  streaming: boolean;
  voiceTimeoutMs: number;
  voiceId?: string;
  voiceName?: string;
  speechRate?: number;
  pitch?: number;
  volume?: number;
  audioFormat?: string;
  interimResults?: boolean;
  autoPunctuation?: boolean;
  confidenceThreshold?: number;
  audioConfig?: VoiceAudioConfig;
}

/**
 * Default Voice Configuration
 */
export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  sttProvider: 'google-stt',
  ttsProvider: 'google-tts',
  language: 'en-US',
  sampleRate: 16000,
  streaming: true,
  voiceTimeoutMs: 15000,
  voiceId: 'shizuka-default',
  voiceName: 'en-US-Journey-F',
  speechRate: 1.0,
  pitch: 0.0,
  volume: 1.0,
  audioFormat: 'mp3',
  interimResults: true,
  autoPunctuation: true,
  confidenceThreshold: 0.7,
  audioConfig: {
    sampleRate: 16000,
    channels: 1,
    encoding: 'pcm16',
    language: 'en-US',
  },
};

/**
 * Speech Recognition Result
 */
export interface STTResult {
  text: string;
  isFinal: boolean;
  confidence: number;
  language?: string;
  durationMs?: number;
  /** Raw acoustic / vocal feature hooks for future MultimodalEmotionFusionEngine */
  audioFeatures?: {
    pitchMean?: number;
    intensityMean?: number;
    speakingRate?: number;
    spectralTilt?: number;
  };
}

/**
 * Speech Synthesis Result
 */
export interface TTSResult {
  audioChunk?: Uint8Array;
  audioUrl?: string;
  durationMs: number;
  sampleRate: number;
  isFinal: boolean;
}

/**
 * Voice Stream Contracts
 */
export interface IVoiceInputStream {
  id: string;
  pushChunk(chunk: Uint8Array): void;
  finish(): void;
  onData(handler: (chunk: Uint8Array) => void): void;
  onEnd(handler: () => void): void;
  onError(handler: (err: Error) => void): void;
  close(): void;
}

export interface IVoiceOutputStream {
  id: string;
  writeChunk(chunk: Uint8Array): Promise<void>;
  finish(): Promise<void>;
  onData(handler: (chunk: Uint8Array) => void): void;
  onEnd(handler: () => void): void;
  onError(handler: (err: Error) => void): void;
  close(): void;
}

/**
 * Provider-Agnostic SpeechToText Interface
 */
export interface ISpeechToTextProvider {
  readonly providerId: string;
  readonly name: string;
  initialize(config: VoiceConfig): Promise<void>;
  transcribe(audio: Uint8Array, config?: Partial<VoiceConfig>): Promise<STTResult>;
  createStream(config?: Partial<VoiceConfig>): Promise<{
    inputStream: IVoiceInputStream;
    onTranscription: (handler: (result: STTResult) => void) => void;
  }>;
  checkHealth(): Promise<boolean>;
}

/**
 * Provider-Agnostic TextToSpeech Interface
 */
export interface ITextToSpeechProvider {
  readonly providerId: string;
  readonly name: string;
  initialize(config: VoiceConfig): Promise<void>;
  synthesize(text: string, config?: Partial<VoiceConfig>): Promise<TTSResult>;
  createStream(textStream: AsyncIterable<string>, config?: Partial<VoiceConfig>): Promise<IVoiceOutputStream>;
  checkHealth(): Promise<boolean>;
}

/**
 * Voice Session State & Metrics
 */
export type VoiceSessionStatus = 'active' | 'paused' | 'stopped' | 'error';

export interface VoiceSessionInfo {
  sessionId: string;
  conversationSessionId?: string;
  status: VoiceSessionStatus;
  voiceState: VoiceState;
  activeMicrophoneId?: string;
  activeSpeakerId?: string;
  startedAt: Date;
  lastActiveAt: Date;
  metrics: {
    inputAudioDurationMs: number;
    outputAudioDurationMs: number;
    turnsCount: number;
    interruptionsCount: number;
  };
}

/**
 * 8. Emotion Integration Extension Point
 * Extension point for MultimodalEmotionFusionEngine (Future Phase)
 */
export interface IVoiceEmotionFeatureExtractor {
  extractFeatures(audioChunk: Uint8Array): {
    pitch?: number;
    energy?: number;
    tempo?: number;
    valenceHint?: 'positive' | 'negative' | 'neutral';
  };
}

/**
 * 9. Capability Integration Extension Point
 * Preparation for Capability Runtime Voice Permission Checks
 */
export interface IVoiceCapabilityChecker {
  hasMicrophonePermission(userId?: string): Promise<boolean>;
  hasSpeakerPermission(userId?: string): Promise<boolean>;
}
