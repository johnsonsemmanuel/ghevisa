"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Input, Select } from "@/components/ui/forms/input";
import { DataTable } from "@/components/ui/display/data-table";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, Clock, User, Activity } from "lucide-react";
import type { PaginatedResponse } from "@/lib/types";

interface AuditLog {
  id: number;
  user_id: number;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
  };
  action: string;
  resource_type: string;
  resource_id: number | null;
  ip_address: string;
  user_agent: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [userId, setUserId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, action, userId, dateFrom, dateTo],
    queryFn: () =>
      api
        .get<PaginatedResponse<AuditLog>>("/admin/reports/audit-logs", {
          params: {
            page,
            ...(action && { action }),
            ...(userId && { user_id: userId }),
            ...(dateFrom && { from: dateFrom }),
            ...(dateTo && { to: dateTo }),
          },
        })
        .then((r) => r.data),
  });

  const columns = [
    {
      key: "created_at",
      header: "Timestamp",
      render: (row: AuditLog) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-text-muted" />
          <span className="text-sm text-text-primary">
            {new Date(row.created_at).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: "user",
      header: "User",
      render: (row: AuditLog) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={14} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {row.user ? `${row.user.first_name} ${row.user.last_name}` : "System"}
            </p>
            <p className="text-xs text-text-muted capitalize">{row.user?.role?.replace("_", " ") || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (row: AuditLog) => {
        const actionColors: Record<string, string> = {
          create: "bg-success/10 text-success",
          update: "bg-info/10 text-info",
          delete: "bg-danger/10 text-danger",
          login: "bg-primary/10 text-primary",
          logout: "bg-warning/10 text-warning",
          approve: "bg-success/10 text-success",
          deny: "bg-danger/10 text-danger",
          escalate: "bg-warning/10 text-warning",
        };
        const color = Object.entries(actionColors).find(([key]) => 
          row.action.toLowerCase().includes(key)
        )?.[1] || "bg-surface text-text-secondary";
        
        return (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${color}`}>
            {row.action}
          </span>
        );
      },
    },
    {
      key: "resource",
      header: "Resource",
      render: (row: AuditLog) => (
        <span className="text-sm text-text-secondary">
          {row.resource_type} {row.resource_id ? `#${row.resource_id}` : ""}
        </span>
      ),
    },
    {
      key: "ip_address",
      header: "IP Address",
      render: (row: AuditLog) => (
        <span className="text-sm font-mono text-text-muted">{row.ip_address || "—"}</span>
      ),
    },
  ];

  const handleExport = () => {
    // Create CSV content
    const headers = ["Timestamp", "User", "Role", "Action", "Resource", "IP Address"];
    const rows = data?.data?.map((log) => [
      new Date(log.created_at).toISOString(),
      log.user ? `${log.user.first_name} ${log.user.last_name}` : "System",
      log.user?.role || "",
      log.action,
      `${log.resource_type} ${log.resource_id || ""}`,
      log.ip_address || "",
    ]) || [];

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell
      title="Audit Logs"
      description="Track all system actions and user activities"
      actions={
        <Button size="sm" variant="secondary" leftIcon={<Download size={14} />} onClick={handleExport}>
          Export CSV
        </Button>
      }
    >
      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-text-muted" />
          <h3 className="font-medium text-text-primary">Filters</h3>
        </div>
        <div className="grid sm:grid-cols-4 gap-4">
          <Input
            label="Action"
            placeholder="e.g., login, approve"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          />
          <Input
            label="User ID"
            type="number"
            placeholder="User ID"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setPage(1);
            }}
          />
          <Input
            label="From Date"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
          />
          <Input
            label="To Date"
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-4 text-center">
          <Activity size={20} className="mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold text-text-primary">{data?.total || 0}</p>
          <p className="text-xs text-text-muted">Total Logs</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-success">
            {data?.data?.filter((l) => l.action.includes("login")).length || 0}
          </p>
          <p className="text-xs text-text-muted">Logins (this page)</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-info">
            {data?.data?.filter((l) => l.action.includes("approve")).length || 0}
          </p>
          <p className="text-xs text-text-muted">Approvals (this page)</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-danger">
            {data?.data?.filter((l) => l.action.includes("deny")).length || 0}
          </p>
          <p className="text-xs text-text-muted">Denials (this page)</p>
        </div>
      </div>

      <DataTable<AuditLog>
        columns={columns}
        data={data?.data || []}
        currentPage={data?.current_page}
        lastPage={data?.last_page}
        onPageChange={setPage}
        loading={isLoading}
        emptyMessage="No audit logs found."
      />
    </DashboardShell>
  );
}
