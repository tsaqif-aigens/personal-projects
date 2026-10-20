import 'server-only';
import type { Vars } from '@/validations/VarsValidation';
import { GOOGLE_FONTS } from '@/validations/ThemeValidation';
import { RELIGIOUS_QUOTE } from '@/server/invitation/constants';

const GOOGLE_FONTS_LIST = GOOGLE_FONTS.join(', ');

// ---------------------------------------------------------------------------
// Step A: vision + text. The AI receives (resized) photos and the couple's
// form data, then returns STRICT JSON: `theme` (palette/fonts/mood) plus the
// generated `copy` and `love_story` values. The Arabic verse is NEVER generated
// here — it is a fixed constant injected by our code.
// ---------------------------------------------------------------------------

export interface StepAInput {
  // Form data (already validated by zod). Contains names, events, gifts, etc.
  formData: Record<string, unknown>;
  // Data URLs or storage URLs of the resized photos. The model uses these to
  // derive a palette and mood (vision).
  photoUrls: string[];
  // The user's style preference: 'auto' or a base template key.
  stylePreference: string;
}

export const STEP_A_SYSTEM_PROMPT = `Anda adalah desainer undangan pernikahan digital profesional untuk pasar Indonesia. Anda menghasilkan undangan Islami yang elegan dan hangat, bernada "sakinah, mawaddah, warahmah".

TUGAS ANDA (langkah pertama dari dua langkah):
Menganalisis foto-foto yang diberikan dan data pasangan, lalu menghasilkan HANYA JSON yang valid (tanpa markdown, tanpa komentar) dengan struktur persis berikut:

{
  "theme": {
    "palette": {
      "primary": "#rrggbb",
      "secondary": "#rrggbb",
      "accent": "#rrggbb",
      "background": "#rrggbb",
      "surface": "#rrggbb",
      "text": "#rrggbb",
      "text_muted": "#rrggbb",
      "overlay": "#rrggbb"
    },
    "fonts": {
      "heading": "Nama Font Google",
      "body": "Nama Font Google",
      "script": "Nama Font Google",
      "arabic": "Nama Font Google"
    },
    "mood": "deskripsi singkat mood/karakter desain dalam Bahasa Indonesia"
  },
  "copy": {
    "opening_line": "kalimat pembuka undangan (Bahasa Indonesia, sopan & islami)",
    "closing_prayer": "doa penutup (Bahasa Indonesia)",
    "gift_intro": "kalimat pengantar bagian hadiah/amplop",
    "wish_intro": "kalimat pengantar bagian ucapan/RSVP",
    "footer": "baris footer singkat"
  },
  "love_story": [
    { "title": "judul momen", "text": "1-2 kalimat lembut tentang momen ini" }
  ]
}

ATURAN PENTING:
1. PALETTE harus diturunkan dari warna dominan dan mood foto. Pastikan kontras teks terhadap latar minimal WCAG AA: rasio >= 4.5:1 untuk teks normal (text vs background), >= 3:1 untuk teks besar/sekunder (text_muted, primary vs background). Gunakan warna hex #rrggbb.
2. FONT hanya boleh dipilih dari daftar whitelist ini: ${GOOGLE_FONTS_LIST}.
3. JANGAN pernah menulis, mengubah, atau menerjemahkan ayat Al-Qur'an. Ayat Arab dan terjemahannya sudah menjadi konstanta tetap di sistem kami.
4. copy dan love_story harus sopan, hangat, islami, dan dalam Bahasa Indonesia. love_story boleh 0-4 item; jika pasangan mengisi sendiri, gunakan milik mereka (jangan menimpa).
5. Jika stylePreference bukan "auto", gunakan karakter gaya tersebut (Elegan = mewah/emas, Floral = lembut/romantis, Minimalis = bersih/modern).
6. Keluarkan JSON saja. Tanpa teks lain.`;

export const buildStepAPrompt = (input: StepAInput): string => {
  const { formData, photoUrls, stylePreference } = input;

  return `Berikut data pasangan (JSON):
${JSON.stringify(formData, null, 2)}

Foto-foto (${photoUrls.length} gambar, sudah diresize):
${photoUrls.map((url, i) => `[Foto ${i + 1}] ${url}`).join('\n')}

Preferensi gaya: ${stylePreference}

Hasilkan JSON sesuai kontrak di atas.`;
};

// ---------------------------------------------------------------------------
// Step B: text. The AI receives the theme + a base template example + the
// template contract, and outputs ONLY the Mustache template markup.
// ---------------------------------------------------------------------------

