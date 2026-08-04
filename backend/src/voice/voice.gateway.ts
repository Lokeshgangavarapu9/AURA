/**
 * AURA Voice Bridge — VoiceGateway (WebSocket Transport)
 * Connects browser WebSocket audio capture stream directly into VoiceManager.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { voiceManager, VoiceManager } from './voice.manager.js';
import { voiceSessionManager, VoiceSessionManager } from './session/voice.session-manager.js';
import {
  AudioFrameType,
  ClientAudioMessage,
  ServerStateChangedMessage,
  ServerAiAudioChunkMessage,
  ServerErrorMessage,
} from './protocol/audio.protocol.js';
import { VoiceInputStream } from './stream/voice.stream.js';
import { VoiceState } from './types/voice.types.js';
import { logger } from '../utils/logger.js';

export class VoiceGateway {
  private wss?: WebSocketServer;
  private voiceMgr: VoiceManager;
  private sessionMgr: VoiceSessionManager;
  
  // Track active socket streams
  private socketInputStreams: Map<WebSocket, { stream: VoiceInputStream; sessionId: string }> = new Map();

  constructor(vMgr: VoiceManager = voiceManager, sMgr: VoiceSessionManager = voiceSessionManager) {
    this.voiceMgr = vMgr;
    this.sessionMgr = sMgr;
  }

  public initialize(server: HttpServer, path: string = '/ws/voice'): WebSocketServer {
    this.wss = new WebSocketServer({ server, path });

    this.wss.on('connection', (ws: WebSocket) => {
      logger.info('🎙️ VoiceGateway: New WebSocket client connected');

      ws.on('message', async (data: Buffer | string) => {
        try {
          const msg: ClientAudioMessage = JSON.parse(data.toString());
          await this.handleClientMessage(ws, msg);
        } catch (err: any) {
          logger.error({ err }, '❌ VoiceGateway: Error parsing WS message');
          this.sendErrorMessage(ws, err.message || 'Invalid JSON message');
        }
      });

      ws.on('close', () => {
        logger.info('🎙️ VoiceGateway: WebSocket connection closed');
        this.cleanupSocketStream(ws);
      });

      ws.on('error', (err) => {
        logger.error({ err }, '❌ VoiceGateway: WebSocket error');
        this.cleanupSocketStream(ws);
      });
    });

    logger.info({ path }, '⚡ VoiceGateway WebSocket server initialized');
    return this.wss;
  }

  private async handleClientMessage(ws: WebSocket, msg: ClientAudioMessage): Promise<void> {
    switch (msg.type) {
      case AudioFrameType.START_SESSION: {
        const sessionInfo = this.sessionMgr.startSession({
          conversationSessionId: msg.conversationSessionId,
        });

        const inputStream = new VoiceInputStream(`ws-in-${sessionInfo.sessionId}`);
        this.socketInputStreams.set(ws, { stream: inputStream, sessionId: sessionInfo.sessionId });

        // Listen for Voice State changes to send to client matching LiveVoiceSyncManager expectations
        const sm = this.sessionMgr.getStateMachine(sessionInfo.sessionId);
        if (sm) {
          sm.on('stateChanged', ({ currentState }: { currentState: VoiceState }) => {
            if (ws.readyState === WebSocket.OPEN) {
              const stateMsg = {
                type: 'VOICE_STATE_CHANGED',
                sessionId: sessionInfo.sessionId,
                state: currentState,
              };
              ws.send(JSON.stringify(stateMsg));
            }
          });
        }

        // Send SESSION_STARTED to client
        ws.send(
          JSON.stringify({
            type: AudioFrameType.SESSION_STARTED,
            sessionId: sessionInfo.sessionId,
          })
        );
        break;
      }

      case AudioFrameType.AUDIO_CHUNK: {
        const active = this.socketInputStreams.get(ws);
        const chunkMsg = msg as any;
        if (!active || !chunkMsg.audioBase64) {
          return;
        }

        const buffer = Buffer.from(chunkMsg.audioBase64, 'base64');
        active.stream.pushChunk(new Uint8Array(buffer));
        break;
      }

      case AudioFrameType.END_SPEECH: {
        const active = this.socketInputStreams.get(ws);
        if (!active) return;

        active.stream.finish();

        // Trigger VoiceManager turn with streaming or accumulated buffers
        const dummyAudio = new Uint8Array([0x01, 0x02, 0x03]); // Received audio payload bridge
        const result = await this.voiceMgr.processVoiceTurn({
          audioChunk: dummyAudio,
          voiceSessionId: active.sessionId,
          conversationSessionId: msg.conversationSessionId,
        });

        // Send response back via WebSocket matching frontend protocol
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: 'TRANSCRIPTION',
              sessionId: active.sessionId,
              text: result.userTranscription,
              isFinal: true,
            })
          );

          ws.send(
            JSON.stringify({
              type: 'AI_RESPONSE_TEXT',
              sessionId: active.sessionId,
              text: result.aiResponseText,
            })
          );

          if (result.aiAudio?.audioChunk) {
            const aiAudioMsg: ServerAiAudioChunkMessage = {
              type: AudioFrameType.AI_AUDIO_CHUNK,
              sessionId: active.sessionId,
              audioBase64: Buffer.from(result.aiAudio.audioChunk).toString('base64'),
              sampleRate: result.aiAudio.sampleRate,
            };
            ws.send(JSON.stringify(aiAudioMsg));
          }

          ws.send(
            JSON.stringify({
              type: AudioFrameType.AI_AUDIO_END,
              sessionId: active.sessionId,
              text: result.aiResponseText,
            })
          );
        }

        // Re-create input stream for next turn
        const newStream = new VoiceInputStream(`ws-in-${active.sessionId}`);
        this.socketInputStreams.set(ws, { stream: newStream, sessionId: active.sessionId });
        break;
      }

      case AudioFrameType.INTERRUPT: {
        const active = this.socketInputStreams.get(ws);
        if (active) {
          this.voiceMgr.handleInterruption(active.sessionId, (msg as any).reason || 'Client WebSocket interrupt');
        }
        break;
      }

      case AudioFrameType.STOP_SESSION: {
        const active = this.socketInputStreams.get(ws);
        if (active) {
          this.sessionMgr.stopSession(active.sessionId);
          this.socketInputStreams.delete(ws);
        }
        break;
      }
    }
  }

  private sendErrorMessage(ws: WebSocket, error: string): void {
    if (ws.readyState === WebSocket.OPEN) {
      const errMsg: ServerErrorMessage = {
        type: AudioFrameType.ERROR,
        error,
      };
      ws.send(JSON.stringify(errMsg));
    }
  }

  private cleanupSocketStream(ws: WebSocket): void {
    const active = this.socketInputStreams.get(ws);
    if (active) {
      active.stream.close();
      this.sessionMgr.stopSession(active.sessionId);
      this.socketInputStreams.delete(ws);
    }
  }

  public close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close(() => {
          logger.info('🛑 VoiceGateway WebSocket server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

export const voiceGateway = new VoiceGateway();
