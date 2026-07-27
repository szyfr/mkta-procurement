"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { notificationsApi } from "@/lib/api";
import type { Notification } from "@/types";

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: ({ signal }) => notificationsApi.list(signal),
  });
}

/**
 * Both mutations update the cache before the request resolves.
 *
 * The menu marks a notification read at the same moment it navigates away, so
 * waiting for the server would show the badge un-decremented on the way out.
 * `onMutate` cancels in-flight refetches first, otherwise a response that was
 * already in the air can land afterwards and undo the change.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications });
      const previous = queryClient.getQueryData<Notification[]>(
        queryKeys.notifications,
      );

      queryClient.setQueryData<Notification[]>(
        queryKeys.notifications,
        (current) =>
          current?.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification,
          ),
      );

      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notifications, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications });
      const previous = queryClient.getQueryData<Notification[]>(
        queryKeys.notifications,
      );

      queryClient.setQueryData<Notification[]>(
        queryKeys.notifications,
        (current) =>
          current?.map((notification) => ({ ...notification, read: true })),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notifications, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}
