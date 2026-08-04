/**
 * AURA Capability Runtime — Tool Mapper
 * Connects the Capability Runtime to Provider Layer. Translates registered Capabilities
 * into normalized IAuraFunctionSchema arrays and routes LLM tool execution calls to SecurityRouter.
 */

import { CapabilityRegistry, capabilityRegistry } from '../registry/capability.registry.js';
import { CapabilitySecurityRouter, capabilitySecurityRouter } from '../security/security.router.js';
import { IAuraFunctionSchema } from '../../ai/providers/types.js';
import { CapabilityExecutionContext, CapabilityPermission } from '../types/capability.types.js';
import { logger } from '../../utils/logger.js';

export class CapabilityToolMapper {
  private registry: CapabilityRegistry;
  private router: CapabilitySecurityRouter;

  constructor(
    registry: CapabilityRegistry = capabilityRegistry,
    router: CapabilitySecurityRouter = capabilitySecurityRouter
  ) {
    this.registry = registry;
    this.router = router;
  }

  /**
   * Translates active capabilities in the registry into IAuraFunctionSchema format for Provider Layer.
   */
  public generateProviderToolSchemas(): IAuraFunctionSchema[] {
    const capabilities = this.registry.listAll();
    return capabilities.map((cap) => ({
      name: cap.metadata.id.replace('.', '_'), // e.g. memory_read
      description: cap.metadata.description,
      parameters: {
        type: 'object',
        properties: {
          input: {
            type: 'object',
            description: 'Parameters required for capability execution',
          },
        },
      },
    }));
  }

  /**
   * Routes an LLM function call request to the appropriate Capability execution through Security Router.
   */
  public async executeToolCall(
    toolName: string,
    rawInput: any,
    context: CapabilityExecutionContext
  ): Promise<any> {
    const capabilityId = toolName.replace('_', '.'); // e.g. memory_read -> memory.read

    logger.info({ toolName, capabilityId }, `🔧 CapabilityToolMapper: Routing tool call [${toolName}] to Capability [${capabilityId}]`);

    const result = await this.router.executeCapability(capabilityId, rawInput, context);
    return result;
  }
}

/** Singleton instance export for CapabilityToolMapper */
export const capabilityToolMapper = new CapabilityToolMapper();
