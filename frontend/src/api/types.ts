/**
 * AURA API Type Definitions & Data Models
 */

/** Standardized Health Endpoint Response */
export interface HealthResponse {
  status: 'ok' | 'error';
  service: string;
  version: string;
  environment: string;
  database: 'connected' | 'disconnected' | 'error';
  uptime: string;
  timestamp: string;
}

/** Standardized Error Payload from Backend */
export interface ApiErrorPayload {
  status: 'error';
  error: {
    code: string;
    message: string;
  };
  requestId?: string;
  timestamp: string;
}

/** Strongly Typed Result Wrapper for all API operations */
export type ApiResult<T> =
  | { success: true; data: T; statusCode: number }
  | { success: false; error: string; statusCode?: number; code?: string };

/** Options for individual HTTP requests */
export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  skipInterceptors?: boolean;
}

/** Request Interceptor Function Signature */
export type RequestInterceptor = (options: RequestOptions) => RequestOptions | Promise<RequestOptions>;

/** Response Interceptor Function Signature */
export type ResponseInterceptor = <T>(result: ApiResult<T>) => ApiResult<T> | Promise<ApiResult<T>>;
