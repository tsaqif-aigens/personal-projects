import { describe, expect, it } from 'vitest';
import { extractJson, toImageBlock } from './client';

describe('extractJson', () => {
  it('returns a bare JSON object unchanged', () => {
    expect(extractJson('{"a": 1}')).toBe('{"a": 1}');
  });

  it('strips markdown json fences', () => {
    const input = '```json\n{"theme": {}}\n```';
    expect(extractJson(input)).toBe('{"theme": {}}');
  });

  it('strips a prose preamble and trailing text', () => {
    const input = 'Berikut hasilnya:\n{"copy": {"x": "y"}}\nSemoga membantu.';
    expect(extractJson(input)).toBe('{"copy": {"x": "y"}}');
  });

  it('handles nested braces and strings containing braces', () => {
    const input = '{"a": {"b": "}"}, "c": 1} trailing';
    expect(extractJson(input)).toBe('{"a": {"b": "}"}, "c": 1}');
  });

  it('falls back to the raw text when no object is present', () => {
    expect(extractJson('no json here')).toBe('no json here');
  });
});

describe('toImageBlock', () => {
  it('passes through https URLs', () => {
    expect(toImageBlock('https://example.com/a.jpg')).toEqual({
      type: 'image',
      source: { type: 'url', url: 'https://example.com/a.jpg' },
    });
  });

  it('decodes base64 data URLs', () => {
    const block = toImageBlock('data:image/png;base64,AAAA');
    expect(block).toEqual({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: 'AAAA' },
    });
  });

  it('rejects unsupported data URL media types', () => {
    expect(() => toImageBlock('data:text/plain;base64,AAAA')).toThrow(
      /Unsupported data URL/,
    );
  });
});
