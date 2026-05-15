"use client";

import { useState } from "react";
import Link from "next/link";
import { useMeetings, useDeleteMeeting, useUpdateMeeting } from "@/hooks/useMeetings";
import { usePapers } from "@/hooks/usePapers";
import { CreateMeetingDialog } from "@/components/create-meeting-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays, MapPin, Users, ChevronDown, ChevronRight,
  Trash2, Pencil, Check, X, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useUsers } from "@/hooks/useUsers";
import type { Meeting } from "@/types";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function isUpcoming(iso: string) {
  return new Date(iso) >= new Date();
}

// ── Edit meeting inline form ──────────────────────────────────────────────────
interface EditFormProps {
  meeting: Meeting;
  users: { id: number; full_name: string; role: string }[];
  papers: { id: number; title: string; short_title: string }[];
  onSave: (data: Partial<Meeting>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function EditForm({ meeting, users, papers, onSave, onCancel, isSaving }: EditFormProps) {
  const [title, setTitle] = useState(meeting.title);
  const [meetingDate, setMeetingDate] = useState(
    meeting.meeting_date.slice(0, 16)
  );
  const [location, setLocation] = useState(meeting.location);
  const [agenda, setAgenda] = useState(meeting.agenda);
  const [notes, setNotes] = useState(meeting.notes);
  const [decisions, setDecisions] = useState(meeting.decisions);
  const [actionItems, setActionItems] = useState(meeting.action_items);
  const [selectedPaper, setSelectedPaper] = useState<string>(
    meeting.paper ? String(meeting.paper) : "none"
  );
  const [participants, setParticipants] = useState<number[]>(meeting.participant_ids);

  const toggleParticipant = (id: number) =>
    setParticipants((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSave = () => {
    if (!title.trim()) { toast.error("Title is required."); return; }
    onSave({
      title,
      meeting_date: meetingDate,
      location,
      agenda,
      notes,
      decisions,
      action_items: actionItems,
      paper: selectedPaper !== "none" ? Number(selectedPaper) : null,
      participant_ids: participants,
    });
  };

  return (
    <div className="px-5 pb-5 pt-2 space-y-4 border-t bg-zinc-50/50">
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Date & Time</Label>
          <Input type="datetime-local" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Related paper</Label>
        <Select value={selectedPaper} onValueChange={(v) => setSelectedPaper(v ?? "none")}>
          <SelectTrigger>
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {papers.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.short_title || p.title.slice(0, 50)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Participants</Label>
        <div className="rounded-md border p-2 max-h-32 overflow-y-auto space-y-1 bg-white">
          {users.map((u) => (
            <label key={u.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-50 cursor-pointer text-sm">
              <input
                type="checkbox"
                className="h-3.5 w-3.5"
                checked={participants.includes(u.id)}
                onChange={() => toggleParticipant(u.id)}
              />
              <span>{u.full_name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Agenda</Label>
        <Textarea rows={2} value={agenda} onChange={(e) => setAgenda(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Decisions</Label>
          <Textarea rows={3} value={decisions} onChange={(e) => setDecisions(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Action items</Label>
        <Textarea rows={2} value={actionItems} onChange={(e) => setActionItems(e.target.value)} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="h-3.5 w-3.5 mr-1" /> Cancel
        </Button>
        <Button type="button" size="sm" disabled={isSaving} onClick={handleSave}>
          <Check className="h-3.5 w-3.5 mr-1" /> Save
        </Button>
      </div>
    </div>
  );
}

// ── Meeting card ──────────────────────────────────────────────────────────────
interface MeetingCardProps {
  meeting: Meeting;
  paperTitle?: string;
  paperId?: number;
  users: { id: number; full_name: string; role: string }[];
  papers: { id: number; title: string; short_title: string }[];
  onDelete: (id: number) => void;
}

function MeetingCard({ meeting, paperTitle, paperId, users, papers, onDelete }: MeetingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const update = useUpdateMeeting();
  const upcoming = isUpcoming(meeting.meeting_date);

  const handleSave = (data: Partial<Meeting>) => {
    update.mutate(
      { id: meeting.id, data },
      {
        onSuccess: () => { toast.success("Meeting updated."); setEditing(false); },
        onError: () => toast.error("Failed to update meeting."),
      }
    );
  };

  return (
    <div className={`rounded-xl border bg-white overflow-hidden ${upcoming ? "border-l-4 border-l-blue-400" : ""}`}>
      {/* Header row */}
      <div className="flex items-start gap-3 px-5 py-4">
        <button
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-zinc-700"
          onClick={() => { setExpanded((v) => !v); setEditing(false); }}
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{meeting.title}</span>
            {upcoming ? (
              <Badge className="text-xs px-1.5 py-0 border-0 bg-blue-50 text-blue-700">Upcoming</Badge>
            ) : (
              <Badge variant="outline" className="text-xs px-1.5 py-0">Past</Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {formatDate(meeting.meeting_date)} · {formatTime(meeting.meeting_date)}
            </span>
            {meeting.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {meeting.location}
              </span>
            )}
            {meeting.participant_names.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {meeting.participant_names.slice(0, 2).join(", ")}
                {meeting.participant_names.length > 2 && ` +${meeting.participant_names.length - 2}`}
              </span>
            )}
            {paperId && paperTitle && (
              <Link href={`/papers/${paperId}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                <FileText className="h-3 w-3" />
                {paperTitle}
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            className="h-7 w-7 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
            onClick={() => { setEditing((v) => !v); setExpanded(true); }}
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            className="h-7 w-7 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(meeting.id)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && !editing && (
        <div className="border-t px-5 py-4 space-y-4 bg-zinc-50/40">
          {meeting.agenda && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Agenda</p>
              <p className="text-sm whitespace-pre-wrap">{meeting.agenda}</p>
            </div>
          )}
          {meeting.notes && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{meeting.notes}</p>
            </div>
          )}
          {meeting.decisions && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Decisions</p>
              <p className="text-sm whitespace-pre-wrap">{meeting.decisions}</p>
            </div>
          )}
          {meeting.action_items && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action items</p>
              <p className="text-sm whitespace-pre-wrap">{meeting.action_items}</p>
            </div>
          )}
          {!meeting.agenda && !meeting.notes && !meeting.decisions && !meeting.action_items && (
            <p className="text-sm text-muted-foreground italic">No details recorded yet.</p>
          )}
        </div>
      )}

      {expanded && editing && (
        <EditForm
          meeting={meeting}
          users={users}
          papers={papers}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
          isSaving={update.isPending}
        />
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MeetingsPage() {
  const [paperFilter, setPaperFilter] = useState<string>("all");
  const [showFilter, setShowFilter] = useState<"all" | "upcoming" | "past">("all");
  const [search, setSearch] = useState("");

  const { data: meetings = [], isLoading } = useMeetings(
    paperFilter !== "all" ? Number(paperFilter) : undefined
  );
  const { data: papersData } = usePapers();
  const { data: users = [] } = useUsers();
  const deleteMeeting = useDeleteMeeting();

  const papers = papersData?.results ?? [];

  const filtered = meetings.filter((m) => {
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (showFilter === "upcoming" && !isUpcoming(m.meeting_date)) return false;
    if (showFilter === "past" && isUpcoming(m.meeting_date)) return false;
    return true;
  });

  const upcoming = meetings.filter((m) => isUpcoming(m.meeting_date));
  const past = meetings.filter((m) => !isUpcoming(m.meeting_date));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule and record research meetings, decisions, and action items
          </p>
        </div>
        <CreateMeetingDialog />
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: meetings.length },
          { label: "Upcoming", value: upcoming.length },
          { label: "Past", value: past.length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-white px-5 py-4">
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-bold tabular-nums mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Search meetings…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />

        <Select value={paperFilter} onValueChange={(v) => setPaperFilter(v ?? "all")}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All papers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All papers</SelectItem>
            {papers.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.short_title || p.title.slice(0, 40)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex rounded-md border overflow-hidden text-sm">
          {(["all", "upcoming", "past"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setShowFilter(f)}
              className={`px-3 py-1.5 capitalize transition-colors ${
                showFilter === f
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-16 text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20">
          <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {meetings.length === 0 ? "No meetings yet — create your first one." : "No meetings match your filters."}
          </p>
          {meetings.length === 0 && <CreateMeetingDialog />}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((meeting) => {
            const paper = papers.find((p) => p.id === meeting.paper);
            return (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                paperTitle={paper ? (paper.short_title || paper.title.slice(0, 50)) : undefined}
                paperId={paper?.id}
                users={users}
                papers={papers}
                onDelete={(id) =>
                  deleteMeeting.mutate(id, {
                    onSuccess: () => toast.success("Meeting deleted."),
                    onError: () => toast.error("Failed to delete meeting."),
                  })
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
