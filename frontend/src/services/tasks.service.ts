import api from "@/lib/axios";
import type { Task, PaginatedResponse } from "@/types";

export const tasksService = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Task>>("/tasks/", { params }),

  get: (id: number) => api.get<Task>(`/tasks/${id}/`),

  create: (data: Partial<Task>) => api.post<Task>("/tasks/", data),

  update: (id: number, data: Partial<Task>) =>
    api.patch<Task>(`/tasks/${id}/`, data),

  delete: (id: number) => api.delete(`/tasks/${id}/`),
};
