/**
 * AURA AI Provider Layer — Domain Error Hierarchy
 * Strongly typed, vendor-independent errors for LLM operations.
 */

export abstract class AuraProviderError extends Error {
  abstract readonly code: string;

  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly rawError?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Thrown when a provider API call breaches execution timeout limit */
export class ProviderTimeoutError extends AuraProviderError {
  readonly code = 'PROVIDER_TIMEOUT';
}

/** Thrown when provider returns 429 or rate quota exceeded */
export class ProviderRateLimitError extends AuraProviderError {
  readonly code = 'PROVIDER_RATE_LIMIT';
}

/** Thrown when provider API key is invalid or unauthorized */
export class ProviderAuthError extends AuraProviderError {
  readonly code = 'PROVIDER_AUTH_ERROR';
}

/** Thrown when network connection fails or socket drops */
export class ProviderNetworkError extends AuraProviderError {
  readonly code = 'PROVIDER_NETWORK_ERROR';
}

/** Thrown when provider returns an unparseable or malformed body */
export class ProviderInvalidResponseError extends AuraProviderError {
  readonly code = 'PROVIDER_INVALID_RESPONSE';
}

/** Thrown when provider service is down or 5xx server error occurs */
export class ProviderUnavailableError extends AuraProviderError {
  readonly code = 'PROVIDER_UNAVAILABLE';
}
