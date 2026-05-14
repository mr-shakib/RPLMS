import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { papersService } from "@/services/papers.service";
import type { Paper } from "@/types";

export function usePapers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["papers", params],
    queryFn: () => papersService.list(params).then((r) => r.data),
  });
}

export function usePaper(id: number | string) {
  return useQuery({
    queryKey: ["papers", id],
    queryFn: () => papersService.get(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreatePaper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Paper>) => papersService.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["papers"] }),
  });
}

export function useUpdatePaper(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Paper>) => papersService.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["papers"] });
      qc.invalidateQueries({ queryKey: ["papers", id] });
    },
  });
}

export function usePaperTransition(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (transition: string) => papersService.transition(id, transition).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["papers", id] }),
  });
}

export function useTransitionPaper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, transition }: { id: number; transition: string }) =>
      papersService.transition(id, transition).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["papers"] });
      qc.invalidateQueries({ queryKey: ["papers", String(id)] });
    },
  });
}

export function useDeletePaper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => papersService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["papers"] }),
  });
}

export function useInlineUpdatePaper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Paper> }) =>
      papersService.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["papers"] }),
  });
}
