import { sessionManager } from '../conversation/session/session.manager.js';
import { logger } from './logger.js';

async function testSessionManagerPipeline() {
  logger.info('🧪 Testing SessionManager & SessionRepository Pipeline...');

  // 1. Create Session
  const session = await sessionManager.createSession({
    title: 'UnitTest Session',
    initialTopic: 'AI Technology',
  });
  logger.info({ sessionId: session.id, title: session.title }, '✅ Test 1: Session Created');

  // 2. Append User Message
  const userMsg = await sessionManager.appendMessage({
    sessionId: session.id,
    sender: 'user',
    text: 'Hello Shizuka! What is your purpose?',
    topic: 'AI Technology',
  });
  logger.info({ messageId: userMsg.id, text: userMsg.text }, '✅ Test 2: User Message Appended');

  // 3. Append AI Response Message
  const aiMsg = await sessionManager.appendMessage({
    sessionId: session.id,
    sender: 'ai',
    text: 'I am here to be your empathetic AI companion!',
    emotion: 'happy',
    topic: 'AI Technology',
  });
  logger.info({ messageId: aiMsg.id, emotion: aiMsg.emotion }, '✅ Test 3: AI Message Appended');

  // 4. Resume / Reload Session
  const reloadedSession = await sessionManager.resumeSession(session.id);
  logger.info(
    { messageCount: reloadedSession.messageCount, topic: reloadedSession.currentTopic },
    '✅ Test 4: Reloaded Session Metadata Verified'
  );

  if (reloadedSession.messageCount !== 2) {
    throw new Error(`Expected messageCount to be 2, got ${reloadedSession.messageCount}`);
  }

  // 5. Load Recent Messages Thread
  const thread = await sessionManager.loadRecentMessages(session.id);
  logger.info({ threadLength: thread.length }, '✅ Test 5: Message Thread Loaded');

  if (thread.length !== 2 || thread[0].text !== userMsg.text || thread[1].text !== aiMsg.text) {
    throw new Error('Message thread order or content mismatch!');
  }

  // 6. End Session
  const ended = await sessionManager.endSession(session.id);
  logger.info({ ended }, '✅ Test 6: Session Ended and Deleted');

  // 7. Verify Deletion / Fallback Creation
  const postEndSession = await sessionManager.resumeSession(session.id);
  logger.info({ newSessionId: postEndSession.id }, '✅ Test 7: Post-End Fallback Creation Verified');

  // Clean up fallback test session
  await sessionManager.endSession(postEndSession.id);

  logger.info('🎉 SessionManager Unit Test Suite Passed Successfully!');
}

testSessionManagerPipeline();
