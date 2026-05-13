"use client";

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePaper } from "@/hooks/usePapers";
import { Badge } from "./ui/badge";

const DOMAINS = [
  { value: "ml", label: "Machine Learning" },
  { value: "nlp", label: "NLP" },
  { value: "cv", label: "Computer Vision" },
  { value: "healthcare", label: "Healthcare AI" },
  { value: "security", label: "Cybersecurity" },
  { value: "other", label: "Other" },
];

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  short_title: z.string().optional(),
  domain: z.string().min(1, "Select a domain"),
  abstract: z.string().optional(),
  problem_statement: z.string().optional(),
  research_gap: z.string().optional(),
  objective: z.string().optional(),
  funding_source: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function CreatePaperDialog() {
  const [open, setOpen] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState("");
  const create = useCreatePaper();

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const addKeyword = () => {
    const kw = kwInput.trim();
    if (kw && !keywords.includes(kw)) {
      setKeywords((prev) => [...prev, kw]);
    }
    setKwInput("");
  };

  const onSubmit = (values: FormValues) => {
    create.mutate(
      { ...values, keywords },
      {
        onSuccess: () => {
          toast.success("Paper created successfully.");
          reset();
          setKeywords([]);
          setOpen(false);
        },
        onError: () => toast.error("Failed to create paper."),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-2" />}>
        <Plus className="h-4 w-4" />
        New Paper
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create new paper</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input placeholder="Full paper title" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Short title</Label>
              <Input placeholder="Abbreviated title" {...register("short_title")} />
            </div>
            <div className="space-y-1.5">
              <Label>Domain <span className="text-destructive">*</span></Label>
              <Select onValueChange={(v) => setValue("domain", v as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.domain && <p className="text-xs text-destructive">{errors.domain.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Abstract</Label>
            <Textarea rows={3} placeholder="Brief summary of the paper" {...register("abstract")} />
          </div>

          <div className="space-y-1.5">
            <Label>Problem Statement</Label>
            <Textarea rows={2} placeholder="What problem does this research address?" {...register("problem_statement")} />
          </div>

          <div className="space-y-1.5">
            <Label>Research Gap</Label>
            <Textarea rows={2} placeholder="What gap in existing literature does this fill?" {...register("research_gap")} />
          </div>

          <div className="space-y-1.5">
            <Label>Objective</Label>
            <Input placeholder="Primary research objective" {...register("objective")} />
          </div>

          <div className="space-y-1.5">
            <Label>Keywords</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a keyword and press Enter"
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addKeyword}>Add</Button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {keywords.map((kw) => (
                  <Badge key={kw} variant="secondary" className="gap-1 pr-1">
                    {kw}
                    <button
                      type="button"
                      onClick={() => setKeywords((prev) => prev.filter((k) => k !== kw))}
                      className="rounded-full hover:bg-zinc-200 p-0.5"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Funding source</Label>
            <Input placeholder="e.g. NSF Grant #12345" {...register("funding_source")} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create paper
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
