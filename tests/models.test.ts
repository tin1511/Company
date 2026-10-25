import { describe, it, expect } from 'vitest';
import { SUPPORTED_MODELS, testModelConnectivity } from '../server/geminiService.ts';

describe('AI Models Management (ChatGPT & Gemini)', () => {
  it('should support both Google Gemini and OpenAI ChatGPT models', () => {
    const providers = new Set(SUPPORTED_MODELS.map((m) => m.provider));
    expect(providers.has('OpenAI ChatGPT')).toBe(true);
    expect(providers.has('Google Gemini')).toBe(true);
  });

  it('should include key ChatGPT models (gpt-4o, gpt-4o-mini, o3-mini)', () => {
    const ids = SUPPORTED_MODELS.map((m) => m.id);
    expect(ids).toContain('gpt-4o');
    expect(ids).toContain('gpt-4o-mini');
    expect(ids).toContain('o3-mini');
    expect(ids).toContain('chatgpt-4o-latest');
  });

  it('should successfully ping ChatGPT model test connectivity', async () => {
    const result = await testModelConnectivity('gpt-4o');
    expect(result.success).toBe(true);
    expect(result.provider).toBe('OpenAI ChatGPT');
    expect(result.latencyMs).toBeGreaterThan(0);
    expect(result.message).toBeTruthy();
  });

  it('should fail test connectivity for unsupported models', async () => {
    const result = await testModelConnectivity('unknown-model-xyz');
    expect(result.success).toBe(false);
    expect(result.error).toBe('UNSUPPORTED_MODEL');
  });
});
