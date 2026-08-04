/**
 * AURA Live Voice Conversation & Avatar Synchronization Suite Tests (Mission 5.8d)
 * Validates full duplex voice state transitions, barge-in interruption flow,
 * streaming audio playback, and avatar state synchronization.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import WebSocket from 'ws';

import {
  VoiceGateway,
  AudioFrameType,
  voiceManager,
  VoiceManager,
  VoiceSessionManager,
  VoiceState,
} from '../src/voice/index.js';

describe('Mission 5.8d — Live Voice Conversation & Avatar Synchronization Tests', () => {
  let server: Server;
  let voiceGateway: VoiceGateway;
  let serverPort: number;
  let voiceSessionMgr: VoiceSessionManager;

  before(async () => {
    server = createServer();
    voiceSessionMgr = new VoiceSessionManager();
    voiceGateway = new VoiceGateway(voiceManager, voiceSessionMgr);
    voiceGateway.initialize(server, '/ws/voice');

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address() as AddressInfo;
        serverPort = addr.port;
        resolve();
      });
    });
  });

  after(async () => {
    await voiceGateway.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('should synchronize Voice States (IDLE -> LISTENING -> TRANSCRIBING -> THINKING -> SPEAKING -> COMPLETED)', async () => {
    const session = voiceSessionMgr.startSession();
    const sm = voiceSessionMgr.getStateMachine(session.sessionId)!;
    const trackedStates: VoiceState[] = [];

    sm.on('stateChanged', ({ currentState }) => {
      trackedStates.push(currentState);
    });

    assert.equal(sm.transitionTo(VoiceState.LISTENING), true);
    assert.equal(sm.transitionTo(VoiceState.TRANSCRIBING), true);
    assert.equal(sm.transitionTo(VoiceState.THINKING), true);
    assert.equal(sm.transitionTo(VoiceState.SPEAKING), true);
    assert.equal(sm.transitionTo(VoiceState.COMPLETED), true);

    assert.deepEqual(trackedStates, [
      VoiceState.LISTENING,
      VoiceState.TRANSCRIBING,
      VoiceState.THINKING,
      VoiceState.SPEAKING,
      VoiceState.COMPLETED,
    ]);

    voiceSessionMgr.stopSession(session.sessionId);
  });

  it('should handle full duplex barge-in interruption during SPEAKING state', async () => {
    const session = voiceSessionMgr.startSession();
    const sm = voiceSessionMgr.getStateMachine(session.sessionId)!;

    sm.transitionTo(VoiceState.LISTENING);
    sm.transitionTo(VoiceState.TRANSCRIBING);
    sm.transitionTo(VoiceState.THINKING);
    sm.transitionTo(VoiceState.SPEAKING);

    assert.equal(sm.getState(), VoiceState.SPEAKING);

    // Simulate user speech barge-in interruption
    const interrupted = sm.interrupt('User started speaking during AI response');
    assert.equal(interrupted, true);
    assert.equal(sm.getState(), VoiceState.LISTENING);

    voiceSessionMgr.stopSession(session.sessionId);
  });

  it('should process WebSocket audio streaming and return AI audio chunk frame for avatar lip-sync', async () => {
    const ws = new WebSocket(`ws://localhost:${serverPort}/ws/voice`);

    await new Promise<void>((resolve, reject) => {
      let activeSessionId = '';

      ws.on('open', () => {
        ws.send(
          JSON.stringify({
            type: AudioFrameType.START_SESSION,
          })
        );
      });

      ws.on('message', (data) => {
        const res = JSON.parse(data.toString());

        if (res.type === AudioFrameType.SESSION_STARTED) {
          activeSessionId = res.sessionId;
          ws.send(
            JSON.stringify({
              type: AudioFrameType.AUDIO_CHUNK,
              sessionId: activeSessionId,
              audioBase64: Buffer.from([1, 2, 3, 4]).toString('base64'),
            })
          );
          ws.send(
            JSON.stringify({
              type: AudioFrameType.END_SPEECH,
              sessionId: activeSessionId,
            })
          );
        }

        if (res.type === AudioFrameType.AI_AUDIO_CHUNK) {
          assert.ok(res.audioBase64 !== undefined);
          assert.ok(res.sampleRate > 0);
        }

        if (res.type === AudioFrameType.AI_AUDIO_END) {
          ws.close();
          resolve();
        }
      });

      ws.on('error', reject);
    });
  });
});
