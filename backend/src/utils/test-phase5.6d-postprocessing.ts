/**
 * AURA Core Runtime — Phase 5.6d Test Suite
 * Validates RuntimeEventBus, AnalyticsTracker, PostProcessingEngine, and Non-blocking Feedback Loops.
 */

import {
  runtimeEventBus,
  analyticsTracker,
  postProcessingEngine,
  runtimeOrchestrator,
  RuntimeEventPayload,
} from '../runtime/index.js';
import { logger } from './logger.js';

async function runPhase56dTests() {
  logger.info('🧪 Starting Phase 5.6d Post-Processing Engine & Learning Evolution Tests...\n');

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
    // T1: RuntimeEventBus Publication & Subscription
    let eventReceived = false;
    let receivedPayload: any = null;

    const listener = (payload: any) => {
      eventReceived = true;
      receivedPayload = payload;
    };

    runtimeEventBus.subscribe('ConversationCompleted', listener);
    runtimeEventBus.publish('ConversationCompleted', 'test-session-56d', { turnCount: 1 });

    assert(Boolean(eventReceived), 'T1: RuntimeEventBus fires event listener on publication');
    assert(receivedPayload?.sessionId === 'test-session-56d', 'T2: RuntimeEventBus passes correct sessionId payload');

    runtimeEventBus.unsubscribe('ConversationCompleted', listener);

    // T2: AnalyticsTracker Telemetry Metric Recording
    analyticsTracker.recordTurnMetric({
      sessionId: 'test-session-analytics',
      providerUsed: 'gemini',
      modelUsed: 'gemini-2.5-flash',
      contextAssemblyMs: 12,
      providerLatencyMs: 120,
      totalTurnTimeMs: 132,
      timestamp: new Date(),
    });

    analyticsTracker.recordCapabilityCall('memory.read');
    analyticsTracker.recordCapabilityCall('memory.read');

    const telemetry = analyticsTracker.getTelemetrySummary();
    assert(telemetry.totalTurnsTracked >= 1, 'T3: AnalyticsTracker records turn telemetry');
    assert(telemetry.averageProviderLatencyMs > 0, 'T4: AnalyticsTracker computes average provider latency');
    assert(telemetry.capabilityCounts['memory.read'] === 2, 'T5: AnalyticsTracker records capability call counts');

    // T3: End-to-End Orchestrator Post-Processing Integration
    let conversationCompletedEventFired = false;
    runtimeEventBus.subscribe('ConversationCompleted', (p) => {
      if (p.sessionId === 'session-e2e-56d') {
        conversationCompletedEventFired = true;
      }
    });

    const turnResult = await runtimeOrchestrator.executeTurn({
      userMessage: 'Testing end-to-end post processing event triggers',
      sessionId: 'session-e2e-56d',
    });

    assert(Boolean(turnResult.responseText), 'T6: RuntimeLifecycleOrchestrator completes turn output');

    // Allow setImmediate background post-processing to execute
    await new Promise((resolve) => setTimeout(resolve, 300));

    assert(Boolean(conversationCompletedEventFired), 'T7: PostProcessingEngine triggers background ConversationCompleted event');

    logger.info(`\n📊 Phase 5.6d Post-Processing Tests: ${passed} passed, ${failed} failed`);
    if (failed === 0) {
      logger.info('🎉 All Post-Processing Engine & Learning Evolution tests passed successfully!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    logger.error({ err }, '❌ Phase 5.6d test suite threw an unhandled error');
    process.exit(1);
  }
}

runPhase56dTests();
