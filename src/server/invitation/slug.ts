import 'server-only';
import { RESERVED_SLUGS } from './constants';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 40;

export interface SlugValidationResult {
  valid: boolean;
  reason?: 'invalid_characters' | 'reserved' | 'too_long';
}

// Validates a slug against the spec: lowercase letters, numbers, and hyphens;
// must not start/end with a hyphen, no consecutive hyphens, and not reserved.
export const validateSlug = (slug: string): SlugValidationResult => {
  if (slug.length === 0 || slug.length > MAX_SLUG_LENGTH) {
    return { valid: false, reason: 'too_long' };
  }

  if (!SLUG_REGEX.test(slug)) {
    return { valid: false, reason: 'invalid_characters' };
  }

  if ((RESERVED_SLUGS as readonly string[]).includes(slug)) {
    return { valid: false, reason: 'reserved' };
  }

  return { valid: true };
};

export const isSlugAvailable = (slug: string): boolean =>
  validateSlug(slug).valid;
