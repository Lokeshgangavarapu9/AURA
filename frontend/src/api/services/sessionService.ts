/**
 * Session API Service — Conversation Workspace & Session Management Integration
 */

import { httpClient } from '../client.js';
import { ENDPOINTS } from '../endpoints.js';
import { ApiResult } from '../types.js';

export interface SessionMetadataPayload {
  id: string;
  title: string;
  currentTopic: string;
  messageCount: number;
  isPinned: boolean;
  lastInteractionAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionThreadMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'ai';
  text: string;
  emotion?: string;
  topic?: string;
  createdAt: string;
}

export interface GetSessionDetailsResponse {
  status: 'ok';
  data: {
    session: SessionMetadataPayload;
    messages: SessionThreadMessage[];
  };
}

export interface ListSessionsResponse {
  status: 'ok';
  data: SessionMetadataPayload[];
}

export interface CreateSessionResponse {
  status: 'ok';
  data: SessionMetadataPayload;
}

export const sessionService = {
  /**
   * Retrieves all conversation sessions sorted by pinned status & recency
   */
  async listSessions(): Promise<ApiResult<ListSessionsResponse>> {
    return httpClient.get<ListSessionsResponse>(ENDPOINTS.SESSIONS.LIST);
  },

  /**
   * Retrieves session metadata and full message history thread by session ID
   */
  async getSessionById(id: string): Promise<ApiResult<GetSessionDetailsResponse>> {
    return httpClient.get<GetSessionDetailsResponse>(ENDPOINTS.SESSIONS.GET_BY_ID(id));
  },

  /**
   * Creates a new conversation session
   */
  async createSession(title?: string): Promise<ApiResult<CreateSessionResponse>> {
    return httpClient.post<CreateSessionResponse>(ENDPOINTS.SESSIONS.CREATE, { title });
  },

  /**
   * Updates session metadata (e.g. rename title or toggle pinned state)
   */
  async updateSession(
    id: string,
    data: { title?: string; isPinned?: boolean }
  ): Promise<ApiResult<CreateSessionResponse>> {
    return httpClient.patch<CreateSessionResponse>(ENDPOINTS.SESSIONS.UPDATE(id), data);
  },

  /**
   * Deletes a session and all its messages
   */
  async deleteSession(id: string): Promise<ApiResult<{ status: 'ok'; data: { deleted: boolean; id: string } }>> {
    return httpClient.delete<{ status: 'ok'; data: { deleted: boolean; id: string } }>(ENDPOINTS.SESSIONS.DELETE(id));
  },
};
