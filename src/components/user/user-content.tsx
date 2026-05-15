'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ComponentProps, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FaArrowLeft, FaHashtag } from 'react-icons/fa';
import * as React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Image from 'next/image';
import { UserVerificationBadge } from '@/components/ui/user-placeholder';
import {
  CalendarDays,
  Hash,
  Link as LinkIcon,
  Plus,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { Dialog as HeadDialog } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { showTopToast } from '@/components/toast/toast-util';
import { authApi } from '@/lib/axios';
import { LoaderSmall } from '@/components/ui/loader';
import { IoIosArrowForward } from 'react-icons/io';
import { PiFireSimpleBold } from 'react-icons/pi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MdContentCopy } from 'react-icons/md';
import { useAuthStore } from '@/store/auth-store';
import { UserEvents } from '@/components/user/user-events';
import { UserPosts } from '@/components/user/user-posts';
import defaultImage from '@/assests/default.jpeg';
import { Linkify } from '@/lib/linkify';
import { DESKTOP_ROUTES } from '@/lib/routes';

interface UserProps extends ComponentProps<'div'> {
  user: { [key: string]: any };
  setUser: (user: { [key: string]: any }) => void;
  prev: string | null;
  variant?: 'mobile' | 'desktop';
}

type ActiveScreenType = 'details' | 'posts' | 'events';

export const UserContent = ({
  user,
  setUser,
  prev,
  variant = 'mobile',
  className,
  ...props
}: UserProps) => {
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const isDesktop = variant === 'desktop';

  const searchParams = useSearchParams();
  const pathname = usePathname();

  const userStats: { name: string; value: string | number }[] = [
    { name: 'Ticket Sold', value: user.participantCount },
    { name: 'Experience', value: user.eventCount },
    { name: 'Subscribers', value: user.totalFollowers },
  ];

  const userAboutLinks: { name: string; value: string }[] = [
    { name: 'Website', value: user.website },
    { name: 'Instagram', value: user.instagramHandle },
    { name: 'Twitter', value: user.twitterHandle },
    { name: 'FaceBook', value: user.facebookHandle },
  ];

  const isUserProfile: boolean = currentUser?.id === user.id;

  const [activeScreen, setActiveScreen] = useState<ActiveScreenType>('details');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const [isSubscribeLoading, setIsSubscribeLoading] = useState<boolean>(false);

  const handleBackClick = () => {
    if (activeScreen === 'details') {
      router.push(prev != null ? prev : '/');
    }
    setActiveScreen('details');
  };

  const handleSubscribeClick = async () => {
    if (!isAuthenticated) {
      router.push(
        `/login?next=${encodeURIComponent(pathname ?? DESKTOP_ROUTES.userDetail(user.id))}`,
      );
      return;
    }

    setIsSubscribeLoading(true);

    try {
      await authApi.post(`/userFollow/follow/user/${user.id}`);
      setUser({ ...user, followed: true });
    } catch (error: any) {
      showTopToast('error', error.response?.data?.description);
    } finally {
      setIsSubscribeLoading(false);
    }
  };

  const handleUnsubscribeClick = async () => {
    if (!isAuthenticated) {
      router.push(
        `/login?next=${encodeURIComponent(pathname ?? DESKTOP_ROUTES.userDetail(user.id))}`,
      );
      return;
    }

    setIsSubscribeLoading(true);

    try {
      await authApi.post(`/userFollow/unfollow/user/${user.id}`);
      setUser({ ...user, followed: false });
    } catch (error: any) {
      showTopToast('error', error.response?.data?.description);
    } finally {
      setIsSubscribeLoading(false);
    }
  };

  const handleLinkCopy = async (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      showTopToast('success', 'Link copied to clipboard');
    }
  };

  const render = () => {
    switch (activeScreen) {
      case 'posts':
        return <UserPosts user={user} variant={variant} />;
      case 'events':
        return <UserEvents user={user} variant={variant} />;
      default:
        if (isDesktop) {
          return (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_clamp(20rem,22vw,24rem)]">
              <section className="min-w-0 space-y-6">
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="h-32 border-b border-border bg-[linear-gradient(135deg,rgba(30,64,175,0.18),rgba(16,185,129,0.10),rgba(255,255,255,0))] dark:bg-[linear-gradient(135deg,rgba(37,99,235,0.22),rgba(16,185,129,0.10),rgba(255,255,255,0.02))]" />
                  <div className="flex flex-wrap items-end justify-between gap-5 px-6 pb-6">
                    <button
                      type="button"
                      className="-mt-16 h-32 w-32 overflow-hidden rounded-full border-4 border-card bg-muted shadow-sm"
                      onClick={() => setIsOpen(true)}
                      aria-label="View profile image"
                    >
                      <AspectRatio ratio={1}>
                        <Image
                          src={user.profileImage || defaultImage}
                          alt={user.username}
                          fill
                          className="object-cover"
                        />
                      </AspectRatio>
                    </button>

                    <div className="flex flex-wrap gap-3">
                      {isUserProfile ? (
                        <>
                          <Button
                            variant="outline"
                            className="h-11 rounded-full"
                            onClick={() =>
                              router.push(
                                `${DESKTOP_ROUTES.settings}?section=profile&prev=${encodeURIComponent(`${pathname}?${searchParams}`)}`,
                              )
                            }
                          >
                            Edit profile
                          </Button>
                          <Button
                            className="h-11 rounded-full"
                            onClick={() =>
                              router.push(
                                `${DESKTOP_ROUTES.createEvent}?prev=${encodeURIComponent(`${pathname}?${searchParams}`)}`,
                              )
                            }
                          >
                            <Plus size={16} />
                            Create event
                          </Button>
                        </>
                      ) : user.followed ? (
                        <Button
                          variant="outline"
                          className="h-11 rounded-full"
                          onClick={handleUnsubscribeClick}
                          disabled={isSubscribeLoading}
                        >
                          {isSubscribeLoading ? <LoaderSmall /> : 'Subscribed'}
                        </Button>
                      ) : (
                        <Button
                          className="h-11 rounded-full bg-blue-800 hover:bg-blue-800"
                          onClick={handleSubscribeClick}
                          disabled={isSubscribeLoading}
                        >
                          <UserPlus size={16} />
                          {isSubscribeLoading ? <LoaderSmall /> : 'Subscribe'}
                        </Button>
                      )}
                    </div>

                    <div className="w-full min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="min-w-0 truncate text-4xl font-black tracking-tight">
                          {user.username}
                        </h2>
                        <UserVerificationBadge user={user} isClickable={true} />
                      </div>
                      {user.aboutText ? (
                        <Linkify
                          text={user.aboutText}
                          className="mt-3 block max-w-3xl text-sm leading-6 text-muted-foreground"
                          as="span"
                        />
                      ) : (
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                          This profile has not added a bio yet.
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
                        if (item.name === 'Experience')
                          setActiveScreen('events');
                      }}
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        {item.name}
                      </p>
                      <p className="mt-2 text-3xl font-black">
                        {item.value ?? 0}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    className="group rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:border-blue-800/30 hover:bg-accent"
                    onClick={() => setActiveScreen('events')}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-foreground transition group-hover:bg-blue-800 group-hover:text-white">
                      <PiFireSimpleBold size={20} />
                    </span>
                    <p className="mt-4 font-black">Experiences</p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      Hosted events and public experiences.
                    </p>
                  </button>
                  <button
                    type="button"
                    className="group rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:border-blue-800/30 hover:bg-accent"
                    onClick={() => setActiveScreen('posts')}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-foreground transition group-hover:bg-blue-800 group-hover:text-white">
                      <Hash size={20} />
                    </span>
                    <p className="mt-4 font-black">Posts</p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      Updates, notes, and tagged conversations.
                    </p>
                  </button>
                </div>
              </section>

              <aside className="hidden xl:block">
                <div className="sticky top-6 space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                      <Users size={20} />
                    </span>
                    <h3 className="mt-4 text-xl font-black">Profile links</h3>
                    <div className="mt-4 space-y-3">
                      {userAboutLinks.map((item) => {
                        if (!item.value) return null;

                        return (
                          <button
                            type="button"
                            key={item.name}
                            className="flex w-full items-center justify-between gap-3 rounded-xl border border-border px-3 py-3 text-left text-sm transition hover:bg-accent"
                            onClick={() => handleLinkCopy(item.value)}
                          >
                            <span className="min-w-0">
                              <span className="block font-bold">
                                {item.name}
                              </span>
                              <span className="block truncate text-muted-foreground">
                                {item.value}
                              </span>
                            </span>
                            <LinkIcon
                              size={16}
                              className="shrink-0 text-muted-foreground"
                            />
                          </button>
                        );
                      })}
                      {userAboutLinks.every((item) => !item.value) ? (
                        <p className="text-sm leading-6 text-muted-foreground">
                          No external links have been added to this profile.
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                      <CalendarDays size={20} />
                    </span>
                    <h3 className="mt-4 text-xl font-black">
                      Explore activity
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Open experiences or posts to continue into the full
                      desktop detail pages.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          );
        }

        return (
          <div className="w-full flex-1 flex flex-col px-4 pt-6 gap-8">
            <div className="w-full flex gap-3 items-center">
              <div
                className="relative w-24 h-24 rounded-full flex items-center justify-center"
                onClick={() => setIsOpen(true)}
              >
                <AspectRatio ratio={1}>
                  <Image
                    src={user.profileImage || defaultImage}
                    alt={user.username}
                    fill
                    className="object-cover rounded-full"
                  />
                </AspectRatio>
              </div>
              <div className="w-full flex flex-col">
                <div className="flex gap-2 items-center">
                  <p className="text-foreground text-sm font-bold truncate">
                    {user.username}
                  </p>
                  <UserVerificationBadge user={user} isClickable={true} />
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col gap-4">
              <div className="w-full flex justify-between items-center px-6">
                {userStats.map((item, index) => (
                  <span
                    key={index}
                    className="flex flex-col items-center justify-center gap-1"
                  >
                    <p className="text-neutral-400 text-sm">{item.name}</p>
                    <p className="font-bold text-lg">{item.value}</p>
                  </span>
                ))}
              </div>
              {isUserProfile ? (
                <div className="w-full flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 min-w-0 shadow-none font-semibold border-foreground py-6"
                    onClick={() =>
                      router.push(
                        `/m/settings/edit-profile?prev=${encodeURIComponent(`${pathname}?${searchParams}`)}`,
                      )
                    }
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 min-w-0 shadow-none font-semibold border-foreground py-6"
                    onClick={() =>
                      router.push(
                        `/m/event-create?prev=${encodeURIComponent(`${pathname}?${searchParams}`)}`,
                      )
                    }
                  >
                    Create Event
                  </Button>
                </div>
              ) : (
                <div className="w-full flex gap-3">
                  {/*<Button*/}
                  {/*    variant="outline"*/}
                  {/*    className="flex-1 min-w-0 shadow-none font-semibold border-black py-6"*/}
                  {/*>*/}
                  {/*    Message*/}
                  {/*</Button>*/}
                  {user.followed ? (
                    <Button
                      variant="outline"
                      className="flex-1 min-w-0 shadow-none font-semibold border-foreground py-6"
                      onClick={handleUnsubscribeClick}
                      disabled={isSubscribeLoading}
                    >
                      {isSubscribeLoading ? <LoaderSmall /> : 'Subscribed'}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      className="flex-1 min-w-0 shadow-none border-none py-6 bg-blue-800 hover:bg-blue-800"
                      onClick={handleSubscribeClick}
                      disabled={isSubscribeLoading}
                    >
                      {isSubscribeLoading ? <LoaderSmall /> : 'Subscribe'}
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="w-full flex flex-col gap-4">
              <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
                <DialogTrigger asChild>
                  <div className="w-full flex justify-between items-center py-2">
                    <span className="font-bold">About</span>
                    <IoIosArrowForward size={16} />
                  </div>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-left">About</DialogTitle>
                  </DialogHeader>
                  <div className="w-full flex flex-col gap-4 text-muted-foreground">
                    <Linkify
                      text={user.aboutText}
                      className="font-medium text-sm"
                      as="span"
                    />
                    <div className="w-full flex flex-col gap-3">
                      {userAboutLinks.map((item, index) => {
                        if (!item.value) return;
                        return (
                          <div key={index} className="flex flex-col">
                            <span className="font-bold text-muted-foreground">
                              {item.name}
                            </span>
                            <span className="w-full flex items-center justify-between">
                              <p>{item.value}</p>
                              <span
                                className="px-2"
                                onClick={() => handleLinkCopy(item.value)}
                              >
                                <MdContentCopy className="text-blue-700" />
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="w-full grid grid-cols-2 gap-4">
                <div
                  className="flex flex-col gap-3 border border-border px-4 py-5 rounded-sm items-start"
                  onClick={() =>
                    router.push(
                      isUserProfile
                        ? `/m/user-events?prev=${encodeURIComponent(`${pathname}?${searchParams}`)}`
                        : `/m/user-events?id=${user?.id}&prev=${encodeURIComponent(`${pathname}?${searchParams}`)}`,
                    )
                  }
                >
                  <div className="h-10 flex items-center justify-center">
                    <PiFireSimpleBold size={32} />
                  </div>
                  <span className="font-semibold">Experiences</span>
                </div>

                <div
                  className="flex flex-col gap-3 border border-border px-4 py-5 rounded-sm items-start"
                  onClick={() => setActiveScreen('posts')}
                >
                  <div className="h-10 flex items-center justify-center">
                    <FaHashtag size={24} />
                  </div>
                  <span className="font-semibold">Posts</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (isDesktop) {
    const activeTitle =
      activeScreen === 'posts'
        ? 'Posts'
        : activeScreen === 'events'
          ? 'Experiences'
          : user.username;

    return (
      <>
        <div
          className={cn(
            'min-h-[100dvh] bg-background text-foreground',
            className,
          )}
          {...props}
        >
          <div className="desktop-page-container py-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card transition hover:bg-accent"
                  aria-label="Go back"
                >
                  <FaArrowLeft size={14} />
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
                    User profile
                  </p>
                  <h1 className="truncate text-3xl font-black capitalize tracking-tight">
                    {activeTitle}
                  </h1>
                </div>
              </div>
              {activeScreen !== 'details' ? (
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setActiveScreen('details')}
                >
                  Profile overview
                </Button>
              ) : null}
            </div>
            {render()}
          </div>
        </div>

        <HeadDialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="fixed inset-0 z-100 flex items-center justify-center bg-neutral-950/80 p-8"
        >
          <div
            className="absolute top-4 right-4 text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={30} />
          </div>
          <HeadDialog.Panel className="max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-background text-foreground">
            <Image
              src={user.profileImage || defaultImage}
              alt="Profile image"
              width={900}
              height={700}
              className="max-h-[90vh] w-auto object-contain"
            />
          </HeadDialog.Panel>
        </HeadDialog>
      </>
    );
  }

  return (
    <>
      <div className={cn('w-full h-[100dvh]', className)} {...props}>
        <div
          className={
            'w-full border-b-1 border-border flex flex-col gap-3 h-20 justify-center'
          }
        >
          <div className="flex flex-row items-center px-8">
            <FaArrowLeft
              size={16}
              onClick={handleBackClick}
              className="cursor-pointer hover:text-muted-foreground transition-colors"
            />
            <p className="font-semibold text-foreground text-sm w-full text-center capitalize truncate ml-4">
              {user.username}
            </p>
          </div>
        </div>
        {render()}
      </div>

      <HeadDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-100 flex items-center justify-center bg-neutral-950/70"
      >
        <div
          className="absolute top-4 right-4 text-white"
          onClick={() => setIsOpen(false)}
        >
          <X size={30} />
        </div>
        <HeadDialog.Panel className="bg-background overflow-hidden w-full max-h-[95%] text-foreground">
          <Image
            src={user.profileImage || defaultImage}
            alt="Snapshot"
            width={800}
            height={600}
            className="object-contain w-full h-auto"
            // style={{ maxHeight: "95vh" }}
          />
        </HeadDialog.Panel>
      </HeadDialog>
    </>
  );
};
