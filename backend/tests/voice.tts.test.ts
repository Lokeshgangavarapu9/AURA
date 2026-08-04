/**
 * AURA Production Text-to-Speech Suite Tests (Mission 5.8c)
 * Validates GoogleTextToSpeechProvider, SpeechProviderManager TTS registration,
 * streaming audio creation, and AudioPlayerService queue/interruption handling.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  GoogleTextToSpeechProvider,
  SpeechProviderManager,
  VoiceManager,
  VoiceSessionManager,
} from '../src/voice/index.js';

describe('Mission 5.8c — Production Text-to-Speech Integration Tests', () => {
  it('should initialize and synthesize speech audio with GoogleTextToSpeechProvider', async () => {
    const provider = new GoogleTextToSpeechProvider();
    await provider.initialize({
      sttProvider: 'google-stt',
      ttsProvider: 'google-tts',
      language: 'en-US',
      sampleRate: 16000,
      streaming: true,
      voiceTimeoutMs: 15000,
      voiceName: 'en-US-Journey-F',
      speechRate: 1.0,
      pitch: 0.0,
      volume: 1.0,
      audioFormat: 'mp3',
    });

    const result = await provider.synthesize('Hello Lokesh, I am Shizuka.');

    assert.ok(result.audioChunk !== undefined);
    assert.equal(result.isFinal, true);
    assert.ok(result.durationMs > 0);
    assert.equal(result.sampleRate, 16000);
  });

  it('should create streaming audio output stream via GoogleTextToSpeechProvider', async () => {
    const provider = new GoogleTextToSpeechProvider();
    await provider.initialize({
      sttProvider: 'google-stt',
      ttsProvider: 'google-tts',
      language: 'en-US',
      sampleRate: 16000,
      streaming: true,
      voiceTimeoutMs: 15000,
    });

    async function* textGenerator() {
      yield 'Hello world, ';
      yield 'this is a streaming text to speech test.';
    }

    const outputStream = await provider.createStream(textGenerator());
    const receivedChunks: Uint8Array[] = [];

    outputStream.onData((chunk) => {
      receivedChunks.push(chunk);
    });

    await new Promise<void>((resolve) => {
      outputStream.onEnd(() => resolve());
    });

    assert.ok(receivedChunks.length >= 2);
  });

  it('should manage and switch TTS providers in SpeechProviderManager', () => {
    const mgr = new SpeechProviderManager();

    const activeTTS = mgr.getTTSProvider();
    assert.equal(activeTTS.providerId, 'google-tts');

    mgr.setActiveTTSProvider('mock-tts');
    assert.equal(mgr.getTTSProvider().providerId, 'mock-tts');

    const ttsList = mgr.listTTSProviders();
    assert.ok(ttsList.some((p) => p.id === 'google-tts'));
    assert.ok(ttsList.some((p) => p.id === 'mock-tts'));
  });

  it('should execute full VoiceManager turn using Google STT and Google TTS providers', async () => {
    const sessionManager = new VoiceSessionManager();
    const googleTTS = new GoogleTextToSpeechProvider();
    const voiceManager = new VoiceManager(
      { ttsProvider: 'google-tts' },
      undefined,
      googleTTS,
      new SpeechProviderManager(),
      sessionManager
    );

    await voiceManager.initialize();

    const result = await voiceManager.processVoiceTurn({
      transcriptionText: 'Hello Shizuka, what is the weather like?',
    });

    assert.equal(result.userTranscription, 'Hello Shizuka, what is the weather like?');
    assert.ok(result.aiResponseText.length > 0);
    assert.ok(result.aiAudio?.audioChunk !== undefined);
  });
});
