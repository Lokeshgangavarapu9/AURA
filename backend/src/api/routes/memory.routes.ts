import { Router, Request, Response } from 'express';
import { sqliteMemoryRepository } from '../../memory/storage/sqlite.repository.js';
import { HTTP_STATUS } from '../../config/index.js';

const router = Router();

/**
 * GET /api/v1/memory
 * Retrieves all memory facts.
 */
router.get('/memory', async (req: Request, res: Response) => {
  try {
    const facts = await sqliteMemoryRepository.getAllMemoryFacts();
    res.status(HTTP_STATUS.OK).json({
      status: 'ok',
      data: facts,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      error: {
        code: 'MEMORY_FETCH_FAILED',
        message: 'Failed to retrieve memories',
      },
    });
  }
});

/**
 * DELETE /api/v1/memory/:id
 * Deletes a memory fact by ID.
 */
router.delete('/memory/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await sqliteMemoryRepository.deleteMemoryFact(id as string);
    if (success) {
      res.status(HTTP_STATUS.OK).json({
        status: 'ok',
        data: { id, deleted: true },
      });
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        error: {
          code: 'MEMORY_NOT_FOUND',
          message: `Memory with ID ${id} not found`,
        },
      });
    }
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      error: {
        code: 'MEMORY_DELETE_FAILED',
        message: 'Failed to delete memory fact',
      },
    });
  }
});

/**
 * GET /api/v1/profile
 * Retrieves the user profile.
 */
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const profile = await sqliteMemoryRepository.getUserProfile();
    res.status(HTTP_STATUS.OK).json({
      status: 'ok',
      data: profile || { name: 'User', bio: '', college: '', occupation: '', age: 0 },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      error: {
        code: 'PROFILE_FETCH_FAILED',
        message: 'Failed to retrieve profile',
      },
    });
  }
});

/**
 * PUT /api/v1/profile
 * Updates the user profile.
 */
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const profile = await sqliteMemoryRepository.updateUserProfile(req.body);
    res.status(HTTP_STATUS.OK).json({
      status: 'ok',
      data: profile,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      error: {
        code: 'PROFILE_UPDATE_FAILED',
        message: 'Failed to update profile',
      },
    });
  }
});

export default router;
