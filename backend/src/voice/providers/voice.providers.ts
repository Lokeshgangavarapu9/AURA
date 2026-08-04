/**
 * AURA Voice Foundation — Mock/Abstract Provider Implementations & Provider-Agnostic Interfaces
 * Serves as foundation and reference for external providers (Google, Whisper, ElevenLabs, Deepgram, Azure).
 */

import {
  ISpeechToTextProvider,
  ITextToSpeechProvider,
  STTResult,
  TTSResult,
  VoiceConfig,
  IVoiceInputStream,
  IVoiceOutputStream,
} from '../types/voice.types.js';
import { VoiceInputStream, VoiceOutputStream } from '../stream/voice.stream.js';

/**
 * Mock/Base Provider-Agnostic SpeechToText Provider
 */
export class MockSpeechToTextProvider implements ISpeechToTextProvider {
  public readonly providerId = 'mock-stt';
  public readonly name = 'Mock Speech To Text Engine';
  private initialized = false;

  public async initialize(config: VoiceConfig): Promise<void> {
    this.initialized = true;
  }

  public async transcribe(audio: Uint8Array, config?: Partial<VoiceConfig>): Promise<STTResult> {
    if (!this.initialized) await this.initialize({} as any);

    return {
      text: '[Simulated Transcribed Speech]',
      isFinal: true,
      confidence: 0.98,
      durationMs: 1200,
      audioFeatures: {
        pitchMean: 210,
        intensityMean: 65,
        speakingRate: 3.2,
      },
    };
  }

  public async createStream(config?: Partial<VoiceConfig>): Promise<{
    inputStream: IVoiceInputStream;
    onTranscription: (handler: (result: STTResult) => void) => void;
  }> {
    const inputStream = new VoiceInputStream();
    const handlers: Array<(result: STTResult) => void> = [];

    inputStream.onData((chunk) => {
      // Simulate real-time streaming partial transcription
      handlers.forEach((h) =>
        h({
          text: 'Streaming speech chunk parsed...',
          isFinal: false,
          confidence: 0.9,
        })
      );
    });

    inputStream.onEnd(() => {
      handlers.forEach((h) =>
        h({
          text: 'Streaming speech completed.',
          isFinal: true,
          confidence: 0.99,
        })
      );
    });

    return {
      inputStream,
      onTranscription: (handler) => handlers.push(handler),
    };
  }

  public async checkHealth(): Promise<boolean> {
    return true;
  }
}

/**
 * Mock/Base Provider-Agnostic TextToSpeech Provider
 */
export class MockTextToSpeechProvider implements ITextToSpeechProvider {
  public readonly providerId = 'mock-tts';
  public readonly name = 'Mock Text To Speech Engine';
  private initialized = false;

  public async initialize(config: VoiceConfig): Promise<void> {
    this.initialized = true;
  }

  public async synthesize(text: string, config?: Partial<VoiceConfig>): Promise<TTSResult> {
    if (!this.initialized) await this.initialize({} as any);

    // Mock binary audio buffer output
    const dummyAudio = new Uint8Array([0x2e, 0x73, 0x6e, 0x64, 0x00, 0x00, 0x00, 0x18]);

    return {
      audioChunk: dummyAudio,
      durationMs: Math.max(500, text.length * 60),
      sampleRate: config?.sampleRate || 16000,
      isFinal: true,
    };
  }

  public async createStream(
    textStream: AsyncIterable<string>,
    config?: Partial<VoiceConfig>
  ): Promise<IVoiceOutputStream> {
    const outputStream = new VoiceOutputStream();

    (async () => {
      try {
        for await (const chunk of textStream) {
          const res = await this.synthesize(chunk, config);
          if (res.audioChunk) {
            await outputStream.writeChunk(res.audioChunk);
          }
        }
        await outputStream.finish();
      } catch (err: any) {
        outputStream.emit('error', err);
      }
    })();

    return outputStream;
  }

  public async checkHealth(): Promise<boolean> {
    return true;
  }
}
