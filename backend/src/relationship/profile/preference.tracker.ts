/**
 * AURA Relationship & Personalization Engine — Preference Tracker
 * Learns and adapts UserCommunicationProfile preferences gradually over multiple conversation turns.
 * Pure domain logic: Modifies ONLY UserCommunicationProfile; contains 0 database or external API dependencies.
 */

import { UserCommunicationProfile } from '../types/index.js';

export class PreferenceTracker {
  /**
   * Evaluates turn features and returns an updated UserCommunicationProfile with gradual weighted shifts.
   * @param currentProfile Active UserCommunicationProfile
   * @param text User input text
   * @param totalTurns Total conversation turns recorded so far
   */
  public updateProfile(
    currentProfile: UserCommunicationProfile,
    text: string,
    totalTurns: number = 1
  ): UserCommunicationProfile {
    const lowerText = (text || '').toLowerCase().trim();

    if (!lowerText) {
      return { ...currentProfile };
    }

    const updated = { ...currentProfile };

    // 1. Response Length Preference (Gradual evaluation based on user input length)
    if (lowerText.length < 15 && totalTurns % 3 === 0) {
      updated.preferredResponseLength = 'concise';
    } else if (lowerText.length > 80 && totalTurns % 3 === 0) {
      updated.preferredResponseLength = 'detailed';
    }

    // 2. Formality Preference (Detects formal vs casual keywords)
    const casualIndicators = /\b(hey|sup|bro|cool|nah|yep|gonna|wanna|lol|haha)\b/;
    const formalIndicators = /\b(dear|sincerely|furthermore|regarding|respectfully|kindly|hereby)\b/;

    if (casualIndicators.test(lowerText) && totalTurns >= 3) {
      updated.preferredFormality = 'casual';
    } else if (formalIndicators.test(lowerText) && totalTurns >= 3) {
      updated.preferredFormality = 'formal';
    }

    // 3. Humor Preference (Detects jokes/laughter)
    if (/\b(haha|lol|funny|joke|lmao|rofl)\b/.test(lowerText) && totalTurns >= 2) {
      updated.preferredHumor = 'frequent';
    }

    // 4. Emoji Usage Preference
    if (/[\u{1F600}-\u{1F64F}]/u.test(lowerText)) {
      updated.preferredEmojiUsage = 'expressive';
    }

    // 5. Technical Depth Preference
    if (/\b(code|algorithm|database|api|architecture|framework|function|type|prisma)\b/.test(lowerText)) {
      updated.preferredTechnicalDepth = 'expert';
    }

    return updated;
  }
}

/** Singleton export for PreferenceTracker */
export const preferenceTracker = new PreferenceTracker();
