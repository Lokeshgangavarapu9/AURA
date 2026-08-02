/**
 * AURA Emotional Intelligence Engine — Voice Emotion Detector
 * Phase 5: Deterministic acoustic heuristic emotion classifier for voice inputs.
 *
 * Design:
 *  - Implements IModalDetector<VoiceFeatures>.
 *  - Zero external dependencies: no WebRTC, no ML library, no database, no Gemini API.
 *  - Deterministic: identical VoiceFeatures inputs always produce identical EmotionResult outputs.
 *  - Production-structured stub: the heuristic rules are grounded in psychoacoustic research.
 *    A real production implementation replaces the heuristics with an acoustic ML model
 *    without changing this class's public API or any downstream code.
 *
 * Acoustic Heuristic Logic:
 *  Each rule set maps feature ranges → EmotionCategory with a base confidence score.
 *  Multiple rules may fire per input; the highest-confidence result wins as primaryEmotion.
 *  The full EmotionScore distribution is included for fusion weighting downstream.
 *
 * Completely decoupled from database, Gemini API, Express, and React.
 */

import { IModalDetector } from '../modal.detector.js';
import { VoiceFeatures } from './voice.features.js';
import { EmotionCategory, EmotionResult, EmotionScore, DetectorSource } from '../../types/index.js';

/**
 * Acoustic heuristic rule: maps a feature evaluation to a candidate emotion + base confidence.
 */
interface AcousticRule {
  readonly emotion: EmotionCategory;
  readonly baseConfidence: number;
  readonly baseIntensity: number;
  readonly matches: (features: VoiceFeatures) => boolean;
}

/**
 * Deterministic acoustic rule set grounded in psychoacoustic research.
 * Rules are ordered from most specific to most general.
 * Multiple rules can match simultaneously (multi-emotion distribution).
 */
const ACOUSTIC_RULES: AcousticRule[] = [
  // Excitement / High arousal: high pitch, high energy, fast rate
  {
    emotion: 'excited',
    baseConfidence: 0.82,
    baseIntensity: 9,
    matches: (f) => f.pitchHz > 200 && f.energyDb > -20 && f.speechRateWpm > 180,
  },
  // Anger: high energy, high tension indicators (high pitch + fast rate + low pause)
  {
    emotion: 'angry',
    baseConfidence: 0.80,
    baseIntensity: 9,
    matches: (f) => f.energyDb > -15 && f.pitchHz > 190 && f.jitter > 0.4 && f.pauseRatio < 0.2,
  },
  // Happiness: moderately high pitch, medium-high energy, normal/fast rate, low jitter
  {
    emotion: 'happy',
    baseConfidence: 0.75,
    baseIntensity: 7,
    matches: (f) => f.pitchHz > 160 && f.energyDb > -30 && f.speechRateWpm >= 130 && f.jitter < 0.3,
  },
  // Sadness: low pitch, low energy, slow rate, high jitter, high shimmer
  {
    emotion: 'sad',
    baseConfidence: 0.78,
    baseIntensity: 8,
    matches: (f) => f.pitchHz < 110 && f.energyDb < -35 && f.speechRateWpm < 110 && f.jitter > 0.35,
  },
  // Worried / Anxious: high jitter, moderate pitch elevation, moderate rate
  {
    emotion: 'worried',
    baseConfidence: 0.72,
    baseIntensity: 7,
    matches: (f) => f.jitter > 0.45 && f.shimmer > 0.4 && f.pitchHz > 140 && f.pauseRatio > 0.25,
  },
  // Frustrated: high shimmer, moderate-high pitch, elevated energy, low pause
  {
    emotion: 'frustrated',
    baseConfidence: 0.70,
    baseIntensity: 7,
    matches: (f) => f.shimmer > 0.5 && f.energyDb > -25 && f.pitchHz > 150 && f.pauseRatio < 0.15,
  },
  // Calm: stable pitch (low jitter/shimmer), low-moderate energy, moderate rate, low pause
  {
    emotion: 'calm',
    baseConfidence: 0.73,
    baseIntensity: 5,
    matches: (f) => f.jitter < 0.15 && f.shimmer < 0.15 && f.pitchHz >= 90 && f.pitchHz <= 160 && f.energyDb >= -40 && f.energyDb <= -25,
  },
  // Thinking / Deliberate: slow rate, high pause ratio, moderate stable pitch
  {
    emotion: 'thinking',
    baseConfidence: 0.65,
    baseIntensity: 5,
    matches: (f) => f.speechRateWpm < 120 && f.pauseRatio > 0.35 && f.jitter < 0.25,
  },
  // Surprised: sudden pitch spike, high energy, short burst (low pause ratio, high shimmer)
  {
    emotion: 'surprised',
    baseConfidence: 0.68,
    baseIntensity: 8,
    matches: (f) => f.pitchHz > 220 && f.shimmer > 0.45 && f.pauseRatio < 0.1,
  },
  // Confused: moderate jitter, slow rate, high pause (hesitation patterns)
  {
    emotion: 'confused',
    baseConfidence: 0.60,
    baseIntensity: 6,
    matches: (f) => f.speechRateWpm < 130 && f.pauseRatio > 0.30 && f.jitter > 0.20 && f.jitter <= 0.40,
  },
  // Curious: slightly elevated pitch, moderate-fast rate, moderate energy
  {
    emotion: 'curious',
    baseConfidence: 0.58,
    baseIntensity: 6,
    matches: (f) => f.pitchHz >= 150 && f.pitchHz <= 195 && f.speechRateWpm >= 140 && f.energyDb >= -35 && f.energyDb <= -20,
  },
];

