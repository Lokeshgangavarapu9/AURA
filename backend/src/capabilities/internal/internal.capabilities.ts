/**
 * AURA Capability Runtime — Internal Capabilities Wrappers
 * Concrete capability implementations delegating to existing AURA backend engines.
 */

import {
  ICapability,
  CapabilityMetadata,
  CapabilityCategory,
  CapabilityPermission,
  CapabilityExecutionContext,
  CapabilityResult,
} from '../types/capability.types.js';
import { memoryEngine } from '../../memory/engine/memory.engine.js';
import { emotionAnalyzer } from '../../emotion/index.js';
import { relationshipAnalyzer } from '../../relationship/index.js';
import { sqliteMemoryRepository } from '../../memory/storage/sqlite.repository.js';
import { prisma } from '../../database/client.js';

/** Capability 1: Read Memory */
export class ReadMemoryCapability implements ICapability<{ query: string }> {
  readonly metadata: CapabilityMetadata = {
    id: 'memory.read',
    name: 'Read Memory',
    description: 'Retrieves relevant working memory facts and preferences for a prompt',
    category: CapabilityCategory.MEMORY,
    version: '1.0.0',
    requiredPermissions: [CapabilityPermission.READ_MEMORY],
    executionCostTokens: 50,
    status: 'active',
  };

  validateInput(input: { query: string }): { valid: boolean; reason?: string } {
    if (!input || typeof input.query !== 'string' || !input.query.trim()) {
      return { valid: false, reason: 'Query string is required' };
    }
    return { valid: true };
  }

  async execute(input: { query: string }): Promise<CapabilityResult> {
    const start = Date.now();
    const workingMemory = await memoryEngine.getWorkingMemory(input.query);
    return {
      success: true,
      data: workingMemory,
      executionTimeMs: Date.now() - start,
    };
  }

  async checkHealth(): Promise<boolean> {
    return true;
  }
}

/** Capability 2: Store Memory */
export class StoreMemoryCapability implements ICapability<{ text: string }> {
  readonly metadata: CapabilityMetadata = {
    id: 'memory.store',
    name: 'Store Memory',
    description: 'Asynchronously extracts and stores new user facts into long term memory',
    category: CapabilityCategory.MEMORY,
    version: '1.0.0',
    requiredPermissions: [CapabilityPermission.WRITE_MEMORY],
    executionCostTokens: 100,
    status: 'active',
  };

  validateInput(input: { text: string }): { valid: boolean; reason?: string } {
    if (!input || typeof input.text !== 'string' || !input.text.trim()) {
      return { valid: false, reason: 'Memory text is required' };
    }
    return { valid: true };
  }

  async execute(input: { text: string }): Promise<CapabilityResult> {
    const start = Date.now();
    memoryEngine.processMessageAsync(input.text, 'Memory stored via StoreMemoryCapability');
    return {
      success: true,
      data: { status: 'queued' },
      executionTimeMs: Date.now() - start,
    };
  }

  async checkHealth(): Promise<boolean> {
    return true;
  }
}

/** Capability 3: Read Relationship */
export class ReadRelationshipCapability implements ICapability<{ userId: string; message: string }> {
  readonly metadata: CapabilityMetadata = {
    id: 'relationship.read',
    name: 'Read Relationship',
    description: 'Computes relationship context and trust scores',
    category: CapabilityCategory.RELATIONSHIP,
    version: '1.0.0',
    requiredPermissions: [CapabilityPermission.READ_RELATIONSHIP],
    executionCostTokens: 30,
    status: 'active',
  };

  validateInput(input: { userId: string; message: string }): { valid: boolean; reason?: string } {
    if (!input || !input.userId || !input.message) {
      return { valid: false, reason: 'userId and message are required' };
    }
    return { valid: true };
  }

  async execute(input: { userId: string; message: string }): Promise<CapabilityResult> {
    const start = Date.now();
    const emotionalContext = emotionAnalyzer.analyze(input.message);
    const relRes = relationshipAnalyzer.analyze({
      userId: input.userId,
      userMessage: input.message,
      emotionalContext,
    });
    return {
      success: true,
      data: relRes.context,
      executionTimeMs: Date.now() - start,
    };
  }

  async checkHealth(): Promise<boolean> {
    return true;
  }
}

/** Capability 4: Read Emotion */
export class ReadEmotionCapability implements ICapability<{ text: string }> {
  readonly metadata: CapabilityMetadata = {
    id: 'emotion.read',
    name: 'Read Emotion',
    description: 'Performs text emotion classification and returns EmotionalContext',
    category: CapabilityCategory.EMOTION,
    version: '1.0.0',
    requiredPermissions: [CapabilityPermission.READ_EMOTION],
    executionCostTokens: 20,
    status: 'active',
  };

  validateInput(input: { text: string }): { valid: boolean; reason?: string } {
    if (!input || !input.text) {
      return { valid: false, reason: 'Text string is required' };
    }
    return { valid: true };
  }

  async execute(input: { text: string }): Promise<CapabilityResult> {
    const start = Date.now();
    const emotionalContext = emotionAnalyzer.analyze(input.text);
    return {
      success: true,
      data: emotionalContext,
      executionTimeMs: Date.now() - start,
    };
  }

  async checkHealth(): Promise<boolean> {
    return true;
  }
}

/** Capability 5: Read Profile */
export class ReadProfileCapability implements ICapability<Record<string, never>> {
  readonly metadata: CapabilityMetadata = {
    id: 'profile.read',
    name: 'Read User Profile',
    description: 'Fetches active User Profile record',
    category: CapabilityCategory.PROFILE,
    version: '1.0.0',
    requiredPermissions: [CapabilityPermission.READ_PROFILE],
    executionCostTokens: 10,
    status: 'active',
  };

  validateInput(): { valid: boolean } {
    return { valid: true };
  }

  async execute(): Promise<CapabilityResult> {
    const start = Date.now();
    const profile = await sqliteMemoryRepository.getUserProfile();
    return {
      success: true,
      data: profile,
      executionTimeMs: Date.now() - start,
    };
  }

  async checkHealth(): Promise<boolean> {
    return true;
  }
}

/** Capability 6: Read Settings */
export class ReadSettingsCapability implements ICapability<Record<string, never>> {
  readonly metadata: CapabilityMetadata = {
    id: 'settings.read',
    name: 'Read Settings',
    description: 'Fetches system settings from database',
    category: CapabilityCategory.SETTINGS,
    version: '1.0.0',
    requiredPermissions: [CapabilityPermission.READ_SETTINGS],
    executionCostTokens: 10,
    status: 'active',
  };

  validateInput(): { valid: boolean } {
    return { valid: true };
  }

  async execute(): Promise<CapabilityResult> {
    const start = Date.now();
    const settings = await prisma.settings.findUnique({ where: { id: 'default' } });
    return {
      success: true,
      data: settings,
      executionTimeMs: Date.now() - start,
    };
  }

  async checkHealth(): Promise<boolean> {
    return true;
  }
}
