import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { venuesService, submissionsService, reviewsService } from "@/services/submissions.service";
import type { Venue, Submission, Review } from "@/types";

// Venues
export function useVenues(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["venues", params],
    queryFn: () => venuesService.list(params).then((r) => r.data.results),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateVenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Venue>) => venuesService.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["venues"] }),
  });
}

export function useDeleteVenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => venuesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["venues"] }),
  });
}

// Submissions
export function useSubmissions(paperId?: number | string) {
  return useQuery({
    queryKey: ["submissions", paperId],
    queryFn: () =>
      submissionsService.list(paperId ? { paper: paperId } : undefined).then((r) => r.data.results),
  });
}

export function useCreateSubmission(paperId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Submission>) => submissionsService.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions", paperId] });
      qc.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

export function useUpdateSubmission(paperId?: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Submission> }) =>
      submissionsService.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions", paperId] });
      qc.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

export function useDeleteSubmission(paperId?: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => submissionsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions", paperId] });
      qc.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

// Reviews
export function useReviews(submissionId?: number) {
  return useQuery({
    queryKey: ["reviews", submissionId],
    queryFn: () =>
      reviewsService.list(submissionId ? { submission: submissionId } : undefined).then((r) => r.data.results),
    enabled: submissionId != null,
  });
}

export function useCreateReview(submissionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Review>) => reviewsService.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews", submissionId] }),
  });
}

export function useDeleteReview(submissionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews", submissionId] }),
  });
}
