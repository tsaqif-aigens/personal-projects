import { useTranslations } from 'next-intl';

export const PhoneMockup = () => {
  const t = useTranslations('Index');

  return (
    <div className="relative mx-auto w-[270px] sm:w-[300px]" aria-label={t('hero_phone_label')}>
      {/* Soft glow behind the phone */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 scale-110 rounded-full bg-primary/30 blur-3xl"
      />

      <div className="overflow-hidden rounded-[2.5rem] border border-gold-200 bg-surface shadow-2xl ring-1 ring-black/5">
        {/* Notch */}
        <div className="flex justify-center pt-3">
          <div className="h-5 w-24 rounded-full bg-foreground/90" />
        </div>

        {/* Screen */}
        <div className="bg-linear-to-b from-forest-800 via-forest-700 to-forest-900 px-5 pb-8 pt-5 text-center">
          <p className="font-serif text-sm tracking-[0.3em] text-gold-300 uppercase">
            {t('hero_phone_label')}
          </p>
          <p className="mt-8 font-serif text-3xl text-cream-50">
            {t('hero_phone_names')}
          </p>
          <p className="mt-2 text-xs text-cream-100/80">{t('hero_phone_date')}</p>

          <div className="mt-8 space-y-2 text-left">
            <div className="h-2 w-full rounded-full bg-cream-50/20" />
            <div className="h-2 w-5/6 rounded-full bg-cream-50/20" />
            <div className="h-2 w-2/3 rounded-full bg-cream-50/20" />
          </div>

          <div className="mt-8 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-forest-900">
            {t('hero_phone_cta')}
          </div>
        </div>
      </div>
    </div>
  );
};
