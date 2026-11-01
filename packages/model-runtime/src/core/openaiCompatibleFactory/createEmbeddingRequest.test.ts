// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { createEmbeddingRequest } from './createEmbeddingRequest';

const payload = {
  dimensions: 1024,
  input: ['First document chunk', 'Second document chunk'],
  model: 'gemini-embedding-2',
};

describe('createEmbeddingRequest', () => {
  it.each([
    'https://generativelanguage.googleapis.com/v1beta/openai',
    'https://generativelanguage.googleapis.com/v1beta/openai/',
    'https://generativelanguage.googleapis.com:443/v1beta/openai/',
  ])('omits the unsupported user field for Google embeddings at %s', (baseURL) => {
    const request = createEmbeddingRequest(payload, baseURL, 'app-user');

    expect(request).not.toHaveProperty('user');
    expect(request).toEqual({ ...payload, encoding_format: 'float' });
    expect(JSON.parse(JSON.stringify(request))).not.toHaveProperty('user');
  });

  it.each([
    'https://api.openai.com/v1',
    'https://api.example.com/v1',
    'https://generativelanguage.googleapis.com.example.com/v1beta/openai/',
    'https://api.example.com/generativelanguage.googleapis.com/v1beta/openai/',
    'https://generativelanguage.googleapis.com/proxy/',
    'https://generativelanguage.googleapis.com:8443/v1beta/openai/',
    'not-a-url',
  ])('preserves user for other endpoints at %s', (baseURL) => {
    expect(createEmbeddingRequest(payload, baseURL, 'app-user')).toEqual({
      ...payload,
      encoding_format: 'float',
      user: 'app-user',
    });
  });

  it('leaves the input payload unchanged', () => {
    const frozenPayload = Object.freeze({ ...payload, input: [...payload.input] });
    Object.freeze(frozenPayload.input);
    const request = createEmbeddingRequest(
      frozenPayload,
      'https://generativelanguage.googleapis.com/v1beta/openai/',
      'app-user',
    );

    expect(frozenPayload).toEqual(payload);
    expect(request.input).toEqual(payload.input);
  });

  it('keeps a single-text query and model ID intact', () => {
    const query = { dimensions: 1024, input: 'Find a relevant document', model: 'mapped-model' };

    expect(
      createEmbeddingRequest(query, 'https://generativelanguage.googleapis.com/v1beta/openai/'),
    ).toEqual({ ...query, encoding_format: 'float' });
  });
});
