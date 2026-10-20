import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/Badge';
import type { InvitationListItem } from '@/server/invitation/list';

const STATUS_VARIANTS: Record<
  InvitationListItem['status'],
  'neutral' | 'success' | 'warning' | 'info'
> = {
  draft: 'neutral',
  preview: 'warning',
  published: 'success',
  archived: 'info',
};

export const StatusBadge = async ({
  status,
}: {
  status: InvitationListItem['status'];
}) => {
  const t = await getTranslations('Dashboard');

  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {t(`status_${status}`)}
    </Badge>
  );
};
