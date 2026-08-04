/**
 * AURA Voice Foundation — Voice Stream Implementation
 * Lightweight, low-latency streaming pipeline contracts for audio buffer chunks.
 */

import { EventEmitter } from 'events';
import { IVoiceInputStream, IVoiceOutputStream } from '../types/voice.types.js';

export class VoiceInputStream extends EventEmitter implements IVoiceInputStream {
  public readonly id: string;
  private isClosed = false;

  constructor(id: string = `v-in-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`) {
    super();
    this.id = id;
  }

  public pushChunk(chunk: Uint8Array): void {
    if (this.isClosed) {
      throw new Error(`Cannot push chunk to closed VoiceInputStream [${this.id}]`);
    }
    this.emit('data', chunk);
  }

  public finish(): void {
    if (this.isClosed) return;
    this.emit('end');
    this.close();
  }

  public onData(handler: (chunk: Uint8Array) => void): void {
    this.on('data', handler);
  }

  public onEnd(handler: () => void): void {
    this.on('end', handler);
  }

  public onError(handler: (err: Error) => void): void {
    this.on('error', handler);
  }

  public close(): void {
    if (this.isClosed) return;
    this.isClosed = true;
    this.removeAllListeners();
  }
}

export class VoiceOutputStream extends EventEmitter implements IVoiceOutputStream {
  public readonly id: string;
  private isClosed = false;

  constructor(id: string = `v-out-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`) {
    super();
    this.id = id;
  }

  public async writeChunk(chunk: Uint8Array): Promise<void> {
    if (this.isClosed) {
      throw new Error(`Cannot write chunk to closed VoiceOutputStream [${this.id}]`);
    }
    this.emit('data', chunk);
  }

  public async finish(): Promise<void> {
    if (this.isClosed) return;
    this.emit('end');
    this.close();
  }

  public onData(handler: (chunk: Uint8Array) => void): void {
    this.on('data', handler);
  }

  public onEnd(handler: () => void): void {
    this.on('end', handler);
  }

  public onError(handler: (err: Error) => void): void {
    this.on('error', handler);
  }

  public close(): void {
    if (this.isClosed) return;
    this.isClosed = true;
    this.removeAllListeners();
  }
}
