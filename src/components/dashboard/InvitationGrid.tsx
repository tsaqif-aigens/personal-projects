import type { InvitationListItem } from '@/server/invitation/list';
import { InvitationCard } from './InvitationCard';

export const InvitationGrid = ({
  invitations,
  locale,
}: {
  invitations: InvitationListItem[];
  locale: string;
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {invitations.map((invitation) => (
        <InvitationCard
          key={invitation.id}
          invitation={invitation}
          locale={locale}
        />
      ))}
    </div>
  );
};
