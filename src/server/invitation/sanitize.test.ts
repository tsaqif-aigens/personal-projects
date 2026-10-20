import { describe, expect, it } from 'vitest';
import { sanitizeCss, sanitizeTemplateHtml } from './sanitize';

const ALLOWED_ORIGIN = 'https://cdn.undangan.ai';

describe('sanitizeTemplateHtml', () => {
  it('preserves Mustache placeholders in text and attributes', () => {
    const html = sanitizeTemplateHtml(
      '<img src="{{cover.photo_url}}" alt=""><a href="{{couple.bride.instagram_url}}">IG</a>',
    );
    expect(html).toContain('{{cover.photo_url}}');
    expect(html).toContain('{{couple.bride.instagram_url}}');
  });

  it('strips script tags', () => {
    const html = sanitizeTemplateHtml(
      '<div>ok</div><script>alert(1)</script>',
    );
    expect(html).not.toContain('<script');
    expect(html).not.toContain('alert(1)');
  });

  it('strips iframe/object/embed', () => {
    const html = sanitizeTemplateHtml(
      '<iframe src="https://evil.com"></iframe><object></object><embed>',
    );
    expect(html).not.toContain('iframe');
    expect(html).not.toContain('object');
    expect(html).not.toContain('embed');
  });

  it('strips on* event handlers', () => {
    const html = sanitizeTemplateHtml(
      '<button data-action="open-invitation" onclick="alert(1)">Open</button>',
    );
    expect(html).toContain('data-action="open-invitation"');
    expect(html).not.toContain('onclick');
  });

  it('strips javascript: URLs', () => {
    const html = sanitizeTemplateHtml(
      '<a href="javascript:alert(1)">click</a>',
    );
    expect(html).not.toContain('javascript:');
  });

  it('strips data: SVG URLs in img src', () => {
    const html = sanitizeTemplateHtml(
      '<img src="data:image/svg+xml;base64,PHN2Zy8+" alt="">',
    );
    expect(html).not.toContain('data:image');
  });

  it('preserves allowed data-* hooks', () => {
    const html = sanitizeTemplateHtml(
      '<div data-countdown data-countdown-target="2026-10-10T10:00:00+08:00"></div><button data-music-toggle></button>',
    );
    expect(html).toContain('data-countdown');
    expect(html).toContain('data-countdown-target');
    expect(html).toContain('data-music-toggle');
  });

  it('strips unknown data-* attributes', () => {
    const html = sanitizeTemplateHtml('<div data-evil="x">ok</div>');
    expect(html).not.toContain('data-evil');
  });

  it('strips form action but preserves data-rsvp-form', () => {
    const html = sanitizeTemplateHtml(
      '<form action="https://evil.com" data-rsvp-form method="post"></form>',
    );
    expect(html).toContain('data-rsvp-form');
    expect(html).not.toContain('action=');
  });
});

describe('sanitizeCss', () => {
  it('rejects @import', () => {
    expect(sanitizeCss("@import url('https://evil.com');", ALLOWED_ORIGIN)).toBe('');
  });

  it('rejects expression()', () => {
    expect(sanitizeCss('body{width:expression(alert(1));}', ALLOWED_ORIGIN)).toBe('');
  });

  it('rejects external url()', () => {
    expect(sanitizeCss('a{background:url(https://evil.com/x);}', ALLOWED_ORIGIN)).toBe('');
  });

  it('rejects data: url()', () => {
    expect(sanitizeCss('a{background:url(data:image/svg+xml;base64,x);}', ALLOWED_ORIGIN)).toBe('');
  });

  it('accepts same-origin url()', () => {
    const out = sanitizeCss('a{background:url(https://cdn.undangan.ai/bg.png);}', ALLOWED_ORIGIN);
    expect(out).toContain('https://cdn.undangan.ai/bg.png');
  });

  it('accepts plain CSS with no url()', () => {
    const css = '.inv{color:#000;font-size:1rem;}';
    expect(sanitizeCss(css, ALLOWED_ORIGIN)).toBe(css);
  });
});
