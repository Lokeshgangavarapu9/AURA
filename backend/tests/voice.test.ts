/**
 * AURA Voice Foundation Architecture — Test Suite (Mission 5.8a)
 * Validates VoiceManager, VoiceSessionManager, Voice State Machine, Stream Contracts,
 * STT/TTS Provider Abstractions, Runtime Integration, Emotion & Capability Hooks.
 */

import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  VoiceManager,
  VoiceSessionManager,
  VoiceStateMachine,
  VoiceState,
  VoiceInputStream,
  VoiceOutputStream,
  MockSpeechToTextProvider,
  MockTextToSpeechProvider,
  STTResult,
  TTSResult,
  IVoiceEmotionFeatureExtractor,
  IVoiceCapabilityChecker,
} from '../src/voice/index.js';

describe('Mission 5.8a — Voice Foundation Architecture Tests', () => {
  let voiceManager: VoiceManager;
  let sessionManager: VoiceSessionManager;

  beforeEach(() => {
    sessionManager = new VoiceSessionManager();
    voiceManager = new VoiceManager(
      { language: 'en-US', sampleRate: 16000 },
      new MockSpeechToTextProvider(),
      new MockTextToSpeechProvider(),
      sessionManager
    );
  });

  describe('1 & 4. VoiceSessionManager & Session Lifecycle', () => {
    it('should start a new voice session with default values', () => {
      const session = sessionManager.startSession({
        activeMicrophoneId: 'mic-1',
        activeSpeakerId: 'spk-1',
      });

      assert.ok(session.sessionId.startsWith('vsess-'));
      assert.equal(session.status, 'active');
      assert.equal(session.voiceState, VoiceState.IDLE);
      assert.equal(session.activeMicrophoneId, 'mic-1');
      assert.equal(session.activeSpeakerId, 'spk-1');
    });

    it('should handle pause, resume, cancel, and stop session lifecycle', () => {
      const session = sessionManager.startSession();
      const id = session.sessionId;

      assert.equal(sessionManager.pauseSession(id), true);
      assert.equal(sessionManager.getSession(id)?.status, 'paused');

      assert.equal(sessionManager.resumeSession(id), true);
      assert.equal(sessionManager.getSession(id)?.status, 'active');

      assert.equal(sessionManager.cancelSession(id, 'Testing cancel'), true);
      assert.equal(sessionManager.getSession(id)?.metrics.interruptionsCount, 1);

      assert.equal(sessionManager.stopSession(id), true);
      assert.equal(sessionManager.getSession(id), undefined);
    });
  });

  describe('6. Voice State Machine & Interruption Flow', () => {
    it('should transition through valid voice states smoothly', () => {
      const sm = new VoiceStateMachine(VoiceState.IDLE);

      assert.equal(sm.getState(), VoiceState.IDLE);
      assert.equal(sm.transitionTo(VoiceState.LISTENING), true);
      assert.equal(sm.transitionTo(VoiceState.TRANSCRIBING), true);
      assert.equal(sm.transitionTo(VoiceState.THINKING), true);
      assert.equal(sm.transitionTo(VoiceState.SPEAKING), true);
      assert.equal(sm.transitionTo(VoiceState.COMPLETED), true);
      assert.equal(sm.transitionTo(VoiceState.IDLE), true);
    });

    it('should reject invalid state transitions', () => {
      const sm = new VoiceStateMachine(VoiceState.IDLE);
      assert.equal(sm.transitionTo(VoiceState.SPEAKING), false);
      assert.equal(sm.getState(), VoiceState.IDLE);
    });

    it('should handle instant user interruption / barge-in', () => {
      const sm = new VoiceStateMachine(VoiceState.SPEAKING);
      assert.equal(sm.interrupt('User started speaking'), true);
      assert.equal(sm.getState(), VoiceState.LISTENING);
    });
  });

  describe('5. Voice Stream Contracts', () => {
    it('should push data and trigger handlers in VoiceInputStream', async () => {
      const stream = new VoiceInputStream('test-in');
      const sampleChunk = new Uint8Array([1, 2, 3, 4]);

      let receivedChunk: Uint8Array | null = null;
      let ended = false;

      stream.onData((chunk) => {
        receivedChunk = chunk;
      });

      stream.onEnd(() => {
        ended = true;
      });

      stream.pushChunk(sampleChunk);
      stream.finish();

      assert.deepEqual(receivedChunk, sampleChunk);
      assert.equal(ended, true);
    });

    it('should write data and complete VoiceOutputStream', async () => {
      const stream = new VoiceOutputStream('test-out');
      const received: Uint8Array[] = [];

      stream.onData((chunk) => {
        received.push(chunk);
      });

      const chunk1 = new Uint8Array([10, 20]);
      await stream.writeChunk(chunk1);
      await stream.finish();

      assert.equal(received.length, 1);
      assert.deepEqual(received[0], chunk1);
    });
  });

  describe('2 & 3. Provider-Agnostic STT and TTS Interfaces', () => {
    it('should transcribe audio via ISpeechToTextProvider', async () => {
      const stt = new MockSpeechToTextProvider();
      const res = await stt.transcribe(new Uint8Array([0, 1, 2]));

      assert.ok(res.text.length > 0);
      assert.equal(res.isFinal, true);
      assert.ok(res.confidence > 0.9);
      assert.ok(res.audioFeatures !== undefined);
    });

    it('should synthesize text via ITextToSpeechProvider', async () => {
      const tts = new MockTextToSpeechProvider();
      const res = await tts.synthesize('Hello Shizuka!');

      assert.ok(res.audioChunk !== undefined);
      assert.ok(res.durationMs > 0);
      assert.equal(res.isFinal, true);
    });
  });

  describe('7. VoiceManager Master Orchestration & Runtime Integration', () => {
    it('should process a full voice turn from transcription input through Cognitive Engine & Core Runtime', async () => {
      await voiceManager.initialize();

      const result = await voiceManager.processVoiceTurn({
        transcriptionText: 'Hello AURA, how are you feeling today?',
      });

      assert.ok(result.sessionId.startsWith('vsess-'));
      assert.equal(result.userTranscription, 'Hello AURA, how are you feeling today?');
      assert.ok(result.aiResponseText.length > 0);
      assert.ok(result.aiAudio !== undefined);
      assert.ok(result.executionTimeMs > 0);
    });

    it('should process audio chunk input through STT -> Runtime -> TTS pipeline', async () => {
      await voiceManager.initialize();

      const audioChunk = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      const result = await voiceManager.processVoiceTurn({ audioChunk });

      assert.ok(result.userTranscription.length > 0);
      assert.ok(result.aiResponseText.length > 0);
      assert.ok(result.aiAudio?.audioChunk !== undefined);
    });
  });

  describe('8 & 9. Emotion & Capability Integration Extension Points', () => {
    it('should trigger emotion feature extractor hook when registered', async () => {
      let hookTriggered = false;

      const mockEmotionExtractor: IVoiceEmotionFeatureExtractor = {
        extractFeatures: (chunk) => {
          hookTriggered = true;
          return { pitch: 220, energy: 0.8, valenceHint: 'positive' };
        },
      };

      voiceManager.registerEmotionExtractor(mockEmotionExtractor);
      await voiceManager.processVoiceTurn({ audioChunk: new Uint8Array([10, 20, 30]) });

      assert.equal(hookTriggered, true);
    });

    it('should enforce capability checker hook when registered', async () => {
      const mockCapabilityChecker: IVoiceCapabilityChecker = {
        hasMicrophonePermission: async () => false, // Permission denied
        hasSpeakerPermission: async () => true,
      };

      voiceManager.registerCapabilityChecker(mockCapabilityChecker);

      await assert.rejects(
        async () => {
          await voiceManager.processVoiceTurn({ transcriptionText: 'Test permission block' });
        },
        {
          name: 'Error',
          message: 'Capability Security Error: Microphone access permission denied',
        }
      );
    });
  });
});
