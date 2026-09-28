import { AIError } from './aiErrors';

export async function executeWithRetry<T>(
  fn: (attempt: number) => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    allowFallbackOnFailure?: boolean;
  } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 1000;

  let attempt = 0;

  while (true) {
    attempt++;
    try {
      return await fn(attempt);
    } catch (err: any) {
      const aiError = AIError.parse(err);

      // Rule: DO NOT retry daily quota exhaustion or configuration errors
      if (aiError.code === 'QUOTA_EXHAUSTED' || aiError.code === 'AI_CONFIGURATION_ERROR' || aiError.code === 'MALFORMED_RESPONSE') {
        throw aiError;
      }

      // Rule: Only retry temporary rate limits or 500/503 server errors up to maxRetries
      if (attempt >= maxRetries || (aiError.code !== 'RATE_LIMITED' && aiError.code !== 'SERVER_ERROR' && aiError.code !== 'NETWORK_ERROR')) {
        throw aiError;
      }

      // Exponential backoff with jitter
      const backoffFactor = Math.pow(2, attempt - 1);
      const jitter = Math.random() * 500;
      const delay = initialDelayMs * backoffFactor + jitter;

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
