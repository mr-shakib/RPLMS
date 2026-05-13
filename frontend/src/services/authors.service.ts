import api from "@/lib/axios";
import type { PaperAuthor } from "@/types/paper";

export const authorsService = {
  list: (paperId: number | string) =>
    api.get<PaperAuthor[]>(`/papers/${paperId}/authors/`),

  create: (paperId: number | string, data: Partial<PaperAuthor>) =>
    api.post<PaperAuthor>(`/papers/${paperId}/authors/`, data),

  update: (paperId: number | string, authorId: number, data: Partial<PaperAuthor>) =>
    api.patch<PaperAuthor>(`/papers/${paperId}/authors/${authorId}/`, data),

  delete: (paperId: number | string, authorId: number) =>
    api.delete(`/papers/${paperId}/authors/${authorId}/`),
};
