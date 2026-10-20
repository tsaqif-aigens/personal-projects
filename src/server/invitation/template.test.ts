import { describe, expect, it } from 'vitest';
import { renderTemplate } from './template';

describe('renderTemplate', () => {
  it('renders double-mustache placeholders from vars', () => {
    const html = renderTemplate(
      '{{couple.bride.nickname}} & {{couple.groom.nickname}}',
      {
        vars: {
          couple: {
            bride: { nickname: 'Aisyah' },
            groom: { nickname: 'Bilal' },
          },
        },
      },
    );
    expect(html).toBe('Aisyah & Bilal');
  });

  it('HTML-escapes values (auto-escaping ON)', () => {
    const html = renderTemplate('{{copy.opening_line}}', {
      vars: { copy: { opening_line: '<script>alert(1)</script>' } },
    });
    expect(html).toBe(
      '&lt;script&gt;alert(1)&lt;&#x2F;script&gt;',
    );
  });

  it('escapes guest name from ?to=', () => {
    const html = renderTemplate('{{guest.name}}', {
      vars: {},
      guestName: '<img src=x onerror=alert(1)>',
    });
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  it('length-limits guest name to 80 characters', () => {
    const longName = 'a'.repeat(200);
    const html = renderTemplate('{{guest.name}}', {
      vars: {},
      guestName: longName,
    });
    expect(html).toBe('a'.repeat(80));
  });

  it('defaults guest name to empty string when omitted', () => {
    const html = renderTemplate('Halo {{guest.name}}', { vars: {} });
    expect(html).toBe('Halo ');
  });

  it('renders section loops', () => {
    const html = renderTemplate(
      '{{#events}}{{title}}|{{/events}}',
      {
        vars: {
          events: [
            { title: 'Akad Nikah' },
            { title: 'Resepsi' },
          ],
        },
      },
    );
    expect(html).toBe('Akad Nikah|Resepsi|');
  });

  it('treats missing vars as empty string', () => {
    const html = renderTemplate('{{cover.photo_url}}', { vars: {} });
    expect(html).toBe('');
  });
});
