import { conversationManager } from '../conversation/manager/conversation.manager.js';
import { relationshipAnalyzer } from '../relationship/analyzer/relationship.analyzer.js';
import { PromptBuilder } from '../ai/prompt.builder.js';
import { MemoryScorer } from '../memory/scoring/scorer.js';
import { MemoryFactEntity } from '../memory/types/index.js';
import { sessionManager } from '../conversation/session/session.manager.js';
import { logger } from './logger.js';

async function runRelationshipIntegrationTests() {
  logger.info('🧪 Running Relationship & Personalization Engine Integration Test Suite...');

  // 1. Verify RelationshipAnalyzer Execution
  const text = 'I am so excited to share my secret goal with you, thank you!';
  const relResult = relationshipAnalyzer.analyze({ userId: 'test-user-1', userMessage: text });
  logger.info({ level: relResult.context.level, health: relResult.context.metrics.relationshipHealth, W_rel: relResult.context.relationshipWeight }, '✅ Test 1: RelationshipAnalyzer executed');

  if (!relResult.context.directive || !relResult.context.relationshipWeight) {
    throw new Error('Test 1 Failed: RelationshipAnalyzer output context missing directive or weight!');
  }

  // 2. Verify PromptBuilder Personality Directive Injection
  const promptInstruction = PromptBuilder.buildSystemInstruction(undefined, undefined, undefined, relResult.context);
  logger.info('✅ Test 2: PromptBuilder generated instruction containing relationship directives');

  if (!promptInstruction.includes('RELATIONSHIP & PERSONALITY DIRECTIVES') || !promptInstruction.includes('Relationship Level')) {
    throw new Error('Test 2 Failed: PromptBuilder missing Relationship directives section!');
  }

  // 3. Verify MemoryScorer W_rel Consumption & Backward Compatibility
  const dummyFact: MemoryFactEntity = {
    id: 'fact-rel-1',
    category: 'goal',
    key: 'career',
    value: 'Become AI Architect',
    confidence: 1.0,
    importance: 9,
    frequency: 4,
    lastUsedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const scoreWithoutWrel = MemoryScorer.scoreMemory(dummyFact, ['career'], new Date(), 1.0);
  const scoreWithWrel = MemoryScorer.scoreMemory(dummyFact, ['career'], new Date(), 1.0, 1.25);
  logger.info({ scoreWithoutWrel: scoreWithoutWrel.finalScore, scoreWithWrel: scoreWithWrel.finalScore }, '✅ Test 3: MemoryScorer W_rel scaling verified');

  if (scoreWithWrel.finalScore <= scoreWithoutWrel.finalScore) {
    throw new Error('Test 3 Failed: MemoryScorer W_rel multiplier scaling failed!');
  }

  // Backward compatibility check: score without W_rel parameter defaults to W_rel = 1.0
  const defaultWrelScore = MemoryScorer.scoreMemory(dummyFact, ['career'], new Date(), 1.0, undefined);
  if (defaultWrelScore.finalScore !== scoreWithoutWrel.finalScore) {
    throw new Error('Test 3 Failed: Backward compatibility failed when W_rel is absent!');
  }

  // 4. Verify ConversationManager Integration
  const convResult = await conversationManager.processConversation({
    userMessage: 'Hello AURA, I trust you and want to share my goal!',
  });

  logger.info(
    {
      sessionId: convResult.sessionId,
      aiEmotion: convResult.aiResponse.emotion,
      relationshipLevel: convResult.relationshipLevel,
      relationshipHealth: convResult.relationshipHealth,
    },
    '✅ Test 4: ConversationManager returned relational response'
  );

  if (!convResult.relationshipLevel || convResult.relationshipHealth === undefined) {
    throw new Error('Test 4 Failed: ConversationManager payload missing relationshipLevel or relationshipHealth!');
  }

  // Clean up test session
  await sessionManager.endSession(convResult.sessionId);

  logger.info('🎉 Relationship Engine Integration Test Suite Passed Successfully!');
}

runRelationshipIntegrationTests();
