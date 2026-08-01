/**
 * Health & System Monitoring API Service
 */

import { httpClient } from '../client.js';
import { ENDPOINTS } from '../endpoints.js';
import { ApiResult, HealthResponse } from '../types.js';

export const healthService = {
  /**
   * Fetches backend server health & system status
   */
  async checkHealth(): Promise<ApiResult<HealthResponse>> {
    return httpClient.get<HealthResponse>(ENDPOINTS.HEALTH, { retries: 1, timeoutMs: 5000 });
  },
};
