import { env, APP_CONSTANTS } from '../config/index.js';
import { logger } from './logger.js';
import { connectDatabase, disconnectDatabase, prisma } from '../database/client.js';

/**
 * Verification Test Script for Step 3 Setup
 * Verifies that env variables are parsed, logger works, and SQLite connects cleanly.
 */
async function testBackendFoundation() {
  logger.info(`🚀 Starting ${APP_CONSTANTS.APP_NAME} Verification Test...`);
  logger.info(`📌 Node Environment: ${env.NODE_ENV}`);
  logger.info(`📌 Target Port: ${env.PORT}`);
  logger.info(`📌 Database Target: ${env.DATABASE_URL}`);

  try {
    await connectDatabase();

    // Query User count to confirm SQLite read capability
    const userCount = await prisma.user.count();
    logger.info(`✅ SQLite Query Success: Found ${userCount} users in database.`);

    await disconnectDatabase();
    logger.info('🎉 Step 3 Backend Foundation Test PASSED 100%!');
  } catch (error) {
    logger.error({ err: error }, '❌ Step 3 Verification Test Failed');
    process.exit(1);
  }
}

testBackendFoundation();
