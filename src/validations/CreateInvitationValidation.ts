import * as z from 'zod';
import {
  coupleSchema,
  galleryItemSchema,
  giftsSchema,
  loveStoryItemSchema,
  musicSchema,
} from '@/validations/VarsValidation';

// The raw form payload submitted from /create. Photos arrive as storage URLs
// (already uploaded + compressed client-side), so we only validate their shape.
//
// Events are collected as raw dates/times here and transformed into the
// display-oriented vars shape (`date_label`, `time_label`, `countdown`) by
// `buildVarsFromForm` on the server. The AI fills `copy`, `love_story` (if the
// couple left it blank), and `theme`; our code injects `quote` (fixed constant),
// `cover.date_short`, `countdown`, and `meta`.

export const formEventSchema = z.object({
  key: z.enum(['akad', 'resepsi']),
  title: z.string().min(1),
  // YYYY-MM-DD.
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus YYYY-MM-DD'),
  // HH:mm.
  start: z.string().regex(/^\d{2}:\d{2}$/, 'Jam mulai harus HH:mm'),
  // HH:mm or the literal "Selesai".
  end: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .or(z.literal('Selesai')),
  timezone: z.enum(['WIB', 'WITA', 'WIT']),
  venue_name: z.string(),
  address: z.string(),
  maps_url: z.string().url().or(z.literal('')),
});

export const CreateInvitationValidation = z.object({
  slug: z
    .string()
    .min(3)
    .max(40)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug harus huruf kecil, angka, dan tanda hubung',
    ),
  stylePreference: z.string().min(1),
  couple: coupleSchema,
  coverPhotoUrl: z.string().url().or(z.literal('')),
  events: z.array(formEventSchema).min(1).max(2),
  gifts: giftsSchema,
  gallery: z.array(galleryItemSchema).max(12),
  // May be empty — the AI writes a gentle story in that case.
  love_story: z.array(loveStoryItemSchema).max(6),
  music: musicSchema,
});

export type CreateInvitationInput = z.infer<typeof CreateInvitationValidation>;
export type FormEvent = z.infer<typeof formEventSchema>;
