import * as z from 'zod';

// The content contract for a single invitation. These values are merged with
// AI-generated copy and rendered through the Mustache template. Keys are
// snake_case to match the JSONB storage and the Mustache placeholders.

export const personSchema = z.object({
  full_name: z.string().min(1),
  nickname: z.string().min(1),
  father: z.string(),
  mother: z.string(),
  father_deceased: z.boolean(),
  mother_deceased: z.boolean(),
  instagram_url: z.string().url().or(z.literal('')),
  photo_url: z.string().url().or(z.literal('')),
});

export const coupleSchema = z.object({
  bride: personSchema,
  groom: personSchema,
});

export const coverSchema = z.object({
  photo_url: z.string().url().or(z.literal('')),
  date_short: z.string().min(1),
});

export const eventSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  date_label: z.string().min(1),
  time_label: z.string().min(1),
  venue_name: z.string(),
  address: z.string(),
  maps_url: z.string().url().or(z.literal('')),
});

export const countdownSchema = z.object({
  target_iso: z.string().datetime({ offset: true }),
  calendar_url: z.string().url().or(z.literal('')),
});

export const giftAccountSchema = z.object({
  bank: z.string().min(1),
  holder: z.string().min(1),
  number: z.string().min(1),
  logo_url: z.string().url().nullable(),
});

export const giftAddressSchema = z.object({
  text: z.string(),
  recipient: z.string(),
  phone: z.string(),
});

export const giftsSchema = z.object({
  enabled: z.boolean(),
  accounts: z.array(giftAccountSchema).max(3),
  address: giftAddressSchema,
});

export const galleryItemSchema = z.object({
  url: z.string().url(),
  alt: z.string(),
});

export const quoteSchema = z.object({
  arabic: z.string().min(1),
  translation: z.string().min(1),
  source: z.string().min(1),
});

export const copySchema = z.object({
  opening_line: z.string().min(1),
  closing_prayer: z.string(),
  gift_intro: z.string(),
  wish_intro: z.string(),
  footer: z.string(),
});

export const loveStoryItemSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
});

export const musicSchema = z.object({
  enabled: z.boolean(),
  url: z.string().url().nullable(),
  title: z.string().nullable(),
});

export const metaSchema = z.object({
  og_title: z.string().min(1),
  og_description: z.string(),
  og_image_url: z.string().url().or(z.literal('')),
});

export const VarsValidation = z.object({
  couple: coupleSchema,
  cover: coverSchema,
  events: z.array(eventSchema).min(1),
  countdown: countdownSchema,
  gifts: giftsSchema,
  gallery: z.array(galleryItemSchema).max(12),
  quote: quoteSchema,
  copy: copySchema,
  love_story: z.array(loveStoryItemSchema),
  music: musicSchema,
  meta: metaSchema,
});

export type Vars = z.infer<typeof VarsValidation>;
