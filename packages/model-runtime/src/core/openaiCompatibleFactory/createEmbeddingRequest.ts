import type OpenAI from 'openai';

import type { EmbeddingsPayload } from '../../types/embeddings';

const isGoogleEmbeddingEndpoint = (baseURL: string): boolean => {
  try {
    const url = new URL(baseURL);

    return (
      url.origin === 'https://generativelanguage.googleapis.com' &&
      url.pathname.replace(/\/+$/, '') === '/v1beta/openai'
    );
  } catch {
    return false;
  }
};

export const createEmbeddingRequest = (
  payload: EmbeddingsPayload,
  baseURL: string,
  user?: string,
): OpenAI.EmbeddingCreateParams => {
  const request: OpenAI.EmbeddingCreateParams = { ...payload, encoding_format: 'float' };

  // Google's OpenAI-compatible embeddings endpoint rejects the optional OpenAI `user` field.
  return isGoogleEmbeddingEndpoint(baseURL) ? request : { ...request, user };
};
