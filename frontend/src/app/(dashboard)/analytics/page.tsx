"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { StatCard } from "@/components/stat-card";
import { FileText, Users, BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  const { data: dash } = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => api.get("/analytics/dashboard/").then((r) => r.data),
  });

  const { data: papers } = useQuery({
    queryKey: ["analytics", "papers"],
    queryFn: () => api.get("/analytics/papers/").then((r) => r.data),
  });

  const { data: users } = useQuery({
    queryKey: ["analytics", "users"],
    queryFn: () => api.get("/analytics/users/").then((r) => r.data),
  });

  const byYear: { year: number; count: number }[] = (papers?.by_year ?? [])
    .filter((r: { year: number | null }) => r.year != null)
    .sort((a: { year: number }, b: { year: number }) => a.year - b.year);

  const maxYearCount = Math.max(1, ...byYear.map((r) => r.count));
  const maxStatusCount = Math.max(1, ...(dash?.by_status ?? []).map((r: { count: number }) => r.count));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Research metrics and platform statistics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Papers" value={dash?.total_papers ?? "—"} icon={FileText} />
        <StatCard label="Open Tasks" value={dash?.pending_tasks ?? "—"} icon={BarChart3} accent="yellow" />
        <StatCard label="Total Users" value={users?.total_users ?? "—"} icon={Users} accent="blue" />
        <StatCard label="Published" value={(dash?.by_status ?? []).find((r: { status: string }) => r.status === "published")?.count ?? 0} icon={TrendingUp} accent="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Papers by status */}
        <Card className="shadow-none border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Papers by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {dash?.by_status?.length ? (
              <ul className="space-y-2.5">
                {dash.by_status.map((row: { status: string; count: number }) => (
                  <li key={row.status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize text-muted-foreground">
                        {row.status.replace(/_/g, " ")}
                      </span>
                      <span className="font-medium tabular-nums">{row.count}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-zinc-800 transition-all"
                        style={{ width: `${(row.count / maxStatusCount) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Papers by domain */}
        <Card className="shadow-none border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Papers by Domain</CardTitle>
          </CardHeader>
          <CardContent>
            {papers?.by_domain?.length ? (
              <ul className="space-y-2.5">
                {papers.by_domain.map((row: { domain: string; count: number }) => (
                  <li key={row.domain} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize text-muted-foreground">{row.domain}</span>
                      <span className="font-medium tabular-nums">{row.count}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${(row.count / Math.max(1, ...papers.by_domain.map((d: { count: number }) => d.count))) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Publications by year */}
        <Card className="shadow-none border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Papers Created by Year</CardTitle>
          </CardHeader>
          <CardContent>
            {byYear.length ? (
              <div className="flex items-end gap-3 h-32">
                {byYear.map((row) => (
                  <div key={row.year} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">{row.count}</span>
                    <div
                      className="w-full rounded-t bg-zinc-800 transition-all"
                      style={{ height: `${(row.count / maxYearCount) * 80}px`, minHeight: "4px" }}
                    />
                    <span className="text-xs text-muted-foreground tabular-nums">{row.year}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Users by role */}
        <Card className="shadow-none border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            {users?.by_role?.length ? (
              <ul className="space-y-2.5">
                {users.by_role.map((row: { role: string; count: number }) => (
                  <li key={row.role} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize text-muted-foreground">
                        {row.role.replace(/_/g, " ")}
                      </span>
                      <span className="font-medium tabular-nums">{row.count}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-purple-500 transition-all"
                        style={{ width: `${(row.count / Math.max(1, ...users.by_role.map((r: { count: number }) => r.count))) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
