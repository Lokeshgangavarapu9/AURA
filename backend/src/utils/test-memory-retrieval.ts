import { sqliteMemoryRepository } from '../memory/storage/sqlite.repository.js';
import { memoryRetriever } from '../memory/retrieval/retriever.js';
import { PromptBuilder } from '../ai/prompt.builder.js';
import { logger } from './logger.js';

async function testMemoryRetrievalAndPromptInjection() {
  logger.info('🧪 Testing Memory Retrieval Engine & Prompt Injection Pipeline...');

  // 1. Seed DB with sample user identity & facts
  await sqliteMemoryRepository.updateUserProfile({
    name: 'Alex',
    age: 22,
    occupation: 'AI Software Engineer',
    college: 'Stanford University',
  });

  await sqliteMemoryRepository.createMemoryFact({
    category: 'preference',
    key: 'Favorite Beverage',
    value: 'Iced Matcha Latte with Oat Milk',
    importance: 9,
  });

  await sqliteMemoryRepository.createMemoryFact({
    category: 'goal',
    key: 'Daily Routine Goal',
    value: 'Practice 15 minutes of diaphragm breathing',
    importance: 8,
  });

  await sqliteMemoryRepository.createMemoryFact({
    category: 'relationship',
    key: 'Sister',
    value: 'Sarah',
    importance: 9,
  });

  // 2. Test System Instruction WITHOUT Memory
  const promptBefore = PromptBuilder.buildSystemInstruction(undefined);
  logger.info({ promptBeforeLength: promptBefore.length }, '✅ System Instruction BEFORE Memory Injection');

  // 3. Execute Memory Retriever for a sample query
  const userQuery = 'Hi Shizuka, what drink should I order today?';
  const workingMemory = await memoryRetriever.getWorkingMemory(userQuery);

  logger.info(
    {
      userQuery,
      tokensEst: workingMemory.totalTokensEstimate,
      factsFound: workingMemory.facts.length + workingMemory.preferences.length + workingMemory.goals.length,
    },
    '✅ WorkingMemory Constructed by Retriever'
  );

  // 4. Test System Instruction WITH Memory Injection
  const promptAfter = PromptBuilder.buildSystemInstruction(workingMemory);
  logger.info({ promptAfterLength: promptAfter.length }, '✅ System Instruction AFTER Memory Injection');

  console.log('\n======================================================');
  console.log('📄 EXCERPT OF GENERATED SYSTEM INSTRUCTION WITH MEMORY:');
  console.log('======================================================');
  console.log(promptAfter.slice(promptAfter.indexOf('=== RECALLED LONG-TERM MEMORY CONTEXT ===')));
  console.log('======================================================\n');

  logger.info('🎉 Memory Retrieval & Context Injection Test Completed Successfully!');
}

testMemoryRetrievalAndPromptInjection();
