/**
 * AURA Emotional Intelligence Engine — Vision Emotion Detector
 * Phase 5: Deterministic facial expression heuristic emotion classifier for vision inputs.
 *
 * Design:
 *  - Implements IModalDetector<VisionFeatures>.
 *  - Zero external dependencies: no OpenCV, no MediaPipe, no database, no Gemini API.
 *  - Deterministic: identical VisionFeatures inputs always produce identical EmotionResult outputs.
 *  - Production-structured stub: the heuristic rules are grounded in Facial Action Coding System
 *    (FACS) research. A real production implementation replaces the heuristics with a
 *    CNN/facial landmark model without changing this class's public API.
 *
 * FACS-grounded Heuristic Logic:
 *  Rules evaluate normalized landmark scores (smileScore, browTension, eyeOpenness,
 *  mouthOpenness, headTilt) to map facial expression patterns → EmotionCategory.
 *  Multiple rules may fire; full EmotionScore distribution is returned for fusion weighting.
 *
 * Completely decoupled from database, Gemini API, Express, and React.
 */

import { IModalDetector } from '../modal.detector.js';
import { VisionFeatures } from './vision.features.js';
import { EmotionCategory, EmotionResult, EmotionScore, DetectorSource } from '../../types/index.js';

/**
 * FACS-grounded expression rule: maps visual feature thresholds to candidate emotion + confidence.
 */
interface ExpressionRule {
  readonly emotion: EmotionCategory;
  readonly baseConfidence: number;
  readonly baseIntensity: number;
  readonly matches: (features: VisionFeatures) => boolean;
}

/**
 * FACS-grounded expression rule set.
 * Rules reference Action Units (AU) conceptually — actual AUs extracted upstream.
 * Multiple rules can match simultaneously (multi-emotion distribution).
 */
const EXPRESSION_RULES: ExpressionRule[] = [
  // Happiness: high smile score, relaxed brow, open eyes (AU6 + AU12)
  {
    emotion: 'happy',
    baseConfidence: 0.85,
    baseIntensity: 7,
    matches: (f) => f.smileScore > 0.65 && f.browTension < 0.3 && f.eyeOpenness > 0.5,
  },
  // Excitement: high smile + wide eyes + open mouth (AU5 + AU12 + AU26/27)
  {
    emotion: 'excited',
    baseConfidence: 0.80,
    baseIntensity: 9,
    matches: (f) => f.smileScore > 0.60 && f.eyeOpenness > 0.75 && f.mouthOpenness > 0.4,
  },
  // Anger: high brow tension, narrowed eyes, no smile, closed mouth (AU4 + AU5 + AU23)
  {
    emotion: 'angry',
    baseConfidence: 0.82,
    baseIntensity: 9,
    matches: (f) => f.browTension > 0.65 && f.eyeOpenness < 0.4 && f.smileScore < 0.2,
  },
  // Sadness: low smile, high brow tension (inner brow raise), low eye openness (AU1 + AU4 + AU15)
  {
    emotion: 'sad',
    baseConfidence: 0.78,
    baseIntensity: 8,
    matches: (f) => f.smileScore < 0.2 && f.browTension > 0.4 && f.eyeOpenness < 0.45,
  },
  // Surprise: wide eyes, open mouth, low brow tension (AU1 + AU2 + AU5 + AU26)
  {
    emotion: 'surprised',
    baseConfidence: 0.83,
    baseIntensity: 8,
    matches: (f) => f.eyeOpenness > 0.80 && f.mouthOpenness > 0.50 && f.browTension < 0.25,
  },
  // Fear / Worried: raised inner brow tension, wide eyes, open mouth — combination (AU1+4+5+20+26)
  {
    emotion: 'worried',
    baseConfidence: 0.72,
    baseIntensity: 7,
    matches: (f) => f.browTension > 0.45 && f.eyeOpenness > 0.60 && f.smileScore < 0.25 && f.mouthOpenness > 0.2,
  },
  // Disgust / Frustrated: high brow tension, narrowed eyes, slight mouth tension
  {
    emotion: 'frustrated',
    baseConfidence: 0.68,
    baseIntensity: 7,
    matches: (f) => f.browTension > 0.55 && f.eyeOpenness < 0.5 && f.smileScore < 0.15,
  },
  // Calm / Neutral: low brow tension, medium eye openness, minimal expression
  {
    emotion: 'calm',
    baseConfidence: 0.65,
    baseIntensity: 5,
    matches: (f) => f.browTension < 0.2 && f.eyeOpenness >= 0.4 && f.eyeOpenness <= 0.70 && f.smileScore < 0.4,
  },
  // Curious: slight head tilt, moderate eye openness, relaxed brow
  {
    emotion: 'curious',
    baseConfidence: 0.62,
    baseIntensity: 6,
    matches: (f) => Math.abs(f.headTilt) > 10 && f.eyeOpenness > 0.5 && f.browTension < 0.35,
  },
  // Thinking / Concentration: mild brow tension (furrowed slightly), low smile, moderate eye openness
  {
    emotion: 'thinking',
    baseConfidence: 0.60,
    baseIntensity: 5,
    matches: (f) => f.browTension >= 0.25 && f.browTension <= 0.55 && f.smileScore < 0.3 && f.eyeOpenness >= 0.35 && f.eyeOpenness <= 0.65,
  },
  // Confused: asymmetric indicators — moderate brow tension + moderate head tilt
  {
    emotion: 'confused',
    baseConfidence: 0.58,
    baseIntensity: 6,
    matches: (f) => f.browTension >= 0.30 && f.browTension <= 0.60 && Math.abs(f.headTilt) > 8 && f.smileScore < 0.25,
  },
];

const DETECTOR_SOURCE: DetectorSource = 'vision';
const DEFAULT_NEUTRAL_CONFIDENCE = 0.55;

export class VisionEmotionDetector implements IModalDetector<VisionFeatures> {
  public readonly modality: DetectorSource = DETECTOR_SOURCE;

  /**
   * Analyzes facial expression features and returns a structured EmotionResult.
   * Deterministic: identical inputs always produce identical outputs.
   * @param features VisionFeatures value object from upstream vision analysis
   */
  public detect(features: VisionFeatures): EmotionResult {
    const startTime = Date.now();

    // Guard: validate that features object is present
    if (!features) {
      return this.buildNeutralResult(Date.now() - startTime, 'No vision features provided');
    }

    // Evaluate all expression rules against provided features
    const matchedScores: EmotionScore[] = [];

    for (const rule of EXPRESSION_RULES) {
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
        'No facial expression patterns matched; defaulting to neutral baseline'
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
      reasoning: `Detected facial emotions [${detectedList}] via vision heuristic rules (smile=${features.smileScore}, browTension=${features.browTension}, eyeOpen=${features.eyeOpenness})`,
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

/** Singleton export for VisionEmotionDetector */
export const visionEmotionDetector = new VisionEmotionDetector();
