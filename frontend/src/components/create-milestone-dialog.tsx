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
import { useCreateMilestone } from "@/hooks/useMilestones";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  deadline: z.string().min(1, "Deadline is required"),
  comments: z.string().optional(),
  status: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

export function CreateMilestoneDialog({ paperId }: { paperId: number | string }) {
  const [open, setOpen] = useState(false);
  const [statusVal, setStatusVal] = useState("pending");
  const create = useCreateMilestone(paperId);

  const { register, handleSubmit, setValue, reset, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { status: "pending" },
    });

  const onSubmit = (values: FormValues) => {
    create.mutate(
      {
        title: values.title,
        description: values.description || "",
        deadline: values.deadline,
        comments: values.comments || "",
        status: values.status as "pending" | "in_progress" | "completed" | "overdue",
      },
      {
        onSuccess: () => {
          toast.success("Milestone created.");
          reset();
          setStatusVal("pending");
          setOpen(false);
        },
        onError: () => toast.error("Failed to create milestone."),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-2" />}>
        <Plus className="h-4 w-4" />
        Add milestone
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add milestone</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input placeholder="e.g. Dataset collection complete" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={2} placeholder="What defines completion of this milestone?" {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Deadline <span className="text-destructive">*</span></Label>
              <Input type="date" {...register("deadline")} />
              {errors.deadline && <p className="text-xs text-destructive">{errors.deadline.message}</p>}
            </div>

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
          </div>

          <div className="space-y-1.5">
            <Label>Comments</Label>
            <Textarea rows={2} placeholder="Any notes or blockers…" {...register("comments")} />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add milestone
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
