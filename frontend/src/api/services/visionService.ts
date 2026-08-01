/**
 * Vision & Camera API Service (Placeholder for Phase 3)
 */

import { httpClient } from '../client.js';
import { ENDPOINTS } from '../endpoints.js';
import { ApiResult } from '../types.js';

export const visionService = {
  /**
   * Sends webcam frame for object and scene analysis
   */
  async analyzeFrame(imageBase64: string): Promise<ApiResult<{ detectedObjects: string[] }>> {
    return httpClient.post<{ detectedObjects: string[] }>(ENDPOINTS.VISION.ANALYZE_FRAME, { imageBase64 });
  },
};
