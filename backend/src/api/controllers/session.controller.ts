import { Request, Response } from 'express';
import { z } from 'zod';
import { sessionManager } from '../../conversation/session/session.manager.js';
import { HTTP_STATUS } from '../../config/index.js';

const createSessionSchema = z.object({
  title: z.string().optional(),
  initialTopic: z.string().optional(),
});

const updateSessionSchema = z.object({
  title: z.string().optional(),
  currentTopic: z.string().optional(),
  isPinned: z.boolean().optional(),
});

/**
 * Session Workspace Controller
 * Handles /api/v1/sessions endpoints for session management & thread history.
 */
export const sessionController = {
  /**
   * GET /api/v1/sessions — List all sessions
   */
  async listSessions(_req: Request, res: Response): Promise<void> {
    const sessions = await sessionManager.listSessions();
    res.status(HTTP_STATUS.OK).json({
      status: 'ok',
      data: sessions,
    });
  },

  /**
   * GET /api/v1/sessions/:id — Get session by ID + thread message history
   */
  async getSessionById(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const session = await sessionManager.getSession(id);

    if (!session) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        error: { code: 'SESSION_NOT_FOUND', message: 'Conversation session not found' },
      });
      return;
    }

    const messages = await sessionManager.loadRecentMessages(id, 100);

    res.status(HTTP_STATUS.OK).json({
      status: 'ok',
      data: {
        session,
        messages,
      },
    });
  },

  /**
   * POST /api/v1/sessions — Create new session
   */
  async createSession(req: Request, res: Response): Promise<void> {
    const validation = createSessionSchema.safeParse(req.body);
    const dto = validation.success ? validation.data : {};

    const session = await sessionManager.createSession(dto);
    res.status(HTTP_STATUS.CREATED).json({
      status: 'ok',
      data: session,
    });
  },

  /**
   * PATCH /api/v1/sessions/:id — Update session metadata (title, pinned state)
   */
  async updateSession(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const validation = updateSessionSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        error: { code: 'VALIDATION_ERROR', message: 'Invalid update body' },
      });
      return;
    }

    const updated = await sessionManager.updateSession(id, validation.data);
    res.status(HTTP_STATUS.OK).json({
      status: 'ok',
      data: updated,
    });
  },

  /**
   * DELETE /api/v1/sessions/:id — Delete session and its thread messages
   */
  async deleteSession(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const deleted = await sessionManager.endSession(id);

    if (!deleted) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        error: { code: 'SESSION_NOT_FOUND', message: 'Session not found for deletion' },
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      status: 'ok',
      data: { deleted: true, id },
    });
  },
};
