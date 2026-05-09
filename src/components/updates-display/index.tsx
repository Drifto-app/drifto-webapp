import React, { useState } from 'react';
import PageHeader from './PageHeader';
import { Tabs } from './tabs';
import RequestDisplay from './RequestDisplay';
import NotificationsDisplay from './NotificationDisplay';
import { Bell, Inbox } from 'lucide-react';

interface UpdateDisplayProps {
  variant?: 'mobile' | 'desktop';
}

export default function UpdateDisplay({
  variant = 'mobile',
}: UpdateDisplayProps) {
  type TabValue = 'requests' | 'notifications' | null;
  // | "inbox"

  const [activeTab, setActiveTab] = useState<TabValue>('notifications');

  if (variant === 'desktop') {
    return (
      <div className="desktop-page-container py-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
              Account activity
            </p>
            <h1 className="mt-1 text-4xl font-black tracking-tight">Updates</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Track notifications, co-host requests, payout activity, and event
              changes.
            </p>
          </div>
          <Tabs active={activeTab} onClick={setActiveTab} variant="desktop" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="min-w-0 rounded-3xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-800/10 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300">
                  {activeTab === 'notifications' ? (
                    <Bell size={20} />
                  ) : (
                    <Inbox size={20} />
                  )}
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    {activeTab === 'notifications'
                      ? 'Notifications'
                      : 'Requests'}
                  </p>
                  <h2 className="text-2xl font-black">
                    {activeTab === 'notifications'
                      ? 'Latest activity'
                      : 'Pending requests'}
                  </h2>
                </div>
              </div>
            </div>
            <div className="p-5">
              {activeTab === 'notifications' ? (
                <NotificationsDisplay variant={variant} />
              ) : activeTab === 'requests' ? (
                <RequestDisplay variant={variant} />
              ) : null}
            </div>
          </section>

          <aside className="hidden xl:block">
            <div className="sticky top-28 rounded-3xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                Inbox
              </p>
              <h3 className="mt-3 text-xl font-black">Stay current</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Notifications open relevant desktop destinations when available.
                Requests let you review co-host invitations without leaving this
                tab.
              </p>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-2">
        <PageHeader
          headerTitle={'Updates'}
          prev={'/?screen=updates'}
          variant={variant}
        />
      </div>
      <Tabs active={activeTab} onClick={setActiveTab} />
      {activeTab == 'notifications' ? (
        <NotificationsDisplay variant={variant} />
      ) : activeTab == 'requests' ? (
        <RequestDisplay variant={variant} />
      ) : (
        <></>
      )}
    </div>
  );
}
