import 'server-only';

// Fixed religious content. The AI must NEVER generate or alter this text; it
// is injected into `vars.quote` by our code and treated as a constant.
export const RELIGIOUS_QUOTE = {
  arabic:
    'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ',
  translation:
    'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.',
  source: 'QS Ar-Rum 21',
} as const;

// Slugs that must never be claimed by a user (they collide with app routes).
export const RESERVED_SLUGS = [
  'create',
  'dashboard',
  'preview',
  'payment',
  'sign-in',
  'sign-up',
  'signin',
  'signup',
  'api',
  'admin',
  'landing',
  'about',
  'portfolio',
  'counter',
  'templates',
  'user-profile',
  'login',
  'logout',
  'settings',
  'terms',
  'privacy',
  'faq',
  'blog',
] as const;

// Mustache template size ceiling (must match the DB check constraint).
export const MAX_TEMPLATE_LENGTH = 200000;

// Maximum guest name length (from the `?to=` query parameter).
export const MAX_GUEST_NAME_LENGTH = 80;

export const VARS_SCHEMA_VERSION = 1;
