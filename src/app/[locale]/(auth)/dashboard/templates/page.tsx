import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ListTemplate } from '@/components/ListTemplate';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Template',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function Template() {
  return (
    <>
      <ListTemplate />
    </>
  );
}
