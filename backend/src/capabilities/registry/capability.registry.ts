/**
 * AURA Capability Runtime — CapabilityRegistry
 * O(1) Map-backed registry for capability discovery, resolution, and health monitoring.
 */

import { ICapability, CapabilityCategory } from '../types/capability.types.js';
import { logger } from '../../utils/logger.js';

export class CapabilityRegistry {
  private capabilities: Map<string, ICapability<any, any>> = new Map();

  /**
   * Registers a capability instance into the registry.
   */
  public register(capability: ICapability<any, any>): void {
    const id = capability.metadata.id.toLowerCase();
    this.capabilities.set(id, capability);
    logger.info(
      { capabilityId: capability.metadata.id, category: capability.metadata.category },
      `⚙️ Registered Capability: [${capability.metadata.id}] (${capability.metadata.name})`
    );
  }

  /**
   * Resolves a capability by ID in O(1) time.
   */
  public get(id: string): ICapability<any, any> | undefined {
    return this.capabilities.get(id.toLowerCase());
  }

  /**
   * Checks if capability exists.
   */
  public has(id: string): boolean {
    return this.capabilities.has(id.toLowerCase());
  }

  /**
   * Lists all registered capabilities.
   */
  public listAll(): ICapability<any, any>[] {
    return Array.from(this.capabilities.values());
  }

  /**
   * Lists capabilities filtered by category.
   */
  public listByCategory(category: CapabilityCategory): ICapability<any, any>[] {
    return this.listAll().filter((cap) => cap.metadata.category === category);
  }

  /**
   * Runs health checks across all registered capabilities.
   */
  public async checkAllHealth(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    for (const [id, cap] of this.capabilities.entries()) {
      try {
        results[id] = await cap.checkHealth();
      } catch {
        results[id] = false;
      }
    }
    return results;
  }
}

/** Singleton instance export for CapabilityRegistry */
export const capabilityRegistry = new CapabilityRegistry();
