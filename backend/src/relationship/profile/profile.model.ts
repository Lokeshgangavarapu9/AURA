/**
 * AURA Relationship & Personalization Engine — User Communication Profile Model
 * Model factory & defaults for user communication preferences.
 * Pure domain logic: Contains ZERO Prisma, ZERO SQLite, ZERO Gemini, and ZERO Express imports.
 */

import { UserCommunicationProfile } from '../types/index.js';

export class UserCommunicationProfileModel {
  /**
   * Returns a baseline default UserCommunicationProfile.
   */
  public static createDefault(): UserCommunicationProfile {
    return {
      preferredFormality: 'balanced',
      preferredResponseLength: 'balanced',
      preferredHumor: 'subtle',
      preferredExplanationStyle: 'guided',
      preferredTechnicalDepth: 'standard',
      preferredEmojiUsage: 'minimal',
      questioningPreference: 'moderate',
    };
  }
}
