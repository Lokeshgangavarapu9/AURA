/**
 * AURA Capability Runtime — Phase 5.6c Test Suite
 * Validates ICapability, CapabilityRegistry, SecurityRouter, Internal Capability Wrappers, and Tool Mapper.
 */

import {
  capabilityRegistry,
  capabilitySecurityRouter,
  capabilityToolMapper,
  CapabilityCategory,
  CapabilityPermission,
  CapabilityExecutionContext,
} from '../capabilities/index.js';
import { runtimeOrchestrator } from '../runtime/index.js';
import { logger } from './logger.js';

async function runPhase56cTests() {
  logger.info('🧪 Starting Phase 5.6c Capability Runtime & Security Router Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      logger.info(`✅ ${testName}${detail ? ` (${detail})` : ''}`);
      passed++;
    } else {
      logger.error(`❌ ${testName}${detail ? ` (${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // Build dummy execution context
    const orchestratorRes = await runtimeOrchestrator.executeTurn({
      userMessage: 'Initialize capability context',
    });

    const executionContext: CapabilityExecutionContext = {
      runtimeContext: orchestratorRes.runtimeContext,
      requestedBy: 'test-runner',
      requestTimestamp: new Date(),
      grantedPermissions: [
        CapabilityPermission.READ_MEMORY,
        CapabilityPermission.WRITE_MEMORY,
        CapabilityPermission.READ_RELATIONSHIP,
        CapabilityPermission.READ_EMOTION,
        CapabilityPermission.READ_PROFILE,
        CapabilityPermission.READ_SETTINGS,
      ],
    };

    // T1: CapabilityRegistry Discovery & Listing
    const registered = capabilityRegistry.listAll();
    assert(registered.length >= 6, 'T1: CapabilityRegistry has internal capabilities registered', `Count: ${registered.length}`);

    const memoryCaps = capabilityRegistry.listByCategory(CapabilityCategory.MEMORY);
    assert(memoryCaps.length >= 2, 'T2: CapabilityRegistry filters by MEMORY category');

    // T2: Health Checks Across Registry
    const health = await capabilityRegistry.checkAllHealth();
    assert(health['memory.read'] === true, 'T3: Health check for memory.read is true');
    assert(health['emotion.read'] === true, 'T4: Health check for emotion.read is true');

    // T3: Security Router Execution with Granted Permissions
    const readMemoryResult = await capabilitySecurityRouter.executeCapability(
      'memory.read',
      { query: 'tech preferences' },
      executionContext
    );
    assert(readMemoryResult.success === true, 'T5: SecurityRouter executes memory.read successfully');

    const readEmotionResult = await capabilitySecurityRouter.executeCapability(
      'emotion.read',
      { text: 'I feel super excited today!' },
      executionContext
    );
    assert(readEmotionResult.success === true && (readEmotionResult.data as any)?.primaryEmotion === 'excited', 'T6: SecurityRouter executes emotion.read successfully');

    // T4: Security Router Rejection on Missing Permission
    const restrictedContext: CapabilityExecutionContext = {
      ...executionContext,
      grantedPermissions: [], // No permissions
    };

    const deniedResult = await capabilitySecurityRouter.executeCapability(
      'memory.read',
      { query: 'test' },
      restrictedContext
    );
    assert(deniedResult.success === false, 'T7: SecurityRouter rejects execution when permission is missing');
    assert(Boolean(deniedResult.error?.includes('Permission Denied')), 'T8: SecurityRouter produces permission denied error message');

    // T5: Security Router Input Validation Rejection
    const invalidInputResult = await capabilitySecurityRouter.executeCapability(
      'memory.read',
      { query: '' }, // Empty query
      executionContext
    );
    assert(invalidInputResult.success === false, 'T9: SecurityRouter rejects execution on invalid input parameters');

    // T6: Tool Mapper Schema Generation
    const providerToolSchemas = capabilityToolMapper.generateProviderToolSchemas();
    assert(providerToolSchemas.length >= 6, 'T10: CapabilityToolMapper generates IAuraFunctionSchema list');
    assert(providerToolSchemas.some((s) => s.name === 'memory_read'), 'T11: CapabilityToolMapper maps memory.read to memory_read function schema');

    // T7: Tool Mapper Tool Execution Routing
    const toolCallResult = await capabilityToolMapper.executeToolCall(
      'emotion_read',
      { text: 'Everything is calm and clear' },
      executionContext
    );
    assert(toolCallResult.success === true, 'T12: CapabilityToolMapper routes tool call emotion_read to Capability SecurityRouter');

    logger.info(`\n📊 Phase 5.6c Capability Runtime Tests: ${passed} passed, ${failed} failed`);
    if (failed === 0) {
      logger.info('🎉 All Capability Runtime & Security Router tests passed successfully!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    logger.error({ err }, '❌ Phase 5.6c test suite threw an unhandled error');
    process.exit(1);
  }
}

runPhase56cTests();
