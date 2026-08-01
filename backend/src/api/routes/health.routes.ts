import { Router } from 'express';
import { getHealthStatus } from '../controllers/health.controller.js';

const router = Router();

/**
 * GET /api/v1/health
 * Public health check endpoint for monitoring system health & DB status.
 */
router.get('/health', getHealthStatus);

export default router;
