import api from "@/lib/axios";
import type { Paper, PaginatedResponse } from "@/types";

export const papersService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Paper>>("/papers/", { params }),

  get: (id: number | string) =>
    api.get<Paper>(`/papers/${id}/`),

  create: (data: Partial<Paper>) =>
    api.post<Paper>("/papers/", data),

  update: (id: number | string, data: Partial<Paper>) =>
    api.patch<Paper>(`/papers/${id}/`, data),

  delete: (id: number | string) =>
    api.delete(`/papers/${id}/`),

  transition: (id: number | string, transition: string) =>
    api.post<{ status: string }>(`/papers/${id}/transition/`, { transition }),
};
