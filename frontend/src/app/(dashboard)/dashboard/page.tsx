"use client";

import { useQuery } from "@tanstack/react-query";
import {
  FileText, CheckSquare, BookOpen, Clock,
  TrendingUp, Send, Activity, ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { useAuthStore } from "@/store/auth.store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axios";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PHASE_BADGE: Record<string, string> = {
  Planning: "bg-blue-50 text-blue-700",
  Development: "bg-yellow-50 text-yellow-700",
  Writing: "bg-purple-50 text-purple-700",
  Submission: "bg-orange-50 text-orange-700",
  Published: "bg-green-50 text-green-700",
};

const PRIORITY_DOT: Record<string, string> = {
  low: "bg-zinc-400", medium: "bg-blue-500",
  high: "bg-orange-500", urgent: "bg-red-600",
};

const TASK_STATUS_COLOR: Record<string, string> = {
  todo: "bg-zinc-100 text-zinc-600",
  in_progress: "bg-blue-50 text-blue-700",
  waiting_review: "bg-yellow-50 text-yellow-700",
};

const ACTIVITY_ICON: Record<string, string> = {
  paper: "bg-zinc-100 text-zinc-600",
  submission: "bg-orange-50 text-orange-600",
  task: "bg-blue-50 text-blue-600",
};

function useDashboard() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => api.get("/analytics/dashboard/").then((r) => r.data),
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading } = useDashboard();

  const now = new Date();
  const myTasks: {
    id: number; title: string; status: string; priority: string;
    deadline: string | null; paper_id: number; paper_title: string | null;
  }[] = stats?.my_tasks ?? [];

  const upcomingTasks = myTasks.filter((t) => {
    if (!t.deadline) return false;
    const d = new Date(t.deadline);
    const daysLeft = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysLeft >= 0 && daysLeft <= 14;
  });

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

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Papers"    value={stats?.total_papers   ?? "—"} icon={FileText}    accent="default" />
        <StatCard label="Under Submission" value={stats?.submitted_papers ?? "—"} icon={Send}     accent="yellow" />
        <StatCard label="Published"        value={stats?.published_papers ?? "—"} icon={BookOpen}  accent="green" />
        <StatCard label="Open Tasks"       value={stats?.pending_tasks   ?? "—"} icon={CheckSquare} accent="blue" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* My Tasks */}
        <Card className="shadow-none border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              My Tasks
              {myTasks.length > 0 && (
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {myTasks.length} open
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
            ) : myTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No open tasks assigned to you.</p>
            ) : (
              <ul className="divide-y">
                {myTasks.map((t) => {
                  const deadline = t.deadline ? new Date(t.deadline) : null;
                  const daysLeft = deadline ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
                  const overdue = daysLeft !== null && daysLeft < 0;
                  return (
                    <li key={t.id} className="flex items-start gap-3 px-5 py-3.5">
                      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${PRIORITY_DOT[t.priority] ?? "bg-zinc-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{t.title}</p>
                        {t.paper_title && (
                          <Link href={`/papers/${t.paper_id}`} className="text-xs text-muted-foreground hover:underline truncate block">
                            {t.paper_title}
                          </Link>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <Badge className={`text-xs px-1.5 py-0 border-0 ${TASK_STATUS_COLOR[t.status] ?? "bg-zinc-100"}`}>
                          {t.status.replace("_", " ")}
                        </Badge>
                        {deadline && (
                          <span className={cn("text-xs tabular-nums", overdue ? "text-red-600 font-medium" : daysLeft! <= 3 ? "text-orange-600" : "text-muted-foreground")}>
                            {overdue ? `${Math.abs(daysLeft!)}d overdue` : daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `${daysLeft}d left`}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {myTasks.length > 0 && (
              <div className="px-5 py-3 border-t">
                <Link href="/tasks" className="text-xs text-muted-foreground hover:text-zinc-900 flex items-center gap-1">
                  View all tasks <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-none border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
            ) : !stats?.recent_activity?.length ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No recent activity.</p>
            ) : (
              <ul className="divide-y">
                {stats.recent_activity.map((item: { type: string; title: string; detail: string; link: string; timestamp: string }, i: number) => (
                  <li key={i} className="flex items-start gap-3 px-5 py-3">
                    <span className={cn("mt-0.5 h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold", ACTIVITY_ICON[item.type] ?? "bg-zinc-100")}>
                      {item.type === "paper" ? "P" : item.type === "submission" ? "S" : "T"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link href={item.link} className="text-sm font-medium hover:underline truncate block">{item.title}</Link>
                      {item.detail && <p className="text-xs text-muted-foreground truncate capitalize">{item.detail}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{timeAgo(item.timestamp)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
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
              <p className="text-sm text-muted-foreground py-8 text-center">No deadlines in the next 14 days.</p>
            ) : (
              <ul className="divide-y">
                {upcomingTasks.map((t) => {
                  const deadline = new Date(t.deadline!);
                  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <li key={t.id} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{t.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                          {t.status.replace("_", " ")} · {t.priority} priority
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-medium tabular-nums">{deadline.toLocaleDateString()}</p>
                        <p className={cn("text-xs mt-0.5", daysLeft <= 3 ? "text-red-600 font-medium" : "text-muted-foreground")}>
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

        {/* Papers by status (mini) */}
        <Card className="shadow-none border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Papers by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!stats?.by_status?.length ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {stats.by_status
                  .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
                  .slice(0, 6)
                  .map((row: { status: string; count: number }) => {
                    const max = Math.max(...stats.by_status.map((r: { count: number }) => r.count), 1);
                    return (
                      <li key={row.status} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize text-muted-foreground text-xs">{row.status.replace(/_/g, " ")}</span>
                          <span className="font-medium tabular-nums text-xs">{row.count}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                          <div className="h-full rounded-full bg-zinc-800 transition-all" style={{ width: `${(row.count / max) * 100}%` }} />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
            <div className="mt-4">
              <Link href="/analytics" className="text-xs text-muted-foreground hover:text-zinc-900 flex items-center gap-1">
                Full analytics <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
