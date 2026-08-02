import { Router, Request, Response } from 'express';
import { prisma } from '../../database/client.js';
import { HTTP_STATUS } from '../../config/index.js';

const router = Router();

const DEFAULT_SETTINGS_ID = 'default';

// GET /api/v1/settings
router.get('/settings', async (req: Request, res: Response) => {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: DEFAULT_SETTINGS_ID },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: DEFAULT_SETTINGS_ID },
      });
    }

    res.status(HTTP_STATUS.OK).json({
      status: 'ok',
      data: settings,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      error: {
        code: 'SETTINGS_FETCH_FAILED',
        message: 'Failed to retrieve settings',
      },
    });
  }
});

// PUT /api/v1/settings
router.put('/settings', async (req: Request, res: Response) => {
  try {
    const updated = await prisma.settings.upsert({
      where: { id: DEFAULT_SETTINGS_ID },
      update: req.body,
      create: {
        ...req.body,
        id: DEFAULT_SETTINGS_ID,
      },
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'ok',
      data: updated,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      error: {
        code: 'SETTINGS_UPDATE_FAILED',
        message: 'Failed to update settings',
      },
    });
  }
});

export default router;
