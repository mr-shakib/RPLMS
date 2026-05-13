"use client";

import { Plus, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePapers } from "@/hooks/usePapers";
import type { Paper } from "@/types";
import { useState } from "react";

const PHASE_BADGE: Record<string, string> = {
  Planning: "bg-blue-50 text-blue-700 border-blue-200",
  Development: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Writing: "bg-purple-50 text-purple-700 border-purple-200",
  Submission: "bg-orange-50 text-orange-700 border-orange-200",
  Published: "bg-green-50 text-green-700 border-green-200",
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
  accepted: "Published", rejected: "Submission", withdrawn: "Submission", published: "Published",
};

export default function PapersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = usePapers({ search });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Papers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your research papers and their lifecycle
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Paper
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search papers by title, keyword, or ID…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Loading…</div>
      ) : !data?.results.length ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20">
          <FileText className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No papers found</p>
          <Button size="sm" variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> Create your first paper
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border divide-y bg-white shadow-none">
          {data.results.map((paper: Paper) => {
            const phase = STATUS_PHASE[paper.status] ?? "Unknown";
            return (
              <div key={paper.id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50">
                <div className="flex-1 min-w-0">
                  <a
                    href={`/papers/${paper.id}`}
                    className="text-sm font-medium hover:underline block truncate"
                  >
                    {paper.title}
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {paper.paper_id} · {paper.domain} · {paper.keywords?.slice(0, 3).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden md:flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-zinc-800"
                        style={{ width: `${paper.overall_progress}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground w-8">
                      {paper.overall_progress}%
                    </span>
                  </div>
                  <Badge variant="outline" className={`text-xs ${PHASE_BADGE[phase] ?? ""}`}>
                    {phase}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
