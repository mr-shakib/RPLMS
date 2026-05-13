import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authorsService } from "@/services/authors.service";
import type { PaperAuthor } from "@/types/paper";

export function useAddAuthor(paperId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PaperAuthor>) =>
      authorsService.create(paperId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["papers", String(paperId)] }),
  });
}

export function useDeleteAuthor(paperId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (authorId: number) => authorsService.delete(paperId, authorId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["papers", String(paperId)] }),
  });
}
