/**
 * AURA Emotional Intelligence Engine — Master Emotion Analyzer Facade
 * The SINGLE public entry point for emotion analysis and orchestration.
 * Completely domain-pure: Contains ZERO Prisma, ZERO SQLite, ZERO Gemini API, and ZERO Express dependencies.
 */

import { IEmotionDetector } from '../detectors/emotion.detector.js';
import { ruleBasedEmotionDetector } from '../detectors/rule.detector.js';
import { ResponsePolicy, responsePolicy } from '../policy/response.policy.js';
import { EmotionalStateTracker, emotionalStateTracker } from '../tracker/state.tracker.js';
import { EmotionContextBuilder, emotionContextBuilder } from '../context/context.builder.js';
import { EmotionalContext } from '../types/index.js';

export class EmotionAnalyzer {
  private detector: IEmotionDetector;
  private policy: ResponsePolicy;
  private tracker: EmotionalStateTracker;
  private contextBuilder: EmotionContextBuilder;

  constructor(
    det: IEmotionDetector = ruleBasedEmotionDetector,
    pol: ResponsePolicy = responsePolicy,
    trk: EmotionalStateTracker = emotionalStateTracker,
    builder: EmotionContextBuilder = emotionContextBuilder
  ) {
    this.detector = det;
    this.policy = pol;
    this.tracker = trk;
    this.contextBuilder = builder;
  }

  /**
   * Master execution pipeline analyzing text turns into version 1 EmotionalContext payloads.
   * @param text Incoming user message
   */
  public analyze(text: string): EmotionalContext {
    // 1. Detect emotion via strategy detector
    const emotionResult = this.detector.detectEmotion(text);

    // 2. Determine AI response tone (AIEmotion & ResponseStyle)
    const aiTone = this.policy.determineResponseTone(emotionResult);

    // 3. Update short-term emotional state tracking
    const emotionalState = this.tracker.updateState(emotionResult);

    // 4. Assemble & return version 1 EmotionalContext
    return this.contextBuilder.buildContext(emotionResult, aiTone, emotionalState);
  }

  /**
   * Resets short-term emotional state tracker to neutral baseline.
   */
  public resetState(): void {
    this.tracker.reset();
  }
}

/** Singleton export for EmotionAnalyzer */
export const emotionAnalyzer = new EmotionAnalyzer();
