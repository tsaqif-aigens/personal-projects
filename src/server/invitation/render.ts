import 'server-only';
import crypto from 'node:crypto';
import type { Theme } from '@/validations/ThemeValidation';
import type { Vars } from '@/validations/VarsValidation';
import { renderTemplate } from './template';

// A typed representation of a persisted invitation row. We only need the three
// content columns plus the cache key (updated_at).
export interface InvitationRow {
  slug: string;
  id: string;
  htmlTemplate: string;
  vars: Vars;
  theme: Theme;
  updatedAt: Date;
}

export interface RenderOptions {
  // Crypto nonce for the first-party runtime script (CSP).
  nonce?: string;
  // When true, a diagonal "PREVIEW" watermark and disabled runtime features are
  // injected. Used on /preview/[id].
  preview?: boolean;
  // Origin used to resolve the runtime script and storage URLs.
  appUrl?: string;
  // Guest name from ?to=; length-limited and escaped by the renderer.
  guestName?: string;
}

// Builds the Google Fonts <link> tags for the theme. Fonts come from a
// hardcoded whitelist (ThemeValidation), so this cannot inject arbitrary CSS.
const buildFontLinks = (theme: Theme): string => {
  const fonts = new Set<string>([
    theme.fonts.heading,
    theme.fonts.body,
    theme.fonts.script,
    theme.fonts.arabic,
  ]);

  return [...fonts]
    .map((font) => {
      const family = font.replace(/ /g, '+');
      // A conservative axis list; the whitelisted fonts are all variable or
      // static weights supported by Google Fonts.
      return `<link rel="preconnect" href="https://fonts.googleapis.com" />`
        + `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`
        + `<link href="https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700&display=swap" rel="stylesheet" />`;
    })
    .join('\n');
};

// Builds the `:root` CSS custom properties from the theme palette + fonts.
const buildRootStyle = (theme: Theme, preview: boolean): string => {
  const { palette, fonts } = theme;
  const cssVars = [
    `--color-primary: ${palette.primary};`,
    `--color-secondary: ${palette.secondary};`,
    `--color-accent: ${palette.accent};`,
    `--color-background: ${palette.background};`,
    `--color-surface: ${palette.surface};`,
    `--color-text: ${palette.text};`,
    `--color-text-muted: ${palette.text_muted};`,
    `--color-overlay: ${palette.overlay};`,
    `--font-heading: '${fonts.heading}', serif;`,
    `--font-body: '${fonts.body}', sans-serif;`,
    `--font-script: '${fonts.script}', cursive;`,
    `--font-arabic: '${fonts.arabic}', serif;`,
  ].join('\n  ');

  const watermarkCss = preview
    ? `\n.inv-preview-watermark { position: fixed; inset: 0; z-index: 9999; pointer-events: none; display: flex; align-items: center; justify-content: center; font-size: 4rem; font-weight: 700; color: rgba(255,0,0,0.35); transform: rotate(-30deg); letter-spacing: 0.2em; }`
    : '';

  return `:root {\n  ${cssVars}\n}${watermarkCss}`;
};

// Builds OG + Twitter meta tags from vars.meta.
const buildMetaTags = (meta: Vars['meta']): string => {
  const tags = [
    `<title>${escapeHtml(meta.og_title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.og_description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtml(meta.og_title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.og_description)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];

  if (meta.og_image_url) {
    tags.push(`<meta property="og:image" content="${escapeHtml(meta.og_image_url)}" />`);
    tags.push(`<meta name="twitter:image" content="${escapeHtml(meta.og_image_url)}" />`);
  }

  return tags.join('\n  ');
};

// Minimal HTML attribute escaping for content we interpolate into the shell
// (meta titles/descriptions). Unlike Mustache (which escapes the template), this
// guards the shell we author ourselves.
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Renders the full invitation HTML document: shell (head + OG + fonts + CSS
// vars) wrapping the Mustache-rendered template body plus the runtime script.
export const renderInvitationDocument = (
  row: InvitationRow,
  { nonce, preview = false, appUrl, guestName }: RenderOptions,
): string => {
  const { htmlTemplate, vars, theme } = row;

  const body = renderTemplate(htmlTemplate, {
    vars: vars as unknown as Record<string, unknown>,
    guestName,
  });

  const runtimeScript = `${appUrl ?? ''}/invitation-runtime.js`;

  const watermark = preview
    ? `<div class="inv-preview-watermark" aria-hidden="true">PREVIEW</div>`
    : '';

  const nonceAttr = nonce ? ` nonce="${nonce}"` : '';
  const bodyAttrs = [
    preview ? 'data-preview="true"' : '',
    vars.music.enabled && vars.music.url
      ? `data-music-src="${escapeHtml(vars.music.url)}"`
      : '',
    // The runtime needs the invitation id and API base to submit RSVPs and
    // load wishes. id is a UUID so it is safe to interpolate directly.
    `data-invitation-id="${row.id}"`,
    `data-api-base="${escapeHtml(appUrl ?? '')}"`,
  ]
    .filter(Boolean)
    .join(' ');

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="robots" content="noindex,nofollow" />
  ${buildMetaTags(vars.meta)}
  ${buildFontLinks(theme)}
  <style>${buildRootStyle(theme, preview)}</style>
</head>
<body${bodyAttrs ? ` ${bodyAttrs}` : ''}>
${watermark}
${body}
<script src="${runtimeScript}"${nonceAttr} defer></script>
</body>
</html>`;
};

// Builds a strict Content-Security-Policy header for invitation responses.
// scripts: self + nonce only; images: self + Supabase storage + data:; fonts:
// Google Fonts only; styles: self (the inline <style> block is covered by
// 'unsafe-inline' when no nonce is present, but we prefer a nonce/hash).
export const buildCspHeader = (nonce: string, storageOrigin: string): string => {
  const directives = [
    "default-src 'none'",
    `script-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' ${storageOrigin} data:`,
    "font-src https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  return directives.join('; ');
};

// Generates a cryptographically-random CSP nonce.
export const generateNonce = (): string =>
  crypto.randomBytes(16).toString('base64');

// A tiny in-memory render cache keyed by `${slug}:${updatedAtIso}`. In
// production this is replaced by Next.js `unstable_cache`; here it keeps the
// pipeline testable and framework-agnostic.
const renderCache = new Map<string, string>();
const MAX_CACHE_ENTRIES = 500;

export const getCachedRender = (slug: string, updatedAt: Date): string | undefined =>
  renderCache.get(cacheKey(slug, updatedAt));

export const setCachedRender = (
  slug: string,
  updatedAt: Date,
  html: string,
): void => {
  renderCache.set(cacheKey(slug, updatedAt), html);
  // Bounded cache: drop the oldest entries when over capacity.
  if (renderCache.size > MAX_CACHE_ENTRIES) {
    const oldest = renderCache.keys().next().value;
    if (oldest) {
      renderCache.delete(oldest);
    }
  }
};

export const invalidateRenderCache = (slug: string): void => {
  for (const key of renderCache.keys()) {
    if (key.startsWith(`${slug}:`)) {
      renderCache.delete(key);
    }
  }
};

const cacheKey = (slug: string, updatedAt: Date): string =>
  `${slug}:${updatedAt.toISOString()}`;
