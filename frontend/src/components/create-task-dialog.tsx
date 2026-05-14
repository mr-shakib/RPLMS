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
import { useCreateTask } from "@/hooks/useTasks";
import { useUsers } from "@/hooks/useUsers";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  priority: z.string().min(1, "Select a priority"),
  deadline: z.string().optional(),
  estimated_hours: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  paperId: number | string;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "ghost";
  triggerSize?: "default" | "sm" | "icon";
}

export function CreateTaskDialog({
  paperId,
  triggerLabel = "New Task",
  triggerVariant = "outline",
  triggerSize = "sm",
}: Props) {
  const [open, setOpen] = useState(false);
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const create = useCreateTask(paperId);
  const { data: users } = useUsers();

  const { register, handleSubmit, setValue, reset, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    create.mutate(
      {
        title: values.title,
        description: values.description,
        priority: priority as "low" | "medium" | "high" | "urgent",
        deadline: values.deadline || undefined,
        estimated_hours: values.estimated_hours ? Number(values.estimated_hours) : undefined,
        assigned_to: assignedTo ? Number(assignedTo) : null,
        paper: Number(paperId),
        status: "todo",
      },
      {
        onSuccess: () => {
          toast.success("Task created.");
          reset();
          setPriority("");
          setAssignedTo("");
          setOpen(false);
        },
        onError: () => toast.error("Failed to create task."),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size={triggerSize} variant={triggerVariant} className="gap-2" />}>
        <Plus className="h-4 w-4" />
        {triggerLabel}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input placeholder="What needs to be done?" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={2} placeholder="Add more detail…" {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Priority <span className="text-destructive">*</span></Label>
              <Select onValueChange={(v) => { setPriority(v as string); setValue("priority", v as string); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick priority" />
                </SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high", "urgent"].map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-xs text-destructive">{errors.priority.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Assign to</Label>
              <Select value={assignedTo} onValueChange={(v) => setAssignedTo(v as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {(users ?? []).map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Deadline</Label>
              <Input type="datetime-local" {...register("deadline")} />
            </div>
            <div className="space-y-1.5">
              <Label>Estimated hours</Label>
              <Input type="number" min="0" step="0.5" placeholder="e.g. 4" {...register("estimated_hours")} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
