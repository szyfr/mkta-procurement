"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { logout } from "@/modules/auth/api/client";
import { LOGIN_PATH } from "@/modules/auth/constants";
import { authKeys, sessionQuery } from "@/modules/auth/queries/auth.queries";

/**
 * The signed-in user as the backend reports it, or `null`. Components that
 * need the user in the browser read it from here rather than from any stored
 * copy — there is no token to decode and no state to keep in sync.
 */
export function useSession() {
  return useQuery(sessionQuery());
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    // Runs whether or not the upstream call succeeded: the Route Handler
    // clears our cookies either way, so the client must not keep showing a
    // session it no longer has.
    onSettled: () => {
      // Everything cached was fetched as the signed-out user's predecessor.
      queryClient.clear();
      router.replace(LOGIN_PATH);
      router.refresh();
    },
  });
}

export { authKeys };
