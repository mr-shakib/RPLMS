import api from "@/lib/axios";
import type { LiteratureEntry, PaginatedResponse } from "@/types";

export const literatureService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<LiteratureEntry>>("/literature/", { params }),

  get: (id: number) => api.get<LiteratureEntry>(`/literature/${id}/`),

  create: (data: Partial<LiteratureEntry>) =>
    api.post<LiteratureEntry>("/literature/", data),

  update: (id: number, data: Partial<LiteratureEntry>) =>
    api.patch<LiteratureEntry>(`/literature/${id}/`, data),

  delete: (id: number) => api.delete(`/literature/${id}/`),
};
