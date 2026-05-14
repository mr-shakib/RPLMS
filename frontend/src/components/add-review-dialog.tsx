"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";
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
import { useCreateReview } from "@/hooks/useSubmissions";

const schema = z.object({
  reviewer_label: z.string().min(1, "Reviewer label is required"),
  comments: z.string().min(1, "Comments are required"),
  revision_type: z.string().optional(),
  received_at: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const REVISION_TYPES = [
  { value: "major", label: "Major Revision" },
  { value: "minor", label: "Minor Revision" },
  { value: "camera_ready", label: "Camera Ready" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

interface Props {
  submissionId: number;
  triggerLabel?: string;
}

export function AddReviewDialog({ submissionId, triggerLabel = "Add review" }: Props) {
  const [open, setOpen] = useState(false);
  const [revisionType, setRevisionType] = useState("");

  const create = useCreateReview(submissionId);

  const { register, handleSubmit, setValue, reset, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { reviewer_label: "Reviewer 1" },
    });

  const onSubmit = (values: FormValues) => {
    create.mutate(
      {
        submission: submissionId,
        reviewer_label: values.reviewer_label,
        comments: values.comments,
        revision_type: revisionType as "major" | "minor" | "camera_ready" | "accepted" | "rejected" | undefined,
        received_at: values.received_at || null,
      },
      {
        onSuccess: () => {
          toast.success("Review added.");
          reset({ reviewer_label: "Reviewer 1" });
          setRevisionType("");
          setOpen(false);
        },
        onError: () => toast.error("Failed to add review."),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-2" />}>
        <Plus className="h-4 w-4" />
        {triggerLabel}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add reviewer feedback</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Reviewer label <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g. Reviewer 1" {...register("reviewer_label")} />
              {errors.reviewer_label && (
                <p className="text-xs text-destructive">{errors.reviewer_label.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Received at</Label>
              <Input type="date" {...register("received_at")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Revision type</Label>
            <Select
              value={revisionType}
              onValueChange={(v) => { setRevisionType(v as string); setValue("revision_type", v as string); }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Not specified" />
              </SelectTrigger>
              <SelectContent>
                {REVISION_TYPES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Comments <span className="text-destructive">*</span></Label>
            <Textarea rows={4} placeholder="Reviewer comments and feedback…" {...register("comments")} />
            {errors.comments && (
              <p className="text-xs text-destructive">{errors.comments.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
