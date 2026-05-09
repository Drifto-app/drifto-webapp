import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Image from 'next/image';
import * as React from 'react';
import { UserVerificationBadge } from '@/components/ui/user-placeholder';
import { Button } from '@/components/ui/button';
import { ShareDialog } from '@/components/share-button/share-option';
import { useShare } from '@/hooks/share-option';
import { PiFireSimpleBold } from 'react-icons/pi';
import { FaHashtag, FaRegClock } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { BiCalendarAlt } from 'react-icons/bi';
import { ActiveScreenType } from '@/components/profile-display/profile-display';
import { UserPosts } from '@/components/user/user-posts';
import { UserEvents } from '@/components/user/user-events';
import { UserOrders } from '@/components/order/user-orders';
import { UserSubscribers } from '@/components/user/user-subscribers';
import defaultImage from '@/assests/default.jpeg';
import { DESKTOP_ROUTES } from '@/lib/routes';
import {
  CalendarDays,
  Heart,
  Hash,
  Settings,
  Share2,
  Ticket,
  Users,
} from 'lucide-react';

interface UserProfileProps extends ComponentProps<'div'> {
  handleScreenChange: (value: string) => void;
  activeScreen: string;
  setActiveScreen: (value: ActiveScreenType) => void;
  variant?: 'mobile' | 'desktop';
}

