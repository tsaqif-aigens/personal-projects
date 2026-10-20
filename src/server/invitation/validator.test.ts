import { describe, expect, it } from 'vitest';
import {
  extractPlaceholders,
  extractSections,
  detectForbiddenMustache,
  validateTemplate,
} from './validator';

const ALLOWED_ORIGIN = 'https://cdn.undangan.ai';

// A minimal valid template containing every required section + placeholder.
const validTemplate = `
<section data-section="cover">
  <img src="{{cover.photo_url}}" alt="">
  <h1>{{couple.bride.nickname}} & {{couple.groom.nickname}}</h1>
  <p>{{cover.date_short}}</p>
  <p>{{guest.name}}</p>
  <button data-action="open-invitation">Buka Undangan</button>
</section>
<section data-section="opening">
  <p>{{copy.opening_line}}</p>
</section>
<section data-section="quote">
  <p>{{quote.arabic}}</p>
  <p>{{quote.translation}}</p>
  <p>{{quote.source}}</p>
</section>
<section data-section="couple">
  <div>
    <img src="{{couple.bride.photo_url}}" alt="">
    <h2>{{couple.bride.full_name}}</h2>
    <p>{{couple.bride.father}}</p>
    <p>{{couple.bride.mother}}</p>
    <a href="{{couple.bride.instagram_url}}">IG</a>
  </div>
  <div>
    <img src="{{couple.groom.photo_url}}" alt="">
    <h2>{{couple.groom.full_name}}</h2>
    <p>{{couple.groom.father}}</p>
    <p>{{couple.groom.mother}}</p>
    <a href="{{couple.groom.instagram_url}}">IG</a>
  </div>
</section>
<section data-section="events">
  {{#events}}
  <div>
    <h3>{{title}}</h3>
    <p>{{date_label}}</p>
    <p>{{time_label}}</p>
    <p>{{venue_name}}</p>
    <p>{{address}}</p>
    <a href="{{maps_url}}">Maps</a>
  </div>
  {{/events}}
</section>
<section data-section="countdown">
  <div data-countdown data-countdown-target="{{countdown.target_iso}}"></div>
  <a href="{{countdown.calendar_url}}">Kalender</a>
</section>
<section data-section="gift">
  {{#gifts.enabled}}
  {{#gifts.accounts}}
  <button data-copy="{{number}}">{{bank}} - {{holder}}</button>
  {{/gifts.accounts}}
  {{/gifts.enabled}}
</section>
<section data-section="rsvp">
  <form data-rsvp-form></form>
  <div data-wishes-list></div>
</section>
<section data-section="gallery">
  {{#gallery}}
  <img src="{{url}}" alt="{{alt}}" data-lightbox>
  {{/gallery}}
</section>
<section data-section="love_story">
  {{#love_story}}
  <h3>{{title}}</h3>
  <p>{{text}}</p>
  {{/love_story}}
</section>
<section data-section="closing">
  <p>{{copy.closing_prayer}}</p>
  <p>{{copy.footer}}</p>
</section>
`;

describe('extractPlaceholders', () => {
  it('extracts double-mustache placeholders', () => {
    const result = extractPlaceholders('{{couple.bride.nickname}} and {{cover.photo_url}}');
    expect(result).toEqual(['couple.bride.nickname', 'cover.photo_url']);
  });

  it('ignores triple-mustache placeholders', () => {
    const result = extractPlaceholders('{{{raw}}} {{ok}}');
    expect(result).toEqual(['ok']);
  });

  it('ignores section open/close tags', () => {
    const result = extractPlaceholders('{{#events}}{{title}}{{/events}}');
    expect(result).toEqual(['title']);
  });

  it('ignores inverted sections', () => {
    const result = extractPlaceholders('{{^music}}none{{/music}}');
    expect(result).toEqual([]);
  });
});

