/**
 * AURA Capability Runtime — Security Router
 * Validates request permissions, input parameters, and context boundaries before executing capabilities.
 */

import { CapabilityRegistry, capabilityRegistry } from '../registry/capability.registry.js';
import {
  CapabilityExecutionContext,
  CapabilityResult,
  CapabilityPermission,
} from '../types/capability.types.js';
import { logger } from '../../utils/logger.js';

export class CapabilitySecurityRouter {
  private registry: CapabilityRegistry;

  constructor(registry: CapabilityRegistry = capabilityRegistry) {
    this.registry = registry;
  }

  /**
   * Executes a capability securely after performing permission and input validation checks.
   */
  public async executeCapability<TInput = Record<string, unknown>, TOutput = unknown>(
    capabilityId: string,
    input: TInput,
    context: CapabilityExecutionContext
  ): Promise<CapabilityResult<TOutput>> {
    const startTime = Date.now();
    const capability = this.registry.get(capabilityId);

    if (!capability) {
      logger.warn({ capabilityId }, `⛔ CapabilitySecurityRouter: Capability [${capabilityId}] not found in registry`);
      return {
        success: false,
        error: `Capability [${capabilityId}] not found`,
        executionTimeMs: Date.now() - startTime,
      };
    }

    // 1. Permission Validation
    const hasPermission = this.validatePermissions(
      capability.metadata.requiredPermissions,
      context.grantedPermissions
    );

    if (!hasPermission) {
      logger.error(
        {
          capabilityId,
          required: capability.metadata.requiredPermissions,
          granted: context.grantedPermissions,
        },
        `🔒 CapabilitySecurityRouter Permission Denied for [${capabilityId}]`
      );
      return {
        success: false,
        error: `Security Permission Denied for capability [${capabilityId}]`,
        executionTimeMs: Date.now() - startTime,
      };
    }

    // 2. Input Parameter Validation
    const validation = capability.validateInput(input);
    if (!validation.valid) {
      logger.warn({ capabilityId, reason: validation.reason }, `⚠️ CapabilitySecurityRouter Input Validation Failed for [${capabilityId}]`);
      return {
        success: false,
        error: `Invalid input for capability [${capabilityId}]: ${validation.reason}`,
        executionTimeMs: Date.now() - startTime,
      };
    }

    // 3. Execution
    try {
      logger.debug({ capabilityId }, `🚀 CapabilitySecurityRouter: Executing capability [${capabilityId}]`);
      const result = await capability.execute(input, context);
      return result;
    } catch (err: any) {
      logger.error({ err, capabilityId }, `❌ CapabilitySecurityRouter: Capability [${capabilityId}] failed during execution`);
      return {
        success: false,
        error: `Capability [${capabilityId}] execution error: ${err.message}`,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Validates if granted permissions satisfy all required permissions.
   */
  private validatePermissions(
    required: CapabilityPermission[],
    granted: CapabilityPermission[]
  ): boolean {
    if (!required || required.length === 0) return true;
    if (granted.includes(CapabilityPermission.SYSTEM_ADMIN)) return true;

    return required.every((req) => granted.includes(req));
  }
}

/** Singleton instance export for CapabilitySecurityRouter */
export const capabilitySecurityRouter = new CapabilitySecurityRouter();
