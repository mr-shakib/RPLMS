"use client";

import { Badge } from "@/components/ui/badge";
import { useAllTasks, useUpdateTask } from "@/hooks/useTasks";
import { usePapers } from "@/hooks/usePapers";
import type { Task } from "@/types";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { CreateTaskDialog } from "@/components/create-task-dialog";

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
  const [paperFilter, setPaperFilter] = useState<string>("all");
  const { data, isLoading } = useAllTasks();
  const { data: papers } = usePapers();
  const updateTask = useUpdateTask();

  const allTasks: Task[] = data?.results ?? [];
  const filtered = paperFilter === "all"
    ? allTasks
    : allTasks.filter((t) => String(t.paper) === paperFilter);

  const byStatus = (status: string) => filtered.filter((t) => t.status === status);

  const moveTask = (task: Task, newStatus: string) => {
    updateTask.mutate(
      { id: task.id, data: { status: newStatus as Task["status"] } },
      { onError: () => toast.error("Failed to update task.") }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">Kanban board · drag status to move</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Select value={paperFilter} onValueChange={(v) => setPaperFilter(v as string)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All papers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All papers</SelectItem>
              {papers?.results.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.short_title || p.title.slice(0, 30)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {paperFilter !== "all" && (
            <CreateTaskDialog paperId={paperFilter} triggerVariant="default" />
          )}
        </div>
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
                      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`} />
                      <p className="text-sm font-medium leading-snug">{task.title}</p>
                    </div>
                    {task.deadline && (
                      <p className="text-xs text-muted-foreground pl-4">
                        Due {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    )}
                    {/* Inline status mover */}
                    <div className="pl-4">
                      <Select
                        value={task.status}
                        onValueChange={(v) => moveTask(task, v as string)}
                      >
                        <SelectTrigger className={`h-6 text-xs px-2 border rounded-full w-auto ${STATUS_COLOR[task.status]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(COLUMN_LABELS).map(([val, label]) => (
                            <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
                          ))}
                          <SelectItem value="blocked" className="text-xs text-red-600">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pl-4">
                      <Badge
                        variant="outline"
                        className={`text-xs px-1.5 py-0 capitalize ${STATUS_COLOR[task.status]}`}
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
