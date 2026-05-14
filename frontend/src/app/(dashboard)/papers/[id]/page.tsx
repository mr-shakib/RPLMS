"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, User, ExternalLink, CalendarDays,
  CheckCircle2, Circle, Clock, AlertCircle, Trash2, Edit2, Check, X, Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { usePaper, usePaperTransition, useUpdatePaper } from "@/hooks/usePapers";
import { usePaperTasks } from "@/hooks/useTasks";
import { useDeleteAuthor } from "@/hooks/useAuthors";
import { useDeleteMilestone } from "@/hooks/useMilestones";
import { useSubmissions, useDeleteSubmission, useReviews, useDeleteReview } from "@/hooks/useSubmissions";
import { useUsers } from "@/hooks/useUsers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ProgressBar } from "@/components/progress-bar";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { AddAuthorDialog } from "@/components/add-author-dialog";
import { FileUploadZone } from "@/components/file-upload-zone";
import { CreateMilestoneDialog } from "@/components/create-milestone-dialog";
import { PaperLifecycle } from "@/components/paper-lifecycle";
import { AddSubmissionDialog } from "@/components/add-submission-dialog";
import { AddReviewDialog } from "@/components/add-review-dialog";
import {
  PAPER_STATUS_LABEL,
  STATUS_TRANSITIONS,
  STATUS_PHASE_COLOR,
} from "@/types/paper";
import type { PaperDetail, Milestone } from "@/types/paper";
import type { Task, Submission } from "@/types";

const DOMAIN_OPTIONS = [
  { value: "ml", label: "Machine Learning" },
  { value: "nlp", label: "NLP" },
  { value: "cv", label: "Computer Vision" },
  { value: "healthcare", label: "Healthcare AI" },
  { value: "security", label: "Cybersecurity" },
  { value: "other", label: "Other" },
];
const DOMAIN_LABEL: Record<string, string> = Object.fromEntries(
  DOMAIN_OPTIONS.map(({ value, label }) => [value, label])
);

type InfoDraft = {
  title: string;
  short_title: string;
  domain: string;
  abstract: string;
  problem_statement: string;
  research_gap: string;
  objective: string;
  methodology: string;
  expected_contribution: string;
  keywords: string[];
  tags: string[];
  funding_source: string;
  ethics_approval_number: string;
  supervisor: number | null;
};

const MILESTONE_ICON = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
  overdue: AlertCircle,
};

const MILESTONE_COLOR = {
  pending: "text-zinc-400",
  in_progress: "text-blue-500",
  completed: "text-green-500",
  overdue: "text-red-500",
};

const TASK_STATUS_COLOR: Record<string, string> = {
  todo: "bg-zinc-100 text-zinc-700",
  in_progress: "bg-blue-50 text-blue-700",
  waiting_review: "bg-yellow-50 text-yellow-700",
  completed: "bg-green-50 text-green-700",
  blocked: "bg-red-50 text-red-700",
};

const PRIORITY_DOT: Record<string, string> = {
  low: "bg-zinc-400",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-600",
};

const SUBMISSION_STATUS_COLOR: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700",
  submitted: "bg-blue-50 text-blue-700",
  under_review: "bg-yellow-50 text-yellow-700",
  revision_required: "bg-orange-50 text-orange-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  withdrawn: "bg-zinc-100 text-zinc-500",
  published: "bg-purple-50 text-purple-700",
};

const REVISION_TYPE_LABEL: Record<string, string> = {
  major: "Major",
  minor: "Minor",
  camera_ready: "Camera Ready",
  accepted: "Accept",
  rejected: "Reject",
};

