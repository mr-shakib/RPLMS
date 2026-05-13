import { useMutation, useQueryClient } from "@tanstack/react-query";
import { milestonesService } from "@/services/milestones.service";
import type { Milestone } from "@/types/paper";

export function useCreateMilestone(paperId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Milestone>) =>
      milestonesService.create(paperId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["papers", String(paperId)] }),
  });
}

export function useUpdateMilestone(paperId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Milestone> }) =>
      milestonesService.update(paperId, id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["papers", String(paperId)] }),
  });
}

export function useDeleteMilestone(paperId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (milestoneId: number) => milestonesService.delete(paperId, milestoneId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["papers", String(paperId)] }),
  });
}
