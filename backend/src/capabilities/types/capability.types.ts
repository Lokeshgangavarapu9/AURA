/**
 * AURA Capability Runtime — Pure Domain Contracts & Types
 * Single source of truth for Capability definitions, security permissions, and execution contexts.
 */

import { RuntimeContext } from '../../runtime/types/runtime.types.js';

export enum CapabilityCategory {
  MEMORY = 'MEMORY',
  RELATIONSHIP = 'RELATIONSHIP',
  EMOTION = 'EMOTION',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY',
  SESSION = 'SESSION',
  PROVIDER = 'PROVIDER',
  // Future inactive categories (compiled for forward compatibility)
  CALENDAR = 'CALENDAR',
  BROWSER = 'BROWSER',
  GITHUB = 'GITHUB',
  DRIVE = 'DRIVE',
  SLACK = 'SLACK',
  NOTION = 'NOTION',
  VOICE = 'VOICE',
  VISION = 'VISION',
}

export enum CapabilityPermission {
  READ_MEMORY = 'READ_MEMORY',
  WRITE_MEMORY = 'WRITE_MEMORY',
  READ_RELATIONSHIP = 'READ_RELATIONSHIP',
  READ_EMOTION = 'READ_EMOTION',
  READ_PROFILE = 'READ_PROFILE',
  READ_SETTINGS = 'READ_SETTINGS',
  READ_HISTORY = 'READ_HISTORY',
  READ_SESSION = 'READ_SESSION',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

export interface CapabilityMetadata {
  id: string;
  name: string;
  description: string;
  category: CapabilityCategory;
  version: string;
  requiredPermissions: CapabilityPermission[];
  executionCostTokens: number;
  isExperimental?: boolean;
  status: 'active' | 'deprecated' | 'inactive';
}

export interface CapabilityExecutionContext {
  runtimeContext: RuntimeContext;
  requestedBy: string;
  requestTimestamp: Date;
  grantedPermissions: CapabilityPermission[];
}

export interface CapabilityResult<TOutput = unknown> {
  success: boolean;
  data?: TOutput;
  error?: string;
  executionTimeMs: number;
}

/** Master Interface for all AURA Capabilities */
export interface ICapability<TInput = Record<string, unknown>, TOutput = unknown> {
  readonly metadata: CapabilityMetadata;

  /** Validates input parameters before execution */
  validateInput(input: TInput): { valid: boolean; reason?: string };

  /** Executes capability logic safely */
  execute(input: TInput, context: CapabilityExecutionContext): Promise<CapabilityResult<TOutput>>;

  /** Health check verification */
  checkHealth(): Promise<boolean>;
}
