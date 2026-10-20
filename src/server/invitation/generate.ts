import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { aiGenerations, invitations } from '@/models/Schema';
import { generateStepA, generateStepB } from '@/server/ai/client';
import { buildVarsWithQuote } from '@/server/ai/prompts';
import { getBaseTemplate } from '@/templates/invitations';
import { Env } from '@/libs/Env';
import {
  CreateInvitationValidation,
  type CreateInvitationInput,
} from '@/validations/CreateInvitationValidation';
import { ThemeValidation } from '@/validations/ThemeValidation';
import { VarsValidation } from '@/validations/VarsValidation';
import { buildVarsFromForm } from './form';
import { sanitizeTemplateHtml } from './sanitize';
import { validateSlug } from './slug';
import { validateTemplate } from './validator';

// CSS `url()` in AI templates may only reference this origin (our app/storage).
// No Supabase storage is configured yet, so we fall back to the app URL.
const ALLOWED_ORIGIN = Env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// Free allowance: one AI generation per account before payment.
export const FREE_GENERATIONS_PER_ACCOUNT = 1;

export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'invalid_input'
      | 'slug_taken'
      | 'slug_invalid'
      | 'free_limit_reached',
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}

// Counts how many invitations this user has generated via AI. `ai_generations`
// stores one row per step (theme + template), so a single generated invitation
// yields >= 2 rows. We therefore count distinct invitation IDs rather than rows.
export const countUserGenerations = async (userId: string): Promise<number> => {
  const rows = await db
    .select({ invitationId: aiGenerations.invitationId })
    .from(aiGenerations)
    .where(eq(aiGenerations.userId, userId));

  return new Set(rows.map((r) => r.invitationId)).size;
};

export const assertFreeGenerationAllowed = async (
  userId: string,
): Promise<void> => {
  const generated = await countUserGenerations(userId);
  if (generated >= FREE_GENERATIONS_PER_ACCOUNT) {
    throw new GenerationError(
      'Batas satu generasi gratis per akun telah tercapai. Bayar untuk menerbitkan undangan ini.',
      'free_limit_reached',
    );
  }
};

// Builds the list of photo URLs to send to Step A (vision). Cover + couple +
// gallery, deduplicated and filtered to non-empty.
const collectPhotoUrls = (input: CreateInvitationInput): string[] => {
  const urls = [
    input.coverPhotoUrl,
    input.couple.bride.photo_url,
    input.couple.groom.photo_url,
    ...input.gallery.map((g) => g.url),
  ];

  return [...new Set(urls.filter((u) => u.length > 0))];
};

export interface GenerateInvitationResult {
  invitationId: string;
  slug: string;
  status: 'preview';
}

// The core orchestration: Step A (theme + copy) -> Step B (template) -> merge
// -> validate -> persist in one transaction, logging to ai_generations. Falls
// back to the closest base template if Step B fails its validation after
// retries.
export const generateInvitation = async (
  userId: string,
  rawInput: CreateInvitationInput,
): Promise<GenerateInvitationResult> => {
  // 1. Validate input.
  const input = CreateInvitationValidation.safeParse(rawInput);
  if (!input.success) {
    throw new GenerationError(
      input.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      'invalid_input',
    );
  }
  const data = input.data;

  // 2. Slug rules + availability.
  const slugCheck = validateSlug(data.slug);
  if (!slugCheck.valid) {
    throw new GenerationError('Slug tidak valid', 'slug_invalid');
  }
  const existing = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(eq(invitations.slug, data.slug));
  if (existing.length > 0) {
    throw new GenerationError('Slug sudah digunakan', 'slug_taken');
  }

  // 3. Free-generation limit (checked before spending any AI budget).
  await assertFreeGenerationAllowed(userId);

  // 4. Deterministic vars (non-AI content).
  const formVars = buildVarsFromForm(data);

  // 5. Pick the closest base template as the few-shot starting point.
  const styleKey =
    data.stylePreference === 'auto' ? 'elegant-gold' : data.stylePreference;
  const base = getBaseTemplate(styleKey) ?? getBaseTemplate('elegant-gold');
  if (base === undefined) {
    throw new GenerationError('Template dasar tidak ditemukan', 'invalid_input');
  }

  // 6. Step A: vision + text -> theme + copy + love_story.
  const stepA = await generateStepA({
    formData: formVars as unknown as Record<string, unknown>,
    photoUrls: collectPhotoUrls(data),
    stylePreference: data.stylePreference,
  });

  // 7. Merge vars. If the couple provided their own love story, keep it.
  const loveStory =
    data.love_story.length > 0 ? data.love_story : stepA.output.love_story;

  const vars = buildVarsWithQuote({
    ...formVars,
    copy: stepA.output.copy,
    love_story: loveStory,
  });

  const theme = stepA.output.theme;

  // 8. Re-validate merged vars + theme (defense in depth).
  VarsValidation.parse(vars);
  ThemeValidation.parse(theme);

  // 9. Step B: text -> html_template. Fall back to the base template on any
  //    validation failure (the AI client already retries up to 2x).
  let htmlTemplate: string;
  let templateModel: string | undefined;
  let templateTokensIn: number | undefined;
  let templateTokensOut: number | undefined;

  try {
    const stepB = await generateStepB(
      { theme: theme as unknown as Record<string, unknown>, baseTemplate: base.html },
      ALLOWED_ORIGIN,
    );

    const sanitized = sanitizeTemplateHtml(stepB.output.html_template);
    const validation = validateTemplate(sanitized, ALLOWED_ORIGIN);
    if (!validation.valid) {
      throw new Error(
        validation.issues.map((i) => `${i.path}: ${i.message}`).join('; '),
      );
    }

    htmlTemplate = sanitized;
    templateModel = 'claude-sonnet-4-5';
    templateTokensIn = stepB.tokensIn;
    templateTokensOut = stepB.tokensOut;
  } catch {
    // Fallback: always produce a result using the validated base template.
    htmlTemplate = sanitizeTemplateHtml(base.html);
    templateModel = undefined;
    templateTokensIn = undefined;
    templateTokensOut = undefined;
  }

  // 10. Persist in one transaction: invitation row + ai_generations log rows.
  const invitationId = await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(invitations)
      .values({
        userId,
        slug: data.slug,
        status: 'preview',
        htmlTemplate,
        vars: vars as unknown as Record<string, unknown>,
        theme: theme as unknown as Record<string, unknown>,
        templateVersion: 1,
        varsSchemaVersion: 1,
        isPaid: false,
      })
      .returning({ id: invitations.id });

    const id = inserted[0]?.id;
    if (id === undefined) {
      throw new GenerationError('Gagal membuat undangan', 'invalid_input');
    }

    await tx.insert(aiGenerations).values([
      {
        userId,
        invitationId: id,
        step: 'theme',
        model: 'claude-sonnet-4-5',
        status: 'success',
        tokensIn: stepA.tokensIn,
        tokensOut: stepA.tokensOut,
      },
      {
        userId,
        invitationId: id,
        step: 'template',
        model: templateModel ?? null,
        status: templateModel === undefined ? 'fallback' : 'success',
        error: templateModel === undefined ? 'Step B failed validation; used base template' : null,
        tokensIn: templateTokensIn ?? null,
        tokensOut: templateTokensOut ?? null,
      },
    ]);

    return id;
  });

  return { invitationId, slug: data.slug, status: 'preview' };
};
