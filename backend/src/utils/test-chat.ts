import { geminiService } from '../ai/gemini.service.js';
import { logger } from './logger.js';

async function testChatService() {
  logger.info('🧪 Testing Gemini Service Direct Chat Generation...');

  const result = await geminiService.generateChatResponse({
    message: 'Hello Shizuka! Tell me something inspiring today.',
    history: [
      { sender: 'user', text: 'Hi!' },
      { sender: 'ai', text: 'Hello! I am happy to see you.' },
    ],
  });

  logger.info({ result }, '✅ Chat Response Generation Result');
}

testChatService();
