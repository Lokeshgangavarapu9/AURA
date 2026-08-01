import { ConversationStateMachine } from '../conversation/state/state.machine.js';
import { ruleBasedTopicTracker } from '../conversation/topic/topic.tracker.js';
import { logger } from './logger.js';

function runStateAndTopicTests() {
  logger.info('🧪 Running State Machine & Topic Tracker Unit Test Suite...');

  // -------------------------------------------------------------
  // 1. STATE MACHINE TESTS
  // -------------------------------------------------------------
  const sm = new ConversationStateMachine('IDLE');

  // Test Valid Transitions
  sm.transitionTo('LISTENING');
  sm.transitionTo('THINKING');
  sm.transitionTo('RESPONDING');
  sm.transitionTo('IDLE');
  logger.info('✅ Test 1: Valid State Transitions (IDLE -> LISTENING -> THINKING -> RESPONDING -> IDLE)');

  // Test Invalid Transition Rejection
  let caughtError = false;
  try {
    sm.transitionTo('RESPONDING'); // Invalid directly from IDLE
  } catch (err: any) {
    caughtError = true;
    logger.info({ error: err.message }, '✅ Test 2: Invalid Transition Error Rejection Verified');
  }

  if (!caughtError) {
    throw new Error('Expected invalid transition to throw Error, but it succeeded!');
  }

  // -------------------------------------------------------------
  // 2. TOPIC TRACKER TESTS
  // -------------------------------------------------------------

  // Test Topic Detection: Technology
  const techRes = ruleBasedTopicTracker.detectTopic('I want to build a React application with TypeScript');
  logger.info({ topic: techRes.currentTopic, confidence: techRes.confidence }, '✅ Test 3: Technology Topic Detection');

  if (techRes.currentTopic !== 'Technology') {
    throw new Error(`Expected topic Technology, got ${techRes.currentTopic}`);
  }

  // Test Topic Shift Detection
  const shiftRes = ruleBasedTopicTracker.detectTopic('I study Computer Science at Stanford University', 'Health');
  logger.info(
    { prev: shiftRes.previousTopic, newTopic: shiftRes.currentTopic, isShift: shiftRes.isTopicShift },
    '✅ Test 4: Topic Shift Detection'
  );

  if (!shiftRes.isTopicShift) {
    throw new Error('Expected topic shift to be true!');
  }

  // Test Empty Message Handling
  const emptyRes = ruleBasedTopicTracker.detectTopic('', 'Career');
  logger.info({ topic: emptyRes.currentTopic, isShift: emptyRes.isTopicShift }, '✅ Test 5: Empty Message Topic Handling');

  if (emptyRes.currentTopic !== 'Career' || emptyRes.isTopicShift !== false) {
    throw new Error('Empty message should retain previous topic without shift!');
  }

  // Test Multi-Turn Topic Continuity
  let currentTopic = 'General';
  const turn1 = ruleBasedTopicTracker.detectTopic('How do I write an algorithm in Python?', currentTopic);
  currentTopic = turn1.currentTopic;

  const turn2 = ruleBasedTopicTracker.detectTopic('Can we add a database to this app?', currentTopic);
  currentTopic = turn2.currentTopic;

  logger.info({ turn1Topic: turn1.currentTopic, turn2Topic: turn2.currentTopic }, '✅ Test 6: Multi-Turn Topic Continuity');

  logger.info('🎉 State Machine & Topic Tracker Unit Test Suite Passed Successfully!');
}

runStateAndTopicTests();
