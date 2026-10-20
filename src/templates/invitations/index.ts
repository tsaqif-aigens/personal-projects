import 'server-only';
import { elegantGoldTemplate } from './elegant-gold';
import { floralSoftTemplate } from './floral-soft';
import { minimalModernTemplate } from './minimal-modern';

export interface BaseTemplate {
  key: string;
  label: string;
  html: string;
}

// The built-in base templates, shipped as few-shot examples for the AI and as
// the fallback when AI generation/validation fails. All must pass the same
// validator the AI output goes through.
export const BASE_TEMPLATES: BaseTemplate[] = [
  { key: 'elegant-gold', label: 'Elegan', html: elegantGoldTemplate },
  { key: 'floral-soft', label: 'Floral', html: floralSoftTemplate },
  { key: 'minimal-modern', label: 'Minimalis', html: minimalModernTemplate },
];

export const getBaseTemplate = (key: string): BaseTemplate | undefined =>
  BASE_TEMPLATES.find((t) => t.key === key);

// Used by the create-form "Gaya yang diinginkan" selector. The special value
// `auto` means "Biarkan AI memilih".
export const STYLE_OPTIONS = [
  { value: 'auto', label: 'Biarkan AI memilih' },
  ...BASE_TEMPLATES.map((t) => ({ value: t.key, label: t.label })),
] as const;
