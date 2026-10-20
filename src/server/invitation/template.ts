import 'server-only';
import Mustache from 'mustache';
import { MAX_GUEST_NAME_LENGTH } from './constants';

export interface RenderContext {
  // The vars JSONB content. Contains all content values.
  vars: Record<string, unknown>;
  // Guest name from ?to=, length-limited and escaped at render.
  guestName?: string;
}

// Renders the invitation template with vars + guest name. Mustache auto-escaping
// is ON (default). Triple-mustache is forbidden upstream by the validator, so
// raw HTML output is impossible. `guest.name` is length-limited here and then
// HTML-escaped by Mustache's default escape.
export const renderTemplate = (
  template: string,
  { vars, guestName }: RenderContext,
): string => {
  const limitedGuestName =
    guestName === undefined
      ? undefined
      : guestName.slice(0, MAX_GUEST_NAME_LENGTH);

  const view = {
    ...vars,
    guest: {
      name: limitedGuestName ?? '',
    },
  };

  // Mustache's default escape HTML-escapes &, <, >, ", ', and `.
  return Mustache.render(template, view);
};
