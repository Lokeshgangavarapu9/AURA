/**
 * AURA Conversation Intelligence Engine — Session Repository Contract
 * Interface defining pure database CRUD operations for ConversationSession and ChatMessageRecord.
 * Completely decoupled from business logic, Gemini, and Prisma.
 */

import {
  SessionMetadata,
  ChatMessageEntity,
  CreateSessionDto,
  AppendMessageDto,
} from '../types/index.js';

export interface ISessionRepository {
  /**
   * Persists a new ConversationSession record.
   */
  createSession(dto?: CreateSessionDto): Promise<SessionMetadata>;

  /**
   * Retrieves all ConversationSession records sorted by pinned status & last interaction.
   */
  listSessions(): Promise<SessionMetadata[]>;

  /**
   * Retrieves a ConversationSession by ID.
   */
  getSessionById(sessionId: string): Promise<SessionMetadata | null>;

  /**
   * Updates metadata on an existing ConversationSession.
   */
  updateSession(sessionId: string, data: Partial<SessionMetadata>): Promise<SessionMetadata>;

  /**
   * Deletes a ConversationSession and all associated messages.
   */
  deleteSession(sessionId: string): Promise<boolean>;

  /**
   * Appends a new ChatMessageRecord to a session thread.
   */
  appendMessage(dto: AppendMessageDto): Promise<ChatMessageEntity>;

  /**
   * Retrieves recent ChatMessageRecords for a session thread.
   */
  getMessagesBySessionId(sessionId: string, limit?: number): Promise<ChatMessageEntity[]>;

  /**
   * Gets the total message count for a session.
   */
  getMessageCount(sessionId: string): Promise<number>;
}
