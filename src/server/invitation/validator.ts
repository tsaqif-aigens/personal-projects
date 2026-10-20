import 'server-only';
import { MAX_TEMPLATE_LENGTH } from './constants';
import { sanitizeCss } from './sanitize';

// The required placeholders for each mandatory section. Placeholders inside a
// Mustache loop (e.g. `{{#events}}{{title}}{{/events}}`) are written bare
// because they are relative to the loop variable.
export const REQUIRED_SECTIONS: Record<string, string[]> = {
  cover: [
    'cover.photo_url',
    'couple.bride.nickname',
    'couple.groom.nickname',
    'cover.date_short',
    'guest.name',
  ],
  opening: ['copy.opening_line'],
  quote: ['quote.arabic', 'quote.translation', 'quote.source'],
  couple: [
    'couple.bride.full_name',
    'couple.bride.photo_url',
    'couple.bride.father',
    'couple.bride.mother',
    'couple.bride.instagram_url',
    'couple.groom.full_name',
    'couple.groom.photo_url',
    'couple.groom.father',
    'couple.groom.mother',
    'couple.groom.instagram_url',
  ],
  events: [
    'title',
    'date_label',
    'time_label',
    'venue_name',
    'address',
    'maps_url',
  ],
  countdown: ['countdown.target_iso', 'countdown.calendar_url'],
  // `gift` section is required but its content is wrapped in `{{#gifts.enabled}}`
  // so there are no unconditionally-required placeholders.
  gift: [],
  rsvp: [],
  gallery: ['url', 'alt'],
  love_story: ['title', 'text'],
  closing: ['copy.closing_prayer', 'copy.footer'],
};

// All legal top-level vars keys (used as the first segment of a dotted
// placeholder). `guest` is injected at render time, not stored in vars.
export const ALLOWED_VAR_ROOTS = new Set([
  'couple',
  'cover',
  'events',
  'countdown',
  'gifts',
  'gallery',
  'quote',
  'copy',
  'love_story',
  'music',
  'meta',
  'guest',
]);

// Bare (non-dotted) placeholders are only legal inside a Mustache loop. These
// map to the fields of the vars arrays/objects being looped over.
export const ALLOWED_BARE_PLACEHOLDERS = new Set([
  // events loop
  'key',
  'title',
  'date_label',
  'time_label',
  'venue_name',
  'address',
  'maps_url',
  // gallery loop
  'url',
  'alt',
  // love_story loop
  'text',
  // gifts.accounts loop
  'bank',
  'holder',
  'number',
  'logo_url',
]);

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

// Extracts value placeholders (double-mustache) from the template. Section
// tags (`{{#x}}`, `{{/x}}`, `{{^x}}`), comments (`{{!x}}`), and
// triple-mustache (`{{{x}}}`) are ignored.
export const extractPlaceholders = (template: string): string[] => {
  const matches = template.match(/\{\{[\s\S]*?\}\}/g) ?? [];
  const placeholders: string[] = [];

  for (const match of matches) {
    // Triple-mustache is forbidden and handled separately.
    if (match.startsWith('{{{')) {
      continue;
    }

    const inner = match.replace(/^\{\{/, '').replace(/\}\}$/, '').trim();

    if (inner.length === 0) {
      continue;
    }

    const first = inner[0];
    if (first === '#' || first === '/' || first === '^' || first === '!') {
      continue;
    }

    placeholders.push(inner);
  }

  return placeholders;
};

// Detects forbidden Mustache constructs:
// - triple-mustache (raw HTML output)
// - partials `{{> name}}`
// - comments with code-like content
export const detectForbiddenMustache = (template: string): string[] => {
  const forbidden: string[] = [];

  if (/\{\{\{/.test(template)) {
    forbidden.push('Triple-mustache {{{ }}} is forbidden');
  }

  if (/\{\{>\s*[a-zA-Z0-9_-]+/.test(template)) {
    forbidden.push('Partials {{> name}} are forbidden');
  }

  const commentMatches = template.match(/\{\{![\s\S]*?\}\}/g) ?? [];
  for (const comment of commentMatches) {
    const body = comment.replace(/^\{\{!/, '').replace(/\}\}$/, '').trim();
    if (/[<>()[\]"';=]/.test(body)) {
      forbidden.push(`Mustache comment with code-like content: ${comment}`);
    }
  }

  return forbidden;
};

// Extracts a `data-section="..."` value. The section key must match one of the
// known required sections.
export const extractSections = (template: string): string[] => {
  const sectionAttrRegex = /data-section\s*=\s*["']([a-z_]+)["']/gi;
  const sections = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = sectionAttrRegex.exec(template)) !== null) {
    if (match[1]) {
      sections.add(match[1]);
    }
  }

  return [...sections];
};

export const validateTemplate = (
  template: string,
  allowedOrigin: string,
): ValidationResult => {
  const issues: ValidationIssue[] = [];

  if (template.length === 0) {
    return {
      valid: false,
      issues: [{ path: 'template', message: 'Template is empty' }],
    };
  }

  if (template.length > MAX_TEMPLATE_LENGTH) {
    issues.push({
      path: 'template',
      message: `Template exceeds ${MAX_TEMPLATE_LENGTH} characters`,
    });
  }

  // 1. Forbidden Mustache constructs.
  for (const message of detectForbiddenMustache(template)) {
    issues.push({ path: 'template', message });
  }

  // 2. Required sections present.
  const sections = extractSections(template);
  for (const section of Object.keys(REQUIRED_SECTIONS)) {
    if (!sections.includes(section)) {
      issues.push({
        path: `section.${section}`,
        message: `Missing required section data-section="${section}"`,
      });
    }
  }

  // 3. Required placeholders present (per section, checked globally since the
  //    AI may nest placeholders inside loops/conditions).
  const placeholders = extractPlaceholders(template);
  const placeholderSet = new Set(placeholders);

  for (const [section, required] of Object.entries(REQUIRED_SECTIONS)) {
    for (const placeholder of required) {
      if (!placeholderSet.has(placeholder)) {
        issues.push({
          path: `section.${section}`,
          message: `Missing required placeholder {{${placeholder}}}`,
        });
      }
    }
  }

  // 4. Unknown placeholders.
  for (const placeholder of placeholders) {
    if (placeholder.includes('.')) {
      const root = placeholder.split('.')[0];
      if (root && !ALLOWED_VAR_ROOTS.has(root)) {
        issues.push({
          path: `placeholder.${placeholder}`,
          message: `Unknown placeholder {{${placeholder}}}`,
        });
      }
    } else if (!ALLOWED_BARE_PLACEHOLDERS.has(placeholder)) {
      issues.push({
        path: `placeholder.${placeholder}`,
        message: `Unknown placeholder {{${placeholder}}}`,
      });
    }
  }

  // 5. CSS sanitization (inline <style> block).
  const styleBlocks = template.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) ?? [];
  for (const block of styleBlocks) {
    const css = block.replace(/<style[^>]*>([\s\S]*?)<\/style>/i, '$1');
    if (sanitizeCss(css, allowedOrigin) === '' && css.trim().length > 0) {
      issues.push({
        path: 'style',
        message: 'Inline CSS contains disallowed url()/@import/expression()',
      });
    }
  }

  return { valid: issues.length === 0, issues };
};
