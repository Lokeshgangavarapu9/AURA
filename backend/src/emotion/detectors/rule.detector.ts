/**
 * AURA Emotional Intelligence Engine — Rule Based Emotion Detector Strategy
 * Sub-millisecond, zero-token deterministic emotion classifier using normalized word token matching.
 * Completely decoupled from database, Gemini API, and Express runtime.
 */

import { IEmotionDetector } from './emotion.detector.js';
import { EmotionCategory, EmotionResult, EmotionScore } from '../types/index.js';

/** Emotion Lexicon Dictionary mapping categories to normalized keyword sets */
const EMOTION_LEXICON: Record<EmotionCategory, { keywords: string[]; baseIntensity: number }> = {
  happy: {
    keywords: ['happy', 'joy', 'glad', 'delighted', 'cheerful', 'great', 'awesome', 'wonderful', 'blessed'],
    baseIntensity: 7,
  },
  excited: {
    keywords: ['excited', 'thrilled', 'pumped', 'ecstatic', 'hyped', 'amazing', 'fantastic', 'eager'],
    baseIntensity: 9,
  },
  curious: {
    keywords: ['curious', 'wonder', 'interested', 'fascinated', 'inquire', 'question', 'why', 'how'],
    baseIntensity: 6,
  },
  thinking: {
    keywords: ['thinking', 'considering', 'analyzing', 'pondering', 'wondering', 'reflecting', 'puzzling'],
    baseIntensity: 5,
  },
  confident: {
    keywords: ['confident', 'certain', 'sure', 'positive', 'determined', 'accomplished', 'strong'],
    baseIntensity: 8,
  },
  calm: {
    keywords: ['calm', 'relaxed', 'peaceful', 'serene', 'tranquil', 'soothed', 'quiet', 'chill'],
    baseIntensity: 5,
  },
  empathetic: {
    keywords: ['empathetic', 'understanding', 'caring', 'compassionate', 'sympathetic', 'kind'],
    baseIntensity: 7,
  },
  surprised: {
    keywords: ['surprised', 'shocked', 'astonished', 'amazed', 'unexpected', 'whoa', 'wow'],
    baseIntensity: 8,
  },
  confused: {
    keywords: ['confused', 'puzzled', 'baffled', 'unclear', 'unsure', 'lost', 'perplexed'],
    baseIntensity: 6,
  },
  worried: {
    keywords: ['worried', 'nervous', 'anxious', 'concerned', 'fearful', 'scared', 'apprehensive', 'stressed', 'overwhelmed'],
    baseIntensity: 7,
  },
  sad: {
    keywords: ['sad', 'unhappy', 'depressed', 'gloomy', 'heartbroken', 'sorrow', 'crying', 'lonely', 'grief'],
    baseIntensity: 8,
  },
  frustrated: {
    keywords: ['frustrated', 'annoyed', 'irritated', 'stuck', 'exasperated', 'bothered', 'upset'],
    baseIntensity: 7,
  },
  angry: {
    keywords: ['angry', 'furious', 'mad', 'enraged', 'outraged', 'hostile', 'hate'],
    baseIntensity: 9,
  },
  neutral: {
    keywords: ['okay', 'fine', 'normal', 'hello', 'hi', 'hey', 'thanks', 'yes', 'no'],
    baseIntensity: 4,
  },
};

export class RuleBasedEmotionDetector implements IEmotionDetector {
  /**
   * Performs sub-millisecond, zero-token text emotion detection.
   * Deterministic function returning identical results for identical inputs.
   */
  public detectEmotion(text: string): EmotionResult {
    const startTime = Date.now();

    if (!text || text.trim().length === 0) {
      const processingTimeMs = Date.now() - startTime;
      return {
        primaryEmotion: 'neutral',
        emotions: [{ emotion: 'neutral', confidence: 1.0, intensity: 4 }],
        reasoning: 'Empty input text defaults to neutral',
        detector: {
          source: 'rule-based',
          confidence: 1.0,
          processingTimeMs,
        },
        timestamp: new Date(),
      };
    }

    // 1. Normalize input text into clean lowercase token words
    const tokens = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((t) => t.length > 0);

    const tokenSet = new Set(tokens);
    const scoreMap: Map<EmotionCategory, { count: number; intensity: number }> = new Map();

    // 2. Exact word token matching against lexicon
    for (const [category, lexicon] of Object.entries(EMOTION_LEXICON) as [EmotionCategory, { keywords: string[]; baseIntensity: number }][]) {
      let matches = 0;
      for (const kw of lexicon.keywords) {
        if (tokenSet.has(kw)) {
          matches++;
        }
      }
      if (matches > 0) {
        scoreMap.set(category, { count: matches, intensity: lexicon.baseIntensity });
      }
    }

    // 3. Handle default case if zero keywords matched
    if (scoreMap.size === 0) {
      const processingTimeMs = Date.now() - startTime;
      return {
        primaryEmotion: 'neutral',
        emotions: [{ emotion: 'neutral', confidence: 0.65, intensity: 4 }],
        reasoning: 'No specific emotional keywords matched; defaulting to neutral baseline',
        detector: {
          source: 'rule-based',
          confidence: 0.65,
          processingTimeMs,
        },
        timestamp: new Date(),
      };
    }

    // 4. Convert match scores into normalized EmotionScore distribution array
    const sortedScores: EmotionScore[] = [];
    let maxMatchCount = 0;

    for (const [emotion, data] of scoreMap.entries()) {
      if (data.count > maxMatchCount) {
        maxMatchCount = data.count;
      }
    }

    let totalRawScore = 0;
    for (const data of scoreMap.values()) {
      totalRawScore += data.count;
    }

    for (const [emotion, data] of scoreMap.entries()) {
      const confidence = Math.min(0.95, Math.round((data.count / totalRawScore) * 100) / 100);
      sortedScores.push({
        emotion,
        confidence,
        intensity: data.intensity,
      });
    }

    // Sort by confidence descending
    sortedScores.sort((a, b) => b.confidence - a.confidence);

    const primaryEmotion = sortedScores[0].emotion;
    const topConfidence = sortedScores.length === 1 ? Math.min(0.95, 0.7 + maxMatchCount * 0.15) : sortedScores[0].confidence;
    const processingTimeMs = Date.now() - startTime;

    const matchedKeywordsList = sortedScores.map((s) => s.emotion).join(', ');

    return {
      primaryEmotion,
      emotions: sortedScores,
      reasoning: `Detected emotions [${matchedKeywordsList}] via keyword heuristics`,
      detector: {
        source: 'rule-based',
        confidence: Math.round(topConfidence * 100) / 100,
        processingTimeMs,
      },
      timestamp: new Date(),
    };
  }
}

/** Singleton export for RuleBasedEmotionDetector */
export const ruleBasedEmotionDetector = new RuleBasedEmotionDetector();
