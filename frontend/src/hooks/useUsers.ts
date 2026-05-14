import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { User } from "@/types";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.get<User[]>("/auth/users/").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}
