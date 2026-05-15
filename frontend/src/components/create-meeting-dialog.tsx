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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCreateMeeting } from "@/hooks/useMeetings";
import { usePapers } from "@/hooks/usePapers";
import { useUsers } from "@/hooks/useUsers";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  meeting_date: z.string().min(1, "Date is required"),
  location: z.string().optional(),
  agenda: z.string().optional(),
  notes: z.string().optional(),
  decisions: z.string().optional(),
  action_items: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  paperId?: number;
}

export function CreateMeetingDialog({ paperId }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<string>(paperId ? String(paperId) : "none");
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);

  const create = useCreateMeeting();
  const { data: papersData } = usePapers();
  const { data: users = [] } = useUsers();

  const papers = papersData?.results ?? [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const toggleParticipant = (userId: number) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const onSubmit = (values: FormValues) => {
    create.mutate(
      {
        title: values.title,
        meeting_date: values.meeting_date,
        location: values.location || "",
        agenda: values.agenda || "",
        notes: values.notes || "",
        decisions: values.decisions || "",
        action_items: values.action_items || "",
        paper: selectedPaper !== "none" ? Number(selectedPaper) : null,
        participant_ids: selectedParticipants,
      },
      {
        onSuccess: () => {
          toast.success("Meeting created.");
          reset();
          setSelectedParticipants([]);
          setSelectedPaper(paperId ? String(paperId) : "none");
          setOpen(false);
        },
        onError: () => toast.error("Failed to create meeting."),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-2" />}>
        <Plus className="h-4 w-4" />
        New meeting
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New meeting</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input placeholder="e.g. Weekly research sync" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date & Time <span className="text-destructive">*</span></Label>
              <Input type="datetime-local" {...register("meeting_date")} />
              {errors.meeting_date && <p className="text-xs text-destructive">{errors.meeting_date.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input placeholder="e.g. Room 204 / Zoom" {...register("location")} />
            </div>
          </div>

          {!paperId && (
            <div className="space-y-1.5">
              <Label>Related paper</Label>
              <Select value={selectedPaper} onValueChange={(v) => setSelectedPaper(v ?? "none")}>
                <SelectTrigger>
                  <SelectValue placeholder="None (general meeting)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (general meeting)</SelectItem>
                  {papers.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.short_title || p.title.slice(0, 50)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Participants</Label>
            <div className="rounded-md border p-2 max-h-36 overflow-y-auto space-y-1">
              {users.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1 py-1">No users available.</p>
              ) : (
                users.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-50 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5"
                      checked={selectedParticipants.includes(u.id)}
                      onChange={() => toggleParticipant(u.id)}
                    />
                    <span>{u.full_name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{u.role.replace("_", " ")}</span>
                  </label>
                ))
              )}
            </div>
            {selectedParticipants.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedParticipants.map((id) => {
                  const u = users.find((x) => x.id === id);
                  return u ? (
                    <span key={id} className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs">
                      {u.full_name}
                      <button type="button" onClick={() => toggleParticipant(id)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Agenda</Label>
            <Textarea rows={3} placeholder="What will be discussed…" {...register("agenda")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea rows={3} placeholder="Meeting notes…" {...register("notes")} />
            </div>
            <div className="space-y-1.5">
              <Label>Decisions</Label>
              <Textarea rows={3} placeholder="Key decisions made…" {...register("decisions")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Action items</Label>
            <Textarea rows={2} placeholder="Follow-up tasks assigned…" {...register("action_items")} />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create meeting
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
