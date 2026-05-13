"use client";

import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  CheckSquare,
  SendHorizonal,
  BookOpen,
  Clock,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { usePapers } from "@/hooks/usePapers";
import { useAllTasks } from "@/hooks/useTasks";
import { useAuthStore } from "@/store/auth.store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axios";
import type { Paper, Task } from "@/types";

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

const PHASE_BADGE: Record<string, string> = {
  Planning: "bg-blue-50 text-blue-700 border-blue-200",
  Development: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Writing: "bg-purple-50 text-purple-700 border-purple-200",
  Submission: "bg-orange-50 text-orange-700 border-orange-200",
  Published: "bg-green-50 text-green-700 border-green-200",
};

function useDashboardStats() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => api.get("/analytics/dashboard/").then((r) => r.data),
  });
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: papers, isLoading: papersLoading } = usePapers({ page_size: 5 });
  const { data: stats } = useDashboardStats();
  const { data: tasksData } = useAllTasks();

  const totalPapers = stats?.total_papers ?? 0;
  const pendingTasks = stats?.pending_tasks ?? 0;

  const publishedCount =
    papers?.results.filter((p: Paper) => p.status === "published").length ?? 0;
  const activeCount =
    papers?.results.filter((p: Paper) =>
      !["published", "rejected", "withdrawn"].includes(p.status)
    ).length ?? 0;

  const now = new Date();
  const soon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const upcomingTasks = (tasksData?.results ?? [])
    .filter((t: Task) => t.deadline && !["completed", "blocked"].includes(t.status))
    .filter((t: Task) => {
      const d = new Date(t.deadline!);
      return d >= now && d <= soon;
    })
    .sort((a: Task, b: Task) =>
      new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.full_name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s an overview of your research workspace.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Papers"
          value={totalPapers}
          icon={FileText}
          accent="default"
        />
        <StatCard
          label="Active Papers"
          value={activeCount}
          icon={TrendingUp}
          accent="blue"
        />
        <StatCard
          label="Published"
          value={publishedCount}
          icon={BookOpen}
          accent="green"
        />
        <StatCard
          label="Open Tasks"
          value={pendingTasks}
          icon={CheckSquare}
          accent="yellow"
        />
      </div>

      {/* Recent papers */}
      <Card className="shadow-none border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <SendHorizonal className="h-4 w-4 text-muted-foreground" />
            Recent Papers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {papersLoading ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : !papers?.results.length ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              No papers yet.{" "}
              <a href="/papers" className="underline underline-offset-4">
                Create your first paper →
              </a>
            </div>
          ) : (
            <ul className="divide-y">
              {papers.results.map((paper: Paper) => {
                const phase = STATUS_PHASE[paper.status] ?? "Unknown";
                return (
                  <li key={paper.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-zinc-50">
                    <div className="flex-1 min-w-0">
                      <a
                        href={`/papers/${paper.id}`}
                        className="text-sm font-medium hover:underline truncate block"
                      >
                        {paper.title}
                      </a>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {paper.paper_id} · {paper.domain}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <div className="h-1.5 w-20 rounded-full bg-zinc-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-zinc-800 transition-all"
                            style={{ width: `${paper.overall_progress}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground w-8">
                          {paper.overall_progress}%
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-0.5 ${PHASE_BADGE[phase] ?? ""}`}
                      >
                        {phase}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Upcoming deadlines */}
      <Card className="shadow-none border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Upcoming Deadlines
            <span className="ml-auto text-xs font-normal text-muted-foreground">Next 14 days</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center px-6">
              No tasks due in the next 14 days.
            </p>
          ) : (
            <ul className="divide-y">
              {upcomingTasks.map((t: Task) => {
                const deadline = new Date(t.deadline!);
                const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <li key={t.id} className="flex items-center gap-4 px-6 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {t.status.replace("_", " ")} · {t.priority} priority
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-medium tabular-nums">
                        {deadline.toLocaleDateString()}
                      </p>
                      <p className={`text-xs mt-0.5 ${daysLeft <= 3 ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                        {daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `${daysLeft}d left`}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
