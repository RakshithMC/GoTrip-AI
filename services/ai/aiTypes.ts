import { ChatMessage, Source, GeneratedPlace } from '../../types';

export type AIErrorCode = 
  | 'UNAUTHORIZED'
  | 'QUOTA_EXHAUSTED'
  | 'RATE_LIMITED'
  | 'AI_CONFIGURATION_ERROR'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'MALFORMED_RESPONSE'
  | 'UNKNOWN_ERROR';

export interface AIResponse<T> {
  data?: T;
  error?: AIErrorData;
  cached?: boolean;
}

export interface AIErrorData {
  code: AIErrorCode;
  userMessage: string;
  originalError?: string;
  status?: number;
}

export interface ChatResponseData {
  text: string;
  sources: Source[];
  relatedQuestions: string[];
}

export interface AIRequestOptions {
  signal?: AbortSignal;
  skipCache?: boolean;
  userProfile?: {
    language?: string;
  };
}
