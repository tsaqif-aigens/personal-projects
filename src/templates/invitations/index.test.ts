import { describe, expect, it } from 'vitest';
import { validateTemplate } from '@/server/invitation/validator';
import { BASE_TEMPLATES } from './index';

const ALLOWED_ORIGIN = 'https://cdn.undangan.ai';

describe('base templates', () => {
  it.each(BASE_TEMPLATES.map((t) => t.key))(
    'validates template %s',
    (key) => {
      const template = BASE_TEMPLATES.find((t) => t.key === key);
      expect(template).toBeDefined();
      const result = validateTemplate(template!.html, ALLOWED_ORIGIN);
      expect(result.issues).toEqual([]);
      expect(result.valid).toBe(true);
    },
  );

  it('has three distinct base templates', () => {
    expect(BASE_TEMPLATES).toHaveLength(3);
    const htmls = new Set(BASE_TEMPLATES.map((t) => t.html));
    expect(htmls.size).toBe(3);
  });

  it('maps style option labels correctly', () => {
    const labels = BASE_TEMPLATES.map((t) => t.label);
    expect(labels).toEqual(['Elegan', 'Floral', 'Minimalis']);
  });
});
