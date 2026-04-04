import { authApi } from "@/lib/axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";

type NotificationType = {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  read: boolean;
  eventId: string | null;
  createdAt: string;
  postId: string | null;
  refundId: string | null;
  orderId: string | null;
  relatedUserId: string | null;
};

// Constants
const NOTIFICATION_API_CONFIG = {
  pageSize: 10,
  sortBy: "createdAt",
};

// Custom hook for infinite scroll
function useInfiniteScroll(
  callback: () => void,
  hasMore: boolean,
  isLoading: boolean
) {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          callback();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, callback]
  );

  return lastElementRef;
}

// Custom hook for notifications with infinite scroll
function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadNotifications = useCallback(
    async (page: number, reset: boolean = false) => {
      try {
        if (page === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }
        setError(null);

        const response = await authApi.get("/notification", {
          params: {
            ...NOTIFICATION_API_CONFIG,
            pageNumber: page,
          },
        });

        const notificationsData = response.data.data.data;

        if (!Array.isArray(notificationsData)) {
          throw new Error("Invalid response format");
        }

        if (reset || page === 1) {
          setNotifications(notificationsData);
        } else {
          setNotifications((prev) => [...prev, ...notificationsData]);
        }

        // Check if there are more pages
        setHasMore(
          notificationsData.length === NOTIFICATION_API_CONFIG.pageSize
        );
        setCurrentPage(page);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load notifications";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadNotifications(currentPage + 1);
    }
  }, [currentPage, hasMore, isLoadingMore, loadNotifications]);

  const refetch = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    loadNotifications(1, true);
  }, [loadNotifications]);

  useEffect(() => {
    loadNotifications(1);
  }, [loadNotifications]);

  return {
    notifications,
    isLoading,
    error,
    refetch,
    hasMore,
    loadMore,
    isLoadingMore,
  };
}

function NotificationsDisplay() {
  const {
    notifications,
    isLoading,
    error,
    refetch,
    hasMore,
    loadMore,
    isLoadingMore,
  } = useNotifications();

  const lastElementRef = useInfiniteScroll(loadMore, hasMore, isLoadingMore);

  if (isLoading && notifications.length === 0) {
    return (
      <div className="px-2 mt-2 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <NotificationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2 mt-2">
        <div className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-black text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="px-2 mt-2">
        <div className="p-6 text-center text-gray-500">
          <p>No notifications yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 mt-2 mb-20">
      {notifications.map((notification, index) => {
        const isLast = index === notifications.length - 1;
        return (
          <div key={notification.id} ref={isLast ? lastElementRef : null}>
            <NotificationComponent notification={notification} />
          </div>
        );
      })}
      {isLoadingMore && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        </div>
      )}
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="p-3 border-b border-b-neutral-400 flex gap-4 items-center">
      <div className="bg-muted p-2 rounded-2xl w-12 h-12 animate-pulse"></div>
      <div className="flex-1">
        <div className="h-5 bg-muted rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
      </div>
      <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
    </div>
  );
}

function NotificationComponent({
  notification,
}: {
  notification: NotificationType;
}) {
  const router = useRouter();

  function formatTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      // Format as time (e.g. 9:45 AM)
      let hours = date.getHours();
      let minutes = date.getMinutes();

      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;

      const formattedMinutes = minutes.toString().padStart(2, "0");
      return `${hours}:${formattedMinutes} ${ampm}`;
    }

    const yearDiff = now.getFullYear() - date.getFullYear();

    if (yearDiff === 0) {
      // Same year, not today → return e.g. "28 Jan"
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      });
    } else if (yearDiff === 1) {
      return "Last year";
    } else {
      return `${yearDiff} years ago`;
    }
  }

  const handleNotificationClick = () => {
    switch (notification.notificationType?.toUpperCase()) {
      case "CO_HOST_INVITATION":
      case "CO_HOST_ACCEPTANCE":
      case "CO_HOST_REMOVAL":
      case "CO_HOST_REJECTION":
        router.push(
          `/m/user/${notification.relatedUserId}?prev=/?screen=updates`
        );
        break;
      case "PAYMENT_PROCESSED_SUCCESSFULLY":
      case "EVENT_EARNINGS_PAID":
      case "WITHDRAWAL_SUCCESSFUL":
      case "WITHDRAWAL_FAILED":
      case "SUCCESSFUL_REFUND":
      case "FAILED_REFUND":
        router.push("/m/wallet?prev=/?screen=updates");
        break;
      case "NEW_EVENT_ORDER":
      case "NEW_SUBSCRIBER":
      case "NEW_POST_COMMENT":
      case "NEW_EVENT_COMMENT":
      case "NEW_EVENT_REACTION":
      case "NEW_POST_REACTION":
      case "NEW_CHAT_MESSAGE":
      default:
        return;
    }
  };

  return (
    <div
      className="p-3 border-b border-b-neutral-400 flex gap-4 items-center hover:bg-background transition-colors cursor-pointer"
      onClick={handleNotificationClick}
    >
      <div className="bg-black p-3 rounded-md w-12 flex-shrink-0">
        <Image src="/logo-white.svg" alt="" width={40} height={40} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-base mb-2 truncate">
          {notification.title}
        </h3>
        <p className="font-medium text-sm line-clamp-2">
          {notification.message}
        </p>
      </div>
      <div className="text-sm font-light whitespace-nowrap">
        {formatTime(notification.createdAt)}
      </div>
    </div>
  );
}

export default NotificationsDisplay;
