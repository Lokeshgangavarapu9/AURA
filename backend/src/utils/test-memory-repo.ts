import { sqliteMemoryRepository } from '../memory/storage/sqlite.repository.js';
import { logger } from './logger.js';

async function testMemoryRepository() {
  logger.info('🧪 Testing SqliteMemoryRepository CRUD Operations...');

  // 1. User Profile CRUD
  const profile = await sqliteMemoryRepository.updateUserProfile({
    name: 'Alex',
    age: 22,
    occupation: 'Software Engineer',
    college: 'Stanford University',
    bio: 'Loves AI, Web3, and Matcha.',
  });
  logger.info({ profile }, '✅ UserProfile Updated');

  // 2. Create Memory Fact
  const fact = await sqliteMemoryRepository.createMemoryFact({
    category: 'preference',
    key: 'Favorite Drink',
    value: 'Matcha Latte with Almond Milk',
    importance: 8,
    confidence: 0.95,
  });
  logger.info({ fact }, '✅ MemoryFact Created');

  // 3. Search Memory Facts
  const results = await sqliteMemoryRepository.findRelevantFacts({
    keywords: ['Matcha'],
    minImportance: 5,
  });
  logger.info({ count: results.length, results }, '✅ MemoryFact Search Results');

  // 4. Create Reflection
  const reflection = await sqliteMemoryRepository.createReflection({
    summary: 'Alex expressed enthusiasm for building autonomous AI companions.',
    sentiment: 'positive',
  });
  logger.info({ reflection }, '✅ Reflection Created');

  logger.info('🎉 All SqliteMemoryRepository CRUD Operations Passed Successfully!');
}

testMemoryRepository();
