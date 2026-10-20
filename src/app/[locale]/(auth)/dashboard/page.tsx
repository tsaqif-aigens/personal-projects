import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { getTranslations } from 'next-intl/server';
import { Hello } from '@/components/Hello';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { InvitationGrid } from '@/components/dashboard/InvitationGrid';
import { ButtonLink } from '@/components/ui/Button';
import { listInvitationsByUser } from '@/server/invitation/list';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function Dashboard(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Dashboard',
  });

  const user = await currentUser();
  const invitations = user
    ? await listInvitationsByUser(user.id)
    : [];

  return (
    <div className="py-5">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Hello />
        <ButtonLink href="/create">{t('create_invitation')}</ButtonLink>
      </div>

      {invitations.length === 0 ? (
        <EmptyState />
      ) : (
        <InvitationGrid invitations={invitations} locale={locale} />
      )}
    </div>
  );
}
