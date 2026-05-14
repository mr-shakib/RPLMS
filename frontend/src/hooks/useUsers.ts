import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { User, PaginatedResponse } from "@/types";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () =>
      api.get<PaginatedResponse<User>>("/auth/users/").then((r) => r.data.results),
    staleTime: 5 * 60 * 1000,
  });
}
