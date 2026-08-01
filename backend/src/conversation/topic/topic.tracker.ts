/**
 * AURA Conversation Intelligence Engine — Topic Tracker Strategy
 * Extensible topic detection architecture.
 * Defines ITopicTracker interface allowing RuleBasedTopicTracker or future SemanticTopicTracker (LLM/Embeddings)
 * to be swapped seamlessly without modifying ConversationManager.
 */

import { TopicResult } from '../types/index.js';

export interface ITopicTracker {
  /**
   * Detects the conversation topic of a user message and identifies topic shifts.
   * @param userMessage Active user prompt
   * @param currentTopic Optional current active topic
   */
  detectTopic(userMessage: string, currentTopic?: string | null): TopicResult;
}

/** Keyword topic dictionary mapping categories to keyword match sets */
const TOPIC_KEYWORDS: Record<string, string[]> = {
  Technology: ['code', 'programming', 'software', 'ai', 'python', 'react', 'typescript', 'database', 'app', 'computer', 'tech', 'algorithm'],
  Career: ['job', 'work', 'college', 'university', 'career', 'study', 'internship', 'interview', 'company', 'salary'],
  Personal: ['family', 'sister', 'brother', 'friend', 'dog', 'cat', 'pet', 'home', 'life', 'name', 'birthday', 'age'],
  Health: ['workout', 'exercise', 'diet', 'sleep', 'food', 'drink', 'matcha', 'coffee', 'meditation', 'breathing', 'feeling', 'tired', 'healthy'],
  Entertainment: ['movie', 'music', 'game', 'gaming', 'book', 'song', 'show', 'anime', 'fun', 'play'],
};

export class RuleBasedTopicTracker implements ITopicTracker {
  /**
   * Fast, sub-millisecond rule-based topic detection
   */
  public detectTopic(userMessage: string, currentTopic: string | null = 'General'): TopicResult {
    const prevTopic = currentTopic || 'General';

    if (!userMessage || userMessage.trim().length === 0) {
      return {
        currentTopic: prevTopic,
        previousTopic: prevTopic,
        isTopicShift: false,
        confidence: 1.0,
      };
    }

    const text = userMessage.toLowerCase();
    const scores: Record<string, number> = {};

    // Calculate match scores per topic category
    for (const [topicName, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      let matches = 0;
      for (const kw of keywords) {
        if (text.includes(kw)) {
          matches++;
        }
      }
      if (matches > 0) {
        scores[topicName] = matches;
      }
    }

    // Determine top topic match
    let detectedTopic = prevTopic;
    let maxMatches = 0;

    for (const [topicName, matches] of Object.entries(scores)) {
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedTopic = topicName;
      }
    }

    // Calculate confidence based on keyword match count
    const confidence = maxMatches > 0 ? Math.min(1.0, 0.6 + maxMatches * 0.15) : 0.5;
    const isTopicShift = detectedTopic !== prevTopic && maxMatches > 0;

    return {
      currentTopic: detectedTopic,
      previousTopic: prevTopic,
      isTopicShift,
      confidence: Math.round(confidence * 100) / 100,
    };
  }
}

/** Singleton export for RuleBasedTopicTracker */
export const ruleBasedTopicTracker = new RuleBasedTopicTracker();
