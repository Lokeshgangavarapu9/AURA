/**
 * AURA Memory Engine — Prisma SQLite Storage Implementation
 * Concrete repository implementation managing SQLite database operations via Prisma.
 * Fully encapsulates Prisma so no Prisma dependencies leak outside this storage class.
 */

import { prisma } from '../../database/client.js';
import { IMemoryRepository } from './memory.repository.js';
import {
  MemoryFactEntity,
  CreateMemoryFactDto,
  UpdateMemoryFactDto,
  UserProfileEntity,
  UpdateUserProfileDto,
  ReflectionEntity,
  CreateReflectionDto,
  MemorySearchFilter,
  MemoryCategory,
} from '../types/index.js';

export class SqliteMemoryRepository implements IMemoryRepository {
  /**
   * Persists a new MemoryFact to SQLite database via Prisma.
   */
  public async createMemoryFact(dto: CreateMemoryFactDto): Promise<MemoryFactEntity> {
    const record = await prisma.memoryFact.create({
      data: {
        category: dto.category,
        key: dto.key,
        value: dto.value,
        confidence: dto.confidence ?? 1.0,
        importance: dto.importance ?? 5,
      },
    });

    return this.mapMemoryFact(record);
  }

  /**
   * Updates an existing MemoryFact in SQLite by ID.
   */
  public async updateMemoryFact(id: string, dto: UpdateMemoryFactDto): Promise<MemoryFactEntity> {
    const record = await prisma.memoryFact.update({
      where: { id },
      data: {
        ...(dto.category && { category: dto.category }),
        ...(dto.key && { key: dto.key }),
        ...(dto.value && { value: dto.value }),
        ...(dto.confidence !== undefined && { confidence: dto.confidence }),
        ...(dto.importance !== undefined && { importance: dto.importance }),
        ...(dto.frequency !== undefined && { frequency: dto.frequency }),
        ...(dto.lastUsedAt && { lastUsedAt: dto.lastUsedAt }),
      },
    });

    return this.mapMemoryFact(record);
  }

  /**
   * Deletes a MemoryFact from SQLite by ID.
   */
  public async deleteMemoryFact(id: string): Promise<boolean> {
    try {
      await prisma.memoryFact.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retrieves a MemoryFact by ID.
   */
  public async getMemoryFactById(id: string): Promise<MemoryFactEntity | null> {
    const record = await prisma.memoryFact.findUnique({ where: { id } });
    return record ? this.mapMemoryFact(record) : null;
  }

  /**
   * Queries MemoryFacts matching category, minImportance, or keyword substrings.
   */
  public async findRelevantFacts(filter: MemorySearchFilter): Promise<MemoryFactEntity[]> {
    const whereClause: Record<string, unknown> = {};

    if (filter.category) {
      whereClause.category = filter.category;
    }

    if (filter.minImportance !== undefined) {
      whereClause.importance = { gte: filter.minImportance };
    }

    if (filter.keywords && filter.keywords.length > 0) {
      whereClause.OR = filter.keywords.map((kw) => ({
        OR: [
          { key: { contains: kw } },
          { value: { contains: kw } },
        ],
      }));
    }

    const records = await prisma.memoryFact.findMany({
      where: whereClause,
      take: filter.limit ?? 20,
      orderBy: { lastUsedAt: 'desc' },
    });

    return records.map((r) => this.mapMemoryFact(r));
  }

  /**
   * Retrieves all MemoryFacts sorted by lastUsedAt.
   */
  public async getAllMemoryFacts(limit = 50): Promise<MemoryFactEntity[]> {
    const records = await prisma.memoryFact.findMany({
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    return records.map((r) => this.mapMemoryFact(r));
  }

  /**
   * Retrieves the primary UserProfile record.
   */
  public async getUserProfile(): Promise<UserProfileEntity | null> {
    const record = await prisma.userProfile.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    return record ? this.mapUserProfile(record) : null;
  }

  /**
   * Creates or updates the primary UserProfile record.
   */
  public async updateUserProfile(dto: UpdateUserProfileDto): Promise<UserProfileEntity> {
    const existing = await this.getUserProfile();

    if (existing) {
      const updated = await prisma.userProfile.update({
        where: { id: existing.id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.age !== undefined && { age: dto.age }),
          ...(dto.occupation !== undefined && { occupation: dto.occupation }),
          ...(dto.college !== undefined && { college: dto.college }),
          ...(dto.bio !== undefined && { bio: dto.bio }),
        },
      });

      return this.mapUserProfile(updated);
    }

    const created = await prisma.userProfile.create({
      data: {
        name: dto.name,
        age: dto.age,
        occupation: dto.occupation,
        college: dto.college,
        bio: dto.bio,
      },
    });

    return this.mapUserProfile(created);
  }

  /**
   * Creates a new Reflection entry.
   */
  public async createReflection(dto: CreateReflectionDto): Promise<ReflectionEntity> {
    const record = await prisma.reflection.create({
      data: {
        summary: dto.summary,
        sentiment: dto.sentiment,
      },
    });

    return this.mapReflection(record);
  }

  /**
   * Retrieves recent Reflections.
   */
  public async getRecentReflections(limit = 10): Promise<ReflectionEntity[]> {
    const records = await prisma.reflection.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => this.mapReflection(r));
  }

  /** Mapper for MemoryFact Prisma model to domain entity */
  private mapMemoryFact(record: any): MemoryFactEntity {
    return {
      id: record.id,
      category: record.category as MemoryCategory,
      key: record.key,
      value: record.value,
      confidence: record.confidence,
      importance: record.importance,
      frequency: record.frequency,
      lastUsedAt: record.lastUsedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  /** Mapper for UserProfile Prisma model to domain entity */
  private mapUserProfile(record: any): UserProfileEntity {
    return {
      id: record.id,
      name: record.name,
      age: record.age,
      occupation: record.occupation,
      college: record.college,
      bio: record.bio,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  /** Mapper for Reflection Prisma model to domain entity */
  private mapReflection(record: any): ReflectionEntity {
    return {
      id: record.id,
      summary: record.summary,
      sentiment: record.sentiment,
      createdAt: record.createdAt,
    };
  }
}

/** Singleton instance export for SQLite Memory Repository */
export const sqliteMemoryRepository = new SqliteMemoryRepository();
