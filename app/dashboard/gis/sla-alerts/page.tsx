"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/display/card";
import { DataTable } from "@/components/ui/display/data-table";
import { StatusBadge } from "@/components/ui/display/badge";
import { AlertTriangle, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Application } from "@/lib/types";

interface SlaReport {
  stats: {
    total_active: number;
    within_sla: number;
    approaching_breach: number;
    breached: number;
    compliance_rate: number;
  };
  approaching: Array<{
    reference: string;
    tier: string;
    agency: string;
    hours_remaining: number;
  }>;
  breached: Array<{
    reference: string;
    tier: string;
    agency: string;
    breached_by: string;
  }>;
}

export default function GisSlaAlertsPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["gis-sla-alerts"],
    queryFn: () => api.get<SlaReport>("/admin/reports/sla").then((r) => r.data),
    refetchInterval: 60000, // Refresh every minute
  });

  const approachingColumns = [
    {
      key: "reference",
      header: "Reference",
      render: (row: SlaReport["approaching"][0]) => (
        <button
          onClick={() => router.push(`/dashboard/gis/cases/${row.reference}`)}
          className="font-medium text-primary hover:underline"
        >
          {row.reference}
        </button>
      ),
    },
    {
      key: "tier",
      header: "Tier",
      render: (row: SlaReport["approaching"][0]) => (
        <span className="capitalize text-text-secondary">{row.tier?.replace("_", " ")}</span>
      ),
    },
    {
      key: "agency",
      header: "Agency",
      render: (row: SlaReport["approaching"][0]) => (
        <span className="uppercase text-text-secondary">{row.agency}</span>
      ),
    },
    {
      key: "hours_remaining",
      header: "Time Left",
      render: (row: SlaReport["approaching"][0]) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-warning" />
          <span className="font-medium text-warning">
            {row.hours_remaining.toFixed(1)} hours
          </span>
        </div>
      ),
    },
  ];

  const breachedColumns = [
    {
      key: "reference",
      header: "Reference",
      render: (row: SlaReport["breached"][0]) => (
        <button
          onClick={() => router.push(`/dashboard/gis/cases/${row.reference}`)}
          className="font-medium text-primary hover:underline"
        >
          {row.reference}
        </button>
      ),
    },
    {
      key: "tier",
      header: "Tier",
      render: (row: SlaReport["breached"][0]) => (
        <span className="capitalize text-text-secondary">{row.tier?.replace("_", " ")}</span>
      ),
    },
    {
      key: "agency",
      header: "Agency",
      render: (row: SlaReport["breached"][0]) => (
        <span className="uppercase text-text-secondary">{row.agency}</span>
      ),
    },
    {
      key: "breached_by",
      header: "Overdue By",
      render: (row: SlaReport["breached"][0]) => (
        <div className="flex items-center gap-2">
          <AlertCircle size={14} className="text-danger" />
          <span className="font-medium text-danger">{row.breached_by}</span>
        </div>
      ),
    },
  ];

  const stats = data?.stats;

  return (
    <DashboardShell
      title="SLA Alerts"
      description="Monitor SLA compliance and address urgent cases"
    >
      {/* Stats Cards - Matching main dashboard style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card variant="default">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-info/8 flex items-center justify-center">
              <Clock size={20} className="text-info" />
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-text-primary">{stats?.total_active || 0}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Active</p>
            </div>
          </div>
          <h3 className="font-semibold text-text-primary text-sm mb-1">Active Cases</h3>
          <p className="text-xs text-text-secondary">Currently being processed</p>
        </Card>

        <Card variant="default">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/8 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-success" />
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-text-primary">{stats?.within_sla || 0}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">On Track</p>
            </div>
          </div>
          <h3 className="font-semibold text-text-primary text-sm mb-1">Within SLA</h3>
          <p className="text-xs text-text-secondary">Meeting deadlines</p>
        </Card>

        <Card variant="default">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/8 flex items-center justify-center">
              <AlertTriangle size={20} className="text-warning" />
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-text-primary">{stats?.approaching_breach || 0}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Warning</p>
            </div>
          </div>
          <h3 className="font-semibold text-text-primary text-sm mb-1">Approaching Breach</h3>
          <p className="text-xs text-text-secondary">Within 12 hours of SLA</p>
        </Card>

        <Card variant="default">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-danger/8 flex items-center justify-center">
              <AlertCircle size={20} className="text-danger" />
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-text-primary">{stats?.breached || 0}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Urgent</p>
            </div>
          </div>
          <h3 className="font-semibold text-text-primary text-sm mb-1">Breached</h3>
          <p className="text-xs text-text-secondary">Requires immediate action</p>
        </Card>
      </div>

      {/* Compliance Rate */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">SLA Compliance Rate</h3>
          <span className={`text-2xl font-bold ${
            (stats?.compliance_rate || 0) >= 90 ? "text-success" :
            (stats?.compliance_rate || 0) >= 70 ? "text-warning" : "text-danger"
          }`}>
            {stats?.compliance_rate?.toFixed(1) || 0}%
          </span>
        </div>
        <div className="w-full bg-surface rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              (stats?.compliance_rate || 0) >= 90 ? "bg-success" :
              (stats?.compliance_rate || 0) >= 70 ? "bg-warning" : "bg-danger"
            }`}
            style={{ width: `${stats?.compliance_rate || 0}%` }}
          />
        </div>
        <p className="text-xs text-text-muted mt-2">
          Target: 95% | Current: {stats?.compliance_rate?.toFixed(1) || 0}%
        </p>
      </div>

      {/* Breached Cases - Priority */}
      {data?.breached && data.breached.length > 0 && (
        <div className="card mb-6 border-danger/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-danger" />
            <h3 className="font-semibold text-danger">SLA Breached - Immediate Action Required</h3>
          </div>
          <DataTable
            columns={breachedColumns}
            data={data.breached}
            loading={isLoading}
            emptyMessage="No breached cases"
          />
        </div>
      )}

      {/* Approaching Breach */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-warning" />
          <h3 className="font-semibold text-text-primary">Approaching SLA Breach (within 12 hours)</h3>
        </div>
        <DataTable
          columns={approachingColumns}
          data={data?.approaching || []}
          loading={isLoading}
          emptyMessage="No cases approaching SLA breach"
        />
      </div>
    </DashboardShell>
  );
}
