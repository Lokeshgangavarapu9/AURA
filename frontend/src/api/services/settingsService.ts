/**
 * App Settings API Service (Placeholder for Phase 2/3)
 */

import { httpClient } from '../client.js';
import { ENDPOINTS } from '../endpoints.js';
import { ApiResult } from '../types.js';

export const settingsService = {
  /**
   * Fetches backend application settings
   */
  async getSettings(): Promise<ApiResult<unknown>> {
    return httpClient.get<unknown>(ENDPOINTS.SETTINGS.GET);
  },

  /**
   * Updates backend application settings
   */
  async updateSettings(settingsData: unknown): Promise<ApiResult<unknown>> {
    return httpClient.put<unknown>(ENDPOINTS.SETTINGS.UPDATE, settingsData);
  },
};
