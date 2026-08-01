import { logger } from './logger.js';

async function testHttpChatEndpoint() {
  logger.info('🧪 Testing HTTP POST /api/v1/chat endpoint...');

  try {
    const res = await fetch('http://localhost:5000/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello Shizuka, how are you feeling today?',
        history: [
          { sender: 'user', text: 'Hi!' },
          { sender: 'ai', text: 'Hello! I am happy to connect.' },
        ],
      }),
    });

    const data = await res.json();
    logger.info({ status: res.status, data }, '✅ HTTP Chat Endpoint Test Result');
  } catch (err) {
    logger.error({ err }, '❌ HTTP Chat Endpoint Test Failed');
  }
}

testHttpChatEndpoint();
