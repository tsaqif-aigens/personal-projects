import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FaqSection } from '@/components/landing/FaqSection';
import { PhoneMockup } from '@/components/landing/PhoneMockup';
import { SectionHeading } from '@/components/landing/SectionHeading';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { getI18nPath } from '@/utils/Helpers';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IIndexProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Hero(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  const signInHref = getI18nPath('/sign-in', locale);
  const steps = [1, 2, 3] as const;

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="bg-linear-to-b from-forest-800 via-forest-700 to-forest-900 text-cream-50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center rounded-full border border-gold-300/40 bg-gold-400/10 px-4 py-1.5 text-sm font-medium text-gold-200">
              {t('hero_badge')}
            </span>

            <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              {t('hero_title')}
            </h1>

            <p className="mt-5 max-w-xl text-lg text-cream-100/85">
              {t('hero_subtitle')}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ButtonLink href={signInHref} size="lg" variant="primary">
                {t('hero_cta')}
              </ButtonLink>
              <ButtonAnchor href="#how" size="lg" variant="secondary">
                {t('hero_secondary')}
              </ButtonAnchor>
            </div>
          </div>

          <PhoneMockup />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading title={t('how_title')} subtitle={t('how_subtitle')} />

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {steps.map(step => (
            <div
              key={step}
              className="rounded-xl border border-border bg-surface p-6 shadow-card"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-primary-soft font-serif text-lg font-semibold text-primary">
                {step}
              </div>
              <h3 className="mt-4 font-serif text-xl font-semibold">
                {t(`how_step_${step}_title`)}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t(`how_step_${step}_desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample */}
      <section id="sample" className="bg-surface-muted">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeading
            title={t('sample_title')}
            subtitle={t('sample_subtitle')}
          />

          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-border bg-surface p-8 text-center shadow-card sm:p-10">
            <p className="font-serif text-2xl font-semibold text-foreground">
              {t('sample_couple')}
            </p>
            <p className="mx-auto mt-4 max-w-md font-serif text-lg text-muted-foreground italic">
              “{t('sample_quote')}”
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              {t('sample_venue')}
            </p>
            <div className="mt-8">
              <ButtonLink href={signInHref} variant="secondary">
                {t('sample_cta')}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          title={t('pricing_title')}
          subtitle={t('pricing_subtitle')}
        />

        <div className="mx-auto mt-12 max-w-md rounded-2xl border border-gold-200 bg-surface p-8 text-center shadow-card">
          <span className="inline-flex items-center rounded-full bg-gold-100 px-4 py-1.5 text-sm font-semibold text-gold-700">
            {t('pricing_badge')}
          </span>
          <p className="mt-4 font-serif text-2xl font-semibold text-foreground">
            {t('pricing_subtitle')}
          </p>
          <div className="mt-8">
            <ButtonLink href={signInHref}>{t('pricing_cta')}</ButtonLink>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-surface-muted">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <SectionHeading title={t('faq_title')} subtitle={t('faq_subtitle')} />
          <div className="mt-12">
            <FaqSection />
          </div>
        </div>
      </section>
    </div>
  );
}
