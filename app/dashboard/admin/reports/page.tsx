"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Select } from "@/components/ui/forms/input";
import { DataTable } from "@/components/ui/display/data-table";
import { Badge } from "@/components/ui/display/badge";
import { CardSkeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  Shield,
} from "lucide-react";
import type { AuditLog, PaginatedResponse } from "@/lib/types";

interface VolumeEntry {
  date: string;
  count: number;
}

interface SlaStats {
  stats: Record<string, unknown>;
  approaching: { reference: string; tier: string; agency: string; hours_remaining: number }[];
  breached: { reference: string; tier: string; agency: string; breached_by: string }[];
}

export default function AdminReportsPage() {
  const [auditPage, setAuditPage] = useState(1);
  const [days, setDays] = useState("30");

  const { data: volumeData, isLoading: volLoading } = useQuery({
    queryKey: ["admin-volume", days],
    queryFn: () =>
      api
        .get<{ volume: VolumeEntry[] }>("/admin/reports/volume", {
          params: { days },
        })
        .then((r) => r.data),
  });

  const { data: slaData, isLoading: slaLoading } = useQuery({
    queryKey: ["admin-sla"],
    queryFn: () =>
      api.get<SlaStats>("/admin/reports/sla").then((r) => r.data),
  });

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ["admin-audit", auditPage],
    queryFn: () =>
      api
        .get<PaginatedResponse<AuditLog>>("/admin/reports/audit-logs", {
          params: { page: auditPage },
        })
        .then((r) => r.data),
  });

  const volume = volumeData?.volume || [];
  const maxCount = Math.max(...volume.map((v) => v.count), 1);

  return (
    <DashboardShell
      title="Reports & Analytics"
      description="Application volumes, SLA compliance, and audit logs"
    >
      {/* Application Volume */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-text-muted" />
            <h2 className="text-lg font-semibold text-text-primary">
              Application Volume
            </h2>
          </div>
          <div className="w-32">
            <Select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              options={[
                { value: "7", label: "7 days" },
                { value: "14", label: "14 days" },
                { value: "30", label: "30 days" },
                { value: "90", label: "90 days" },
              ]}
            />
          </div>
        </div>

        {volLoading ? (
          <CardSkeleton />
        ) : volume.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">
            No application data for the selected period
          </p>
        ) : (
          <div className="space-y-2">
            {/* Simple bar chart */}
            <div className="flex items-end gap-1 h-40">
              {volume.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end"
                >
                  <span className="text-[10px] text-text-muted mb-1">
                    {v.count}
                  </span>
                  <div
                    className="w-full bg-accent/80 rounded-t min-h-[2px] transition-all"
                    style={{
                      height: `${(v.count / maxCount) * 100}%`,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-text-muted px-1">
              <span>{volume[0]?.date}</span>
              <span>{volume[volume.length - 1]?.date}</span>
            </div>
          </div>
        )}
      </div>

      {/* SLA Compliance */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Approaching Breach */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-warning" />
            <h2 className="text-lg font-semibold text-text-primary">
              Approaching SLA Breach
            </h2>
          </div>
          {slaLoading ? (
            <CardSkeleton />
          ) : (slaData?.approaching?.length ?? 0) === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">
              No cases approaching breach
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {slaData?.approaching?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {item.reference}
                    </p>
                    <p className="text-xs text-text-muted">
                      {item.tier?.replace("_", " ")} &middot;{" "}
                      {item.agency?.toUpperCase()}
                    </p>
                  </div>
                  <Badge variant="warning">
                    {Math.round(item.hours_remaining)}h left
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Breached */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-danger" />
            <h2 className="text-lg font-semibold text-text-primary">
              SLA Breached
            </h2>
          </div>
          {slaLoading ? (
            <CardSkeleton />
          ) : (slaData?.breached?.length ?? 0) === 0 ? (
            <div className="text-center py-6">
              <Shield size={24} className="mx-auto text-success mb-2" />
              <p className="text-sm text-success font-medium">
                All cases within SLA
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {slaData?.breached?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-danger/5 border border-danger/20"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {item.reference}
                    </p>
                    <p className="text-xs text-text-muted">
                      {item.tier?.replace("_", " ")} &middot;{" "}
                      {item.agency?.toUpperCase()}
                    </p>
                  </div>
                  <Badge variant="danger">{item.breached_by}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-text-muted" />
          <h2 className="text-lg font-semibold text-text-primary">
            Audit Logs
          </h2>
        </div>

        <DataTable<AuditLog>
          columns={[
            {
              key: "created_at",
              header: "Timestamp",
              render: (row: AuditLog) =>
                new Date(row.created_at).toLocaleString(),
            },
            {
              key: "user",
              header: "User",
              render: (row: AuditLog) =>
                row.user
                  ? `${row.user.first_name} ${row.user.last_name}`
                  : "System",
            },
            {
              key: "role",
              header: "Role",
              render: (row: AuditLog) => (
                <span className="text-sm capitalize">
                  {row.user?.role?.replace(/_/g, " ") || "—"}
                </span>
              ),
            },
            {
              key: "action",
              header: "Action",
              render: (row: AuditLog) => (
                <span className="text-sm text-text-primary">
                  {row.action}
                </span>
              ),
            },
          ]}
          data={auditData?.data || []}
          currentPage={auditData?.current_page}
          lastPage={auditData?.last_page}
          onPageChange={setAuditPage}
          loading={auditLoading}
          emptyMessage="No audit log entries found."
        />
      </div>
    </DashboardShell>
  );
}
