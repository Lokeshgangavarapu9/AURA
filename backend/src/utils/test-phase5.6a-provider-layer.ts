/**
 * AURA AI Provider Layer — Phase 5.6a Test Suite
 * Validates IAIProviderAdapter implementations, Schema Conversion, Error Hierarchy, and ProviderManager switching.
 */

import {
  providerRegistry,
  providerManager,
  GeminiAdapter,
  OpenAIAdapter,
  IAuraFunctionSchema,
  ProviderAuthError,
  ProviderRateLimitError,
  ProviderTimeoutError,
} from '../ai/providers/index.js';
import { geminiService } from '../ai/gemini.service.js';
import { logger } from './logger.js';

async function runPhase56aTests() {
  logger.info('🧪 Starting Phase 5.6a AI Provider Abstraction Layer Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      logger.info(`✅ ${testName}${detail ? ` (${detail})` : ''}`);
      passed++;
    } else {
      logger.error(`❌ ${testName}${detail ? ` (${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // T1: Registry setup & default discovery
    const registered = providerRegistry.listProviders();
    assert(registered.includes('gemini') && registered.includes('openai'), 'T1: ProviderRegistry lists default Gemini and OpenAI adapters', `Found: ${registered.join(', ')}`);

    // T2: Gemini Adapter Instantiation & Model Metadata
    const geminiAdapter = new GeminiAdapter('test-gemini-key');
    assert(geminiAdapter.providerId === 'gemini', 'T2: GeminiAdapter providerId is "gemini"');
    assert(geminiAdapter.defaultModel === 'gemini-2.5-flash', 'T3: GeminiAdapter defaultModel is "gemini-2.5-flash"');

    // T3: OpenAI Adapter Instantiation & Model Metadata
    const openAIAdapter = new OpenAIAdapter('test-openai-key');
    assert(openAIAdapter.providerId === 'openai', 'T4: OpenAIAdapter providerId is "openai"');
    assert(openAIAdapter.defaultModel === 'gpt-4o-mini', 'T5: OpenAIAdapter defaultModel is "gpt-4o-mini"');

    // T4: Normalized Tool Schema Conversion for Gemini
    const sampleTools: IAuraFunctionSchema[] = [
      {
        name: 'searchMemory',
        description: 'Queries user memory facts by keyword',
        parameters: {
          type: 'object',
          properties: {
            keyword: { type: 'string', description: 'Search keyword' },
          },
          required: ['keyword'],
        },
      },
    ];

    const geminiTranslated: any = geminiAdapter.translateToolSchema(sampleTools);
    assert(
      geminiTranslated && Array.isArray(geminiTranslated) && geminiTranslated[0].functionDeclarations?.[0]?.name === 'searchMemory',
      'T6: GeminiAdapter translates IAuraFunctionSchema to FunctionDeclaration list correctly'
    );

    // T5: Normalized Tool Schema Conversion for OpenAI
    const openAITranslated: any = openAIAdapter.translateToolSchema(sampleTools);
    assert(
      openAITranslated && Array.isArray(openAITranslated) && openAITranslated[0].type === 'function' && openAITranslated[0].function?.name === 'searchMemory',
      'T7: OpenAIAdapter translates IAuraFunctionSchema to OpenAI tools format correctly'
    );

    // T6: ProviderManager Active Selection & Dynamic Switching
    assert(providerManager.getActiveProviderId() === 'gemini', 'T8: ProviderManager initializes default provider as Gemini');
    
    providerManager.setActiveProvider('openai', 'gpt-4o');
    assert(providerManager.getActiveProviderId() === 'openai', 'T9: ProviderManager switches active provider to "openai"');
    assert(providerManager.getActiveModelId() === 'gpt-4o', 'T10: ProviderManager updates active model to "gpt-4o"');

    // Reset back to gemini for default operation
    providerManager.setActiveProvider('gemini', 'gemini-2.5-flash');
    assert(providerManager.getActiveProviderId() === 'gemini', 'T11: ProviderManager switches back to "gemini"');

    // T7: Error Hierarchy & Identification
    const authErr = new ProviderAuthError('Invalid key', 401);
    assert(authErr.code === 'PROVIDER_AUTH_ERROR' && authErr.statusCode === 401, 'T12: ProviderAuthError instantiates with correct error code');

    const rateLimitErr = new ProviderRateLimitError('Too many requests', 429);
    assert(rateLimitErr.code === 'PROVIDER_RATE_LIMIT' && rateLimitErr.statusCode === 429, 'T13: ProviderRateLimitError instantiates with correct code');

    const timeoutErr = new ProviderTimeoutError('Request timed out', 408);
    assert(timeoutErr.code === 'PROVIDER_TIMEOUT', 'T14: ProviderTimeoutError instantiates with correct code');

    // T8: Backward Compatibility Check on GeminiService
    const serviceRes = await geminiService.generateChatResponse({
      message: 'Test provider abstraction layer connection',
    });
    assert(Boolean(serviceRes.text) && Boolean(serviceRes.emotion), 'T15: GeminiService executes smoothly through ProviderManager abstraction', `Emotion: ${serviceRes.emotion}`);

    logger.info(`\n📊 Phase 5.6a Provider Layer Tests: ${passed} passed, ${failed} failed`);
    if (failed === 0) {
      logger.info('🎉 All AI Provider Abstraction Layer tests passed successfully!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    logger.error({ err }, '❌ Phase 5.6a test suite threw an unhandled error');
    process.exit(1);
  }
}

runPhase56aTests();
