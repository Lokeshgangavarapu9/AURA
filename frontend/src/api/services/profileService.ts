/**
 * User Profile API Service (Placeholder for Phase 2/3)
 */

import { httpClient } from '../client.js';
import { ENDPOINTS } from '../endpoints.js';
import { ApiResult } from '../types.js';

export const profileService = {
  /**
   * Fetches user profile configuration
   */
  async getProfile(): Promise<ApiResult<unknown>> {
    return httpClient.get<unknown>(ENDPOINTS.PROFILE.GET);
  },

  /**
   * Updates user profile
   */
  async updateProfile(profileData: unknown): Promise<ApiResult<unknown>> {
    return httpClient.put<unknown>(ENDPOINTS.PROFILE.UPDATE, profileData);
  },
};
