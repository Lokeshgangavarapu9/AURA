/**
 * AURA Voice & STT Suite Tests (Mission 5.8b)
 * Validates GoogleSpeechToTextProvider, SpeechProviderManager,
 * partial/final transcripts, and Developer Mode UI settings.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  GoogleSpeechToTextProvider,
  SpeechProviderManager,
  VoiceManager,
  VoiceSessionManager,
  VoiceState,
} from '../src/voice/index.js';

describe('Mission 5.8b — Production Voice & STT Integration Tests', () => {
  it('should initialize and transcribe audio with GoogleSpeechToTextProvider', async () => {
    const provider = new GoogleSpeechToTextProvider();
    await provider.initialize({
      sttProvider: 'google-stt',
      ttsProvider: 'mock-tts',
      language: 'en-US',
      sampleRate: 16000,
      streaming: true,
      voiceTimeoutMs: 15000,
      interimResults: true,
      autoPunctuation: true,
      confidenceThreshold: 0.7,
    });

    const sampleAudio = new Uint8Array([1, 2, 3, 4, 5]);
    const result = await provider.transcribe(sampleAudio);

    assert.equal(result.isFinal, true);
    assert.ok(result.text.length > 0);
    assert.ok(result.confidence >= 0.7);
    assert.equal(result.language, 'en-US');
  });

  it('should handle streaming partial and final transcriptions in GoogleSpeechToTextProvider', async () => {
    const provider = new GoogleSpeechToTextProvider();
    await provider.initialize({
      sttProvider: 'google-stt',
      ttsProvider: 'mock-tts',
      language: 'en-US',
      sampleRate: 16000,
      streaming: true,
      voiceTimeoutMs: 15000,
      interimResults: true,
      autoPunctuation: true,
      confidenceThreshold: 0.7,
    });

    const { inputStream, onTranscription } = await provider.createStream();
    const results: string[] = [];

    onTranscription((res) => {
      results.push(res.text);
    });

    inputStream.pushChunk(new Uint8Array([10, 20, 30]));
    inputStream.finish();

    assert.ok(results.length >= 2);
    assert.ok(results.some((t) => t.includes('Listening')));
    assert.ok(results.some((t) => t.includes('Hello Shizuka')));
  });

  it('should register and manage multiple STT/TTS providers in SpeechProviderManager', () => {
    const mgr = new SpeechProviderManager();

    const activeSTT = mgr.getSTTProvider();
    assert.equal(activeSTT.providerId, 'google-stt');

    mgr.setActiveSTTProvider('mock-stt');
    assert.equal(mgr.getSTTProvider().providerId, 'mock-stt');

    const sttList = mgr.listSTTProviders();
    assert.ok(sttList.some((p) => p.id === 'google-stt'));
    assert.ok(sttList.some((p) => p.id === 'mock-stt'));
  });

  it('should execute VoiceManager turn with Google STT Provider smoothly', async () => {
    const sessionManager = new VoiceSessionManager();
    const googleSTT = new GoogleSpeechToTextProvider();
    const voiceManager = new VoiceManager(
      { sttProvider: 'google-stt' },
      googleSTT,
      undefined,
      new SpeechProviderManager(),
      sessionManager
    );

    await voiceManager.initialize();

    const result = await voiceManager.processVoiceTurn({
      audioChunk: new Uint8Array([100, 101, 102]),
    });

    assert.ok(result.userTranscription.length > 0);
    assert.ok(result.aiResponseText.length > 0);
    assert.equal(result.sttResult.confidence, 0.95);
  });
});
