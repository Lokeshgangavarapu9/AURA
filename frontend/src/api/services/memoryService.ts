/**
 * Memory Engine API Service (Placeholder for Phase 2)
 */

import { httpClient } from '../client.js';
import { ENDPOINTS } from '../endpoints.js';
import { ApiResult } from '../types.js';

export const memoryService = {
  /**
   * Retrieves long-term AI memory records
   */
  async getMemories(): Promise<ApiResult<unknown[]>> {
    return httpClient.get<unknown[]>(ENDPOINTS.MEMORY.GET_MEMORIES);
  },

  /**
   * Searches memory store using semantic query
   */
  async searchMemory(query: string): Promise<ApiResult<unknown[]>> {
    return httpClient.post<unknown[]>(ENDPOINTS.MEMORY.SEARCH, { query });
  },
};
