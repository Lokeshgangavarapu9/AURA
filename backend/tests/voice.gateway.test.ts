/**
 * AURA Voice Bridge — Test Suite (Mission 5.8a.5)
 * Validates VoiceGateway, WebSocket Audio Transport, Protocol Serialization, and Stream Flow.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import WebSocket from 'ws';

import {
  VoiceGateway,
  AudioFrameType,
  ClientAudioMessage,
  voiceManager,
  voiceSessionManager,
} from '../src/voice/index.js';

describe('Mission 5.8a.5 — VoiceGateway & Browser Audio Bridge Tests', () => {
  let server: Server;
  let voiceGateway: VoiceGateway;
  let serverPort: number;

  before(async () => {
    server = createServer();
    voiceGateway = new VoiceGateway(voiceManager, voiceSessionManager);
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

  it('should connect client to VoiceGateway via WebSocket', async () => {
    const ws = new WebSocket(`ws://localhost:${serverPort}/ws/voice`);

    await new Promise<void>((resolve, reject) => {
      ws.on('open', () => {
        assert.equal(ws.readyState, WebSocket.OPEN);
        ws.close();
        resolve();
      });
      ws.on('error', reject);
    });
  });

  it('should initialize voice session over WebSocket when receiving START_SESSION frame', async () => {
    const ws = new WebSocket(`ws://localhost:${serverPort}/ws/voice`);

    await new Promise<void>((resolve, reject) => {
      ws.on('open', () => {
        const msg: ClientAudioMessage = {
          type: AudioFrameType.START_SESSION,
          sampleRate: 16000,
        };
        ws.send(JSON.stringify(msg));
      });

      ws.on('message', (data) => {
        const res = JSON.parse(data.toString());
        if (res.type === AudioFrameType.SESSION_STARTED) {
          assert.ok(res.sessionId.startsWith('vsess-'));
          ws.close();
          resolve();
        }
      });
      ws.on('error', reject);
    });
  });

  it('should accept audio chunks and complete speech turn over WebSocket transport', async () => {
    const ws = new WebSocket(`ws://localhost:${serverPort}/ws/voice`);
    let activeSessionId = '';

    await new Promise<void>((resolve, reject) => {
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

          // Push Audio Chunk frame
          const audioBuffer = Buffer.from([1, 2, 3, 4, 5]).toString('base64');
          ws.send(
            JSON.stringify({
              type: AudioFrameType.AUDIO_CHUNK,
              sessionId: activeSessionId,
              audioBase64: audioBuffer,
            })
          );

          // Send END_SPEECH frame
          ws.send(
            JSON.stringify({
              type: AudioFrameType.END_SPEECH,
              sessionId: activeSessionId,
            })
          );
        }

        if (res.type === AudioFrameType.TRANSCRIPTION_FINAL) {
          assert.ok(res.text.length > 0);
        }

        if (res.type === AudioFrameType.AI_AUDIO_END) {
          assert.ok(res.text.length > 0);
          ws.close();
          resolve();
        }
      });
      ws.on('error', reject);
    });
  });

  it('should handle client interruption frame over WebSocket transport', async () => {
    const ws = new WebSocket(`ws://localhost:${serverPort}/ws/voice`);

    await new Promise<void>((resolve, reject) => {
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
          // Send INTERRUPT frame
          ws.send(
            JSON.stringify({
              type: AudioFrameType.INTERRUPT,
              sessionId: res.sessionId,
              reason: 'User manual click interrupt',
            })
          );

          setTimeout(() => {
            ws.close();
            resolve();
          }, 50);
        }
      });
      ws.on('error', reject);
    });
  });
});
