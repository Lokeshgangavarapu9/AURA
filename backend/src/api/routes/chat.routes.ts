import { Router } from 'express';
import { handleChatMessage } from '../controllers/chat.controller.js';

const router = Router();

/**
 * POST /api/v1/chat
 * Primary chat endpoint for communicating with Gemini AI Engine.
 */
router.post('/chat', handleChatMessage);

export default router;
