import { Request, Response } from 'express';
import { HTTP_STATUS } from '../config/index.js';

/**
 * Global 404 Not Found Middleware
 * Catches any HTTP request targeting non-existent endpoints and returns a clean JSON error response.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    status: 'error',
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
    },
    timestamp: new Date().toISOString(),
  });
};
