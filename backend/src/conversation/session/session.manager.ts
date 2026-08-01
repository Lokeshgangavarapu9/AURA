/**
 * AURA Conversation Intelligence Engine — Session Manager
 * Executes session business logic (session creation, resumption, message appending, thread loading).
 * Strictly decoupled: Contains ZERO LLM calls, ZERO PromptBuilder calls, and ZERO Memory Engine calls.
 */

import { ISessionRepository } from './session.repository.js';
import { sqliteSessionRepository } from './sqlite.session.js';
import {
  SessionMetadata,
  ChatMessageEntity,
  CreateSessionDto,
  AppendMessageDto,
} from '../types/index.js';
import { logger } from '../../utils/logger.js';

export class SessionManager {
  private repository: ISessionRepository;

  constructor(repository: ISessionRepository = sqliteSessionRepository) {
    this.repository = repository;
  }

  /**
   * Lists all active and saved ConversationSessions.
   */
  public async listSessions(): Promise<SessionMetadata[]> {
    return this.repository.listSessions();
  }

  /**
   * Retrieves session metadata by ID.
   */
  public async getSession(sessionId: string): Promise<SessionMetadata | null> {
    return this.repository.getSessionById(sessionId);
  }

  /**
   * Creates a new ConversationSession record.
   */
  public async createSession(dto?: CreateSessionDto): Promise<SessionMetadata> {
    const session = await this.repository.createSession(dto);
    logger.info({ sessionId: session.id, title: session.title }, '✅ SessionManager: Created new session');
    return session;
  }

  /**
   * Resumes an existing ConversationSession by ID.
   * If session does not exist, creates a new one gracefully.
   */
  public async resumeSession(sessionId: string): Promise<SessionMetadata> {
    const existing = await this.repository.getSessionById(sessionId);

    if (existing) {
      // Touch lastInteractionAt timestamp
      const updated = await this.repository.updateSession(sessionId, {
        lastInteractionAt: new Date(),
      });
      logger.info({ sessionId: updated.id }, '✅ SessionManager: Resumed active session');
      return updated;
    }

    logger.warn({ sessionId }, '⚠️ SessionManager: Requested session not found — creating new session fallback');
    return this.createSession({ title: 'Resumed Conversation' });
  }

  /**
   * Ends and deletes a ConversationSession.
   */
  public async endSession(sessionId: string): Promise<boolean> {
    const deleted = await this.repository.deleteSession(sessionId);
    if (deleted) {
      logger.info({ sessionId }, '✅ SessionManager: Ended and deleted session');
    } else {
      logger.warn({ sessionId }, '⚠️ SessionManager: Failed to end session — session not found');
    }
    return deleted;
  }

  /**
   * Appends a user or AI message to a session thread and increments message count.
   */
  public async appendMessage(dto: AppendMessageDto): Promise<ChatMessageEntity> {
    const message = await this.repository.appendMessage(dto);
    await this.incrementMessageCount(dto.sessionId);
    return message;
  }

  /**
   * Loads recent chat message thread for a session sorted chronologically.
   */
  public async loadRecentMessages(sessionId: string, limit = 50): Promise<ChatMessageEntity[]> {
    return this.repository.getMessagesBySessionId(sessionId, limit);
  }

  /**
   * Updates metadata on an existing session.
   */
  public async updateSession(sessionId: string, data: Partial<SessionMetadata>): Promise<SessionMetadata> {
    return this.repository.updateSession(sessionId, data);
  }

  /**
   * Increments message count on a session and updates lastInteractionAt timestamp.
   */
  public async incrementMessageCount(sessionId: string): Promise<void> {
    const session = await this.repository.getSessionById(sessionId);
    if (session) {
      const newCount = session.messageCount + 1;
      await this.repository.updateSession(sessionId, {
        messageCount: newCount,
        lastInteractionAt: new Date(),
      });
    }
  }
}

/** Singleton instance export for SessionManager */
export const sessionManager = new SessionManager();
