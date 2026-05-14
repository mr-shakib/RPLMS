"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Notification } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, CheckCheck, Check } from "lucide-react";

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/notifications/").then((r) => r.data),
  });

  const markOne = useMutation({
    mutationFn: (id: number) => api.post(`/notifications/${id}/mark_read/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAll = useMutation({
    mutationFn: () => api.post("/notifications/mark_all_read/"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications: Notification[] = data?.results ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Loading…</div>
      ) : !notifications.length ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <Bell className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white divide-y shadow-none">
          {notifications.map((n: Notification) => (
            <div
              key={n.id}
              className={cn(
                "flex gap-4 px-5 py-4",
                !n.is_read && "bg-blue-50/40"
              )}
            >
              <div className="mt-1 shrink-0 w-2">
                {!n.is_read && (
                  <span className="block h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
              {!n.is_read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-zinc-400 hover:text-zinc-700"
                  title="Mark as read"
                  disabled={markOne.isPending}
                  onClick={() => markOne.mutate(n.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
