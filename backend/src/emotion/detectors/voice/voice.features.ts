/**
 * AURA Emotional Intelligence Engine — VoiceFeatures Domain Value Object
 * Phase 5: Typed input contract for VoiceEmotionDetector.
 *
 * VoiceFeatures encapsulates the acoustic properties extracted from a speech segment.
 * These values would be provided by an upstream audio analysis layer (WebRTC, Web Audio API,
 * or a server-side audio processing pipeline). The domain layer remains completely decoupled
 * from the extraction implementation.
 *
 * All values use normalized, unitless scales or documented physical units to remain
 * framework and library agnostic.
 *
 * Contains ZERO runtime code — pure TypeScript type definitions only.
 */

/**
 * Acoustic feature payload extracted from a speech segment.
 * Each property represents a distinct acoustic characteristic that correlates
 * with specific emotional states in psychoacoustic research.
 */
export interface VoiceFeatures {
  /**
   * Fundamental frequency (F0) of the voice in Hz.
   * Typical human speech range: 80–255 Hz.
   * Higher pitch correlates with excitement, stress, or urgency.
   * Lower pitch correlates with sadness, calm, or boredom.
   */
  pitchHz: number;

  /**
   * Root Mean Square (RMS) energy level of the signal in decibels (dB).
   * Range: -60 dB (near-silence) to 0 dB (max amplitude).
   * High energy correlates with excitement, anger, or emphasis.
   * Low energy correlates with sadness, calm, or whispered speech.
   */
  energyDb: number;

  /**
   * Approximate words per minute speaking rate.
   * Typical conversational rate: 120–180 WPM.
   * High rate correlates with excitement or anxiety.
   * Low rate correlates with sadness, thinking, or deliberate speech.
   */
  speechRateWpm: number;

  /**
   * Pitch jitter — cycle-to-cycle variation in fundamental frequency.
   * Normalized scale: 0.0 (perfectly stable) to 1.0 (highly irregular).
   * High jitter correlates with emotional stress, sadness, or nervousness.
   */
  jitter: number;

  /**
   * Amplitude shimmer — cycle-to-cycle variation in signal amplitude.
   * Normalized scale: 0.0 (perfectly stable) to 1.0 (highly irregular).
   * High shimmer correlates with emotional arousal or nervousness.
   */
  shimmer: number;

  /**
   * Ratio of silence/pause duration to total segment duration.
   * Scale: 0.0 (continuous speech) to 1.0 (mostly silence).
   * High pause ratio correlates with thinking, sadness, or hesitation.
   */
  pauseRatio: number;
}
