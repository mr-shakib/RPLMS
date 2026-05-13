import api from "@/lib/axios";
import type { PaginatedResponse, Notification } from "@/types";

export const notificationsService = {
  list: () => api.get<PaginatedResponse<Notification>>("/notifications/"),
  markRead: (id: number) => api.post(`/notifications/${id}/mark_read/`),
  markAllRead: () => api.post("/notifications/mark_all_read/"),
};
