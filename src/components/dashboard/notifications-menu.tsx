"use client";

import { BellIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { notifications as initialNotifications } from "@/data/notifications";
import type { NotificationGroup } from "@/lib/types";
import { cn } from "@/lib/utils";

const groupLabels: Record<NotificationGroup, string> = {
  today: "Today",
  earlier: "Earlier",
};

/**
 * Notification bell with unread count. Opening an item marks it read, matching
 * the wireframe note that clicking navigates to the record and clears the dot.
 */
export function NotificationsMenu() {
  const [notifications, setNotifications] =
    React.useState(initialNotifications);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const groups = (["today", "earlier"] as const)
    .map((group) => ({
      group,
      items: notifications.filter(
        (notification) => notification.group === group,
      ),
    }))
    .filter((entry) => entry.items.length > 0);

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
  }

  function markAsRead(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
          />
        }
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {unreadCount}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-2.5">
          <PopoverTitle className="text-xs font-medium">
            Notifications
          </PopoverTitle>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
        </div>
        <Separator />

        {groups.map((entry, index) => (
          <div key={entry.group}>
            {index > 0 ? <Separator /> : null}
            <p className="px-3 py-1.5 text-[11px] text-muted-foreground">
              {groupLabels[entry.group]}
            </p>
            <ul>
              {entry.items.map((notification) => (
                <li key={notification.id}>
                  <Link
                    href={notification.href}
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      "flex gap-3 border-l-2 px-4 py-2.5 hover:bg-accent hover:text-accent-foreground",
                      notification.read
                        ? "border-l-transparent"
                        : "border-l-status-info bg-status-info-subtle",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        notification.read
                          ? "border border-border"
                          : "bg-status-info",
                      )}
                    />
                    <span className="flex flex-col gap-0.5">
                      <span
                        className={cn(
                          "text-xs",
                          notification.read
                            ? "text-muted-foreground"
                            : "font-medium text-foreground",
                        )}
                      >
                        {notification.message}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {notification.timestamp}
                      </span>
                    </span>
                    {notification.read ? null : (
                      <span className="sr-only">Unread</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <Separator />
        <Link
          href="/dashboard"
          className="block px-4 py-2.5 text-center text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          View all notifications
        </Link>
      </PopoverContent>
    </Popover>
  );
}
