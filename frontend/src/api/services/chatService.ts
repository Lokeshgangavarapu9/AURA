/**
 * Chat API Service — Live Gemini AI Companion Integration
 */

import { httpClient } from '../client.js';
import { ENDPOINTS } from '../endpoints.js';
import { ApiResult } from '../types.js';

export interface ChatMessagePayload {
  id: string;
  sessionId: string;
  text: string;
  emotion: 'neutral' | 'happy' | 'thinking' | 'curious' | 'surprised' | 'soothing';
  topic: string;
  messageCount: number;
  timestamp: string;
}

export interface BackendChatResponse {
  status: 'ok';
  data: ChatMessagePayload;
}

export interface ChatHistoryItemPayload {
  sender: 'user' | 'ai';
  text: string;
}

export const chatService = {
  /**
   * Sends user message + optional active sessionId to backend ConversationManager (POST /api/v1/chat)
   */
  async sendMessage(
    message: string,
    sessionId?: string | null
  ): Promise<ApiResult<BackendChatResponse>> {
    return httpClient.post<BackendChatResponse>(ENDPOINTS.CHAT.SEND_MESSAGE, {
      message,
      sessionId: sessionId || undefined,
    });
  },

  /**
   * Uploads base64 encoded file data to backend
   */
  async uploadFile(filename: string, base64: string): Promise<ApiResult<{ filename: string, url: string }>> {
    return httpClient.post<{ filename: string, url: string }>(ENDPOINTS.CHAT.UPLOAD, {
      filename,
      base64,
    });
  },

  /**
   * Placeholder for fetching conversation history from database
   */
  async getHistory(): Promise<ApiResult<unknown[]>> {
    return httpClient.get<unknown[]>(ENDPOINTS.CHAT.GET_HISTORY);
  },
};
