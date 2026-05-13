"use client";

import { useQuery } from "@tanstack/react-query";
import { tasksService } from "@/services/tasks.service";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types";

const STATUS_COLOR: Record<string, string> = {
  todo: "bg-zinc-100 text-zinc-700 border-zinc-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  waiting_review: "bg-yellow-50 text-yellow-700 border-yellow-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  blocked: "bg-red-50 text-red-700 border-red-200",
};

const PRIORITY_DOT: Record<string, string> = {
  low: "bg-zinc-400",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-600",
};

const COLUMNS = ["todo", "in_progress", "waiting_review", "completed"] as const;
const COLUMN_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  waiting_review: "Review",
  completed: "Done",
};

export default function TasksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksService.list().then((r) => r.data),
  });

  const byStatus = (status: string) =>
    (data?.results ?? []).filter((t: Task) => t.status === status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">Kanban board for your assigned tasks</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {COLUMN_LABELS[col]}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  ({byStatus(col).length})
                </span>
              </div>
              <div className="space-y-2">
                {byStatus(col).map((task: Task) => (
                  <div key={task.id} className="rounded-lg border bg-white p-3 shadow-none space-y-2">
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`}
                      />
                      <p className="text-sm font-medium leading-snug">{task.title}</p>
                    </div>
                    {task.deadline && (
                      <p className="text-xs text-muted-foreground pl-4">
                        Due {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    )}
                    <div className="pl-4">
                      <Badge
                        variant="outline"
                        className={`text-xs px-1.5 py-0 ${STATUS_COLOR[task.status]}`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
                {byStatus(col).length === 0 && (
                  <div className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
