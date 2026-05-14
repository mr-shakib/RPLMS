import api from "@/lib/axios";
import type { Venue, Submission, Review, ReviewerResponse } from "@/types";

export const venuesService = {
  list: (params?: Record<string, unknown>) =>
    api.get<Venue[]>("/submissions/venues/", { params }),

  get: (id: number) => api.get<Venue>(`/submissions/venues/${id}/`),

  create: (data: Partial<Venue>) => api.post<Venue>("/submissions/venues/", data),

  update: (id: number, data: Partial<Venue>) =>
    api.patch<Venue>(`/submissions/venues/${id}/`, data),

  delete: (id: number) => api.delete(`/submissions/venues/${id}/`),
};

export const submissionsService = {
  list: (params?: Record<string, unknown>) =>
    api.get<Submission[]>("/submissions/", { params }),

  get: (id: number) => api.get<Submission>(`/submissions/${id}/`),

  create: (data: Partial<Submission>) => api.post<Submission>("/submissions/", data),

  update: (id: number, data: Partial<Submission>) =>
    api.patch<Submission>(`/submissions/${id}/`, data),

  delete: (id: number) => api.delete(`/submissions/${id}/`),
};

export const reviewsService = {
  list: (params?: Record<string, unknown>) =>
    api.get<Review[]>("/reviews/", { params }),

  get: (id: number) => api.get<Review>(`/reviews/${id}/`),

  create: (data: Partial<Review>) => api.post<Review>("/reviews/", data),

  update: (id: number, data: Partial<Review>) =>
    api.patch<Review>(`/reviews/${id}/`, data),

  delete: (id: number) => api.delete(`/reviews/${id}/`),

  saveResponse: (reviewId: number, data: Partial<ReviewerResponse>) =>
    api.post<ReviewerResponse>(`/reviews/${reviewId}/response/`, data),
};
