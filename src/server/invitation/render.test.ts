import { describe, expect, it } from 'vitest';
import type { Theme } from '@/validations/ThemeValidation';
import type { Vars } from '@/validations/VarsValidation';
import {
  buildCspHeader,
  generateNonce,
  renderInvitationDocument,
} from './render';
import type { InvitationRow } from './render';

const theme: Theme = {
  palette: {
    primary: '#b8860b',
    secondary: '#4a3728',
    accent: '#d4af37',
    background: '#fffdf5',
    surface: '#faf6ec',
    text: '#2d2a26',
    text_muted: '#6b6559',
    overlay: '#000000',
  },
  fonts: {
    heading: 'Playfair Display',
    body: 'Poppins',
    script: 'Great Vibes',
    arabic: 'Amiri',
  },
  mood: 'elegan & hangat',
};

const vars: Vars = {
  couple: {
    bride: {
      full_name: 'Siti Aminah',
      nickname: 'Aminah',
      father: 'Bapak Ahmad',
      mother: 'Ibu Siti',
      father_deceased: false,
      mother_deceased: false,
      instagram_url: '',
      photo_url: '',
    },
    groom: {
      full_name: 'Budi Santoso',
      nickname: 'Budi',
      father: 'Bapak Rudi',
      mother: 'Ibu Dewi',
      father_deceased: false,
      mother_deceased: false,
      instagram_url: '',
      photo_url: '',
    },
  },
  cover: {
    photo_url: '',
    date_short: '10 . 10 . 26',
  },
  events: [
    {
      key: 'akad',
      title: 'Akad Nikah',
      date_label: 'Sabtu, 10 Oktober 2026',
      time_label: '10.00 WITA - Selesai',
      venue_name: 'Masjid Agung',
      address: 'Jl. Contoh No. 1',
      maps_url: '',
    },
  ],
  countdown: {
    target_iso: '2026-10-10T10:00:00+08:00',
    calendar_url: '',
  },
  gifts: {
    enabled: true,
    accounts: [],
    address: { text: '', recipient: '', phone: '' },
  },
  gallery: [],
  quote: {
    arabic: 'وَمِنْ آيَاتِهِ',
    translation: 'Dan di antara tanda-tanda...',
    source: 'QS Ar-Rum 21',
  },
  copy: {
    opening_line: 'Assalamu\'alaikum',
    closing_prayer: 'Wassalamu\'alaikum',
    gift_intro: 'Terima kasih',
    wish_intro: 'Tulis doa',
    footer: 'Dibuat dengan cinta',
  },
  love_story: [],
  music: { enabled: false, url: null, title: null },
  meta: {
    og_title: 'Undangan Aminah & Budi',
    og_description: 'Kami mengundang Anda',
    og_image_url: '',
  },
};

