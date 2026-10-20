import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type IAboutProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IAboutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'About',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function About(props: IAboutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'About',
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-serif text-3xl font-semibold text-foreground">
        {t('meta_title')}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        {t('about_paragraph')}
      </p>
    </div>
  );
};
