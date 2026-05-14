"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePapers, useDeletePaper, useTransitionPaper, useInlineUpdatePaper } from "@/hooks/usePapers";
import { CreatePaperDialog } from "@/components/create-paper-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2, ExternalLink, ChevronUp, ChevronDown, ChevronsUpDown,
  ArrowRight, Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Paper, PaperStatus } from "@/types";
import { STATUS_TRANSITIONS, PAPER_STATUS_LABEL, STATUS_PHASE_COLOR } from "@/types/paper";

const DOMAIN_LABEL: Record<string, string> = {
  ml: "Machine Learning", nlp: "NLP", cv: "Computer Vision",
  healthcare: "Healthcare AI", security: "Cybersecurity", other: "Other",
};
const DOMAIN_COLOR: Record<string, string> = {
  ml: "bg-blue-50 text-blue-700", nlp: "bg-indigo-50 text-indigo-700",
  cv: "bg-cyan-50 text-cyan-700", healthcare: "bg-green-50 text-green-700",
  security: "bg-red-50 text-red-700", other: "bg-zinc-100 text-zinc-700",
};
const STATUS_PHASE: Record<string, string> = {
  idea_proposed: "Planning", topic_discussion: "Planning", literature_review: "Planning",
  gap_analysis: "Planning", proposal_drafting: "Planning", proposal_approved: "Planning",
  dataset_collection: "Development", dataset_cleaning: "Development",
  model_development: "Development", experimentation: "Development",
  evaluation: "Development", result_analysis: "Development",
  initial_draft: "Writing", figure_preparation: "Writing", formatting: "Writing",
  citation_checking: "Writing", grammar_review: "Writing", internal_review: "Writing",
  supervisor_review: "Writing",
  journal_selection: "Submission", submission_ready: "Submission", submitted: "Submission",
  under_review: "Submission", revision_requested: "Submission", resubmitted: "Submission",
  accepted: "Published", rejected: "Terminal", withdrawn: "Terminal", published: "Published",
};

type SortKey = "title" | "status" | "domain" | "overall_progress" | "updated_at";
type SortDir = "asc" | "desc";

function SortBtn({ col, sort, onToggle }: {
  col: SortKey;
  sort: { key: SortKey; dir: SortDir };
  onToggle: (k: SortKey) => void;
}) {
  return (
    <button
      onClick={() => onToggle(col)}
      className="flex items-center gap-0.5 hover:text-zinc-900 select-none"
    >
      {sort.key === col ? (
        sort.dir === "asc"
          ? <ChevronUp className="h-3 w-3 text-zinc-600" />
          : <ChevronDown className="h-3 w-3 text-zinc-600" />
      ) : (
        <ChevronsUpDown className="h-3 w-3 text-zinc-400" />
      )}
    </button>
  );
}

