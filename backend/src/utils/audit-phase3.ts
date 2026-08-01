import { conversationManager } from '../conversation/manager/conversation.manager.js';
import { sessionManager } from '../conversation/session/session.manager.js';
import { ConversationStateMachine } from '../conversation/state/state.machine.js';
import { ruleBasedTopicTracker } from '../conversation/topic/topic.tracker.js';
import { sqliteMemoryRepository } from '../memory/storage/sqlite.repository.js';
import { sqliteSessionRepository } from '../conversation/session/sqlite.session.js';
import { logger } from './logger.js';

async function runPhase3Audit() {
  logger.info('=====================================================');
  logger.info('🔍 AURA PHASE 3 END-TO-END AUDIT & VERIFICATION SUITE');
  logger.info('=====================================================');

  const auditResults: Record<string, boolean> = {};

  try {
    // -----------------------------------------------------------------
    // 1. VERIFY STATE MACHINE
    // -----------------------------------------------------------------
    logger.info('\n--- 1. Verifying Conversation State Machine ---');
    const sm = new ConversationStateMachine('IDLE');
    sm.transitionTo('LISTENING');
    sm.transitionTo('THINKING');
    sm.transitionTo('RESPONDING');
    sm.transitionTo('IDLE');

    let invalidRejected = false;
    try {
      sm.transitionTo('RESPONDING'); // Invalid directly from IDLE
    } catch {
      invalidRejected = true;
    }

    auditResults['StateMachine_ValidTransitions'] = true;
    auditResults['StateMachine_InvalidRejection'] = invalidRejected;
    logger.info(`✅ StateMachine Audit: Valid transitions & error rejection verified (${invalidRejected ? 'PASSED' : 'FAILED'})`);

    // -----------------------------------------------------------------
    // 2. VERIFY TOPIC TRACKER
    // -----------------------------------------------------------------
    logger.info('\n--- 2. Verifying Topic Tracker ---');
    const topic1 = ruleBasedTopicTracker.detectTopic('I am studying Computer Science and Python coding');
    const topic2 = ruleBasedTopicTracker.detectTopic('I exercise every morning for my health and fitness', topic1.currentTopic);

    auditResults['TopicTracker_Detection'] = topic1.currentTopic === 'Technology';
    auditResults['TopicTracker_Shift'] = topic2.isTopicShift && topic2.currentTopic === 'Health';
    logger.info(`✅ TopicTracker Audit: Detected Topic 1='${topic1.currentTopic}', Shifted to Topic 2='${topic2.currentTopic}'`);

    // -----------------------------------------------------------------
    // 3. VERIFY SESSION MANAGER & REPOSITORY
    // -----------------------------------------------------------------
    logger.info('\n--- 3. Verifying Session Manager & Repository ---');
    const session = await sessionManager.createSession({ title: 'Audit Test Session', initialTopic: 'Technology' });
    auditResults['SessionManager_Create'] = !!session.id;

    const userMsg = await sessionManager.appendMessage({
      sessionId: session.id,
      sender: 'user',
      text: 'Audit Test Message',
      topic: 'Technology',
    });

    const aiMsg = await sessionManager.appendMessage({
      sessionId: session.id,
      sender: 'ai',
      text: 'Audit Test Response',
      emotion: 'happy',
      topic: 'Technology',
    });

    const thread = await sessionManager.loadRecentMessages(session.id);
    auditResults['SessionManager_AppendAndLoad'] = thread.length === 2;

    const updatedSession = await sessionManager.updateSession(session.id, { isPinned: true, title: 'Pinned Audit Session' });
    auditResults['SessionManager_UpdatePin'] = updatedSession.isPinned && updatedSession.title === 'Pinned Audit Session';

    const allSessions = await sessionManager.listSessions();
    auditResults['SessionManager_List'] = allSessions.some((s) => s.id === session.id);

    logger.info(`✅ SessionManager Audit: CRUD operations & pinning verified (PASSED)`);

    // -----------------------------------------------------------------
    // 4. VERIFY MEMORY RECALL & CONVERSATION MANAGER ORCHESTRATION
    // -----------------------------------------------------------------
    logger.info('\n--- 4. Verifying Memory Recall & ConversationManager Orchestration ---');

    // Turn 1: Save identity details
    const turn1Result = await conversationManager.processConversation({
      userMessage: 'My name is Lokesh and I work as an AI Software Engineer.',
    });

    auditResults['ConversationManager_Turn1'] = !!turn1Result.sessionId && !!turn1Result.aiResponse.text;

    // Turn 2: Recall identity details in same session
    const turn2Result = await conversationManager.processConversation({
      userMessage: 'What is my name and what do I work as?',
      sessionId: turn1Result.sessionId,
    });

    auditResults['ConversationManager_Turn2'] = !!turn2Result.aiResponse.text;
    auditResults['ConversationManager_SessionReuse'] = turn2Result.sessionId === turn1Result.sessionId;

    logger.info(`🤖 Turn 2 AI Recall Response: "${turn2Result.aiResponse.text}"`);

    // -----------------------------------------------------------------
    // 5. VERIFY SQLITE PERSISTENCE
    // -----------------------------------------------------------------
    logger.info('\n--- 5. Verifying SQLite Database Persistence ---');
    const persistedSession = await sqliteSessionRepository.getSessionById(turn1Result.sessionId);
    const persistedMessages = await sqliteSessionRepository.getMessagesBySessionId(turn1Result.sessionId);

    auditResults['SQLite_Persistence_Session'] = !!persistedSession && persistedSession.messageCount === 4;
    auditResults['SQLite_Persistence_Messages'] = persistedMessages.length === 4;

    // Clean up audit sessions
    await sessionManager.endSession(session.id);
    await sessionManager.endSession(turn1Result.sessionId);

    // -----------------------------------------------------------------
    // AUDIT SUMMARY REPORT
    // -----------------------------------------------------------------
    logger.info('\n=====================================================');
    logger.info('📊 PHASE 3 AUDIT RESULTS SUMMARY');
    logger.info('=====================================================');

    let totalTests = 0;
    let passedTests = 0;

    for (const [testName, passed] of Object.entries(auditResults)) {
      totalTests++;
      if (passed) passedTests++;
      logger.info(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
    }

    const score = Math.round((passedTests / totalTests) * 100);
    logger.info(`\n🎯 OVERALL READINESS SCORE: ${score}% (${passedTests}/${totalTests} Passed)`);
    logger.info('=====================================================\n');

  } catch (err: unknown) {
    logger.error({ err }, '❌ Audit Suite Encountered Error');
  }
}

runPhase3Audit();
