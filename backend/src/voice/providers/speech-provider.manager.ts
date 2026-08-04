/**
 * AURA Voice Foundation — Speech Provider Registry / Manager
 * Provider-agnostic registry for registering and selecting STT / TTS engines dynamically.
 * Prepared for Google STT, OpenAI Whisper, Deepgram, Azure Speech, ElevenLabs, Google TTS.
 */

import { ISpeechToTextProvider, ITextToSpeechProvider, VoiceConfig } from '../types/voice.types.js';
import { MockSpeechToTextProvider, MockTextToSpeechProvider } from './voice.providers.js';
import { GoogleSpeechToTextProvider } from './google-stt.provider.js';
import { GoogleTextToSpeechProvider } from './google-tts.provider.js';
import { logger } from '../../utils/logger.js';

export class SpeechProviderManager {
  private sttProviders: Map<string, ISpeechToTextProvider> = new Map();
  private ttsProviders: Map<string, ITextToSpeechProvider> = new Map();

  private activeSTTId = 'google-stt';
  private activeTTSId = 'google-tts';

  constructor() {
    // Register built-in default providers
    this.registerSTTProvider(new GoogleSpeechToTextProvider());
    this.registerSTTProvider(new MockSpeechToTextProvider());
    this.registerTTSProvider(new GoogleTextToSpeechProvider());
    this.registerTTSProvider(new MockTextToSpeechProvider());
  }

  public registerSTTProvider(provider: ISpeechToTextProvider): void {
    this.sttProviders.set(provider.providerId, provider);
    logger.info({ providerId: provider.providerId, name: provider.name }, '🎙️ Registered STT Provider');
  }

  public registerTTSProvider(provider: ITextToSpeechProvider): void {
    this.ttsProviders.set(provider.providerId, provider);
    logger.info({ providerId: provider.providerId, name: provider.name }, '🗣️ Registered TTS Provider');
  }

  public getSTTProvider(providerId?: string): ISpeechToTextProvider {
    const id = providerId || this.activeSTTId;
    const provider = this.sttProviders.get(id);

    if (!provider) {
      logger.warn({ requestedId: id, fallback: 'google-stt' }, '⚠️ STT Provider not found, falling back');
      return this.sttProviders.get('google-stt') || this.sttProviders.get('mock-stt')!;
    }

    return provider;
  }

  public getTTSProvider(providerId?: string): ITextToSpeechProvider {
    const id = providerId || this.activeTTSId;
    const provider = this.ttsProviders.get(id);

    if (!provider) {
      logger.warn({ requestedId: id, fallback: 'mock-tts' }, '⚠️ TTS Provider not found, falling back');
      return this.ttsProviders.get('mock-tts')!;
    }

    return provider;
  }

  public setActiveSTTProvider(providerId: string): void {
    if (!this.sttProviders.has(providerId)) {
      throw new Error(`Cannot set active STT Provider: '${providerId}' is not registered`);
    }
    this.activeSTTId = providerId;
    logger.info({ providerId }, '🎙️ Active STT Provider set');
  }

  public setActiveTTSProvider(providerId: string): void {
    if (!this.ttsProviders.has(providerId)) {
      throw new Error(`Cannot set active TTS Provider: '${providerId}' is not registered`);
    }
    this.activeTTSId = providerId;
    logger.info({ providerId }, '🗣️ Active TTS Provider set');
  }

  public listSTTProviders(): Array<{ id: string; name: string }> {
    return Array.from(this.sttProviders.values()).map((p) => ({ id: p.providerId, name: p.name }));
  }

  public listTTSProviders(): Array<{ id: string; name: string }> {
    return Array.from(this.ttsProviders.values()).map((p) => ({ id: p.providerId, name: p.name }));
  }
}

export const speechProviderManager = new SpeechProviderManager();
