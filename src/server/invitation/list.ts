import 'server-only';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { invitations } from '@/models/Schema';

// A lightweight, presentation-ready shape for the dashboard grid. The `vars`
// JSONB column is typed as `unknown` by Drizzle, so we defensively extract only
// the display fields we need (no `any`, no unsafe casts).
export interface InvitationListItem {
  id: string;
  slug: string;
  status: 'draft' | 'preview' | 'published' | 'archived';
  isPaid: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  coverUrl: string;
  brideName: string;
  groomName: string;
}

// Reads a nested string field from a possibly-untyped vars object, returning
// '' when the path does not resolve to a string.
const readString = (
  vars: unknown,
  path: Array<string>,
): string => {
  let value: unknown = vars;
  for (const key of path) {
    if (typeof value !== 'object' || value === null) {
      return '';
    }
    value = (value as Record<string, unknown>)[key];
  }
  return typeof value === 'string' ? value : '';
};

// Lists all invitations owned by a user, newest first. The cover URL falls back
// to the OG image when no cover photo is set, so a card always has an image.
export const listInvitationsByUser = async (
  userId: string,
): Promise<InvitationListItem[]> => {
  const rows = await db
    .select()
    .from(invitations)
    .where(eq(invitations.userId, userId))
    .orderBy(desc(invitations.createdAt));

  return rows.map((row) => {
    const coverUrl =
      readString(row.vars, ['cover', 'photo_url'])
      || readString(row.vars, ['meta', 'og_image_url']);

    return {
      id: row.id,
      slug: row.slug,
      status: row.status,
      isPaid: row.isPaid,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      coverUrl,
      brideName: readString(row.vars, ['couple', 'bride', 'nickname']),
      groomName: readString(row.vars, ['couple', 'groom', 'nickname']),
    };
  });
};
