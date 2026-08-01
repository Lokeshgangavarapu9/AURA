import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, env } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * Global Error Handler Middleware
 * Catches unhandled application errors and converts them into standardized JSON error responses.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  logger.error(
    {
      requestId: req.requestId,
      err: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    },
    'Unhandled Server Error'
  );

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    },
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  });
};
