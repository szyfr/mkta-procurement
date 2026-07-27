import type {
  DashboardData,
  Notification,
  ReportData,
  ReportFilters,
  ReportSummary,
  RolePermission,
  SearchResult,
  SessionUser,
  UpdateAccountInput,
  User,
} from "@/types";

import { apiClient, type QueryParams } from "./client";

export const dashboardApi = {
  get: (signal?: AbortSignal) =>
    apiClient.get<DashboardData>("/dashboard", undefined, signal),
};

export const reportsApi = {
  list: (signal?: AbortSignal) =>
    apiClient.get<ReportSummary[]>("/reports", undefined, signal),

  get: (id: string, filters: ReportFilters = {}, signal?: AbortSignal) =>
    apiClient.get<ReportData>(`/reports/${id}`, filters as QueryParams, signal),
};

export const notificationsApi = {
  list: (signal?: AbortSignal) =>
    apiClient.get<Notification[]>("/notifications", undefined, signal),

  markRead: (id: string) =>
    apiClient.patch<Notification>(`/notifications/${id}/read`),

  markAllRead: () => apiClient.post<Notification[]>("/notifications/read-all"),
};

export const searchApi = {
  search: (query: string, signal?: AbortSignal) =>
    apiClient.get<SearchResult[]>("/search", { q: query }, signal),
};

export const settingsApi = {
  account: (signal?: AbortSignal) =>
    apiClient.get<SessionUser>("/settings/account", undefined, signal),

  updateAccount: (input: UpdateAccountInput) =>
    apiClient.patch<SessionUser>("/settings/account", input),

  users: (signal?: AbortSignal) =>
    apiClient.get<User[]>("/settings/users", undefined, signal),

  roles: (signal?: AbortSignal) =>
    apiClient.get<RolePermission[]>("/settings/roles", undefined, signal),
};

/** Master data for the pickers. Rarely changes, so hooks cache it hard. */
export const referenceApi = {
  departments: (signal?: AbortSignal) =>
    apiClient.get<string[]>("/departments", undefined, signal),

  vendors: (signal?: AbortSignal) =>
    apiClient.get<string[]>("/vendors", undefined, signal),

  paymentTerms: (signal?: AbortSignal) =>
    apiClient.get<string[]>("/payment-terms", undefined, signal),

  catalogItems: (signal?: AbortSignal) =>
    apiClient.get<{ name: string; unit: string; unitCost: number }[]>(
      "/catalog-items",
      undefined,
      signal,
    ),
};

export const sessionApi = {
  get: (signal?: AbortSignal) =>
    apiClient.get<SessionUser>("/session", undefined, signal),

  login: (email: string, password: string) =>
    apiClient.post<SessionUser>("/auth/login", { email, password }),

  logout: () => apiClient.post<{ ok: boolean }>("/auth/logout"),
};
