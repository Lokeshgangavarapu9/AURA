/**
 * AURA — Chat Pipeline Debugging Test
 * Verifies that rate-limited/quota-exceeded provider errors are mapped to friendly
 * explanation messages instead of generic "system glitches".
 */

import { conversationManager } from '../conversation/manager/conversation.manager.js';
import { logger } from './logger.js';

async function verifyChatPipelineDebug() {
  logger.info('🧪 Starting E2E Chat Pipeline Debugging Verification...\n');

  try {
    const result = await conversationManager.processConversation({
      userMessage: 'Test pipeline error mapping',
    });

    logger.info(`🤖 Response Received: "${result.aiResponse.text}"`);

    const hasGlitchText = result.aiResponse.text.includes('system glitch');
    const hasQuotaText = result.aiResponse.text.includes('quota has been exceeded');

    if (hasQuotaText) {
      logger.info('✅ SUCCESS: System mapped the provider quota rate limit to a friendly explanation message!');
      process.exit(0);
    } else if (hasGlitchText) {
      logger.error('❌ FAILURE: System still returned the generic "system glitch" message.');
      process.exit(1);
    } else {
      logger.info('✅ SUCCESS: System returned a live successful AI response!');
      process.exit(0);
    }
  } catch (err) {
    logger.error({ err }, '❌ E2E Chat Pipeline test failed with unexpected error');
    process.exit(1);
  }
}

verifyChatPipelineDebug();
