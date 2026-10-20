import { getTranslations } from 'next-intl/server';
import { Env } from '@/libs/Env';
import type { InvitationListItem } from '@/server/invitation/list';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CopyLinkButton } from './CopyLinkButton';
import { StatusBadge } from './StatusBadge';

const formatDate = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

export const InvitationCard = async ({
  invitation,
  locale,
}: {
  invitation: InvitationListItem;
  locale: string;
}) => {
  const t = await getTranslations({ locale, namespace: 'Dashboard' });
  const appUrl = Env.NEXT_PUBLIC_APP_URL ?? '';

  const publicUrl = `${appUrl}/${invitation.slug}`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    t('share_message', { url: publicUrl }),
  )}`;

  const coupleLabel = [invitation.brideName, invitation.groomName]
    .filter(Boolean)
    .join(' & ');

  return (
    <Card hover className="overflow-hidden">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-muted">
        {invitation.coverUrl ? (
          // Plain <img> because cover URLs may point to storage origins not yet
          // listed in next/image remote patterns.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={invitation.coverUrl}
            alt={coupleLabel || invitation.slug}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted">
            {t('no_cover')}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="truncate text-sm font-semibold text-foreground">
            {coupleLabel || invitation.slug}
          </h2>
          <StatusBadge status={invitation.status} />
        </div>

        <p className="text-xs text-muted-foreground">
          {formatDate(invitation.createdAt, locale)}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ButtonLink href={`/preview/${invitation.id}`} size="sm">
            {t('view_preview')}
          </ButtonLink>

          {invitation.status === 'published' && (
            <>
              <ButtonAnchor
                variant="secondary"
                size="sm"
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('share')}
              </ButtonAnchor>
              <CopyLinkButton url={publicUrl} />
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
