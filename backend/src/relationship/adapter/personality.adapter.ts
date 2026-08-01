/**
 * AURA Relationship & Personalization Engine — Personality Adapter Layer
 * Converts EmotionalContext, RelationshipLevel, and UserCommunicationProfile into a transient PersonalityDirective.
 * Pure adapter logic: Generated dynamically every turn; NEVER saved or persisted to database.
 */

import {
  PersonalityDirective,
  RelationshipLevel,
  UserCommunicationProfile,
  RelationshipBoundaries,
  RelationshipMetrics,
} from '../types/index.js';
import { EmotionalContext } from '../../emotion/types/index.js';

export class PersonalityAdapter {
  /**
   * Dynamically constructs a transient PersonalityDirective for system prompt guidance.
   */
  public adaptPersonality(
    emotionalContext?: EmotionalContext,
    level: RelationshipLevel = 'stranger',
    profile?: UserCommunicationProfile,
    boundaries?: RelationshipBoundaries,
    metrics?: RelationshipMetrics
  ): PersonalityDirective {
    const rules: string[] = [];

    // 1. Level-Based Directives
    switch (level) {
      case 'stranger':
        rules.push('Maintain polite, formal boundaries and respectful tone.');
        break;
      case 'acquaintance':
        rules.push('Be warm, polite, and welcoming.');
        break;
      case 'companion':
        rules.push('Speak comfortably with active listening and relaxed warmth.');
        break;
      case 'close_friend':
        rules.push('Speak casually and naturally like a close friend. Offer gentle coaching where helpful.');
        break;
      case 'confidant':
        rules.push('Express deep empathy and unconditional support. You are a trusted confidant.');
        break;
    }

    // 2. Emotion Guidance Integration
    if (emotionalContext) {
      rules.push(`User Emotion: ${emotionalContext.primaryEmotion}. AI Stance: ${emotionalContext.aiTone.aiEmotion}.`);
      rules.push(`Adopt a ${emotionalContext.aiTone.responseStyle} delivery style.`);
    }

    // 3. User Communication Profile Guidance
    if (profile) {
      if (profile.preferredFormality === 'casual') rules.push('Use casual phrasing and avoid stiff formality.');
      if (profile.preferredResponseLength === 'concise') rules.push('Keep responses brief and concise.');
      if (profile.preferredHumor === 'frequent') rules.push('Feel free to incorporate light, playful humor.');
      if (profile.preferredEmojiUsage === 'expressive') rules.push('Use friendly emojis occasionally.');
    }

    // Summary Prompt formatting
    const healthText = metrics ? ` | Health: ${metrics.relationshipHealth}/100` : '';
    const summaryPrompt = `Relationship Tier: ${level}${healthText}. ${rules.join(' ')}`;

    const safetyNotice = boundaries?.romantic === false
      ? 'Safety Notice: Romantic interactions disabled. Professional boundaries active.'
      : 'Safety Notice: Maintain ethical AI companion standards.';

    return {
      summaryPrompt,
      rules,
      safetyNotice,
    };
  }
}

/** Singleton export for PersonalityAdapter */
export const personalityAdapter = new PersonalityAdapter();