export default function PapersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "updated_at", dir: "desc" });
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = usePapers({ search, page });
  const deleteP = useDeletePaper();
  const transitionP = useTransitionPaper();
  const updateP = useInlineUpdatePaper();

  const papers: Paper[] = data?.results ?? [];

  let displayed = [...papers];
  if (domainFilter !== "all") displayed = displayed.filter((p) => p.domain === domainFilter);
  if (phaseFilter !== "all") displayed = displayed.filter((p) => STATUS_PHASE[p.status] === phaseFilter);
  displayed.sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    if (sort.key === "overall_progress") return (a.overall_progress - b.overall_progress) * dir;
    const av = String(a[sort.key] ?? "").toLowerCase();
    const bv = String(b[sort.key] ?? "").toLowerCase();
    return av < bv ? -dir : av > bv ? dir : 0;
  });

  const toggleSort = (key: SortKey) => {
    setSort((prev) => prev.key === key
      ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
      : { key, dir: "asc" }
    );
  };

  const startEdit = (paper: Paper) => {
    setEditingId(paper.id);
    setEditValue(paper.title);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const saveEdit = (id: number) => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== papers.find((p) => p.id === id)?.title) {
      updateP.mutate(
        { id, data: { title: trimmed } },
        {
          onSuccess: () => toast.success("Title updated."),
          onError: () => toast.error("Failed to update title."),
        }
      );
    }
    setEditingId(null);
  };

  const handleTransition = (paperId: number, t: string, label: string) => {
    transitionP.mutate(
      { id: paperId, transition: t },
      {
        onSuccess: () => toast.success(`→ ${label}`),
        onError: () => toast.error("Transition not allowed from current status."),
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteP.mutate(id, {
      onSuccess: () => toast.success("Paper deleted."),
      onError: () => toast.error("Failed to delete paper."),
    });
  };

  const TH = ({ children, col, className }: { children?: React.ReactNode; col?: SortKey; className?: string }) => (
    <th className={cn("px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide", className)}>
      {col ? (
        <span className="flex items-center gap-1">
          {children}
          <SortBtn col={col} sort={sort} onToggle={toggleSort} />
        </span>
      ) : children}
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Papers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.count ?? 0} total · click a title to rename · hover a row for actions
          </p>
        </div>
        <CreatePaperDialog />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search title or ID…"
            className="pl-8 h-8 text-sm"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={domainFilter} onValueChange={(v) => { setDomainFilter(v as string); setPage(1); }}>
          <SelectTrigger className="h-8 w-40 text-sm">
            <SelectValue placeholder="All domains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All domains</SelectItem>
            {Object.entries(DOMAIN_LABEL).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={phaseFilter} onValueChange={(v) => { setPhaseFilter(v as string); setPage(1); }}>
          <SelectTrigger className="h-8 w-40 text-sm">
            <SelectValue placeholder="All phases" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All phases</SelectItem>
            {["Planning", "Development", "Writing", "Submission", "Published", "Terminal"].map((ph) => (
              <SelectItem key={ph} value={ph}>{ph}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Loading…</div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20">
          <p className="text-sm text-muted-foreground">No papers found</p>
          <CreatePaperDialog />
        </div>
      ) : (
        <div className="rounded-xl border bg-white overflow-hidden shadow-none">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50/80">
                <TH className="w-24">Paper ID</TH>
                <TH col="title">Title</TH>
                <TH col="domain" className="w-36 hidden sm:table-cell">Domain</TH>
                <TH col="status" className="w-52">Status</TH>
                <TH col="overall_progress" className="w-32">Progress</TH>
                <TH col="updated_at" className="w-28 hidden lg:table-cell">Updated</TH>
                <TH className="w-20" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayed.map((paper, idx) => {
                const transitions = STATUS_TRANSITIONS[paper.status as PaperStatus] ?? [];
                const isEditing = editingId === paper.id;
                return (
                  <tr
                    key={paper.id}
                    className={cn(
                      "group hover:bg-blue-50/20 transition-colors",
                      idx % 2 === 1 && "bg-zinc-50/40"
                    )}
                  >
                    {/* Paper ID */}
                    <td className="px-3 py-2.5">
                      <span className="text-xs font-mono text-muted-foreground">{paper.paper_id}</span>
                    </td>

                    {/* Title — inline edit */}
                    <td className="px-3 py-2.5 max-w-xs">
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          className="w-full rounded border border-zinc-300 bg-white px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(paper.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(paper.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                      ) : (
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="min-w-0">
                            <span
                              className="font-medium cursor-text hover:text-blue-600 line-clamp-2 leading-snug"
                              onClick={() => startEdit(paper)}
                              title="Click to rename"
                            >
                              {paper.title}
                            </span>
                            {paper.keywords?.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate hidden xl:block">
                                {paper.keywords.slice(0, 3).join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Domain */}
                    <td className="px-3 py-2.5 hidden sm:table-cell">
                      <Badge className={cn("text-xs px-1.5 py-0 border-0", DOMAIN_COLOR[paper.domain] ?? "bg-zinc-100")}>
                        {DOMAIN_LABEL[paper.domain] ?? paper.domain}
                      </Badge>
                    </td>

                    {/* Status + transition dropdown */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <Badge className={cn("text-xs px-1.5 py-0 border-0 whitespace-nowrap", STATUS_PHASE_COLOR[paper.status] ?? "bg-zinc-100")}>
                          {PAPER_STATUS_LABEL[paper.status as PaperStatus]}
                        </Badge>
                        {transitions.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <button className="h-5 w-5 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity" title="Advance status" />
                              }
                            >
                              <ArrowRight className="h-3 w-3" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="min-w-48">
                              {transitions.map(({ label, transition: t }) => (
                                <DropdownMenuItem
                                  key={t}
                                  onClick={() => handleTransition(paper.id, t, label)}
                                >
                                  {label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-zinc-100 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              paper.overall_progress >= 75 ? "bg-green-500" :
                              paper.overall_progress >= 40 ? "bg-yellow-500" : "bg-zinc-400"
                            )}
                            style={{ width: `${paper.overall_progress}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground w-7">
                          {paper.overall_progress}%
                        </span>
                      </div>
                    </td>

                    {/* Updated */}
                    <td className="px-3 py-2.5 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {new Date(paper.updated_at).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Row actions */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="Open detail"
                          className="h-7 w-7 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                          onClick={() => router.push(`/papers/${paper.id}`)}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Delete paper"
                          className="h-7 w-7 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(paper.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {(data?.next || data?.previous) && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-zinc-50/50">
              <span className="text-xs text-muted-foreground">
                Page {page} · showing {displayed.length} of {data?.count}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm" className="h-7 text-xs"
                  disabled={!data?.previous}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline" size="sm" className="h-7 text-xs"
                  disabled={!data?.next}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
