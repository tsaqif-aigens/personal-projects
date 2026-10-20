import 'server-only';
import type {
  CreateInvitationInput,
  FormEvent,
} from '@/validations/CreateInvitationValidation';
import type { Vars } from '@/validations/VarsValidation';

// Indonesian labels. Kept server-side so the AI never translates/corrupts them.
const DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

const TIMEZONE_OFFSET: Record<FormEvent['timezone'], string> = {
  WIB: '+07:00',
  WITA: '+08:00',
  WIT: '+09:00',
};

// "2026-10-10" -> "Sabtu, 10 Oktober 2026".
const formatDateLabel = (date: string): string => {
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  const dayName = DAY_NAMES[parsed.getUTCDay()] ?? '';
  const monthName = MONTH_NAMES[(month ?? 1) - 1] ?? '';
  return `${dayName}, ${day} ${monthName} ${year}`;
};

// "2026-10-10" -> "10 . 10 . 26" (the short cover date format from the spec).
const formatDateShort = (date: string): string => {
  const [year, month, day] = date.split('-').map(Number);
  return `${day} . ${month} . ${String(year ?? 0).slice(-2)}`;
};

// Builds the display time label: "10.00 WITA - Selesai" or "10.00 WITA - 12.00 WITA".
const formatTimeLabel = (event: FormEvent): string => {
  const start = event.start.replace(':', '.');
  const end = event.end === 'Selesai' ? 'Selesai' : event.end.replace(':', '.');
  return `${start} ${event.timezone} - ${end}`;
};

// Converts the akad date+time into a full ISO datetime with timezone offset.
const buildCountdownTarget = (event: FormEvent): string => {
  const [year, month, day] = event.date.split('-').map(Number);
  const [hour, minute] = event.start.split(':').map(Number);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${year}-${pad(month ?? 1)}-${pad(day ?? 1)}T${pad(hour ?? 0)}:${pad(minute ?? 0)}:00${TIMEZONE_OFFSET[event.timezone]}`;
};

// Derives the meta title/description from the couple. The cover photo URL is
// used as the OG image (falling back to empty).
const buildMeta = (
  input: CreateInvitationInput,
  coverDateShort: string,
): Vars['meta'] => {
  const names = `${input.couple.bride.nickname} & ${input.couple.groom.nickname}`;
  return {
    og_title: `Undangan Pernikahan ${names}`,
    og_description: `Dengan memohon rahmat dan ridho Allah SWT, ${input.couple.bride.full_name} & ${input.couple.groom.full_name} mengundang Anda, ${coverDateShort}.`,
    og_image_url: input.coverPhotoUrl || '',
  };
};

// The deterministic, non-AI parts of `vars`: couple, cover, events, countdown,
// gifts, gallery, music, meta. `copy` + `love_story` are produced by the AI
// (love_story uses the couple's own text when provided); `quote` is a fixed
// constant injected separately.
export interface FormVars {
  couple: Vars['couple'];
  cover: Vars['cover'];
  events: Vars['events'];
  countdown: Vars['countdown'];
  gifts: Vars['gifts'];
  gallery: Vars['gallery'];
  music: Vars['music'];
  meta: Vars['meta'];
}

export const buildVarsFromForm = (input: CreateInvitationInput): FormVars => {
  // The countdown targets the akad event; if the couple only provided a
  // resepsi, fall back to the first event.
  const akad = input.events.find((e) => e.key === 'akad') ?? input.events[0];
  const countdownTarget =
    akad === undefined ? '1970-01-01T00:00:00+07:00' : buildCountdownTarget(akad);

  const events = input.events.map((event) => ({
    key: event.key,
    title: event.title,
    date_label: formatDateLabel(event.date),
    time_label: formatTimeLabel(event),
    venue_name: event.venue_name,
    address: event.address,
    maps_url: event.maps_url,
  }));

  const coverDateShort =
    akad === undefined ? '' : formatDateShort(akad.date);

  return {
    couple: input.couple,
    cover: {
      photo_url: input.coverPhotoUrl,
      date_short: coverDateShort,
    },
    events,
    countdown: {
      target_iso: countdownTarget,
      calendar_url: '',
    },
    gifts: input.gifts,
    gallery: input.gallery,
    music: input.music,
    meta: buildMeta(input, coverDateShort),
  };
};
