import { describe, expect, it } from 'vitest';
import { buildVarsFromForm } from './form';
import type { CreateInvitationInput } from '@/validations/CreateInvitationValidation';

const baseInput: CreateInvitationInput = {
  slug: 'aisyah-dan-bilal',
  stylePreference: 'auto',
  couple: {
    bride: {
      full_name: 'Aisyah Putri',
      nickname: 'Aisyah',
      father: 'Bapak Ahmad',
      mother: 'Ibu Siti',
      father_deceased: false,
      mother_deceased: false,
      instagram_url: '',
      photo_url: 'https://example.com/bride.jpg',
    },
    groom: {
      full_name: 'Bilal Rahman',
      nickname: 'Bilal',
      father: 'Bapak Yusuf',
      mother: 'Ibu Aminah',
      father_deceased: false,
      mother_deceased: false,
      instagram_url: '',
      photo_url: 'https://example.com/groom.jpg',
    },
  },
  coverPhotoUrl: 'https://example.com/cover.jpg',
  events: [
    {
      key: 'akad',
      title: 'Akad Nikah',
      date: '2026-10-10',
      start: '10:00',
      end: 'Selesai',
      timezone: 'WITA',
      venue_name: 'Masjid Raya',
      address: 'Jl. Merdeka No. 1',
      maps_url: '',
    },
  ],
  gifts: {
    enabled: false,
    accounts: [],
    address: { text: '', recipient: '', phone: '' },
  },
  gallery: [],
  love_story: [],
  music: { enabled: false, url: null, title: null },
};

describe('buildVarsFromForm', () => {
  it('derives Indonesian date_label and time_label from raw date/time', () => {
    const vars = buildVarsFromForm(baseInput);

    expect(vars.events[0]?.date_label).toBe('Sabtu, 10 Oktober 2026');
    expect(vars.events[0]?.time_label).toBe('10.00 WITA - Selesai');
  });

  it('derives the short cover date and countdown ISO target', () => {
    const vars = buildVarsFromForm(baseInput);

    expect(vars.cover.date_short).toBe('10 . 10 . 26');
    expect(vars.countdown.target_iso).toBe('2026-10-10T10:00:00+08:00');
  });

  it('formats a ranged end time with the timezone suffix', () => {
    const vars = buildVarsFromForm({
      ...baseInput,
      events: [{ ...baseInput.events[0]!, end: '13:00', timezone: 'WIB' }],
    });

    expect(vars.events[0]?.time_label).toBe('10.00 WIB - 13.00');
    expect(vars.countdown.target_iso).toBe('2026-10-10T10:00:00+07:00');
  });

  it('falls back to the first event for countdown when akad is absent', () => {
    const vars = buildVarsFromForm({
      ...baseInput,
      events: [
        {
          key: 'resepsi',
          title: 'Resepsi',
          date: '2026-10-11',
          start: '11:00',
          end: 'Selesai',
          timezone: 'WIT',
          venue_name: 'Gedung',
          address: 'Jl. X',
          maps_url: '',
        },
      ],
    });

    expect(vars.countdown.target_iso).toBe('2026-10-11T11:00:00+09:00');
    expect(vars.cover.date_short).toBe('11 . 10 . 26');
  });

  it('builds og_title/og_description from the couple and cover photo', () => {
    const vars = buildVarsFromForm(baseInput);

    expect(vars.meta.og_title).toContain('Aisyah & Bilal');
    expect(vars.meta.og_description).toContain('Aisyah Putri & Bilal Rahman');
    expect(vars.meta.og_image_url).toBe('https://example.com/cover.jpg');
  });

  it('passes through gifts, gallery, and music unchanged', () => {
    const vars = buildVarsFromForm(baseInput);

    expect(vars.gifts).toEqual(baseInput.gifts);
    expect(vars.gallery).toEqual(baseInput.gallery);
    expect(vars.music).toEqual(baseInput.music);
  });
});
