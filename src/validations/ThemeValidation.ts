import * as z from 'zod';

// Whitelisted Google Fonts. The AI must pick from this list so that we can
// safely inject the font <link> tags into the invitation shell without
// allowing arbitrary CSS/URL injection.
export const GOOGLE_FONTS = [
  'Playfair Display',
  'Cormorant Garamond',
  'Cormorant',
  'Great Vibes',
  'Parisienne',
  'Pinyon Script',
  'Lora',
  'Merriweather',
  'EB Garamond',
  'Marcellus',
  'Cinzel',
  'Italiana',
  'DM Serif Display',
  'Spectral',
  'Amiri',
  'Scheherazade New',
  'Reem Kufi',
  'Lateef',
  'Noto Naskh Arabic',
  'Poppins',
  'Montserrat',
  'Inter',
  'Nunito Sans',
  'Work Sans',
  'Jost',
  'Raleway',
  'Quicksand',
  'Plus Jakarta Sans',
] as const;

export const fontFamilySchema = z.enum(GOOGLE_FONTS);

// A single hex color. The AI outputs `#rrggbb` values; we validate the shape
// and, where a WCAG contrast requirement is encoded, enforce it in
// ThemeValidation below.
export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Palette colors must be #rrggbb hex values');

export const paletteSchema = z.object({
  primary: hexColorSchema,
  secondary: hexColorSchema,
  accent: hexColorSchema,
  background: hexColorSchema,
  surface: hexColorSchema,
  text: hexColorSchema,
  text_muted: hexColorSchema,
  overlay: hexColorSchema,
});

export const themeSchema = z.object({
  palette: paletteSchema,
  fonts: z.object({
    heading: fontFamilySchema,
    body: fontFamilySchema,
    script: fontFamilySchema,
    arabic: fontFamilySchema,
  }),
  mood: z.string().min(1),
});

export type Theme = z.infer<typeof themeSchema>;

// WCAG AA: relative luminance helper.
const channel = (value: number): number => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export const relativeLuminance = (hex: string): number => {
  const normalized = hex.replace('#', '');
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

export const contrastRatio = (a: string, b: string): number => {
  const lumA = relativeLuminance(a);
  const lumB = relativeLuminance(b);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
};

// WCAG AA requires >= 4.5:1 for normal text and >= 3:1 for large text.
const MIN_TEXT_CONTRAST = 4.5;
const MIN_LARGE_TEXT_CONTRAST = 3;

export const ThemeValidation = themeSchema.superRefine((theme, ctx) => {
  const { text, text_muted, background, primary } = theme.palette;

  if (contrastRatio(text, background) < MIN_TEXT_CONTRAST) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Palette text/background contrast ${contrastRatio(text, background).toFixed(2)}:1 is below WCAG AA (${MIN_TEXT_CONTRAST}:1)`,
      path: ['palette', 'text'],
    });
  }

  if (contrastRatio(text_muted, background) < MIN_LARGE_TEXT_CONTRAST) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Palette text_muted/background contrast ${contrastRatio(text_muted, background).toFixed(2)}:1 is below WCAG AA large-text threshold (${MIN_LARGE_TEXT_CONTRAST}:1)`,
      path: ['palette', 'text_muted'],
    });
  }

  if (contrastRatio(primary, background) < MIN_LARGE_TEXT_CONTRAST) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Palette primary/background contrast ${contrastRatio(primary, background).toFixed(2)}:1 is below WCAG AA large-text threshold (${MIN_LARGE_TEXT_CONTRAST}:1)`,
      path: ['palette', 'primary'],
    });
  }
});
