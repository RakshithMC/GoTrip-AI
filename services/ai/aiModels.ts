export const PRIMARY_MODEL = "gemini-3.8-flash";
export const FALLBACK_MODEL = "gemini-3.5-flash-lite";

export interface ModelConfig {
  primary: string;
  fallback: string;
  maxRetries: number;
}

export const AI_MODEL_CONFIG: ModelConfig = {
  primary: PRIMARY_MODEL,
  fallback: FALLBACK_MODEL,
  maxRetries: 3,
};
