import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import {
  StepAOutputValidation,
  StepBOutputValidation,
  type StepAOutput,
  type StepBOutput,
} from '@/validations/AiOutputValidation';
import { sanitizeTemplateHtml } from '@/server/invitation/sanitize';
import { validateTemplate } from '@/server/invitation/validator';
import { Env } from '@/libs/Env';
import {
  buildStepAPrompt,
  buildStepBPrompt,
  STEP_A_SYSTEM_PROMPT,
  STEP_B_SYSTEM_PROMPT,
  type StepAInput,
  type StepBInput,
} from './prompts';

// Model constants. Step A (vision) and Step B (text) both use Sonnet; the
// exact model id is kept here so it can be swapped without touching call sites.
const VISION_MODEL = 'claude-sonnet-4-5';
const TEXT_MODEL = 'claude-sonnet-4-5';

const MAX_ATTEMPTS = 3; // initial attempt + up to 2 retries
const MAX_TOKENS = 8192;

// Lazily create the client so server-only code can still be imported (and unit
// tested) without an API key present.
let client: Anthropic | null = null;

const getClient = (): Anthropic => {
  if (client === null) {
    if (!Env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    client = new Anthropic({ apiKey: Env.ANTHROPIC_API_KEY });
  }
  return client;
};

// Claude may wrap JSON in markdown fences or add a preamble. Extract the first
// balanced JSON object so we can feed it to zod.
export const extractJson = (text: string): string => {
  const trimmed = text.trim();

  // Strip markdown code fences if present.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? (fenced[1] ?? '').trim() : trimmed;

  // Find the first '{' (or '[') and its matching close bracket, ignoring any
  // prose before or after. This also handles strings containing braces.
  const openIndex = candidate.search(/[{\[]/);
  if (openIndex === -1) {
    return candidate;
  }

  const start = openIndex;
  const openChar = candidate[start];
  const closeChar = openChar === '{' ? '}' : ']';

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < candidate.length; i += 1) {
    const char = candidate[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === openChar) {
      depth += 1;
    } else if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return candidate.slice(start, i + 1);
      }
    }
  }

  return candidate.slice(start);
};

// Converts a photo URL or data URL into an Anthropic image content block.
// Storage URLs are passed through; data URLs are decoded to base64 blocks.
export const toImageBlock = (
  url: string,
): Anthropic.ImageBlockParam => {
  if (url.startsWith('data:')) {
    const match = url.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/);
    if (match) {
      const mediaType = match[1] as
        | 'image/jpeg'
        | 'image/png'
        | 'image/gif'
        | 'image/webp';
      return {
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: match[2] ?? '' },
      };
    }
    throw new Error(`Unsupported data URL media type for photo: ${url.slice(0, 40)}...`);
  }

  return {
    type: 'image',
    source: { type: 'url', url },
  };
};

interface AttemptResult {
  output: StepAOutput;
  tokensIn: number;
  tokensOut: number;
}

// Step A: vision + text → theme + copy + love_story. Retries up to 2 times on
// zod validation failure, feeding the error back into the prompt.
export const generateStepA = async (
  input: StepAInput,
): Promise<AttemptResult> => {
  const anthropic = getClient();
  const imageBlocks = input.photoUrls.map(toImageBlock);

  let lastError = '';

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    let userPrompt = buildStepAPrompt(input);

    if (attempt > 0) {
      userPrompt += `\n\nPERBAIKI OUTPUT ANDA. Output sebelumnya ditolak karena kesalahan berikut:\n${lastError}\n\nOutput JSON yang valid saja.`;
    }

    const message = await anthropic.messages.create({
      model: VISION_MODEL,
      max_tokens: MAX_TOKENS,
      system: STEP_A_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            ...imageBlocks,
            { type: 'text', text: userPrompt },
          ],
        },
      ],
    });

    const textBlock = message.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text',
    );
    const raw = textBlock?.text ?? '';

    const parsed = StepAOutputValidation.safeParse(JSON.parse(extractJson(raw)));

    if (parsed.success) {
      return {
        output: parsed.data,
        tokensIn: message.usage.input_tokens,
        tokensOut: message.usage.output_tokens,
      };
    }

    lastError = parsed.error.issues
      .map(issue => `- ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
  }

  throw new Error(`Step A failed after ${MAX_ATTEMPTS} attempts: ${lastError}`);
};

// Step B: text → html_template. Runs the validator + sanitizer, retrying up to
// 2 times with the validator errors in the prompt. Returns sanitized markup.
export const generateStepB = async (
  input: StepBInput,
  allowedOrigin: string,
): Promise<{
  output: StepBOutput;
  tokensIn: number;
  tokensOut: number;
}> => {
  const anthropic = getClient();
  let lastError = '';

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    let userPrompt = buildStepBPrompt(input);

    if (attempt > 0) {
      userPrompt += `\n\nPERBAIKI OUTPUT ANDA. Output sebelumnya ditolak oleh validator dengan kesalahan berikut:\n${lastError}\n\nPerbaiki markup sesuai kontrak. Output HTML saja.`;
    }

    const message = await anthropic.messages.create({
      model: TEXT_MODEL,
      max_tokens: MAX_TOKENS,
      system: STEP_B_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const textBlock = message.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text',
    );
    const raw = textBlock?.text ?? '';

    const parsed = StepBOutputValidation.safeParse({ html_template: raw });
    if (!parsed.success) {
      lastError = parsed.error.issues
        .map(issue => `- ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
      continue;
    }

    // Structural + security validation before persisting.
    const validation = validateTemplate(parsed.data.html_template, allowedOrigin);
    if (!validation.valid) {
      lastError = validation.issues
        .map(issue => `- ${issue.path}: ${issue.message}`)
        .join('\n');
      continue;
    }

    const sanitized = sanitizeTemplateHtml(parsed.data.html_template);

    return {
      output: { html_template: sanitized },
      tokensIn: message.usage.input_tokens,
      tokensOut: message.usage.output_tokens,
    };
  }

  throw new Error(`Step B failed after ${MAX_ATTEMPTS} attempts: ${lastError}`);
};