const row: InvitationRow = {
  slug: 'aminah-budi',
  id: 'inv_00000000-0000-4000-8000-000000000000',
  htmlTemplate: `
<section data-section="cover">
  <h1>{{couple.bride.nickname}} & {{couple.groom.nickname}}</h1>
  <p>{{cover.date_short}}</p>
  <p>{{guest.name}}</p>
  <button data-action="open-invitation">Buka Undangan</button>
</section>
<section data-section="opening"><p>{{copy.opening_line}}</p></section>
<section data-section="quote"><p>{{quote.arabic}}</p><p>{{quote.translation}}</p><p>{{quote.source}}</p></section>
<section data-section="couple">
  <h2>{{couple.bride.full_name}}</h2><img src="{{couple.bride.photo_url}}" alt="">
  <p>{{couple.bride.father}}</p><p>{{couple.bride.mother}}</p><a href="{{couple.bride.instagram_url}}">IG</a>
  <h2>{{couple.groom.full_name}}</h2><img src="{{couple.groom.photo_url}}" alt="">
  <p>{{couple.groom.father}}</p><p>{{couple.groom.mother}}</p><a href="{{couple.groom.instagram_url}}">IG</a>
</section>
<section data-section="events">{{#events}}<h3>{{title}}</h3><p>{{date_label}}</p><p>{{time_label}}</p><p>{{venue_name}}</p><p>{{address}}</p><a href="{{maps_url}}">Maps</a>{{/events}}</section>
<section data-section="countdown"><div data-countdown data-countdown-target="{{countdown.target_iso}}"></div><a href="{{countdown.calendar_url}}">Kalender</a></section>
<section data-section="gift">{{#gifts.enabled}}{{#gifts.accounts}}<button data-copy="{{number}}">{{bank}}</button>{{/gifts.accounts}}{{/gifts.enabled}}</section>
<section data-section="rsvp"><form data-rsvp-form></form><div data-wishes-list></div></section>
<section data-section="gallery">{{#gallery}}<img src="{{url}}" alt="{{alt}}" data-lightbox>{{/gallery}}</section>
<section data-section="love_story">{{#love_story}}<h3>{{title}}</h3><p>{{text}}</p>{{/love_story}}</section>
<section data-section="closing"><p>{{copy.closing_prayer}}</p><p>{{copy.footer}}</p></section>
`,
  vars,
  theme,
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('renderInvitationDocument', () => {
  it('renders the full HTML document shell', () => {
    const html = renderInvitationDocument(row, {});
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<html lang="id">');
    expect(html).toContain('</html>');
  });

  it('injects the theme palette as CSS custom properties', () => {
    const html = renderInvitationDocument(row, {});
    expect(html).toContain('--color-primary: #b8860b;');
    expect(html).toContain('--font-heading: \'Playfair Display\', serif;');
  });

  it('renders Mustache placeholders with vars content', () => {
    const html = renderInvitationDocument(row, {});
    expect(html).toContain('Aminah & Budi');
    expect(html).toContain('Assalamu&#39;alaikum');
    expect(html).toContain('Masjid Agung');
  });

  it('escapes a guest name from ?to=', () => {
    const html = renderInvitationDocument(row, { guestName: '<script>alert(1)</script>' });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
  });

  it('injects a PREVIEW watermark only in preview mode', () => {
    expect(renderInvitationDocument(row, {})).not.toContain('inv-preview-watermark');
    expect(renderInvitationDocument(row, { preview: true })).toContain('inv-preview-watermark');
  });

  it('builds meta tags from vars.meta', () => {
    const html = renderInvitationDocument(row, {});
    expect(html).toContain('<title>Undangan Aminah &amp; Budi</title>');
    expect(html).toContain('name="robots" content="noindex,nofollow"');
  });

  it('links the runtime script with a nonce', () => {
    const html = renderInvitationDocument(row, { nonce: 'abc123', appUrl: 'https://undangan.ai' });
    expect(html).toContain('src="https://undangan.ai/invitation-runtime.js"');
    expect(html).toContain('nonce="abc123"');
  });

  it('injects the invitation id and api base for the runtime', () => {
    const html = renderInvitationDocument(row, { appUrl: 'https://undangan.ai' });
    expect(html).toContain('data-invitation-id="inv_00000000-0000-4000-8000-000000000000"');
    expect(html).toContain('data-api-base="https://undangan.ai"');
  });
});

describe('buildCspHeader', () => {
  it('includes script nonce and storage origin', () => {
    const csp = buildCspHeader('nonce-xyz', 'https://cdn.undangan.ai');
    expect(csp).toContain("script-src 'self' 'nonce-nonce-xyz'");
    expect(csp).toContain('img-src');
    expect(csp).toContain('https://cdn.undangan.ai');
    expect(csp).toContain("font-src https://fonts.gstatic.com");
    expect(csp).toContain("frame-ancestors 'none'");
  });
});

describe('generateNonce', () => {
  it('produces unique base64 nonces', () => {
    const a = generateNonce();
    const b = generateNonce();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(0);
  });
});
