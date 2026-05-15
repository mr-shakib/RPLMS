import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { literatureService } from "@/services/literature.service";
import type { LiteratureEntry } from "@/types";

export function useLiterature(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["literature", params],
    queryFn: () => literatureService.list(params).then((r) => r.data),
  });
}

export function usePaperLiterature(paperId: number) {
  return useQuery({
    queryKey: ["literature", "paper", paperId],
    queryFn: () =>
      literatureService.list({ paper: paperId }).then((r) => r.data.results),
    enabled: paperId > 0,
  });
}

export function useCreateLiteratureEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<LiteratureEntry>) =>
      literatureService.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["literature"] });
    },
  });
}

export function useUpdateLiteratureEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LiteratureEntry> }) =>
      literatureService.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["literature"] });
    },
  });
}

export function useDeleteLiteratureEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => literatureService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["literature"] });
    },
  });
}