export const UserProfile = ({
  activeScreen,
  setActiveScreen,
  handleScreenChange,
  variant = 'mobile',
  className,
  ...props
}: UserProfileProps) => {
  const { user } = useAuthStore();
  const router = useRouter();
  const isDesktop = variant === 'desktop';

  const userUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${isDesktop ? DESKTOP_ROUTES.userDetail(user?.id ?? '') : `/m/user/${user?.id}`}`;
  const { isShareDialogOpen, closeShareDialog, handleQuickShare } = useShare({
    title: user?.username,
    url: userUrl,
  });

  const userStats: { name: string; value: string | number }[] = [
    { name: 'Ticket Sold', value: user?.participantCount || 0 },
    { name: 'Experience', value: user?.eventCount || 0 },
    { name: 'Subscribers', value: user?.totalFollowers || 0 },
  ];

  const render = () => {
    switch (activeScreen) {
      case 'posts':
        return <UserPosts user={user!} isForUser={true} variant={variant} />;
      case 'orders':
        return <UserOrders user={user!} variant={variant} />;
      case 'subscribers':
        return <UserSubscribers variant={variant} />;
      case 'events':
        return <UserEvents user={user!} isForUser={true} variant={variant} />;
      default:
        if (isDesktop) {
          return (
            <>
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_clamp(20rem,22vw,24rem)]">
                <section className="min-w-0 space-y-6">
                  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="h-28 border-b border-border bg-[linear-gradient(135deg,rgba(30,64,175,0.18),rgba(16,185,129,0.12),rgba(255,255,255,0))] dark:bg-[linear-gradient(135deg,rgba(37,99,235,0.22),rgba(16,185,129,0.10),rgba(255,255,255,0.02))]" />
                    <div className="flex flex-wrap items-end justify-between gap-5 px-6 pb-6">
                      <button
                        type="button"
                        className="-mt-14 h-28 w-28 overflow-hidden rounded-full border-4 border-card bg-muted shadow-sm"
                        onClick={() =>
                          router.push(
                            `${DESKTOP_ROUTES.settings}?section=profile&prev=${encodeURIComponent(`/?screen=profile`)}`,
                          )
                        }
                        aria-label="Update profile picture"
                      >
                        <AspectRatio ratio={1}>
                          <Image
                            src={user?.profileImage || defaultImage}
                            alt={user?.username || 'Profile image'}
                            fill
                            className="object-cover"
                          />
                        </AspectRatio>
                      </button>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          className="h-11 rounded-full"
                          onClick={handleQuickShare}
                        >
                          <Share2 size={16} />
                          Share
                        </Button>
                        <Button
                          className="h-11 rounded-full"
                          onClick={() =>
                            router.push(
                              `${DESKTOP_ROUTES.settings}?section=profile&prev=${encodeURIComponent(`/?screen=profile`)}`,
                            )
                          }
                        >
                          <Settings size={16} />
                          Edit profile
                        </Button>
                      </div>

                      <div className="w-full min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="min-w-0 truncate text-3xl font-black tracking-tight">
                            {user?.username}
                          </h2>
                          {user ? (
                            <UserVerificationBadge
                              user={user}
                              isClickable={true}
                            />
                          ) : null}
                        </div>
                        {user?.aboutText ? (
                          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                            {user.aboutText}
                          </p>
                        ) : (
                          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                            Build your profile with a short bio, social links,
                            and hosted experiences.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {userStats.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        className="rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-800/30 hover:shadow-md"
                        onClick={() => {
                          if (item.name === 'Subscribers') {
                            setActiveScreen('subscribers');
                          } else if (item.name === 'Experience') {
                            setActiveScreen('events');
                          }
                        }}
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          {item.name}
                        </p>
                        <p className="mt-2 text-3xl font-black">{item.value}</p>
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      {
                        label: 'Experiences',
                        description: 'Your hosted events',
                        icon: <PiFireSimpleBold size={20} />,
                        onClick: () => setActiveScreen('events'),
                      },
                      {
                        label: 'Posts',
                        description: 'Your community updates',
                        icon: <Hash size={20} />,
                        onClick: () => setActiveScreen('posts'),
                      },
                      {
                        label: 'Subscribers',
                        description: 'People following you',
                        icon: <Users size={20} />,
                        onClick: () => setActiveScreen('subscribers'),
                      },
                      {
                        label: 'Plans',
                        description: 'Bookings and tickets',
                        icon: <CalendarDays size={20} />,
                        onClick: () => handleScreenChange('plans'),
                      },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        className="group rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:border-blue-800/30 hover:bg-accent"
                        onClick={item.onClick}
                      >
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-foreground transition group-hover:bg-blue-800 group-hover:text-white">
                          {item.icon}
                        </span>
                        <p className="mt-4 font-black">{item.label}</p>
                        <p className="mt-1 text-sm leading-5 text-muted-foreground">
                          {item.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>

                <aside className="hidden xl:block">
                  <div className="sticky top-6 space-y-4">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                        <Ticket size={20} />
                      </span>
                      <h3 className="mt-4 text-xl font-black">
                        Profile actions
                      </h3>
                      <div className="mt-4 grid gap-2">
                        <Button
                          variant="outline"
                          className="h-11 justify-start rounded-xl"
                          onClick={() => router.push(DESKTOP_ROUTES.bookings)}
                        >
                          <BiCalendarAlt size={18} />
                          View plans
                        </Button>
                        <Button
                          variant="outline"
                          className="h-11 justify-start rounded-xl"
                          onClick={() => setActiveScreen('posts')}
                        >
                          <FaHashtag size={16} />
                          View posts
                        </Button>
                        <Button
                          variant="outline"
                          className="h-11 justify-start rounded-xl"
                          onClick={() => setActiveScreen('subscribers')}
                        >
                          <Users size={16} />
                          Subscribers
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                        <Heart size={20} />
                      </span>
                      <h3 className="mt-4 text-xl font-black">Favourites</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Liked experiences live in the Favourites tab at the top
                        of this page.
                      </p>
                    </div>
                  </div>
                </aside>
              </div>

              <ShareDialog
                isOpen={isShareDialogOpen}
                onClose={closeShareDialog}
                title={user?.username}
                url={userUrl}
              />
            </>
          );
        }

        return (
          <>
            <div className="w-full flex flex-col px-4 pt-6 pb-25 gap-8">
              <div className="flex items-center gap-5 px-2">
                <div
                  className="w-24 h-24 flex flex-row items-center cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/m/settings/profile-picture?prev=${encodeURIComponent(`/?screen=profile`)}`,
                    )
                  }
                >
                  <AspectRatio ratio={1}>
                    <Image
                      src={user?.profileImage || defaultImage}
                      alt={user?.username}
                      fill
                      className="object-cover rounded-full"
                    />
                  </AspectRatio>
                </div>
                <div className="flex flex-row gap-1 items-center">
                  <p
                    className="font-medium text-xl cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/m/settings/username?prev=${encodeURIComponent(`/?screen=profile`)}`,
                      )
                    }
                  >
                    {user?.username}
                  </p>
                  <UserVerificationBadge user={user!} isClickable={true} />
                </div>
              </div>
              <div className="w-full flex justify-between items-center px-4 mt-2">
                {userStats.map((item, index) => (
                  <span
                    key={index}
                    className="flex flex-col items-center justify-center gap-1 cursor-pointer"
                    onClick={() => {
                      if (item.name === 'Subscribers') {
                        setActiveScreen('subscribers');
                      } else if (item.name === 'Experience') {
                        router.push(
                          `/m/user-events?id=${user?.id}&prev=${encodeURIComponent('/?screen=profile')}`,
                        );
                      }
                    }}
                  >
                    <p className="text-neutral-500 text-sm font-medium">
                      {item.name}
                    </p>
                    <p className="font-bold text-lg">{item.value}</p>
                  </span>
                ))}
              </div>
              <div className="w-full flex gap-3 px-2">
                <Button
                  variant="outline"
                  className="flex-1 min-w-0 shadow-none font-semibold border-border rounded-2xl h-12"
                  onClick={() =>
                    router.push(
                      `/m/settings/edit-profile?prev=${encodeURIComponent(`/?screen=profile`)}`,
                    )
                  }
                >
                  Edit profile
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 min-w-0 shadow-none font-semibold border-border rounded-2xl h-12"
                  onClick={handleQuickShare}
                >
                  Share Profile
                </Button>
              </div>
              <div className="w-full flex flex-col px-2 mt-4">
                <div
                  className="flex flex-row gap-5 items-center justify-start border-b border-border py-5 cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/m/user-events?id=${user?.id}&prev=${encodeURIComponent('/?screen=profile')}`,
                    )
                  }
                >
                  <PiFireSimpleBold size={24} className="text-foreground" />
                  <span className="font-normal text-[17px]">Experiences</span>
                </div>

                <div
                  className="flex flex-row gap-5 items-center justify-start border-b border-border py-5 cursor-pointer"
                  onClick={() => setActiveScreen('posts')}
                >
                  <FaHashtag size={24} className="text-foreground" />
                  <span className="font-normal text-[17px]">Posts</span>
                </div>
                <div
                  className="flex flex-row gap-5 items-center justify-start border-b border-border py-5 cursor-pointer"
                  onClick={() => {
                    if (isDesktop) {
                      router.push(DESKTOP_ROUTES.bookings);
                      return;
                    }

                    setActiveScreen('orders');
                  }}
                >
                  <FaRegClock size={24} className="text-foreground" />
                  <span className="font-normal text-[17px]">Orders</span>
                </div>
                <div
                  className="flex flex-row gap-5 items-center justify-start border-b border-border py-5 cursor-pointer"
                  onClick={() => handleScreenChange('plans')}
                >
                  <BiCalendarAlt size={24} className="text-foreground" />
                  <span className="font-normal text-[17px]">Plans</span>
                </div>
              </div>
            </div>

            <ShareDialog
              isOpen={isShareDialogOpen}
              onClose={closeShareDialog}
              title={user?.username}
              url={userUrl}
            />
          </>
        );
    }
  };

  return (
    <div className={cn(className, 'w-full')} {...props}>
      {render()}
    </div>
  );
};
