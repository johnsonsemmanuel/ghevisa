"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/forms/input";
import { DataTable } from "@/components/ui/display/data-table";
import { CheckCircle2, XCircle, Clock, CreditCard, DollarSign, Download } from "lucide-react";
import type { Payment, PaginatedResponse } from "@/lib/types";

interface PaymentWithApplication extends Payment {
  application?: {
    id: number;
    reference_number: string;
    first_name: string;
    last_name: string;
  };
}

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments", page, status],
    queryFn: () =>
      api
        .get<PaginatedResponse<PaymentWithApplication>>("/admin/payments", {
          params: { 
            page, 
            per_page: 20,
            ...(status && { status }),
          },
        })
        .then((r) => r.data),
  });

  const columns = [
    {
      key: "transaction_reference",
      header: "Transaction Ref",
      render: (row: PaymentWithApplication) => (
        <span className="font-mono text-sm text-text-primary">
          {row.transaction_reference}
        </span>
      ),
    },
    {
      key: "application",
      header: "Application",
      render: (row: PaymentWithApplication) => (
        <div>
          <p className="text-sm font-medium text-text-primary">
            {row.application?.reference_number || "—"}
          </p>
          <p className="text-xs text-text-muted">
            {row.application ? `${row.application.first_name} ${row.application.last_name}` : "—"}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (row: PaymentWithApplication) => (
        <span className="text-sm font-bold text-text-primary">
          {row.currency} {row.amount}
        </span>
      ),
    },
    {
      key: "payment_provider",
      header: "Provider",
      render: (row: PaymentWithApplication) => (
        <span className="text-sm capitalize">{row.payment_provider}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: PaymentWithApplication) => {
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
      key: "paid_at",
      header: "Date",
      render: (row: PaymentWithApplication) => (
        <span className="text-sm text-text-muted">
          {row.paid_at ? new Date(row.paid_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  // Calculate totals from current page data
  const payments = data?.data || [];
  const totalCollected = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const completedCount = payments.filter((p) => p.status === "completed").length;
  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const failedCount = payments.filter((p) => p.status === "failed").length;

  const handleExportCSV = () => {
    const headers = ["Transaction Ref", "Application Ref", "Applicant", "Amount", "Currency", "Provider", "Status", "Date"];
    const rows = payments.map((p) => [
      p.transaction_reference,
      p.application?.reference_number || "",
      p.application ? `${p.application.first_name} ${p.application.last_name}` : "",
      p.amount,
      p.currency,
      p.payment_provider,
      p.status,
      p.paid_at ? new Date(p.paid_at).toISOString() : "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell
      title="All Payments"
      description="View and manage all payment transactions"
      actions={
        <Button size="sm" variant="secondary" leftIcon={<Download size={14} />} onClick={handleExportCSV}>
          Export CSV
        </Button>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-success" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Total Collected</p>
              <p className="text-xl font-bold text-success">${totalCollected.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-info/10 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={20} className="text-info" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Completed</p>
              <p className="text-xl font-bold text-text-primary">{completedCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Pending</p>
              <p className="text-xl font-bold text-warning">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger/10 rounded-xl flex items-center justify-center">
              <XCircle size={20} className="text-danger" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Failed</p>
              <p className="text-xl font-bold text-danger">{failedCount}</p>
            </div>
          </div>
        </div>
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

      <DataTable<PaymentWithApplication>
        columns={columns}
        data={payments}
        currentPage={data?.current_page}
        lastPage={data?.last_page}
        onPageChange={setPage}
        loading={isLoading}
        emptyMessage="No payment records found."
      />
    </DashboardShell>
  );
}
