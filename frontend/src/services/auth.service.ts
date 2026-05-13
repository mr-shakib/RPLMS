import api from "@/lib/axios";
import type { User } from "@/types";

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload {
  email: string; full_name: string; password: string; password_confirm: string;
  institution?: string; department?: string; orcid?: string; role?: string;
}

export const authService = {
  login: (data: LoginPayload) =>
    api.post<{ access: string; refresh: string }>("/auth/login/", data),

  register: (data: RegisterPayload) =>
    api.post<User>("/auth/register/", data),

  logout: (refresh: string) =>
    api.post("/auth/logout/", { refresh }),

  me: () => api.get<User>("/auth/me/"),

  updateMe: (data: Partial<Pick<User, "full_name" | "institution" | "department" | "orcid">>) =>
    api.patch<User>("/auth/me/", data),

  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post("/auth/change-password/", data),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password/", { email }),

  resetPassword: (data: { token: string; new_password: string }) =>
    api.post("/auth/reset-password/", data),
};