describe('extractSections', () => {
  it('extracts data-section values', () => {
    const result = extractSections(
      '<section data-section="cover"></section><section data-section="gift"></section>',
    );
    expect(result).toContain('cover');
    expect(result).toContain('gift');
  });

  it('is case-insensitive on attribute values', () => {
    const result = extractSections('<section data-section="COVER"></section>');
    expect(result).toContain('COVER');
  });
});

describe('detectForbiddenMustache', () => {
  it('detects triple-mustache', () => {
    const result = detectForbiddenMustache('{{{couple.bride.nickname}}}');
    expect(result.some((m) => m.includes('Triple-mustache'))).toBe(true);
  });

  it('detects partials', () => {
    const result = detectForbiddenMustache('{{> header}}');
    expect(result.some((m) => m.includes('Partials'))).toBe(true);
  });

  it('detects code-like comments', () => {
    const result = detectForbiddenMustache('{{! <script>alert(1)</script> }}');
    expect(result.some((m) => m.includes('comment'))).toBe(true);
  });

  it('allows benign comments', () => {
    const result = detectForbiddenMustache('{{! hero section }}');
    expect(result).toHaveLength(0);
  });
});

describe('validateTemplate', () => {
  it('accepts a complete valid template', () => {
    const result = validateTemplate(validTemplate, ALLOWED_ORIGIN);
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('rejects an empty template', () => {
    const result = validateTemplate('', ALLOWED_ORIGIN);
    expect(result.valid).toBe(false);
  });

  it('rejects a missing section', () => {
    const missing = validTemplate.replace(
      '<section data-section="opening">',
      '<section data-section="xopening">',
    );
    const result = validateTemplate(missing, ALLOWED_ORIGIN);
    expect(result.valid).toBe(false);
    expect(
      result.issues.some((i) => i.message.includes('opening')),
    ).toBe(true);
  });

  it('rejects a missing required placeholder', () => {
    const missing = validTemplate.replace('{{cover.date_short}}', '');
    const result = validateTemplate(missing, ALLOWED_ORIGIN);
    expect(result.valid).toBe(false);
    expect(
      result.issues.some((i) => i.message.includes('cover.date_short')),
    ).toBe(true);
  });

  it('rejects an unknown placeholder root', () => {
    const bad = `${validTemplate} {{evil.pwn}}`;
    const result = validateTemplate(bad, ALLOWED_ORIGIN);
    expect(result.valid).toBe(false);
    expect(
      result.issues.some((i) => i.message.includes('evil.pwn')),
    ).toBe(true);
  });

  it('rejects triple-mustache', () => {
    const bad = `${validTemplate} {{{copy.opening_line}}}`;
    const result = validateTemplate(bad, ALLOWED_ORIGIN);
    expect(result.valid).toBe(false);
  });

  it('rejects an @import in inline CSS', () => {
    const bad = `${validTemplate}<style>.inv{@import url('https://evil.com');}</style>`;
    const result = validateTemplate(bad, ALLOWED_ORIGIN);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.path === 'style')).toBe(true);
  });

  it('rejects an external url() in inline CSS', () => {
    const bad = `${validTemplate}<style>.inv{background:url(https://evil.com/x.png);}</style>`;
    const result = validateTemplate(bad, ALLOWED_ORIGIN);
    expect(result.valid).toBe(false);
  });

  it('accepts a url() pointing at the allowed origin', () => {
    const good = `${validTemplate}<style>.inv{background:url(https://cdn.undangan.ai/bg.png);}</style>`;
    const result = validateTemplate(good, ALLOWED_ORIGIN);
    expect(result.valid).toBe(true);
  });

  it('rejects a template over the size limit', () => {
    const huge = `${validTemplate}<div>${'x'.repeat(210000)}</div>`;
    const result = validateTemplate(huge, ALLOWED_ORIGIN);
    expect(result.valid).toBe(false);
    expect(
      result.issues.some((i) => i.message.includes('exceeds')),
    ).toBe(true);
  });
});
