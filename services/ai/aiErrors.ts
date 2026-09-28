import { AIErrorCode, AIErrorData } from './aiTypes';

export class AIError extends Error {
  public readonly code: AIErrorCode;
  public readonly userMessage: string;
  public readonly status?: number;
  public readonly isQuotaExhausted: boolean;

  constructor(code: AIErrorCode, message?: string, status?: number, originalError?: any) {
    const userMsg = message || AIError.getDefaultUserMessage(code);
    super(userMsg);
    this.name = 'AIError';
    this.code = code;
    this.userMessage = userMsg;
    this.status = status;
    this.isQuotaExhausted = code === 'QUOTA_EXHAUSTED';
  }

  public toJSON(): AIErrorData {
    return {
      code: this.code,
      userMessage: this.userMessage,
      status: this.status,
    };
  }

  public static getDefaultUserMessage(code: AIErrorCode): string {
    switch (code) {
      case 'UNAUTHORIZED':
        return 'Please log in to use GoTrip AI.';
      case 'QUOTA_EXHAUSTED':
        return 'AI service is temporarily unavailable because the usage limit has been reached. Please try again later.';
      case 'RATE_LIMITED':
        return 'GoTrip AI is handling high request traffic. Please wait a moment and try again.';
      case 'NETWORK_ERROR':
        return 'Unable to connect to the AI service. Please check your internet connection and try again.';
      case 'AI_CONFIGURATION_ERROR':
        return 'AI service configuration needs attention.';
      case 'SERVER_ERROR':
        return 'The AI service encountered a temporary server error. Please try again in a moment.';
      case 'MALFORMED_RESPONSE':
        return 'Received an invalid response format from the AI service. Please try again.';
      default:
        return 'An unexpected error occurred while communicating with the AI service.';
    }
  }

  public static parse(error: any): AIError {
    if (error instanceof AIError) {
      return error;
    }

    const errStr = String(error?.message || error || '').toLowerCase();
    const status = error?.status || error?.statusCode || (errStr.includes('429') ? 429 : 500);

    if (errStr.includes('unauthorized') || errStr.includes('401') || errStr.includes('invalid jwt') || errStr.includes('please log in') || status === 401) {
      return new AIError('UNAUTHORIZED', 'Please log in to use GoTrip AI.', 401, error);
    }

    if (errStr.includes('quota') || errStr.includes('resource_exhausted') || errStr.includes('exceeded your current quota')) {
      return new AIError('QUOTA_EXHAUSTED', undefined, 429, error);
    }
    
    if (errStr.includes('429') || errStr.includes('rate_limit') || errStr.includes('too many requests')) {
      return new AIError('RATE_LIMITED', undefined, 429, error);
    }

    if (errStr.includes('api_key') || errStr.includes('invalid key') || errStr.includes('forbidden') || errStr.includes('403')) {
      return new AIError('AI_CONFIGURATION_ERROR', undefined, 403, error);
    }

    if (errStr.includes('network') || errStr.includes('failed to fetch') || errStr.includes('offline') || errStr.includes('econnrefused')) {
      return new AIError('NETWORK_ERROR', undefined, 0, error);
    }

    if (errStr.includes('500') || errStr.includes('502') || errStr.includes('503') || errStr.includes('504')) {
      return new AIError('SERVER_ERROR', undefined, 503, error);
    }

    if (errStr.includes('json') || errStr.includes('parse') || errStr.includes('unexpected token')) {
      return new AIError('MALFORMED_RESPONSE', undefined, 200, error);
    }

    return new AIError('UNKNOWN_ERROR', undefined, status, error);
  }
}
