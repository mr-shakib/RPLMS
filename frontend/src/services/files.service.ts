import api from "@/lib/axios";

export interface ResearchFile {
  id: number;
  paper: number;
  uploaded_by: number;
  file_url: string;
  original_filename: string;
  file_type: string;
  category: string;
  version: number;
  size_bytes: number;
  is_locked: boolean;
  uploaded_at: string;
}

export const filesService = {
  list: (paperId: number | string) =>
    api.get<{ results: ResearchFile[] }>("/files/", { params: { paper: paperId } }),

  upload: (paperId: number | string, file: File, category: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("paper", String(paperId));
    form.append("category", category);
    return api.post<ResearchFile>("/files/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (id: number) => api.delete(`/files/${id}/`),
};
