import { describe, expect, it } from 'vitest';
import {
  STEP_A_SYSTEM_PROMPT,
  STEP_B_SYSTEM_PROMPT,
  buildStepAPrompt,
  buildStepBPrompt,
  buildVarsWithQuote,
} from './prompts';
import { RELIGIOUS_QUOTE } from '@/server/invitation/constants';

describe('AI prompts', () => {
  it('Step A prompt embeds form data and style preference', () => {
    const prompt = buildStepAPrompt({
      formData: { couple: { bride: { nickname: 'Aminah' } } },
      photoUrls: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
      stylePreference: 'elegant-gold',
    });
    expect(prompt).toContain('"nickname": "Aminah"');
    expect(prompt).toContain('[Foto 1] https://example.com/1.jpg');
    expect(prompt).toContain('[Foto 2] https://example.com/2.jpg');
    expect(prompt).toContain('elegant-gold');
  });

  it('Step A system prompt forbids generating religious text', () => {
    expect(STEP_A_SYSTEM_PROMPT).toContain('JANGAN pernah menulis, mengubah, atau menerjemahkan ayat Al-Qur\'an');
    expect(STEP_A_SYSTEM_PROMPT).toContain('Playfair Display');
  });

  it('Step B prompt embeds theme and base template', () => {
    const prompt = buildStepBPrompt({
      theme: { palette: { primary: '#b8860b' } },
      baseTemplate: '<section data-section="cover">...</section>',
    });
    expect(prompt).toContain('#b8860b');
    expect(prompt).toContain('data-section="cover"');
    expect(prompt).toContain('--color-primary');
  });

  it('Step B system prompt lists the full template contract', () => {
    expect(STEP_B_SYSTEM_PROMPT).toContain('data-action="open-invitation"');
    expect(STEP_B_SYSTEM_PROMPT).toContain('data-countdown');
    expect(STEP_B_SYSTEM_PROMPT).toContain('data-rsvp-form');
    expect(STEP_B_SYSTEM_PROMPT).toContain('data-wishes-list');
    expect(STEP_B_SYSTEM_PROMPT).toContain('data-copy');
    expect(STEP_B_SYSTEM_PROMPT).toContain('data-lightbox');
    expect(STEP_B_SYSTEM_PROMPT).toContain('data-music-toggle');
    expect(STEP_B_SYSTEM_PROMPT).toContain('DILARANG menulis JavaScript');
  });

  it('injects the fixed religious quote into vars', () => {
    const base = {
      couple: {},
      cover: {},
      events: [],
      countdown: {},
      gifts: {},
      gallery: [],
      copy: {},
      love_story: [],
      music: {},
      meta: {},
    } as never;

    const vars = buildVarsWithQuote(base);
    expect(vars.quote).toEqual(RELIGIOUS_QUOTE);
  });
});
