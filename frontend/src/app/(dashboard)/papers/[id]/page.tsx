"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, ExternalLink, CalendarDays, CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { usePaper, usePaperTransition } from "@/hooks/usePapers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ProgressBar } from "@/components/progress-bar";
import {
  PAPER_STATUS_LABEL,
  STATUS_TRANSITIONS,
  STATUS_PHASE_COLOR,
} from "@/types/paper";
import type { PaperDetail, Milestone } from "@/types/paper";

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

export default function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: paper, isLoading, error } = usePaper(id);
  const transition = usePaperTransition(id);

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
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const p = paper as PaperDetail;
  const availableTransitions = STATUS_TRANSITIONS[p.status] ?? [];
  const statusColor = STATUS_PHASE_COLOR[p.status] ?? "bg-zinc-100 text-zinc-700";

  const handleTransition = (t: string, label: string) => {
    transition.mutate(t, {
      onSuccess: () => toast.success(`Status updated: ${label}`),
      onError: () => toast.error("Transition failed. Check if it's allowed from the current status."),
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

          {/* Transition buttons */}
          {availableTransitions.length > 0 && (
            <div className="flex gap-2 shrink-0">
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
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Overall Progress — {p.overall_progress}%
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <ProgressBar label="Literature Review" value={p.literature_review_progress} color="bg-blue-500" />
          <ProgressBar label="Dataset" value={p.dataset_progress} color="bg-yellow-500" />
          <ProgressBar label="Experiments" value={p.experiment_progress} color="bg-orange-500" />
          <ProgressBar label="Writing" value={p.writing_progress} color="bg-purple-500" />
          <ProgressBar label="Revision" value={p.revision_progress} color="bg-green-500" />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-0">
          {["overview", "authors", "milestones", "metadata"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent capitalize pb-2 px-4"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="mt-6 space-y-5">
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
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {label}
                </h3>
                <p className="text-sm leading-relaxed">{value}</p>
              </div>
            ) : null
          )}

          {p.keywords.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Keywords
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {p.keywords.map((kw) => (
                  <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
                ))}
              </div>
            </div>
          )}

          {(p.funding_source || p.ethics_approval_number) && (
            <div className="grid grid-cols-2 gap-4 pt-1">
              {p.funding_source && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Funding</p>
                  <p className="text-sm">{p.funding_source}</p>
                </div>
              )}
              {p.ethics_approval_number && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Ethics #</p>
                  <p className="text-sm">{p.ethics_approval_number}</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Authors tab */}
        <TabsContent value="authors" className="mt-6">
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
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-xs text-muted-foreground">{author.contribution_percentage}% contribution</p>
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
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Milestones tab */}
        <TabsContent value="milestones" className="mt-6">
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
                      {m.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{m.description}</p>
                      )}
                      {m.comments && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{m.comments}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                        <CalendarDays className="h-3 w-3" />
                        {new Date(m.deadline).toLocaleDateString()}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${
                          m.status === "completed" ? "text-green-700 border-green-200" :
                          m.status === "overdue" ? "text-red-700 border-red-200" :
                          m.status === "in_progress" ? "text-blue-700 border-blue-200" :
                          ""
                        }`}
                      >
                        {m.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Metadata tab */}
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
