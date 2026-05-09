import { authApi } from '@/lib/axios';
import { Check, ChevronDown, ChevronUp, Inbox, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UserVerificationBadge } from '../ui/user-placeholder';
import { useRouter } from 'next/navigation';
import { DESKTOP_ROUTES } from '@/lib/routes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// User info type
type UserPlaceholder = {
  id: string;
  username: string;
  profileImageUrl: string;
  userVerificationType: string | null;
  verified: boolean;
};

// Event info type
type EventPlaceholder = {
  eventId: string;
  title: string;
  titleFileUrl: string;
  original: boolean;
  featured: boolean;
};

// Possible invitation status values
type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

// Invitation type
type Invitation = {
  inviteId: string;
  userPlaceHolder: UserPlaceholder;
  hostedPlaceHolder: UserPlaceholder;
  eventPlaceHolder: EventPlaceholder;
  invitationStatus: InvitationStatus;
  expireAt: string;
};

type Invitations = Invitation[];

interface RequestDisplayProps {
  variant?: 'mobile' | 'desktop';
}

const RequestDisplay = ({ variant = 'mobile' }: RequestDisplayProps) => {
  const isDesktop = variant === 'desktop';
  const [requests, setRequests] = useState<Invitations>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const router = useRouter();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.get('/invite/user');
      const data: Invitations = response.data.data;
      setRequests(data);
    } catch {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const toggleDropdown = (inviteId: string) => {
    setOpenDropdown(openDropdown === inviteId ? null : inviteId);
  };

  const handleApprove = async (
    inviteId: string,
    eventId: string,
    username: string,
  ) => {
    try {
      setActionLoading(inviteId);
      // Add your approve API logic here
      // await authApi.post(`/invite/${inviteId}/approve`);

      await authApi.post(`/invite/${inviteId}/respond`, {
        eventId,
        username,
        isAccepted: false,
      });

      // Remove from list or update status
      setRequests((prev) => prev.filter((req) => req.inviteId !== inviteId));
      setOpenDropdown(null);
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlock = async (
    inviteId: string,
    eventId: string,
    username: string,
  ) => {
    try {
      setActionLoading(inviteId);

      await authApi.post(`/invite/${inviteId}/respond`, {
        eventId,
        username,
        isAccepted: false,
      });

      // Remove from list
      setRequests((prev) => prev.filter((req) => req.inviteId !== inviteId));
      setOpenDropdown(null);
    } catch (err) {
      console.error('Failed to block:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewProfile = (userId: string) => {
    const path =
      variant === 'desktop'
        ? DESKTOP_ROUTES.userDetail(userId)
        : `/m/user/${userId}`;
    router.push(`${path}?prev=${encodeURIComponent('/?screen=updates')}`);
  };
  const handleViewEvent = (eventId: string) => {
    const path =
      variant === 'desktop'
        ? DESKTOP_ROUTES.eventDetail(eventId)
        : `/m/events/${eventId}`;
    router.push(`${path}?prev=${encodeURIComponent('/?screen=updates')}`);
  };

  function isInviteExpired(expireAt: string): boolean {
    const now = new Date();
    const expiryDate = new Date(expireAt);
    return expiryDate.getTime() < now.getTime();
  }

  if (loading) {
    if (isDesktop) {
      return (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <RequestSkeleton key={i} variant="desktop" />
          ))}
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <RequestSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    if (isDesktop) {
      return (
        <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <Button
            onClick={fetchRequests}
            className="rounded-full bg-blue-800 hover:bg-blue-800"
          >
            Retry
          </Button>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-background shadow rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-black text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    if (isDesktop) {
      return (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background p-10 text-center">
          <Inbox size={42} className="text-blue-800" />
          <p className="mt-4 text-lg font-black">No pending requests</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Co-host invites and collaboration requests will appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-background shadow rounded-lg p-6 text-center text-gray-500">
          <p>No pending requests</p>
        </div>
      </div>
    );
  }

  if (isDesktop) {
    return (
      <div className="grid gap-3">
        {requests.map((invite) => {
          const user = invite.hostedPlaceHolder;
          const isActionLoading = actionLoading === invite.inviteId;
          const event = invite.eventPlaceHolder;
          const expired = isInviteExpired(invite.expireAt);

          return (
            <article
              key={invite.inviteId}
              className={cn(
                'rounded-2xl border border-border bg-background p-4 shadow-sm',
                expired && 'opacity-75',
              )}
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={event.titleFileUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </span>
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate font-black">{user.username}</p>
                      <UserVerificationBadge user={user} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      Event invite to{' '}
                      <span className="font-semibold text-foreground">
                        {event.title}
                      </span>
                      {expired ? ' (expired)' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {!expired ? (
                    <>
                      <Button
                        size="sm"
                        className="rounded-full bg-blue-800 hover:bg-blue-800"
                        disabled={isActionLoading}
                        onClick={() =>
                          handleApprove(
                            invite.inviteId,
                            invite.eventPlaceHolder.eventId,
                            user.username,
                          )
                        }
                      >
                        {isActionLoading ? (
                          <Loader2 className="animate-spin" size={15} />
                        ) : (
                          <Check size={15} />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={isActionLoading}
                        onClick={() =>
                          handleBlock(
                            invite.inviteId,
                            invite.eventPlaceHolder.eventId,
                            user.username,
                          )
                        }
                      >
                        Decline
                      </Button>
                    </>
                  ) : null}
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={isActionLoading}
                    onClick={() => handleViewProfile(user.id)}
                  >
                    View profile
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={isActionLoading}
                    onClick={() => handleViewEvent(event.eventId)}
                  >
                    View event
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-4">
        {requests.map((invite) => {
          const user = invite.hostedPlaceHolder;
          const isOpen = openDropdown === invite.inviteId;
          const isActionLoading = actionLoading === invite.inviteId;
          const event = invite.eventPlaceHolder;
          return (
            <div
              key={invite.inviteId}
              className="bg-background shadow rounded-lg overflow-hidden"
            >
              {/* Main Request Row */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {/* Profile Image */}
                  <span className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                    <Image
                      src={event.titleFileUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </span>

                  {/* Username + checkmark */}
                  <div className="flex flex-col gap-2 ">
                    <span className="font-bold flex gap-1">
                      {user.username}

                      <UserVerificationBadge user={user} />
                    </span>
                    <p>
                      Event invite to {event.title}{' '}
                      {isInviteExpired(invite.expireAt) ? '(expired)' : ''}
                    </p>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => toggleDropdown(invite.inviteId)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Toggle options"
                  disabled={isActionLoading}
                >
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Dropdown Menu */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="flex items-center gap-3 border-t border-border p-3 overflow-x-scroll bg-muted/40">
                  {/* Approve Button */}
                  <button
                    onClick={() =>
                      handleApprove(
                        invite.inviteId,
                        invite.eventPlaceHolder.eventId,
                        user.username,
                      )
                    }
                    disabled={isActionLoading}
                    className={`w-fit flex items-center gap-2 px-4 py-2 whitespace-nowrap border border-foreground rounded-full bg-background hover:bg-muted/40 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed
                      ${isInviteExpired(invite.expireAt) ? ' hidden' : ' flex'}
                      `}
                  >
                    {isActionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    <span className="font-medium text-muted-foreground">
                      Approve
                    </span>
                  </button>
                  {/* Block Button */}
                  <button
                    onClick={() =>
                      handleBlock(
                        invite.inviteId,
                        invite.eventPlaceHolder.eventId,
                        user.username,
                      )
                    }
                    disabled={isActionLoading}
                    className={`w-fit  items-center gap-2 px-4 py-2 whitespace-nowrap border border-foreground rounded-full bg-background hover:bg-muted/40 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed 
                      ${
                        isInviteExpired(invite.expireAt) ? ' hidden' : ' flex'
                      }`}
                  >
                    {isActionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    <span className="font-medium text-muted-foreground">
                      Block
                    </span>
                  </button>
                  {/* View Profile Button */}
                  <button
                    onClick={() => handleViewProfile(user.id)}
                    disabled={isActionLoading}
                    className="w-fit flex items-center gap-2 px-4 py-2 whitespace-nowrap border border-foreground rounded-full bg-background hover:bg-muted/40 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="font-medium text-muted-foreground">
                      View Profile
                    </span>
                  </button>{' '}
                  {/* View Event Button */}
                  <button
                    onClick={() => handleViewEvent(event.eventId)}
                    disabled={isActionLoading}
                    className="w-fit flex items-center gap-2 px-4 py-2 whitespace-nowrap border border-foreground rounded-full bg-background hover:bg-muted/40 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="font-medium text-muted-foreground">
                      View Event
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function RequestSkeleton({
  variant = 'mobile',
}: {
  variant?: 'mobile' | 'desktop';
}) {
  if (variant === 'desktop') {
    return (
      <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-xl bg-muted" />
          <div className="flex-1">
            <div className="mb-2 h-4 w-36 animate-pulse rounded bg-muted" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-28 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background shadow rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-muted h-12 w-12 animate-pulse"></div>
          <div className="h-5 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-9 w-9 bg-muted rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

export default RequestDisplay;
