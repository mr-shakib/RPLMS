import api from "@/lib/axios";
import type { Milestone } from "@/types/paper";

export const milestonesService = {
  list: (paperId: number | string) =>
    api.get<Milestone[]>(`/papers/${paperId}/milestones/`),

  create: (paperId: number | string, data: Partial<Milestone>) =>
    api.post<Milestone>(`/papers/${paperId}/milestones/`, data),

  update: (paperId: number | string, milestoneId: number, data: Partial<Milestone>) =>
    api.patch<Milestone>(`/papers/${paperId}/milestones/${milestoneId}/`, data),

  delete: (paperId: number | string, milestoneId: number) =>
    api.delete(`/papers/${paperId}/milestones/${milestoneId}/`),
};
