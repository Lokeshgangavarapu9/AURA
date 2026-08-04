/**
 * AURA AI Provider Layer — Domain Types & Interfaces
 * Vendor-independent contracts for text generation, streaming, function calling, and provider management.
 */

/** Normalized tool/function schema definition across all providers */
export interface IAuraFunctionSchema {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
      items?: Record<string, unknown>;
    }>;
    required?: string[];
  };
}

/** Standard message format for conversation history */
export interface ProviderMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
}

/** Function call requested by LLM */
export interface ProviderToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

/** Unified request payload sent to any provider adapter */
export interface ProviderRequest {
  prompt: string;
  systemInstruction?: string;
  history?: ProviderMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: IAuraFunctionSchema[];
  responseFormat?: 'text' | 'json';
  timeoutMs?: number;
  abortSignal?: AbortSignal;
}

/** Unified response payload returned from any provider adapter */
export interface ProviderResponse {
  text: string;
  modelUsed: string;
  providerId: string;
  toolCalls?: ProviderToolCall[];
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'error';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  rawResponse?: unknown;
}

/** Streaming token chunk */
export interface StreamChunk {
  delta: string;
  isComplete: boolean;
  modelUsed: string;
  providerId: string;
  finishReason?: string;
}

/** Master contract implemented by all LLM provider adapters */
export interface IAIProviderAdapter {
  readonly providerId: string;
  readonly defaultModel: string;
  readonly supportedModels: string[];

  /** Generates a complete text response */
  generateText(request: ProviderRequest): Promise<ProviderResponse>;

  /** Generates a streaming text response */
  generateStream(request: ProviderRequest): AsyncIterable<StreamChunk>;

  /** Translates AURA normalized tool schemas to provider-native tool format */
  translateToolSchema(tools: IAuraFunctionSchema[]): unknown;

  /** Health check verification */
  checkHealth(): Promise<boolean>;
}

/** Master configuration structure */
export interface ProviderConfig {
  activeProvider: string;
  activeModel: string;
  apiKeys: {
    gemini?: string;
    openai?: string;
    [key: string]: string | undefined;
  };
  defaults: {
    temperature: number;
    maxTokens: number;
    timeoutMs: number;
    streamingEnabled: boolean;
    retryAttempts: number;
  };
}
