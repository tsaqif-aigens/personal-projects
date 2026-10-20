import { getTranslations } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/Button';

export const EmptyState = async () => {
  const t = await getTranslations('Dashboard');

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-strong px-6 py-16 text-center">
      <div className="mb-4 text-4xl" aria-hidden="true">
        💌
      </div>
      <h2 className="mb-2 text-lg font-semibold text-foreground">
        {t('empty_title')}
      </h2>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {t('empty_description')}
      </p>
      <ButtonLink href="/create">{t('create_invitation')}</ButtonLink>
    </div>
  );
};
