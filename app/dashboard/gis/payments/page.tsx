"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/display/card";
import { Select } from "@/components/ui/forms/input";
import { DataTable } from "@/components/ui/display/data-table";
import { CheckCircle2, XCircle, Clock, CreditCard } from "lucide-react";
import type { Application, PaginatedResponse } from "@/lib/types";

export default function GisPaymentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["gis-payments", page, status],
    queryFn: () =>
      api
        .get<PaginatedResponse<Application>>("/gis/cases", {
          params: { page, per_page: 20 },
        })
        .then((r) => r.data),
  });

  // Extract payment data from applications
  const payments = data?.data?.filter((app) => app.payment).map((app) => ({
    ...app.payment!,
    application: app,
  })) || [];

  const columns = [
    {
      key: "reference",
      header: "Reference",
      render: (row: typeof payments[0]) => (
        <div>
          <p className="font-medium text-text-primary font-mono text-sm">
            {row.transaction_reference}
          </p>
          <p className="text-xs text-text-muted">{row.application.reference_number}</p>
        </div>
      ),
    },
    {
      key: "applicant",
      header: "Applicant",
      render: (row: typeof payments[0]) => (
        <p className="text-sm text-text-primary">
          {row.application.first_name} {row.application.last_name}
        </p>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (row: typeof payments[0]) => (
        <p className="text-sm font-bold text-text-primary">
          ${row.amount} <span className="text-text-muted font-normal">{row.currency}</span>
        </p>
      ),
    },
    {
      key: "provider",
      header: "Provider",
      render: (row: typeof payments[0]) => (
        <span className="text-sm capitalize">{row.payment_provider}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: typeof payments[0]) => {
        const statusConfig = {
          completed: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
          pending: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
          failed: { icon: XCircle, color: "text-danger", bg: "bg-danger/10" },
        };
        const config = statusConfig[row.status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;
        return (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg}`}>
            <Icon size={14} className={config.color} />
            <span className={`text-xs font-medium capitalize ${config.color}`}>{row.status}</span>
          </div>
        );
      },
    },
    {
      key: "date",
      header: "Date",
      render: (row: typeof payments[0]) => (
        <span className="text-sm text-text-muted">
          {row.paid_at ? new Date(row.paid_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  // Calculate totals
  const totalCollected = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const completedCount = payments.filter((p) => p.status === "completed").length;
  const pendingCount = payments.filter((p) => p.status === "pending").length;

  return (
    <DashboardShell
      title="Payments"
      description="View payment records for cases in your queue"
    >
      {/* Summary Cards - Matching main dashboard style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card variant="default">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/8 flex items-center justify-center">
              <CreditCard size={20} className="text-success" />
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-text-primary">${totalCollected.toFixed(2)}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Collected</p>
            </div>
          </div>
          <h3 className="font-semibold text-text-primary text-sm mb-1">Total Collected</h3>
          <p className="text-xs text-text-secondary">Successfully processed payments</p>
        </Card>

        <Card variant="default">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-info/8 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-info" />
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-text-primary">{completedCount}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Completed</p>
            </div>
          </div>
          <h3 className="font-semibold text-text-primary text-sm mb-1">Completed</h3>
          <p className="text-xs text-text-secondary">Payment transactions finalized</p>
        </Card>

        <Card variant="default">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/8 flex items-center justify-center">
              <Clock size={20} className="text-warning" />
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-text-primary">{pendingCount}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Pending</p>
            </div>
          </div>
          <h3 className="font-semibold text-text-primary text-sm mb-1">Pending</h3>
          <p className="text-xs text-text-secondary">Awaiting confirmation</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <div className="max-w-xs">
          <Select
            label="Filter by Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "", label: "All Payments" },
              { value: "completed", label: "Completed" },
              { value: "pending", label: "Pending" },
              { value: "failed", label: "Failed" },
            ]}
          />
        </div>
      </div>

      <DataTable<typeof payments[0]>
        columns={columns}
        data={status ? payments.filter((p) => p.status === status) : payments}
        currentPage={data?.current_page}
        lastPage={data?.last_page}
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/dashboard/gis/cases/${row.application.id}`)}
        loading={isLoading}
        emptyMessage="No payment records found."
      />
    </DashboardShell>
  );
}
