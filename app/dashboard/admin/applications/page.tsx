"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/forms/input";
import { DataTable } from "@/components/ui/display/data-table";
import { StatusBadge } from "@/components/ui/display/badge";
import { Search, FileText, Filter, Download } from "lucide-react";
import type { Application, PaginatedResponse } from "@/lib/types";

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-applications", page, status, search],
    queryFn: () =>
      api
        .get<PaginatedResponse<Application>>("/admin/applications", {
          params: { 
            page, 
            per_page: 20,
            ...(status && { status }),
            ...(search && { search }),
          },
        })
        .then((r) => r.data),
  });

  const columns = [
    {
      key: "reference_number",
      header: "Reference",
      render: (row: Application) => (
        <span className="font-medium text-text-primary font-mono text-sm">
          {row.reference_number}
        </span>
      ),
    },
    {
      key: "applicant",
      header: "Applicant",
      render: (row: Application) => (
        <div>
          <p className="text-sm font-medium text-text-primary">
            {row.first_name} {row.last_name}
          </p>
          <p className="text-xs text-text-muted">{row.nationality}</p>
        </div>
      ),
    },
    {
      key: "visa_type",
      header: "Visa Type",
      render: (row: Application) => row.visa_type?.name || "—",
    },
    {
      key: "processing_tier",
      header: "Tier",
      render: (row: Application) => {
        const tierColors: Record<string, string> = {
          express: "bg-success/10 text-success",
          fast_track: "bg-info/10 text-info",
          regular: "bg-warning/10 text-warning",
        };
        const tier = row.processing_tier || "—";
        const color = tierColors[tier] || "bg-surface text-text-muted";
        return (
          <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${color}`}>
            {tier.replace("_", " ")}
          </span>
        );
      },
    },
    {
      key: "assigned_agency",
      header: "Agency",
      render: (row: Application) => (
        <span className="text-sm uppercase font-medium">{row.assigned_agency || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: Application) => <StatusBadge status={row.status} />,
    },
    {
      key: "created_at",
      header: "Created",
      render: (row: Application) => (
        <span className="text-sm text-text-muted">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Calculate stats
  const stats = {
    total: data?.total || 0,
    pending: data?.data?.filter(a => ["submitted", "under_review", "pending_approval"].includes(a.status)).length || 0,
    approved: data?.data?.filter(a => a.status === "approved").length || 0,
    denied: data?.data?.filter(a => a.status === "denied").length || 0,
  };

  const handleExportCSV = () => {
    const headers = ["Reference", "Applicant", "Nationality", "Visa Type", "Tier", "Agency", "Status", "Created"];
    const rows = data?.data?.map((app) => [
      app.reference_number,
      `${app.first_name} ${app.last_name}`,
      app.nationality,
      app.visa_type?.name || "",
      app.processing_tier || "",
      app.assigned_agency || "",
      app.status,
      new Date(app.created_at).toISOString(),
    ]) || [];

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell
      title="All Applications"
      description="View and manage all visa applications in the system"
      actions={
        <Button size="sm" variant="secondary" leftIcon={<Download size={14} />} onClick={handleExportCSV}>
          Export CSV
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
          <p className="text-xs text-text-muted">Total</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-warning">{stats.pending}</p>
          <p className="text-xs text-text-muted">Pending</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.approved}</p>
          <p className="text-xs text-text-muted">Approved</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-danger">{stats.denied}</p>
          <p className="text-xs text-text-muted">Denied</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search by reference or name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="input !pl-9 w-full"
              />
            </div>
          </div>
          <div className="w-48">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All Statuses" },
                { value: "draft", label: "Draft" },
                { value: "pending_payment", label: "Pending Payment" },
                { value: "submitted", label: "Submitted" },
                { value: "under_review", label: "Under Review" },
                { value: "pending_approval", label: "Pending Approval" },
                { value: "escalated", label: "Escalated" },
                { value: "approved", label: "Approved" },
                { value: "denied", label: "Denied" },
              ]}
            />
          </div>
        </div>
      </div>

      <DataTable<Application>
        columns={columns}
        data={data?.data || []}
        currentPage={data?.current_page}
        lastPage={data?.last_page}
        onPageChange={setPage}
        onRowClick={(row) => {
          // Route to admin application detail page
          router.push(`/dashboard/admin/applications/${row.id}`);
        }}
        loading={isLoading}
        emptyMessage="No applications found."
      />
    </DashboardShell>
  );
}
