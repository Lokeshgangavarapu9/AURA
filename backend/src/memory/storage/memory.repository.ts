/**
 * AURA Memory Engine — Repository Contract (Abstract Storage Interface)
 * Defines pure data access contracts for reading and writing memory data.
 * Keeps storage vector-ready and decoupled from Prisma, SQLite, or future Vector databases.
 */

import {
  MemoryFactEntity,
  CreateMemoryFactDto,
  UpdateMemoryFactDto,
  UserProfileEntity,
  UpdateUserProfileDto,
  ReflectionEntity,
  CreateReflectionDto,
  MemorySearchFilter,
} from '../types/index.js';

export interface IMemoryRepository {
  /**
   * Persists a new MemoryFact entity to storage.
   */
  createMemoryFact(dto: CreateMemoryFactDto): Promise<MemoryFactEntity>;

  /**
   * Updates an existing MemoryFact by ID.
   */
  updateMemoryFact(id: string, dto: UpdateMemoryFactDto): Promise<MemoryFactEntity>;

  /**
   * Deletes a MemoryFact by ID.
   */
  deleteMemoryFact(id: string): Promise<boolean>;

  /**
   * Retrieves a MemoryFact by ID.
   */
  getMemoryFactById(id: string): Promise<MemoryFactEntity | null>;

  /**
   * Queries MemoryFacts using search filter criteria (category, keywords, minImportance).
   */
  findRelevantFacts(filter: MemorySearchFilter): Promise<MemoryFactEntity[]>;

  /**
   * Retrieves all MemoryFacts in storage.
   */
  getAllMemoryFacts(limit?: number): Promise<MemoryFactEntity[]>;

  /**
   * Retrieves the current UserProfile identity record or null if not yet initialized.
   */
  getUserProfile(): Promise<UserProfileEntity | null>;

  /**
   * Creates or updates the single UserProfile record.
   */
  updateUserProfile(dto: UpdateUserProfileDto): Promise<UserProfileEntity>;

  /**
   * Creates a new Reflection entry.
   */
  createReflection(dto: CreateReflectionDto): Promise<ReflectionEntity>;

  /**
   * Retrieves recent Reflections sorted chronologically.
   */
  getRecentReflections(limit?: number): Promise<ReflectionEntity[]>;
}
