import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => authService.me().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const { setTokens, setUser } = useAuthStore();
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: async ({ data }) => {
      setTokens(data.access, data.refresh);
      const { data: user } = await authService.me();
      setUser(user);
      qc.setQueryData(["me"], user);
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const { refreshToken, logout } = useAuthStore();
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(refreshToken ?? ""),
    onSettled: () => {
      logout();
      qc.clear();
      router.push("/login");
    },
  });
}
