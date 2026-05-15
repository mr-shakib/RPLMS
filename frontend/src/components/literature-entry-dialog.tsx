"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateLiteratureEntry, useUpdateLiteratureEntry } from "@/hooks/useLiterature";
import type { LiteratureEntry } from "@/types";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  authors: z.string().optional(),
  year: z.string().optional(),
  doi: z.string().optional(),
  journal: z.string().optional(),
  source_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  summary: z.string().optional(),
  method: z.string().optional(),
  dataset: z.string().optional(),
  limitations: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

// Add mode: no entry, shows a trigger button
interface AddProps {
  paperId?: number;
  entry?: undefined;
  open?: undefined;
  onOpenChange?: undefined;
}

// Edit mode: entry provided, controlled open state
interface EditProps {
  paperId?: number;
  entry: LiteratureEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Props = AddProps | EditProps;

export function LiteratureEntryDialog({ paperId, entry, open: controlledOpen, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(entry?.tags ?? []);

  const create = useCreateLiteratureEntry();
  const update = useUpdateLiteratureEntry();
  const isEditing = !!entry;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: entry
      ? {
          title: entry.title,
          authors: entry.authors,
          year: entry.year ? String(entry.year) : "",
          doi: entry.doi,
          journal: entry.journal,
          source_url: entry.source_url,
          summary: entry.summary,
          method: entry.method,
          dataset: entry.dataset,
          limitations: entry.limitations,
          notes: entry.notes,
        }
      : {},
  });

  useEffect(() => {
    if (open && entry) setTags(entry.tags ?? []);
  }, [open, entry]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  const onSubmit = (values: FormValues) => {
    const payload: Partial<LiteratureEntry> = {
      title: values.title,
      authors: values.authors ?? "",
      year: values.year ? Number(values.year) : null,
      doi: values.doi ?? "",
      journal: values.journal ?? "",
      source_url: values.source_url ?? "",
      summary: values.summary ?? "",
      method: values.method ?? "",
      dataset: values.dataset ?? "",
      limitations: values.limitations ?? "",
      notes: values.notes ?? "",
      tags,
      paper: paperId ?? entry?.paper ?? null,
    };

    if (isEditing && entry) {
      update.mutate(
        { id: entry.id, data: payload },
        {
          onSuccess: () => { toast.success("Entry updated."); setOpen(false); },
          onError: () => toast.error("Failed to update entry."),
        }
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast.success("Entry added.");
          reset();
          setTags([]);
          setOpen(false);
        },
        onError: () => toast.error("Failed to add entry."),
      });
    }
  };

  const isPending = create.isPending || update.isPending;

  const form = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
      <div className="space-y-1.5">
        <Label>Title <span className="text-destructive">*</span></Label>
        <Input placeholder="Paper or article title" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Authors</Label>
          <Input placeholder="e.g. Smith, J., Doe, A." {...register("authors")} />
        </div>
        <div className="space-y-1.5">
          <Label>Year</Label>
          <Input type="number" min="1900" max="2099" placeholder="2024" {...register("year")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Journal / Conference</Label>
          <Input placeholder="e.g. Nature, CVPR" {...register("journal")} />
        </div>
        <div className="space-y-1.5">
          <Label>DOI</Label>
          <Input placeholder="10.xxxx/xxxxx" {...register("doi")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Source URL</Label>
        <Input placeholder="https://…" {...register("source_url")} />
        {errors.source_url && <p className="text-xs text-destructive">{errors.source_url.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Tags / Keywords</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            placeholder="Type and press Enter…"
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs">
                {t}
                <button type="button" onClick={() => removeTag(t)}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Summary</Label>
        <Textarea rows={3} placeholder="Brief summary of the paper…" {...register("summary")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Method</Label>
          <Textarea rows={2} placeholder="Key methods used…" {...register("method")} />
        </div>
        <div className="space-y-1.5">
          <Label>Dataset</Label>
          <Textarea rows={2} placeholder="Datasets used…" {...register("dataset")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Limitations</Label>
          <Textarea rows={2} placeholder="Noted limitations…" {...register("limitations")} />
        </div>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea rows={2} placeholder="Personal notes or relevance…" {...register("notes")} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Save changes" : "Add entry"}
        </Button>
      </div>
    </form>
  );

  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit entry</DialogTitle>
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-2" />}>
        <Plus className="h-4 w-4" />
        Add paper
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add literature entry</DialogTitle>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
}
