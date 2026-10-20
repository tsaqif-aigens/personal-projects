import 'server-only';
import sanitizeHtml from 'sanitize-html';

// The single source of truth for which tags/attributes the AI template may
// use. Everything else is stripped before a template is ever persisted.
export const ALLOWED_TAGS = [
  'section',
  'div',
  'span',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'a',
  'img',
  'button',
  'ul',
  'ol',
  'li',
  'figure',
  'figcaption',
  'blockquote',
  'br',
  'hr',
  'strong',
  'em',
  'b',
  'i',
  'small',
  'time',
  'address',
  'style',
  'form',
  'input',
  'textarea',
  'select',
  'option',
  'label',
  'svg',
  'path',
  'circle',
  'rect',
  'line',
  'polyline',
  'polygon',
  'g',
  'defs',
  'clipPath',
  'mask',
  'use',
  'title',
  'desc',
] as const;

// Data attributes the first-party runtime understands. Any other data-* hook
// is stripped so a hostile template cannot smuggle behavior.
export const ALLOWED_DATA_ATTRIBUTES = [
  'data-section',
  'data-action',
  'data-countdown',
  'data-countdown-target',
  'data-copy',
  'data-lightbox',
  'data-rsvp-form',
  'data-wishes-list',
  'data-music-toggle',
  'data-guest-name',
] as const;

export const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions['allowedAttributes'] = {
  a: ['href', 'target', 'rel', 'title', 'data-copy', 'data-action'],
  img: ['src', 'alt', 'loading', 'data-lightbox'],
  button: ['type', 'data-action', 'data-copy', 'data-music-toggle'],
  section: ['data-section'],
  div: ['data-countdown', 'data-countdown-target', 'data-wishes-list', 'data-guest-name'],
  form: ['data-rsvp-form'],
  input: ['type', 'name', 'placeholder', 'required', 'value'],
  textarea: ['name', 'placeholder', 'rows'],
  select: ['name'],
  option: ['value', 'selected'],
  label: ['for'],
  time: ['datetime'],
  svg: ['xmlns', 'viewBox', 'fill', 'stroke', 'stroke-width', 'width', 'height', 'aria-hidden', 'class'],
  path: ['d', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'],
  circle: ['cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry', 'fill', 'stroke', 'stroke-width'],
  line: ['x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width', 'stroke-linecap'],
  polyline: ['points', 'fill', 'stroke', 'stroke-width'],
  polygon: ['points', 'fill', 'stroke', 'stroke-width'],
  g: ['fill', 'stroke', 'stroke-width'],
  use: ['href', 'xlink:href'],
  style: [],
};

const transformTags: sanitizeHtml.IOptions['transformTags'] = {
  a: sanitizeHtml.simpleTransform('a', {
    rel: 'noopener noreferrer',
    target: '_blank',
  }),
};

// Sanitizes the AI-generated template markup. Preserves Mustache `{{...}}`
// placeholders (including inside attribute values) while stripping scripts,
// iframes, event handlers, and javascript:/data: URLs.
export const sanitizeTemplateHtml = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags: [...ALLOWED_TAGS],
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
    },
    allowedSchemesAppliedToAttributes: ['href', 'src'],
    allowProtocolRelative: false,
    transformTags,
    // Do not treat template text as text nodes to be escaped; Mustache will
    // handle escaping at render time. We only want structural sanitization.
    textFilter: undefined,
    parser: {
      lowerCaseTags: true,
      lowerCaseAttributeNames: true,
    },
  });
};

// Allowed URL schemes for sanitization.
export const sanitizeCss = (css: string, allowedOrigin: string): string => {
  let output = css;

  // Reject @import (exfiltration / arbitrary CSS loading).
  if (/@import/i.test(output)) {
    return '';
  }

  // Reject IE/legacy expression() — arbitrary JS execution.
  if (/expression\s*\(/i.test(output)) {
    return '';
  }

  // Reject url() references that are not our storage domain. Allow data: SVG
  // is explicitly disallowed by the spec, so we also block data: here.
  const urlRegex = /url\(\s*(['"]?)(.*?)\1\s*\)/gi;
  const allowedHost = new URL(allowedOrigin).host;

  let hasDisallowedUrl = false;
  output = output.replace(urlRegex, (_match, _quote, value: string) => {
    const trimmed = value.trim();

    if (trimmed === '') {
      return 'none';
    }

    if (/^data:/i.test(trimmed)) {
      hasDisallowedUrl = true;
      return 'none';
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed, allowedOrigin);
    } catch {
      hasDisallowedUrl = true;
      return 'none';
    }

    if (parsed.host !== allowedHost) {
      hasDisallowedUrl = true;
      return 'none';
    }

    return `url(${parsed.toString()})`;
  });

  // If any url() was disallowed, reject the whole block rather than silently
  // rendering a partially-broken style.
  if (hasDisallowedUrl) {
    return '';
  }

  return output;
};
