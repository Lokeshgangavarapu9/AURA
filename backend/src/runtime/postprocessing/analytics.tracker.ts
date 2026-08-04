/**
 * AURA Core Runtime — Analytics Telemetry Tracker
 * Tracks execution metrics (provider latency, context assembly duration, capability usage stats).
 */

import { logger } from '../../utils/logger.js';

export interface TurnTelemetryMetric {
  sessionId: string;
  providerUsed: string;
  modelUsed: string;
  contextAssemblyMs: number;
  providerLatencyMs: number;
  totalTurnTimeMs: number;
  timestamp: Date;
}

export class AnalyticsTracker {
  private turnMetrics: TurnTelemetryMetric[] = [];
  private capabilityCallCounts: Map<string, number> = new Map();

  /**
   * Records execution metrics for a completed turn.
   */
  public recordTurnMetric(metric: TurnTelemetryMetric): void {
    this.turnMetrics.push(metric);
    if (this.turnMetrics.length > 500) {
      this.turnMetrics.shift(); // Evict oldest metric
    }

    logger.debug(
      {
        sessionId: metric.sessionId,
        latencyMs: metric.providerLatencyMs,
        totalTimeMs: metric.totalTurnTimeMs,
      },
      '📊 AnalyticsTracker: Turn telemetry recorded'
    );
  }

  /**
   * Increments invocation counter for a capability.
   */
  public recordCapabilityCall(capabilityId: string): void {
    const current = this.capabilityCallCounts.get(capabilityId) || 0;
    this.capabilityCallCounts.set(capabilityId, current + 1);
  }

  /**
   * Calculates runtime telemetry summary statistics.
   */
  public getTelemetrySummary(): {
    totalTurnsTracked: number;
    averageProviderLatencyMs: number;
    averageTotalTurnTimeMs: number;
    capabilityCounts: Record<string, number>;
  } {
    const total = this.turnMetrics.length;
    if (total === 0) {
      return {
        totalTurnsTracked: 0,
        averageProviderLatencyMs: 0,
        averageTotalTurnTimeMs: 0,
        capabilityCounts: Object.fromEntries(this.capabilityCallCounts.entries()),
      };
    }

    const avgLatency = Math.round(this.turnMetrics.reduce((sum, m) => sum + m.providerLatencyMs, 0) / total);
    const avgTotal = Math.round(this.turnMetrics.reduce((sum, m) => sum + m.totalTurnTimeMs, 0) / total);

    return {
      totalTurnsTracked: total,
      averageProviderLatencyMs: avgLatency,
      averageTotalTurnTimeMs: avgTotal,
      capabilityCounts: Object.fromEntries(this.capabilityCallCounts.entries()),
    };
  }
}

/** Singleton instance export for AnalyticsTracker */
export const analyticsTracker = new AnalyticsTracker();
