import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { meetingsService } from "@/services/meetings.service";
import type { Meeting } from "@/types";

export function useMeetings(paperId?: number) {
  const params = paperId != null ? { paper: paperId } : undefined;
  return useQuery({
    queryKey: ["meetings", paperId ?? "all"],
    queryFn: () => meetingsService.list(params).then((r) => r.data.results),
  });
}

export function useMeeting(id: number) {
  return useQuery({
    queryKey: ["meetings", id],
    queryFn: () => meetingsService.get(id).then((r) => r.data),
    enabled: id > 0,
  });
}

export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Meeting>) =>
      meetingsService.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}

export function useUpdateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Meeting> }) =>
      meetingsService.update(id, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["meetings"] });
      qc.invalidateQueries({ queryKey: ["meetings", id] });
    },
  });
}

export function useDeleteMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => meetingsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}
