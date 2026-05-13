import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksService } from "@/services/tasks.service";
import type { Task } from "@/types";

export function usePaperTasks(paperId: number | string) {
  return useQuery({
    queryKey: ["tasks", "paper", paperId],
    queryFn: () => tasksService.list({ paper: paperId }).then((r) => r.data),
    enabled: !!paperId,
  });
}

export function useAllTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksService.list().then((r) => r.data),
  });
}

export function useCreateTask(paperId?: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Task>) => tasksService.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      if (paperId) qc.invalidateQueries({ queryKey: ["tasks", "paper", paperId] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) =>
      tasksService.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
