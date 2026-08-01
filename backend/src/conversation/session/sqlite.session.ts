/**
 * AURA Conversation Intelligence Engine — Prisma SQLite Session Repository
 * Concrete implementation managing SQLite session database queries via Prisma.
 * Encapsulates Prisma entirely so no Prisma imports leak outside this file.
 */

import { prisma } from '../../database/client.js';
import { ISessionRepository } from './session.repository.js';
import {
  SessionMetadata,
  ChatMessageEntity,
  CreateSessionDto,
  AppendMessageDto,
  ChatMessageSender,
} from '../types/index.js';

export class SqliteSessionRepository implements ISessionRepository {
  /**
   * Creates a new ConversationSession record in SQLite.
   */
  public async createSession(dto?: CreateSessionDto): Promise<SessionMetadata> {
    const record = await prisma.conversationSession.create({
      data: {
        title: dto?.title ?? 'New Conversation',
        currentTopic: dto?.initialTopic ?? 'General',
        messageCount: 0,
        isPinned: false,
      },
    });

    return this.mapSession(record);
  }

  /**
   * Retrieves all ConversationSessions sorted by pinned status (desc) and last interaction (desc).
   */
  public async listSessions(): Promise<SessionMetadata[]> {
    const records = await prisma.conversationSession.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { lastInteractionAt: 'desc' },
      ],
    });

    return records.map((r) => this.mapSession(r));
  }

  /**
   * Retrieves a ConversationSession by ID.
   */
  public async getSessionById(sessionId: string): Promise<SessionMetadata | null> {
    const record = await prisma.conversationSession.findUnique({
      where: { id: sessionId },
    });

    return record ? this.mapSession(record) : null;
  }

  /**
   * Updates metadata on an existing ConversationSession.
   */
  public async updateSession(sessionId: string, data: Partial<SessionMetadata>): Promise<SessionMetadata> {
    const record = await prisma.conversationSession.update({
      where: { id: sessionId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.currentTopic !== undefined && { currentTopic: data.currentTopic }),
        ...(data.messageCount !== undefined && { messageCount: data.messageCount }),
        ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
        ...(data.lastInteractionAt && { lastInteractionAt: data.lastInteractionAt }),
      },
    });

    return this.mapSession(record);
  }

  /**
   * Deletes a ConversationSession by ID.
   */
  public async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await prisma.conversationSession.delete({ where: { id: sessionId } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Appends a new ChatMessageRecord to SQLite database.
   */
  public async appendMessage(dto: AppendMessageDto): Promise<ChatMessageEntity> {
    const record = await prisma.chatMessageRecord.create({
      data: {
        sessionId: dto.sessionId,
        sender: dto.sender,
        text: dto.text,
        emotion: dto.emotion ?? 'neutral',
        topic: dto.topic ?? 'General',
      },
    });

    return this.mapMessage(record);
  }

  /**
   * Retrieves recent ChatMessageRecords for a session thread sorted chronologically.
   */
  public async getMessagesBySessionId(sessionId: string, limit = 50): Promise<ChatMessageEntity[]> {
    const records = await prisma.chatMessageRecord.findMany({
      where: { sessionId },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });

    return records.map((r) => this.mapMessage(r));
  }

  /**
   * Gets total message count for a session.
   */
  public async getMessageCount(sessionId: string): Promise<number> {
    return prisma.chatMessageRecord.count({
      where: { sessionId },
    });
  }

  /** Mapper for ConversationSession Prisma model to domain entity */
  private mapSession(record: any): SessionMetadata {
    return {
      id: record.id,
      title: record.title,
      currentTopic: record.currentTopic,
      messageCount: record.messageCount,
      isPinned: record.isPinned ?? false,
      lastInteractionAt: record.lastInteractionAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  /** Mapper for ChatMessageRecord Prisma model to domain entity */
  private mapMessage(record: any): ChatMessageEntity {
    return {
      id: record.id,
      sessionId: record.sessionId,
      sender: record.sender as ChatMessageSender,
      text: record.text,
      emotion: record.emotion,
      topic: record.topic,
      createdAt: record.createdAt,
    };
  }
}

/** Singleton instance export for SqliteSessionRepository */
export const sqliteSessionRepository = new SqliteSessionRepository();
