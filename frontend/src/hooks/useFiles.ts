import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { filesService } from "@/services/files.service";

export function useFiles(paperId: number | string) {
  return useQuery({
    queryKey: ["files", paperId],
    queryFn: () => filesService.list(paperId).then((r) => r.data.results),
    enabled: !!paperId,
  });
}

export function useUploadFile(paperId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, category }: { file: File; category: string }) =>
      filesService.upload(paperId, file, category).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files", paperId] }),
  });
}

export function useDeleteFile(paperId: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => filesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files", paperId] }),
  });
}
