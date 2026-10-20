/**
 * invitation-runtime.js — first-party runtime for AI wedding invitations.
 *
 * This script is loaded by the invitation shell and drives ALL interactivity
 * via `data-*` hooks. The AI-generated template contains NO JavaScript; this
 * file is the only script that runs on an invitation page.
 *
 * Hooks handled here:
 *  - data-action="open-invitation"      -> reveal content, start music
 *  - data-countdown + data-countdown-target -> live countdown
 *  - data-copy                          -> copy text to clipboard
 *  - data-lightbox                      -> simple full-screen image viewer
 *  - data-rsvp-form                     -> submit RSVP to the API
 *  - data-wishes-list                   -> load + paginate wishes
 *  - data-music-toggle                  -> play/pause music
 *
 * In preview mode (body[data-preview="true"]) RSVP/wishes/music are disabled.
 */
(function () {
  'use strict';

  var isPreview = document.body.hasAttribute('data-preview');

  /* ------------------------------------------------------------------ *
   * Runtime-owned styles (lightbox, section reveal, cover transition).
   * These are UI elements owned by the runtime, not the AI template.
   * ------------------------------------------------------------------ */
  function injectRuntimeStyles() {
    if (document.getElementById('inv-runtime-styles')) return;
    var style = document.createElement('style');
    style.id = 'inv-runtime-styles';
    style.textContent = [
      // Cover transition
      '.inv-cover { transition: opacity 0.5s ease; }',
      '.inv-cover.inv-cover--open { opacity: 1; }',
      // Section reveal
      'section[data-section] { opacity: 0; transform: translateY(16px); transition: opacity 0.6s ease, transform 0.6s ease; }',
      'section[data-section="cover"] { opacity: 1; transform: none; }',
      'section[data-section].inv-section--visible { opacity: 1; transform: none; }',
      'body.inv-opened section[data-section="cover"] { min-height: auto; }',
      // Lightbox
      '.inv-lightbox { position: fixed; inset: 0; z-index: 10000; display: none; align-items: center; justify-content: center; }',
      '.inv-lightbox.inv-lightbox--open { display: flex; }',
      '.inv-lightbox-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.85); }',
      '.inv-lightbox-img { position: relative; max-width: 92vw; max-height: 92vh; border-radius: 8px; }',
      '.inv-lightbox-close { position: absolute; top: 16px; right: 16px; width: 44px; height: 44px; border-radius: 50%; border: none; background: rgba(255,255,255,0.2); color: #fff; font-size: 1.5rem; cursor: pointer; }',
      // Music button playing state
      '.inv-music.inv-music--playing { animation: inv-spin 3s linear infinite; }',
      '@keyframes inv-spin { to { transform: rotate(360deg); } }',
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------ *
   * Cover: "Buka Undangan" reveals the rest of the page.
   * ------------------------------------------------------------------ */
  function setupOpenInvitation() {
    var buttons = document.querySelectorAll('[data-action="open-invitation"]');
    if (buttons.length === 0) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cover = document.querySelector('[data-section="cover"]');
        if (cover) cover.classList.add('inv-cover--open');

        // Reveal all non-cover sections.
        document.querySelectorAll('section[data-section]').forEach(function (s) {
          if (s.getAttribute('data-section') !== 'cover') {
            s.classList.add('inv-section--visible');
          }
        });

        if (!isPreview) maybeStartMusic();

        document.body.classList.add('inv-opened');
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Countdown
   * ------------------------------------------------------------------ */
  function setupCountdown() {
    var nodes = document.querySelectorAll('[data-countdown]');
    nodes.forEach(function (node) {
      var target = node.getAttribute('data-countdown-target');
      if (!target) return;

      var end = new Date(target).getTime();
      if (Number.isNaN(end)) return;

      var tick = function () {
        var now = Date.now();
        var diff = end - now;

        if (diff <= 0) {
          node.textContent = 'Hari ini!';
          return;
        }

        var days = Math.floor(diff / 86400000);
        var hours = Math.floor((diff % 86400000) / 3600000);
        var minutes = Math.floor((diff % 3600000) / 60000);
        var seconds = Math.floor((diff % 60000) / 1000);

        node.innerHTML = '';
        [['Hari', days], ['Jam', hours], ['Menit', minutes], ['Detik', seconds]]
          .forEach(function (part) {
            var span = document.createElement('span');
            span.textContent = part[1];
            span.setAttribute('data-countdown-unit', part[0]);
            node.appendChild(span);
          });
      };

      tick();
      setInterval(tick, 1000);
    });
  }

  /* ------------------------------------------------------------------ *
   * Copy to clipboard
   * ------------------------------------------------------------------ */
  function setupCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy') || '';
        copyText(text).then(function (ok) {
          var original = btn.textContent;
          btn.textContent = ok ? 'Tersalin!' : 'Gagal';
          setTimeout(function () { btn.textContent = original; }, 1500);
        });
      });
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; })
        .catch(function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (_e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  /* ------------------------------------------------------------------ *
   * Lightbox
   * ------------------------------------------------------------------ */
  function setupLightbox() {
    var overlay = document.createElement('div');
    overlay.className = 'inv-lightbox';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<div class="inv-lightbox-backdrop"></div>' +
      '<img class="inv-lightbox-img" alt="" />' +
      '<button class="inv-lightbox-close" aria-label="Tutup">&times;</button>';
    document.body.appendChild(overlay);

    var img = overlay.querySelector('.inv-lightbox-img');
    var close = function () {
      overlay.classList.remove('inv-lightbox--open');
      overlay.setAttribute('aria-hidden', 'true');
    };

    overlay.querySelector('.inv-lightbox-backdrop').addEventListener('click', close);
    overlay.querySelector('.inv-lightbox-close').addEventListener('click', close);

    document.querySelectorAll('[data-lightbox]').forEach(function (el) {
      el.addEventListener('click', function () {
        if (img) img.src = el.src || '';
        overlay.classList.add('inv-lightbox--open');
        overlay.setAttribute('aria-hidden', 'false');
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * RSVP + wishes
   * ------------------------------------------------------------------ */
  function setupRsvp() {
    var form = document.querySelector('[data-rsvp-form]');
    var wishesList = document.querySelector('[data-wishes-list]');

    if (!form || !wishesList || isPreview) return;

    var invitationId = document.body.getAttribute('data-invitation-id');
    var apiBase = document.body.getAttribute('data-api-base') || '';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('[name="name"]');
      var attendance = form.querySelector('[name="attendance"]');
      var message = form.querySelector('[name="message"]');

      var payload = {
        name: name ? name.value : '',
        attendance: attendance ? attendance.value : 'hadir',
        message: message ? message.value : '',
      };

      fetch(apiBase + '/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId: invitationId, ...payload }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error('RSVP failed');
          return res.json();
        })
        .then(function () {
          form.reset();
          loadWishes();
        })
        .catch(function () {
          alert('Gagal mengirim RSVP. Silakan coba lagi.');
        });
    });

    var page = 0;
    function loadWishes() {
      if (!wishesList) return;
      fetch(apiBase + '/api/wishes?invitationId=' + encodeURIComponent(invitationId || ''))
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var wishes = Array.isArray(data) ? data : data.wishes || [];
          wishesList.innerHTML = '';
          if (wishes.length === 0) {
            wishesList.textContent = 'Belum ada ucapan.';
            return;
          }
          wishes.forEach(function (w) {
            var div = document.createElement('div');
            div.className = 'inv-wish';
            var nameEl = document.createElement('strong');
            nameEl.textContent = w.name || '';
            var msgEl = document.createElement('p');
            msgEl.textContent = w.message || '';
            div.appendChild(nameEl);
            div.appendChild(msgEl);
            wishesList.appendChild(div);
          });
        })
        .catch(function () { /* silent */ });
    }

    loadWishes();
  }

  /* ------------------------------------------------------------------ *
   * Music (only after "Buka Undangan")
   * ------------------------------------------------------------------ */
  var audio = null;
  function maybeStartMusic() {
    var toggle = document.querySelector('[data-music-toggle]');
    if (!toggle) return;

    var src = toggle.getAttribute('data-music-src');
    if (!src) return;

    if (!audio) {
      audio = new Audio(src);
      audio.loop = true;
    }

    audio.play().then(function () {
      toggle.classList.add('inv-music--playing');
    }).catch(function () { /* autoplay blocked; user can tap toggle */ });
  }

  function setupMusic() {
    var toggle = document.querySelector('[data-music-toggle]');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      if (!audio) {
        maybeStartMusic();
        return;
      }
      if (audio.paused) {
        audio.play().then(function () {
          toggle.classList.add('inv-music--playing');
        }).catch(function () {});
      } else {
        audio.pause();
        toggle.classList.remove('inv-music--playing');
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Scroll reveal (CSS + IntersectionObserver)
   * ------------------------------------------------------------------ */
  function setupScrollReveal() {
    if (!('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('inv-section--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('section[data-section]').forEach(function (s) {
      if (s.getAttribute('data-section') !== 'cover') {
        observer.observe(s);
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    injectRuntimeStyles();
    setupOpenInvitation();
    setupCountdown();
    setupCopyButtons();
    setupLightbox();
    setupRsvp();
    setupMusic();
    setupScrollReveal();
  });
})();