export interface StepBInput {
  theme: Record<string, unknown>;
  // The closest base template as a few-shot starting point.
  baseTemplate: string;
}

export const STEP_B_SYSTEM_PROMPT = `Anda adalah front-end engineer ahli yang membuat markup undangan pernikahan digital (Bahasa Indonesia, mobile-first, Islami).

TUGAS ANDA (langkah kedua dari dua langkah):
Menghasilkan HANYA markup HTML (tanpa <html>, <head>, <body>, tanpa markdown) untuk undangan. Markup adalah daftar terurut <section data-section="..."> yang menggunakan placeholder Mustache ({{...}}) untuk SEMUA konten dinamis.

KONTRAK WAJIB (setiap section dan placeholder berikut HARUS ada):
- section data-section="cover": {{cover.photo_url}}, {{couple.bride.nickname}}, {{couple.groom.nickname}}, {{cover.date_short}}, {{guest.name}}, dan tombol dengan data-action="open-invitation"
- section data-section="opening": {{copy.opening_line}}
- section data-section="quote": {{quote.arabic}}, {{quote.translation}}, {{quote.source}}
- section data-section="couple": {{couple.bride.full_name}}, {{couple.bride.photo_url}}, {{couple.bride.father}}, {{couple.bride.mother}}, {{couple.bride.instagram_url}}, {{couple.groom.full_name}}, {{couple.groom.photo_url}}, {{couple.groom.father}}, {{couple.groom.mother}}, {{couple.groom.instagram_url}}
- section data-section="events": loop {{#events}} dengan {{title}}, {{date_label}}, {{time_label}}, {{venue_name}}, {{address}}, {{maps_url}} lalu {{/events}}
- section data-section="countdown": elemen dengan data-countdown dan data-countdown-target="{{countdown.target_iso}}", serta tautan {{countdown.calendar_url}}
- section data-section="gift" (konten dibungkus {{#gifts.enabled}}): loop {{#gifts.accounts}} dengan tombol data-copy="{{number}}", {{bank}}, {{holder}}, lalu {{/gifts.accounts}}, serta blok alamat {{gifts.address.text}}, {{gifts.address.recipient}}, {{gifts.address.phone}}, lalu {{/gifts.enabled}}
- section data-section="rsvp": <form data-rsvp-form> (field: name, attendance, message) dan <div data-wishes-list>
- section data-section="gallery": loop {{#gallery}} dengan <img src="{{url}}" alt="{{alt}}" data-lightbox> lalu {{/gallery}}
- section data-section="love_story": loop {{#love_story}} dengan {{title}}, {{text}} lalu {{/love_story}}
- section data-section="closing": {{copy.closing_prayer}}, {{copy.footer}}
- (opsional) jika musik aktif: <button data-music-toggle>

ATURAN PENTING:
1. Anda BOLEH bebas mendesain markup, nama class (semua class diawali .inv), ornamen SVG inline, tata letak, dan CSS dalam SATU <style> block (semua selector diawali .inv).
2. Anda DILARANG menulis JavaScript apa pun. Semua interaktivitas ditangani runtime pihak pertama kami melalui hook data-*.
3. DILARANG menggunakan triple-mustache {{{ }}}, partial {{> }}, atau komentar Mustache berisi kode.
4. DILARANG <script>, <iframe>, <object>, <embed>, atribut on*, URL javascript:/data:.
5. CSS dilarang @import, url() ke domain luar, expression().
6. Ukuran total maksimal 200.000 karakter.
7. Gunakan desain mobile-first yang indah dan elegan. Semua teks UI dalam Bahasa Indonesia.
8. Keluarkan markup HTML saja. Tanpa teks penjelasan.`;

export const buildStepBPrompt = (input: StepBInput): string => {
  return `Tema yang telah dipilih (JSON):
${JSON.stringify(input.theme, null, 2)}

Terapkan token palet/font tema ini ke dalam CSS Anda menggunakan CSS custom properties (--color-primary, --color-secondary, --color-accent, --color-background, --color-surface, --color-text, --color-text-muted, --color-overlay, --font-heading, --font-body, --font-script, --font-arabic).

Template dasar rujukan (ikuti struktur section & placeholder-nya, tapi desain boleh Anda ubah):
${input.baseTemplate}

Hasilkan markup HTML undangan sesuai kontrak.`;
};

// The religious quote is injected into vars by our code — never by the AI.
export const buildVarsWithQuote = (vars: Omit<Vars, 'quote'>): Vars => ({
  ...vars,
  quote: RELIGIOUS_QUOTE,
});
