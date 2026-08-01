import { Request, Response } from 'express';
import { prisma } from '../../database/client.js';
import { env, APP_CONSTANTS, HTTP_STATUS } from '../../config/index.js';

/**
 * Enhanced Health Check Controller
 * Verifies system status, uptime, database connectivity, and environment parameters.
 */
export const getHealthStatus = async (req: Request, res: Response): Promise<void> => {
  let dbStatus = 'disconnected';

  try {
    // Quick ping query to verify database connectivity
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  res.status(HTTP_STATUS.OK).json({
    status: 'ok',
    service: APP_CONSTANTS.APP_NAME,
    version: '1.0.0',
    environment: env.NODE_ENV,
    database: dbStatus,
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
};
