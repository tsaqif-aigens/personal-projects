import * as z from 'zod';
import { ThemeValidation } from '@/validations/ThemeValidation';
import { copySchema, loveStoryItemSchema } from '@/validations/VarsValidation';

// Step A output: the AI returns design tokens plus the generated copy. The
// copy/love_story values are merged into `vars` later; the palette/fonts/mood
// are stored as `theme`.
export const StepAOutputValidation = z.object({
  theme: ThemeValidation,
  copy: copySchema,
  love_story: z.array(loveStoryItemSchema),
});

export type StepAOutput = z.infer<typeof StepAOutputValidation>;

// Step B output: only the Mustache template markup. The validator/sanitizer
// pipeline (TemplateValidation) performs the heavier structural checks.
export const StepBOutputValidation = z.object({
  html_template: z.string().min(1).max(200000),
});

export type StepBOutput = z.infer<typeof StepBOutputValidation>;
