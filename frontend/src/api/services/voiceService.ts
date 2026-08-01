/**
 * Voice & Audio API Service (Placeholder for Phase 3)
 */

import { httpClient } from '../client.js';
import { ENDPOINTS } from '../endpoints.js';
import { ApiResult } from '../types.js';

export const voiceService = {
  /**
   * Sends raw audio stream chunk for transcription
   */
  async sendAudioChunk(audioBase64: string): Promise<ApiResult<{ transcript: string }>> {
    return httpClient.post<{ transcript: string }>(ENDPOINTS.VOICE.TRANSCRIBE, { audioBase64 });
  },
};
