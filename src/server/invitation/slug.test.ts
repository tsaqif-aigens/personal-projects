import { describe, expect, it } from 'vitest';
import { validateSlug } from './slug';

describe('validateSlug', () => {
  it('accepts lowercase letters, numbers, and hyphens', () => {
    expect(validateSlug('aisyah-dan-bilal').valid).toBe(true);
    expect(validateSlug('nikah2026').valid).toBe(true);
  });

  it('rejects uppercase characters', () => {
    expect(validateSlug('Aisyah').valid).toBe(false);
    expect(validateSlug('Aisyah').reason).toBe('invalid_characters');
  });

  it('rejects leading/trailing hyphens', () => {
    expect(validateSlug('-aisyah').valid).toBe(false);
    expect(validateSlug('aisyah-').valid).toBe(false);
  });

  it('rejects consecutive hyphens', () => {
    expect(validateSlug('aisyah--bilal').valid).toBe(false);
  });

  it('rejects empty and too-long slugs', () => {
    expect(validateSlug('').valid).toBe(false);
    expect(validateSlug('a'.repeat(41)).valid).toBe(false);
    expect(validateSlug('a'.repeat(41)).reason).toBe('too_long');
  });

  it('rejects reserved slugs', () => {
    expect(validateSlug('create').valid).toBe(false);
    expect(validateSlug('create').reason).toBe('reserved');
    expect(validateSlug('dashboard').valid).toBe(false);
    expect(validateSlug('api').valid).toBe(false);
  });

  it('rejects special characters and spaces', () => {
    expect(validateSlug('aisyah bilal').valid).toBe(false);
    expect(validateSlug('aisyah_bilal').valid).toBe(false);
    expect(validateSlug('aisyah.bilal').valid).toBe(false);
  });
});
