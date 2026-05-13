"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAddAuthor } from "@/hooks/useAuthors";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email").or(z.literal("")),
  affiliation: z.string().optional(),
  department: z.string().optional(),
  orcid: z.string().optional(),
  google_scholar_link: z.string().url("Enter a valid URL").or(z.literal("")).optional(),
  author_order: z.string().min(1),
  contribution_percentage: z.string(),
  is_corresponding: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

export function AddAuthorDialog({ paperId }: { paperId: number | string }) {
  const [open, setOpen] = useState(false);
  const add = useAddAuthor(paperId);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { author_order: "1", contribution_percentage: "0" },
    });

  const onSubmit = (values: FormValues) => {
    add.mutate(
      {
        name: values.name,
        email: values.email || "",
        affiliation: values.affiliation || "",
        department: values.department || "",
        orcid: values.orcid || "",
        google_scholar_link: values.google_scholar_link || "",
        author_order: Number(values.author_order),
        contribution_percentage: Number(values.contribution_percentage),
        is_corresponding: values.is_corresponding ?? false,
      },
      {
        onSuccess: () => {
          toast.success("Author added.");
          reset();
          setOpen(false);
        },
        onError: () => toast.error("Failed to add author."),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-2" />}>
        <UserPlus className="h-4 w-4" />
        Add author
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add author</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Full name <span className="text-destructive">*</span></Label>
            <Input placeholder="Dr. Jane Smith" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="author@uni.edu" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>ORCID</Label>
              <Input placeholder="0000-0000-0000-0000" {...register("orcid")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Affiliation</Label>
              <Input placeholder="MIT" {...register("affiliation")} />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Input placeholder="CSAIL" {...register("department")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Google Scholar URL</Label>
            <Input placeholder="https://scholar.google.com/…" {...register("google_scholar_link")} />
            {errors.google_scholar_link && (
              <p className="text-xs text-destructive">{errors.google_scholar_link.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Author order</Label>
              <Input type="number" min="1" {...register("author_order")} />
            </div>
            <div className="space-y-1.5">
              <Label>Contribution %</Label>
              <Input type="number" min="0" max="100" {...register("contribution_percentage")} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("is_corresponding")} className="rounded" />
            Corresponding author
          </label>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={add.isPending}>
              {add.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add author
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
