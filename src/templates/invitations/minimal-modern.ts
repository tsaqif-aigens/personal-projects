// Base template: "minimal-modern". Clean, geometric, generous whitespace.
// Same data-* hooks and Mustache contract as the others.
export const minimalModernTemplate = `<style>
.inv { margin: 0; }
.inv, .inv * { box-sizing: border-box; }
.inv { background: var(--color-background); color: var(--color-text); font-family: var(--font-body); -webkit-font-smoothing: antialiased; }
.inv section { padding: 56px 24px; max-width: 600px; margin: 0 auto; }
.inv .inv-cover { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; overflow: hidden; }
.inv .inv-cover-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.85; }
.inv .inv-cover-inner { position: relative; z-index: 1; padding: 24px; }
.inv h1, .inv h2, .inv h3 { font-family: var(--font-heading); color: var(--color-text); line-height: 1.2; letter-spacing: -0.01em; }
.inv .inv-script { font-family: var(--font-script); color: var(--color-accent); font-size: 1.8rem; }
.inv .inv-arabic { font-family: var(--font-arabic); direction: rtl; font-size: 1.5rem; color: var(--color-text); }
.inv .inv-btn { display: inline-block; padding: 12px 24px; border-radius: 6px; background: var(--color-primary); color: var(--color-background); text-decoration: none; font-weight: 600; letter-spacing: 0.02em; }
.inv .inv-btn--ghost { background: transparent; color: var(--color-primary); border: 1px solid var(--color-primary); }
.inv .inv-couple { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: center; }
.inv .inv-couple-photo { width: 120px; height: 120px; border-radius: 8px; object-fit: cover; }
.inv .inv-event { border-left: 3px solid var(--color-accent); padding: 16px 20px; margin-bottom: 16px; text-align: left; background: var(--color-surface); }
.inv .inv-countdown { display: flex; gap: 8px; justify-content: center; }
.inv .inv-countdown span { border: 1px solid var(--color-text-muted); border-radius: 8px; padding: 14px; min-width: 60px; font-family: var(--font-heading); }
.inv .inv-gift-list { list-style: none; padding: 0; }
.inv .inv-gift-list li { border: 1px solid var(--color-text-muted); border-radius: 8px; padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
.inv .inv-copy-btn { border: none; background: var(--color-primary); color: var(--color-background); border-radius: 6px; padding: 8px 14px; cursor: pointer; }
.inv .inv-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.inv .inv-gallery img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; cursor: pointer; }
.inv .inv-form { display: flex; flex-direction: column; gap: 12px; }
.inv .inv-form input, .inv .inv-form textarea, .inv .inv-form select { padding: 12px; border: 1px solid var(--color-text-muted); border-radius: 6px; font-family: var(--font-body); }
.inv .inv-wish { border: 1px solid var(--color-text-muted); border-radius: 8px; padding: 16px; margin-bottom: 12px; }
.inv .inv-music { position: fixed; bottom: 16px; right: 16px; z-index: 10; border-radius: 50%; width: 48px; height: 48px; border: none; background: var(--color-primary); color: var(--color-background); cursor: pointer; }
.inv .inv-closing { text-align: center; }
</style>
<section data-section="cover" class="inv-cover">
  <img class="inv-cover-photo" src="{{cover.photo_url}}" alt="">
  <div class="inv-cover-inner">
    <p class="inv-script">Undangan Pernikahan</p>
    <h1>{{couple.bride.nickname}} &amp; {{couple.groom.nickname}}</h1>
    <p>{{cover.date_short}}</p>
    <p>Kepada Yth. {{guest.name}}</p>
    <button class="inv-btn" data-action="open-invitation">Buka Undangan</button>
  </div>
</section>
<section data-section="opening" class="inv-opening">
  <p>{{copy.opening_line}}</p>
</section>
<section data-section="quote" class="inv-quote">
  <p class="inv-arabic">{{quote.arabic}}</p>
  <p>{{quote.translation}}</p>
  <p class="inv-script">{{quote.source}}</p>
</section>
<section data-section="couple" class="inv-couple-section">
  <div class="inv-couple">
    <div>
      <img class="inv-couple-photo" src="{{couple.bride.photo_url}}" alt="{{couple.bride.full_name}}">
      <h2>{{couple.bride.full_name}}</h2>
      <p>{{couple.bride.father}} &amp; {{couple.bride.mother}}</p>
      <a href="{{couple.bride.instagram_url}}">@{{couple.bride.nickname}}</a>
    </div>
    <div>
      <img class="inv-couple-photo" src="{{couple.groom.photo_url}}" alt="{{couple.groom.full_name}}">
      <h2>{{couple.groom.full_name}}</h2>
      <p>{{couple.groom.father}} &amp; {{couple.groom.mother}}</p>
      <a href="{{couple.groom.instagram_url}}">@{{couple.groom.nickname}}</a>
    </div>
  </div>
</section>
<section data-section="events" class="inv-events">
  {{#events}}
  <div class="inv-event">
    <h3>{{title}}</h3>
    <p>{{date_label}}</p>
    <p>{{time_label}}</p>
    <p>{{venue_name}}</p>
    <p>{{address}}</p>
    <a class="inv-btn inv-btn--ghost" href="{{maps_url}}">Lihat Lokasi</a>
  </div>
  {{/events}}
</section>
<section data-section="countdown" class="inv-countdown-section">
  <div class="inv-countdown" data-countdown data-countdown-target="{{countdown.target_iso}}"></div>
  <a class="inv-btn inv-btn--ghost" href="{{countdown.calendar_url}}">Simpan ke Kalender</a>
</section>
<section data-section="gift" class="inv-gift">
  {{#gifts.enabled}}
  <p>{{copy.gift_intro}}</p>
  <ul class="inv-gift-list">
    {{#gifts.accounts}}
    <li>
      <span><strong>{{bank}}</strong><br>{{holder}} — {{number}}</span>
      <button class="inv-copy-btn" data-copy="{{number}}">Salin</button>
    </li>
    {{/gifts.accounts}}
  </ul>
  <p>{{gifts.address.text}} — {{gifts.address.recipient}} ({{gifts.address.phone}})</p>
  {{/gifts.enabled}}
</section>
<section data-section="rsvp" class="inv-rsvp">
  <p>{{copy.wish_intro}}</p>
  <form class="inv-form" data-rsvp-form>
    <input type="text" name="name" placeholder="Nama Anda" required>
    <select name="attendance">
      <option value="hadir">Hadir</option>
      <option value="akan_hadir">Akan Hadir</option>
      <option value="tidak_hadir">Tidak Hadir</option>
    </select>
    <textarea name="message" placeholder="Tulis ucapan &amp; doa" rows="3"></textarea>
    <button class="inv-btn" type="submit">Kirim</button>
  </form>
  <div data-wishes-list></div>
</section>
<section data-section="gallery" class="inv-gallery-section">
  <div class="inv-gallery">
    {{#gallery}}
    <img src="{{url}}" alt="{{alt}}" data-lightbox>
    {{/gallery}}
  </div>
</section>
<section data-section="love_story" class="inv-story">
  {{#love_story}}
  <h3>{{title}}</h3>
  <p>{{text}}</p>
  {{/love_story}}
</section>
<section data-section="closing" class="inv-closing">
  <p class="inv-script">Terima Kasih</p>
  <p>{{copy.closing_prayer}}</p>
  <p>{{copy.footer}}</p>
</section>
{{#music.enabled}}
<button class="inv-music" data-music-toggle aria-label="Musik">♪</button>
{{/music.enabled}}
`;
