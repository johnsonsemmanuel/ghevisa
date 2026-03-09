"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Calendar,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface FinancialData {
  period: { start: string; end: string };
  total_revenue: number;
  currency: string;
  revenue_by_method: Array<{ payment_option: string; total: number; count: number }>;
  revenue_by_day: Array<{ date: string; total: number; count: number }>;
  revenue_by_visa_type: Array<{ name: string; total: number; count: number }>;
  transaction_stats: {
    total_transactions: number;
    successful: number;
    pending: number;
    failed: number;
  };
}

export default function FinancialReportsPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["financial-reports", startDate, endDate],
    queryFn: () =>
      api.get<FinancialData>("/admin/analytics/financial", {
        params: { start_date: startDate, end_date: endDate },
      }).then((r) => r.data),
  });

  const handleExport = async () => {
    try {
      const response = await api.get("/admin/analytics/financial/export", {
        params: { start_date: startDate, end_date: endDate },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `financial_report_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case "card":
        return <CreditCard size={16} />;
      case "momo":
      case "mtn":
      case "vodafone":
      case "airteltigo":
        return <DollarSign size={16} />;
      default:
        return <DollarSign size={16} />;
    }
  };

  return (
    <DashboardShell
      title="Financial Reports"
      description="Revenue analytics and payment insights"
    >
      {/* Date Filter */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-text-muted" />
            <span className="text-sm font-medium text-text-secondary">Period:</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          />
          <span className="text-text-muted">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          />
          <Button onClick={() => refetch()} size="sm">
            Apply
          </Button>
          <Button onClick={handleExport} variant="secondary" size="sm">
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-accent to-accent/80 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
                <ArrowUpRight size={20} className="opacity-60" />
              </div>
              <p className="text-sm opacity-80 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(data.total_revenue)}</p>
            </div>

            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <TrendingUp size={20} className="text-success" />
                </div>
              </div>
              <p className="text-sm text-text-muted mb-1">Successful Transactions</p>
              <p className="text-2xl font-bold text-text-primary">
                {data.transaction_stats.successful.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <CreditCard size={20} className="text-warning" />
                </div>
              </div>
              <p className="text-sm text-text-muted mb-1">Pending</p>
              <p className="text-2xl font-bold text-text-primary">
                {data.transaction_stats.pending.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center">
                  <ArrowDownRight size={20} className="text-danger" />
                </div>
              </div>
              <p className="text-sm text-text-muted mb-1">Failed</p>
              <p className="text-2xl font-bold text-text-primary">
                {data.transaction_stats.failed.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue by Payment Method */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <PieChart size={20} className="text-primary" />
                <h3 className="font-semibold text-text-primary">Revenue by Payment Method</h3>
              </div>
              <div className="space-y-3">
                {data.revenue_by_method.map((method, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        {getPaymentMethodIcon(method.payment_option)}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary capitalize">
                          {method.payment_option || "Other"}
                        </p>
                        <p className="text-xs text-text-muted">{method.count} transactions</p>
                      </div>
                    </div>
                    <p className="font-semibold text-accent">{formatCurrency(method.total)}</p>
                  </div>
                ))}
                {data.revenue_by_method.length === 0 && (
                  <p className="text-center text-text-muted py-4">No transactions in this period</p>
                )}
              </div>
            </div>

            {/* Revenue by Visa Type */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={20} className="text-primary" />
                <h3 className="font-semibold text-text-primary">Revenue by Visa Type</h3>
              </div>
              <div className="space-y-3">
                {data.revenue_by_visa_type.map((type, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">{type.name}</p>
                      <p className="text-xs text-text-muted">{type.count} applications</p>
                    </div>
                    <p className="font-semibold text-accent">{formatCurrency(type.total)}</p>
                  </div>
                ))}
                {data.revenue_by_visa_type.length === 0 && (
                  <p className="text-center text-text-muted py-4">No revenue data in this period</p>
                )}
              </div>
            </div>
          </div>

          {/* Daily Revenue Table */}
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={20} className="text-primary" />
              <h3 className="font-semibold text-text-primary">Daily Revenue Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-text-secondary">Date</th>
                    <th className="text-right py-3 px-4 font-semibold text-text-secondary">Transactions</th>
                    <th className="text-right py-3 px-4 font-semibold text-text-secondary">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.revenue_by_day.map((day, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-surface/50">
                      <td className="py-3 px-4 text-text-primary">
                        {new Date(day.date).toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 text-right text-text-secondary">{day.count}</td>
                      <td className="py-3 px-4 text-right font-semibold text-accent">
                        {formatCurrency(day.total)}
                      </td>
                    </tr>
                  ))}
                  {data.revenue_by_day.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-text-muted">
                        No transactions in this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-text-muted">Failed to load financial data</div>
      )}
    </DashboardShell>
  );
}
