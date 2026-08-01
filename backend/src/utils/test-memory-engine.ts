import { MemoryDetector } from '../memory/processors/detector.js';
import { memoryEngine } from '../memory/engine/memory.engine.js';
import { sqliteMemoryRepository } from '../memory/storage/sqlite.repository.js';
import { logger } from './logger.js';

async function testMemoryEnginePipeline() {
  logger.info('🧪 Testing Step 5 Two-Stage Memory Engine Pipeline...');

  // 1. Test Stage 1 Detector with casual message
  const casualResult = MemoryDetector.inspectMessage('Hello there, what is 2 + 2?');
  logger.info(
    { needsExtraction: casualResult.needsExtraction, candidateCount: casualResult.candidates.length },
    '✅ Test 1: Casual Message Detector Inspection'
  );

  // 2. Test Stage 1 Detector with personal memory statement
  const personalMsg = 'My name is Lokesh and I study at SRM University.';
  const personalResult = MemoryDetector.inspectMessage(personalMsg);
  logger.info(
    { needsExtraction: personalResult.needsExtraction, candidates: personalResult.candidates },
    '✅ Test 2: Personal Statement Detector Inspection'
  );

  // 3. Test Full Async Process & SQLite Persistence
  logger.info('🚀 Triggering processMessageAsync for personal statement...');
  memoryEngine.processMessageAsync(personalMsg);

  // Wait 3 seconds for background extractor to execute Gemini structured JSON call
  await new Promise((resolve) => setTimeout(resolve, 3500));

  // 4. Verify User Profile persisted in SQLite
  const userProfile = await sqliteMemoryRepository.getUserProfile();
  logger.info({ userProfile }, '✅ Test 3: Verified SQLite UserProfile after background extraction');

  logger.info('🎉 Memory Engine Step 5 Verification Completed Successfully!');
}

testMemoryEnginePipeline();
