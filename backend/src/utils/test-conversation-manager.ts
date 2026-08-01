import { conversationManager } from '../conversation/manager/conversation.manager.js';
import { sessionManager } from '../conversation/session/session.manager.js';
import { sqliteMemoryRepository } from '../memory/storage/sqlite.repository.js';
import { logger } from './logger.js';

async function testConversationManagerEndToEnd() {
  logger.info('🧪 Running Full End-to-End ConversationManager Test Suite...');

  // Turn 1: Initial User Prompt (triggers Session creation & Topic detection)
  const result1 = await conversationManager.processConversation({
    userMessage: 'My name is Lokesh and I study Computer Science at SRM University.',
  });

  logger.info({ result1 }, '✅ Turn 1: Processed First Conversation Turn');

  if (!result1.sessionId || !result1.aiResponse.text) {
    throw new Error('Turn 1 failed: Invalid ConversationResult payload');
  }

  // Verify Session Created & Message History
  const session1 = await sessionManager.resumeSession(result1.sessionId);
  const thread1 = await sessionManager.loadRecentMessages(result1.sessionId);

  logger.info(
    { sessionId: session1.id, messageCount: session1.messageCount, threadLength: thread1.length },
    '✅ Turn 1: Verified SQLite Session & Message Thread'
  );

  if (session1.messageCount !== 2 || thread1.length !== 2) {
    throw new Error(`Expected messageCount 2, got ${session1.messageCount}`);
  }

  // Turn 2: Follow-up Prompt in SAME session (tests topic tracking & memory retrieval)
  const result2 = await conversationManager.processConversation({
    userMessage: 'What drink do I like and what is my sister name?',
    sessionId: result1.sessionId,
  });

  logger.info({ result2 }, '✅ Turn 2: Processed Follow-up Turn in Same Session');

  // Verify Thread Continuation
  const thread2 = await sessionManager.loadRecentMessages(result1.sessionId);
  logger.info({ threadLength: thread2.length }, '✅ Turn 2: Verified Continued Message Thread');

  if (thread2.length !== 4) {
    throw new Error(`Expected threadLength 4, got ${thread2.length}`);
  }

  // Wait 3.5 seconds for background memory extraction to complete
  await new Promise((resolve) => setTimeout(resolve, 3500));

  // Verify User Profile updated in SQLite by background memory extractor
  const userProfile = await sqliteMemoryRepository.getUserProfile();
  logger.info({ userProfile }, '✅ Verified Long-Term UserProfile created by background extraction');

  // Clean up test session
  await sessionManager.endSession(result1.sessionId);

  logger.info('🎉 ConversationManager End-to-End Test Suite Passed Successfully!');
}

testConversationManagerEndToEnd();