const DETECTOR_SOURCE: DetectorSource = 'voice';
const DEFAULT_NEUTRAL_CONFIDENCE = 0.55;

export class VoiceEmotionDetector implements IModalDetector<VoiceFeatures> {
  public readonly modality: DetectorSource = DETECTOR_SOURCE;

  /**
   * Analyzes acoustic features and returns a structured EmotionResult.
   * Deterministic: identical inputs always produce identical outputs.
   * @param features VoiceFeatures value object from upstream audio analysis
   */
  public detect(features: VoiceFeatures): EmotionResult {
    const startTime = Date.now();

    // Guard: validate that features object is present
    if (!features) {
      return this.buildNeutralResult(Date.now() - startTime, 'No voice features provided');
    }

    // Evaluate all acoustic rules against provided features
    const matchedScores: EmotionScore[] = [];

    for (const rule of ACOUSTIC_RULES) {
      if (rule.matches(features)) {
        matchedScores.push({
          emotion: rule.emotion,
          confidence: rule.baseConfidence,
          intensity: rule.baseIntensity,
        });
      }
    }

    // No rules matched — fall back to neutral
    if (matchedScores.length === 0) {
      return this.buildNeutralResult(
        Date.now() - startTime,
        'No acoustic rule patterns matched; defaulting to neutral baseline'
      );
    }

    // Sort by confidence descending
    matchedScores.sort((a, b) => b.confidence - a.confidence);

    // Normalize confidences across matched emotions (proportional distribution)
    const totalConfidence = matchedScores.reduce((sum, s) => sum + s.confidence, 0);
    const normalizedScores: EmotionScore[] = matchedScores.map((s) => ({
      emotion: s.emotion,
      confidence: Math.round((s.confidence / totalConfidence) * 100) / 100,
      intensity: s.intensity,
    }));

    // Re-sort after normalization
    normalizedScores.sort((a, b) => b.confidence - a.confidence);

    const primaryEmotion = normalizedScores[0].emotion;
    const primaryConfidence = normalizedScores[0].confidence;
    const processingTimeMs = Date.now() - startTime;
    const detectedList = normalizedScores.map((s) => s.emotion).join(', ');

    return {
      primaryEmotion,
      emotions: normalizedScores,
      reasoning: `Detected acoustic emotions [${detectedList}] via voice heuristic rules (pitch=${features.pitchHz}Hz, energy=${features.energyDb}dB, rate=${features.speechRateWpm}wpm)`,
      detector: {
        source: DETECTOR_SOURCE,
        confidence: Math.min(0.95, Math.round(primaryConfidence * 100) / 100),
        processingTimeMs,
      },
      timestamp: new Date(),
    };
  }

  /** Constructs a neutral EmotionResult for edge cases */
  private buildNeutralResult(processingTimeMs: number, reasoning: string): EmotionResult {
    return {
      primaryEmotion: 'neutral',
      emotions: [{ emotion: 'neutral', confidence: DEFAULT_NEUTRAL_CONFIDENCE, intensity: 4 }],
      reasoning,
      detector: {
        source: DETECTOR_SOURCE,
        confidence: DEFAULT_NEUTRAL_CONFIDENCE,
        processingTimeMs,
      },
      timestamp: new Date(),
    };
  }
}

/** Singleton export for VoiceEmotionDetector */
export const voiceEmotionDetector = new VoiceEmotionDetector();