function SubmissionCard({ sub, paperId }: { sub: Submission; paperId: string }) {
  const { data: reviews = [] } = useReviews(sub.id);
  const deleteReview = useDeleteReview(sub.id);
  const deleteSub = useDeleteSubmission(paperId);

  return (
    <div className="rounded-xl border bg-white divide-y">
      <div className="flex items-start gap-4 px-5 py-4">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{sub.venue_detail?.name ?? `Venue #${sub.venue}`}</span>
            {sub.venue_detail?.quartile && sub.venue_detail.quartile !== "unranked" && (
              <Badge variant="outline" className="text-xs">{sub.venue_detail.quartile}</Badge>
            )}
            <Badge className={`text-xs px-2 py-0.5 border-0 capitalize ${SUBMISSION_STATUS_COLOR[sub.status] ?? ""}`}>
              {sub.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Attempt #{sub.attempt_number}</span>
            {sub.submitted_at && <span>Submitted {new Date(sub.submitted_at).toLocaleDateString()}</span>}
            {sub.notes && <span className="truncate max-w-xs">{sub.notes}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AddReviewDialog submissionId={sub.id} />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => deleteSub.mutate(sub.id, {
              onSuccess: () => toast.success("Submission removed."),
              onError: () => toast.error("Failed to remove submission."),
            })}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="divide-y bg-zinc-50/50">
          {reviews.map((rev) => (
            <div key={rev.id} className="flex gap-4 px-6 py-3.5">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">{rev.reviewer_label}</span>
                  {rev.revision_type && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {REVISION_TYPE_LABEL[rev.revision_type] ?? rev.revision_type}
                    </Badge>
                  )}
                  {rev.received_at && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(rev.received_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rev.comments}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => deleteReview.mutate(rev.id, {
                  onSuccess: () => toast.success("Review removed."),
                  onError: () => toast.error("Failed to remove review."),
                })}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const PROGRESS_FIELDS = [
  { key: "literature_review_progress" as const, label: "Literature Review", color: "bg-blue-500" },
  { key: "dataset_progress" as const, label: "Dataset", color: "bg-yellow-500" },
  { key: "experiment_progress" as const, label: "Experiments", color: "bg-orange-500" },
  { key: "writing_progress" as const, label: "Writing", color: "bg-purple-500" },
  { key: "revision_progress" as const, label: "Revision", color: "bg-green-500" },
];

export default function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressDraft, setProgressDraft] = useState<Record<string, number>>({});
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoDraft, setInfoDraft] = useState<InfoDraft | null>(null);
  const [kwInput, setKwInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const { data: paper, isLoading, error } = usePaper(id);
  const transition = usePaperTransition(id);
  const updatePaper = useUpdatePaper(id);
  const { data: tasksData } = usePaperTasks(id);
  const deleteAuthor = useDeleteAuthor(id);
  const deleteMilestone = useDeleteMilestone(id);
  const { data: submissions = [] } = useSubmissions(id);
  const { data: users } = useUsers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="flex flex-col items-center gap-3 py-24">
        <p className="text-sm text-muted-foreground">Paper not found.</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  const p = paper as PaperDetail;
  const tasks: Task[] = tasksData?.results ?? [];
  const availableTransitions = STATUS_TRANSITIONS[p.status] ?? [];
  const statusColor = STATUS_PHASE_COLOR[p.status] ?? "bg-zinc-100 text-zinc-700";

  const handleTransition = (t: string, label: string) => {
    transition.mutate(t, {
      onSuccess: () => toast.success(`Status updated: ${label}`),
      onError: () => toast.error("Transition not allowed from current status."),
    });
  };

  const startEditProgress = () => {
    setProgressDraft({
      literature_review_progress: p.literature_review_progress,
      dataset_progress: p.dataset_progress,
      experiment_progress: p.experiment_progress,
      writing_progress: p.writing_progress,
      revision_progress: p.revision_progress,
    });
    setEditingProgress(true);
  };

  const saveProgress = () => {
    updatePaper.mutate(progressDraft, {
      onSuccess: () => { toast.success("Progress updated."); setEditingProgress(false); },
      onError: () => toast.error("Failed to update progress."),
    });
  };

  const startEditInfo = () => {
    setInfoDraft({
      title: p.title,
      short_title: p.short_title ?? "",
      domain: p.domain,
      abstract: p.abstract ?? "",
      problem_statement: p.problem_statement ?? "",
      research_gap: p.research_gap ?? "",
      objective: p.objective ?? "",
      methodology: p.methodology ?? "",
      expected_contribution: p.expected_contribution ?? "",
      keywords: [...(p.keywords ?? [])],
      tags: [...(p.tags ?? [])],
      funding_source: p.funding_source ?? "",
      ethics_approval_number: p.ethics_approval_number ?? "",
      supervisor: p.supervisor?.id ?? null,
    });
    setEditingInfo(true);
  };

  const cancelEditInfo = () => { setEditingInfo(false); setInfoDraft(null); setKwInput(""); setTagInput(""); };

  const saveInfo = () => {
    if (!infoDraft) return;
    updatePaper.mutate(infoDraft as Parameters<typeof updatePaper.mutate>[0], {
      onSuccess: () => { toast.success("Paper info updated."); cancelEditInfo(); },
      onError: () => toast.error("Failed to save changes."),
    });
  };

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 -ml-2 text-muted-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Papers
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">{p.paper_id}</span>
              <Badge className={`text-xs px-2 py-0.5 border-0 ${statusColor}`}>
                {PAPER_STATUS_LABEL[p.status]}
              </Badge>
              <Badge variant="outline" className="text-xs">{p.domain}</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight leading-tight">{p.title}</h1>
            {p.supervisor && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Supervisor: {p.supervisor.full_name}
              </p>
            )}
          </div>

          {availableTransitions.length > 0 && (
            <div className="flex gap-2 shrink-0 flex-wrap">
              {availableTransitions.map(({ label, transition: t, variant = "default" }) => (
                <Button
                  key={t}
                  size="sm"
                  variant={variant}
                  disabled={transition.isPending}
                  onClick={() => handleTransition(t, label)}
                >
                  {label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Progress overview */}
      <Card className="shadow-none border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Overall Progress — {p.overall_progress}%
            </CardTitle>
            {!editingProgress ? (
              <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={startEditProgress}>
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs text-muted-foreground"
                  onClick={() => setEditingProgress(false)}
                  disabled={updatePaper.isPending}
                >
                  <X className="h-3 w-3" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  onClick={saveProgress}
                  disabled={updatePaper.isPending}
                >
                  <Check className="h-3 w-3" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PROGRESS_FIELDS.map(({ key, label, color }) =>
            editingProgress ? (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-medium tabular-nums">{progressDraft[key] ?? 0}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={progressDraft[key] ?? 0}
                  onChange={(e) => setProgressDraft((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                  className="w-full accent-zinc-800 cursor-pointer"
                />
              </div>
            ) : (
              <ProgressBar key={key} label={label} value={p[key]} color={color} />
            )
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-0">
          {["overview", "lifecycle", "authors", "tasks", "submissions", "files", "milestones", "metadata"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent capitalize pb-2 px-4"
            >
              {tab}
              {tab === "tasks" && tasks.length > 0 && (
                <span className="ml-1.5 rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs tabular-nums">
                  {tasks.length}
                </span>
              )}
              {tab === "submissions" && submissions.length > 0 && (
                <span className="ml-1.5 rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs tabular-nums">
                  {submissions.length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Lifecycle */}
        <TabsContent value="lifecycle" className="mt-6">
          <PaperLifecycle currentStatus={p.status} />
        </TabsContent>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6">
          {editingInfo && infoDraft ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Edit paper info</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={cancelEditInfo} disabled={updatePaper.isPending}>
                    <X className="h-3 w-3" /> Cancel
                  </Button>
                  <Button size="sm" className="h-7 gap-1.5 text-xs" onClick={saveInfo} disabled={updatePaper.isPending}>
                    {updatePaper.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    Save
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Title</Label>
                  <Input value={infoDraft.title} onChange={(e) => setInfoDraft((d) => d && ({ ...d, title: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Short title</Label>
                  <Input placeholder="Abbreviated title" value={infoDraft.short_title} onChange={(e) => setInfoDraft((d) => d && ({ ...d, short_title: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Domain</Label>
                  <Select value={infoDraft.domain} onValueChange={(v) => setInfoDraft((d) => d && ({ ...d, domain: v as string }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DOMAIN_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Supervisor</Label>
                  <Select
                    value={infoDraft.supervisor ? String(infoDraft.supervisor) : ""}
                    onValueChange={(v) => setInfoDraft((d) => d && ({ ...d, supervisor: v ? Number(v) : null }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {(users ?? []).map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Abstract</Label>
                <Textarea rows={4} placeholder="Brief summary of the research…" value={infoDraft.abstract} onChange={(e) => setInfoDraft((d) => d && ({ ...d, abstract: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>Problem Statement</Label>
                <Textarea rows={3} placeholder="What problem does this research address?" value={infoDraft.problem_statement} onChange={(e) => setInfoDraft((d) => d && ({ ...d, problem_statement: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>Research Gap</Label>
                <Textarea rows={3} placeholder="What gap in existing literature does this fill?" value={infoDraft.research_gap} onChange={(e) => setInfoDraft((d) => d && ({ ...d, research_gap: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>Objective</Label>
                <Textarea rows={2} placeholder="Primary research objective" value={infoDraft.objective} onChange={(e) => setInfoDraft((d) => d && ({ ...d, objective: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>Methodology</Label>
                <Textarea rows={3} placeholder="Research methodology and approach" value={infoDraft.methodology} onChange={(e) => setInfoDraft((d) => d && ({ ...d, methodology: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>Expected Contribution</Label>
                <Textarea rows={2} placeholder="What will this research contribute?" value={infoDraft.expected_contribution} onChange={(e) => setInfoDraft((d) => d && ({ ...d, expected_contribution: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a keyword and press Enter"
                    value={kwInput}
                    onChange={(e) => setKwInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const kw = kwInput.trim();
                        if (kw && !infoDraft.keywords.includes(kw)) setInfoDraft((d) => d && ({ ...d, keywords: [...d.keywords, kw] }));
                        setKwInput("");
                      }
                    }}
                  />
                </div>
                {infoDraft.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {infoDraft.keywords.map((kw) => (
                      <Badge key={kw} variant="secondary" className="gap-1 pr-1 text-xs">
                        {kw}
                        <button type="button" onClick={() => setInfoDraft((d) => d && ({ ...d, keywords: d.keywords.filter((k) => k !== kw) }))} className="rounded-full hover:bg-zinc-200 p-0.5">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const tag = tagInput.trim();
                        if (tag && !infoDraft.tags.includes(tag)) setInfoDraft((d) => d && ({ ...d, tags: [...d.tags, tag] }));
                        setTagInput("");
                      }
                    }}
                  />
                </div>
                {infoDraft.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {infoDraft.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="gap-1 pr-1 text-xs">
                        {tag}
                        <button type="button" onClick={() => setInfoDraft((d) => d && ({ ...d, tags: d.tags.filter((t) => t !== tag) }))} className="rounded-full hover:bg-zinc-100 p-0.5">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Funding source</Label>
                  <Input placeholder="e.g. NSF Grant #12345" value={infoDraft.funding_source} onChange={(e) => setInfoDraft((d) => d && ({ ...d, funding_source: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Ethics approval #</Label>
                  <Input placeholder="e.g. IRB-2024-001" value={infoDraft.ethics_approval_number} onChange={(e) => setInfoDraft((d) => d && ({ ...d, ethics_approval_number: e.target.value }))} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={cancelEditInfo} disabled={updatePaper.isPending}>Cancel</Button>
                <Button size="sm" onClick={saveInfo} disabled={updatePaper.isPending}>
                  {updatePaper.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Save changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" className="gap-2" onClick={startEditInfo}>
                  <Edit2 className="h-3.5 w-3.5" /> Edit info
                </Button>
              </div>

              {/* Core metadata strip */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border bg-white px-5 py-4 sm:grid-cols-3 lg:grid-cols-4">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Domain</p>
                  <p className="text-sm font-medium">{DOMAIN_LABEL[p.domain] ?? p.domain}</p>
                </div>
                {p.supervisor && (
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Supervisor</p>
                    <p className="text-sm font-medium">{p.supervisor.full_name}</p>
                  </div>
                )}
                {p.short_title && (
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Short title</p>
                    <p className="text-sm font-medium">{p.short_title}</p>
                  </div>
                )}
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Created</p>
                  <p className="text-sm font-medium">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Research fields */}
              {[
                { label: "Abstract", value: p.abstract },
                { label: "Problem Statement", value: p.problem_statement },
                { label: "Research Gap", value: p.research_gap },
                { label: "Objective", value: p.objective },
                { label: "Methodology", value: p.methodology },
                { label: "Expected Contribution", value: p.expected_contribution },
              ].map(({ label, value }) =>
                value ? (
                  <div key={label} className="space-y-1.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
                  </div>
                ) : null
              )}

              {p.keywords?.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Keywords</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {p.keywords.map((kw) => <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>)}
                  </div>
                </div>
              )}

              {p.tags?.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((tag) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                  </div>
                </div>
              )}

              {(p.funding_source || p.ethics_approval_number) && (
                <div className="grid grid-cols-2 gap-4">
                  {p.funding_source && (
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Funding</p>
                      <p className="text-sm">{p.funding_source}</p>
                    </div>
                  )}
                  {p.ethics_approval_number && (
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Ethics #</p>
                      <p className="text-sm">{p.ethics_approval_number}</p>
                    </div>
                  )}
                </div>
              )}

              {!p.abstract && !p.problem_statement && !p.research_gap && !p.objective && (
                <div className="rounded-xl border border-dashed py-12 text-center">
                  <p className="text-sm text-muted-foreground">No research details added yet.</p>
                  <Button variant="ghost" size="sm" className="mt-2 gap-2" onClick={startEditInfo}>
                    <Edit2 className="h-3.5 w-3.5" /> Fill in paper details
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Authors */}
        <TabsContent value="authors" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <AddAuthorDialog paperId={id} />
          </div>

          {p.authors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No authors added yet.</p>
          ) : (
            <div className="divide-y rounded-xl border bg-white">
              {p.authors.map((author) => (
                <div key={author.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-semibold">
                    {author.author_order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{author.name}</p>
                      {author.is_corresponding && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0">Corresponding</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {author.affiliation}{author.department ? ` · ${author.department}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right space-y-0.5">
                      <p className="text-xs text-muted-foreground">{author.contribution_percentage}%</p>
                      {author.orcid && (
                        <p className="text-xs font-mono text-muted-foreground">{author.orcid}</p>
                      )}
                      {author.google_scholar_link && (
                        <a
                          href={author.google_scholar_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          Scholar <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() =>
                        deleteAuthor.mutate(author.id, {
                          onSuccess: () => toast.success("Author removed."),
                          onError: () => toast.error("Failed to remove author."),
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tasks */}
        <TabsContent value="tasks" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <CreateTaskDialog paperId={id} />
          </div>

          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No tasks yet.</p>
          ) : (
            <div className="divide-y rounded-xl border bg-white">
              {tasks.map((task: Task) => (
                <div key={task.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{task.title}</p>
                    {task.deadline && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Due {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 capitalize ${TASK_STATUS_COLOR[task.status]}`}
                  >
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Submissions */}
        <TabsContent value="submissions" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <AddSubmissionDialog paperId={id} />
          </div>
          {submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No submissions yet.</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub: Submission) => (
                <SubmissionCard key={sub.id} sub={sub} paperId={id} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Files */}
        <TabsContent value="files" className="mt-6">
          <FileUploadZone paperId={id} />
        </TabsContent>

        {/* Milestones */}
        <TabsContent value="milestones" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <CreateMilestoneDialog paperId={id} />
          </div>

          {p.milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No milestones yet.</p>
          ) : (
            <div className="space-y-3">
              {p.milestones.map((m: Milestone) => {
                const Icon = MILESTONE_ICON[m.status];
                return (
                  <div key={m.id} className="flex gap-4 rounded-xl border bg-white px-5 py-4">
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${MILESTONE_COLOR[m.status]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{m.title}</p>
                      {m.description && <p className="text-sm text-muted-foreground mt-0.5">{m.description}</p>}
                      {m.comments && <p className="text-xs text-muted-foreground mt-1 italic">{m.comments}</p>}
                    </div>
                    <div className="flex items-start gap-3 shrink-0">
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(m.deadline).toLocaleDateString()}
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${
                            m.status === "completed" ? "text-green-700 border-green-200" :
                            m.status === "overdue" ? "text-red-700 border-red-200" :
                            m.status === "in_progress" ? "text-blue-700 border-blue-200" : ""
                          }`}
                        >
                          {m.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                        disabled={deleteMilestone.isPending}
                        onClick={() =>
                          deleteMilestone.mutate(m.id, {
                            onSuccess: () => toast.success("Milestone deleted."),
                            onError: () => toast.error("Failed to delete milestone."),
                          })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Metadata */}
        <TabsContent value="metadata" className="mt-6">
          {!p.metadata ? (
            <p className="text-sm text-muted-foreground text-center py-10">No publication metadata yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 rounded-xl border bg-white px-6 py-5 lg:grid-cols-3">
              {[
                { label: "DOI", value: p.metadata.doi },
                { label: "ISSN", value: p.metadata.issn },
                { label: "Publisher", value: p.metadata.publisher },
                { label: "Journal Quartile", value: p.metadata.journal_quartile },
                { label: "Impact Factor", value: p.metadata.impact_factor?.toString() },
                { label: "Acceptance Rate", value: p.metadata.acceptance_rate ? `${p.metadata.acceptance_rate}%` : undefined },
                { label: "APC Fee", value: p.metadata.apc_fee ? `$${p.metadata.apc_fee}` : undefined },
                { label: "Conference", value: p.metadata.conference_name },
                { label: "Submission Deadline", value: p.metadata.submission_deadline ? new Date(p.metadata.submission_deadline).toLocaleDateString() : undefined },
              ].map(({ label, value }) =>
                value ? (
                  <div key={label} className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-medium">{value}</p>
                  </div>
                ) : null
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
