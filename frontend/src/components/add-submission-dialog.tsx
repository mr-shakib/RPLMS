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
import { useCreateSubmission } from "@/hooks/useSubmissions";
import { useVenues } from "@/hooks/useSubmissions";

const schema = z.object({
  venue: z.string().min(1, "Select a venue"),
  status: z.string().min(1),
  submitted_at: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "revision_required", label: "Revision Required" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "published", label: "Published" },
];

interface Props {
  paperId: number | string;
}

export function AddSubmissionDialog({ paperId }: Props) {
  const [open, setOpen] = useState(false);
  const [venueVal, setVenueVal] = useState("");
  const [statusVal, setStatusVal] = useState("draft");

  const create = useCreateSubmission(paperId);
  const { data: venues } = useVenues();

  const { register, handleSubmit, setValue, reset, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { status: "draft" },
    });

  const onSubmit = (values: FormValues) => {
    create.mutate(
      {
        paper: Number(paperId),
        venue: Number(values.venue),
        status: values.status as "draft" | "submitted" | "under_review" | "revision_required" | "accepted" | "rejected" | "withdrawn" | "published",
        submitted_at: values.submitted_at || null,
        notes: values.notes || "",
      },
      {
        onSuccess: () => {
          toast.success("Submission added.");
          reset();
          setVenueVal("");
          setStatusVal("draft");
          setOpen(false);
        },
        onError: () => toast.error("Failed to add submission."),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-2" />}>
        <Plus className="h-4 w-4" />
        Add submission
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add submission</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Venue <span className="text-destructive">*</span></Label>
            <Select
              value={venueVal}
              onValueChange={(v) => { setVenueVal(v as string); setValue("venue", v as string); }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select venue…" />
              </SelectTrigger>
              <SelectContent>
                {(venues ?? []).map((v) => (
                  <SelectItem key={v.id} value={String(v.id)}>
                    {v.name}
                    {v.quartile && v.quartile !== "unranked" ? ` (${v.quartile})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.venue && <p className="text-xs text-destructive">{errors.venue.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={statusVal}
                onValueChange={(v) => { setStatusVal(v as string); setValue("status", v as string); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Submitted at</Label>
              <Input type="date" {...register("submitted_at")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={2} placeholder="Any notes about this submission…" {...register("notes")} />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add submission
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
