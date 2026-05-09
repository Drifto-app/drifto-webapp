import type { ComponentType } from "react";
import { FaHotjar } from "react-icons/fa";
import { IoPizzaOutline } from "react-icons/io5";
import { TbTicketOff } from "react-icons/tb";

type StatusIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

export interface EventDisplayStatusMeta {
  label: string;
  description: string;
  Icon: StatusIcon;
  iconSize: number;
  iconClassName: string;
  badgeClassName: string;
}

const DEFAULT_STATUS: EventDisplayStatusMeta = {
  label: "event",
  description: "This event is now available",
  Icon: IoPizzaOutline,
  iconSize: 22,
  iconClassName: "text-foreground",
  badgeClassName:
    "border-border bg-muted text-foreground dark:bg-muted/80 dark:text-foreground",
};

export const getEventDisplayStatusMeta = (
  status?: string | null,
): EventDisplayStatusMeta => {
  switch (status) {
    case "ACTIVE":
      return {
        label: "active",
        description: "Tickets are now available",
        Icon: IoPizzaOutline,
        iconSize: 22,
        iconClassName: "text-emerald-600",
        badgeClassName:
          "border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300",
      };
    case "HOT":
      return {
        label: "hot",
        description: "Tickets are almost sold out",
        Icon: FaHotjar,
        iconSize: 16,
        iconClassName: "text-orange-600",
        badgeClassName:
          "border-orange-200 bg-orange-500/10 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/15 dark:text-orange-300",
      };
    case "SOLD_OUT":
      return {
        label: "sold out",
        description: "Tickets are sold out",
        Icon: TbTicketOff,
        iconSize: 18,
        iconClassName: "text-red-600",
        badgeClassName:
          "border-red-200 bg-red-500/10 text-red-700 dark:border-red-500/20 dark:bg-red-500/15 dark:text-red-300",
      };
    default:
      return DEFAULT_STATUS;
  }
};
