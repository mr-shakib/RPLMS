import api from "@/lib/axios";
import type { Meeting, PaginatedResponse } from "@/types";

export const meetingsService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Meeting>>("/meetings/", { params }),

  get: (id: number) => api.get<Meeting>(`/meetings/${id}/`),

  create: (data: Partial<Meeting>) => api.post<Meeting>("/meetings/", data),

  update: (id: number, data: Partial<Meeting>) =>
    api.patch<Meeting>(`/meetings/${id}/`, data),

  delete: (id: number) => api.delete(`/meetings/${id}/`),
};
