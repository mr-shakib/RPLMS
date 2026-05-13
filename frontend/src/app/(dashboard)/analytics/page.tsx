"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { StatCard } from "@/components/stat-card";
import { FileText, Users, BarChart3 } from "lucide-react";
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Research metrics and platform statistics</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Total Papers" value={dash?.total_papers ?? "—"} icon={FileText} />
        <StatCard label="Open Tasks" value={dash?.pending_tasks ?? "—"} icon={BarChart3} accent="yellow" />
        <StatCard label="Total Users" value={users?.total_users ?? "—"} icon={Users} accent="blue" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-none border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Papers by Domain</CardTitle>
          </CardHeader>
          <CardContent>
            {papers?.by_domain?.length ? (
              <ul className="space-y-2">
                {papers.by_domain.map((row: { domain: string; count: number }) => (
                  <li key={row.domain} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{row.domain}</span>
                    <span className="font-medium tabular-nums">{row.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Papers by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {dash?.by_status?.length ? (
              <ul className="space-y-2">
                {dash.by_status.map((row: { status: string; count: number }) => (
                  <li key={row.status} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">
                      {row.status.replace(/_/g, " ")}
                    </span>
                    <span className="font-medium tabular-nums">{row.count}</span>
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
