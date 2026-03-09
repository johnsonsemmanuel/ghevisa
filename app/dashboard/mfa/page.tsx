"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge, SlaIndicator } from "@/components/ui/badge";
import { MetricsSkeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronRight,
  Shield,
  FileCheck,
  BadgeCheck,
  Inbox,
} from "lucide-react";
import type { MfaMetrics, Application, PaginatedResponse } from "@/lib/types";

export default function MfaDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["mfa-metrics"],
    queryFn: () => api.get<MfaMetrics>("/mfa/metrics").then((r) => r.data),
    refetchInterval: 30000,
  });

  const { data: recentEscalations } = useQuery({
    queryKey: ["mfa-recent-escalations"],
    queryFn: () =>
      api.get<PaginatedResponse<Application>>("/mfa/escalations", { params: { page: 1, status: "approved" } }).then((r) => r.data),
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <DashboardShell
      title="MFA Dashboard"
      description="Ministry of Foreign Affairs — Escalation overview"
      actions={
        <Button
          leftIcon={<AlertTriangle size={16} />}
          onClick={() => router.push("/dashboard/mfa/escalations")}
        >
          Escalation Inbox
        </Button>
      }
    >
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent via-accent-light to-accent p-6 lg:p-8 mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-gold/15 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium mb-1">{greeting()},</p>
          <h2 className="text-white text-2xl font-bold mb-2">
            {user?.first_name || "Reviewer"} {user?.last_name || ""}
          </h2>
          <p className="text-white/70 text-sm max-w-md">
            Review and decide on cases escalated from GIS requiring diplomatic review.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <Button
              onClick={() => router.push("/dashboard/mfa/escalations")}
              leftIcon={<Shield size={15} />}
              className="!bg-white !text-accent hover:!bg-white/90 !shadow-lg !font-bold"
            >
              Open Inbox
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/mfa/escalations?queue=approval_queue")}
              className="!text-white/90 hover:!text-white hover:!bg-white/15"
            >
              Approval Queue <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      {isLoading ? (
        <MetricsSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-interactive group" onClick={() => router.push("/dashboard/mfa/escalations?queue=review_queue")}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-warning/8 flex items-center justify-center group-hover:bg-warning/12 transition-colors">
                <Clock size={20} className="text-warning" />
              </div>
              <ChevronRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-text-primary tracking-tight">{metrics?.pending_decision ?? 0}</p>
            <p className="text-xs text-text-muted font-medium mt-1">Pending Review</p>
          </div>

          <div className="card-interactive group" onClick={() => router.push("/dashboard/mfa/escalations?queue=approval_queue")}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-info/8 flex items-center justify-center group-hover:bg-info/12 transition-colors">
                <BadgeCheck size={20} className="text-info" />
              </div>
              <ChevronRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-text-primary tracking-tight">{metrics?.pending_approval ?? 0}</p>
            <p className="text-xs text-text-muted font-medium mt-1">Pending Approval</p>
          </div>

          <div className="card-interactive group" onClick={() => router.push("/dashboard/mfa/escalations")}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-success/8 flex items-center justify-center group-hover:bg-success/12 transition-colors">
                <CheckCircle2 size={20} className="text-success" />
              </div>
              <ChevronRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-text-primary tracking-tight">{metrics?.total_approved ?? 0}</p>
            <p className="text-xs text-text-muted font-medium mt-1">Approved / Issued</p>
            {(metrics?.approved_today ?? 0) > 0 && (
              <p className="text-xs text-success font-medium mt-0.5">+{metrics?.approved_today} today</p>
            )}
          </div>

          <div className="card-interactive group" onClick={() => router.push("/dashboard/mfa/escalations?status=denied")}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-danger/8 flex items-center justify-center group-hover:bg-danger/12 transition-colors">
                <XCircle size={20} className="text-danger" />
              </div>
              <ChevronRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-text-primary tracking-tight">{metrics?.denied_today ?? 0}</p>
            <p className="text-xs text-text-muted font-medium mt-1">Denied Today</p>
          </div>
        </div>
      )}

      {/* ── SLA Warning ── */}
      {metrics?.sla_breaches ? (
        <div className="card border-2 border-danger/20 bg-danger/5 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={24} className="text-danger" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-danger">
                {metrics.sla_breaches} SLA Breach{metrics.sla_breaches > 1 ? "es" : ""} Detected
              </p>
              <p className="text-sm text-text-muted">
                Some escalated cases have exceeded their SLA deadline. Immediate action required.
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => router.push("/dashboard/mfa/escalations")}>
              View <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      ) : null}

      {/* ── Recent Escalations ── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-text-primary">Approved Applications</h2>
            <p className="text-xs text-text-muted mt-0.5">Applications approved or issued via MFA</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/dashboard/mfa/escalations")}
          >
            View All <ArrowRight size={13} className="ml-1" />
          </Button>
        </div>

        {!recentEscalations?.data?.length ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Inbox size={24} className="text-text-muted" />
            </div>
            <p className="text-text-primary font-semibold mb-1">No approved applications yet</p>
            <p className="text-sm text-text-muted mb-6 max-w-xs mx-auto">
              Approved applications will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentEscalations.data.slice(0, 6).map((app) => {
              const hoursLeft = app.sla_deadline
                ? Math.max(0, (new Date(app.sla_deadline).getTime() - Date.now()) / 3600000)
                : null;
              const isUrgent = hoursLeft !== null && hoursLeft < 12;

              return (
                <div
                  key={app.id}
                  className={`flex items-center gap-4 px-6 py-3.5 hover:bg-surface/60 transition-colors cursor-pointer group ${isUrgent ? "bg-danger/3" : ""}`}
                  onClick={() => router.push(`/dashboard/mfa/escalations/${app.id}`)}
                >
                  <div className={`w-9 h-9 rounded-lg ${isUrgent ? "bg-danger/10" : "bg-warning/10"} flex items-center justify-center shrink-0`}>
                    {isUrgent ? (
                      <AlertTriangle size={16} className="text-danger" />
                    ) : (
                      <FileCheck size={16} className="text-warning" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{app.reference_number}</p>
                    <p className="text-xs text-text-muted truncate">
                      {app.visa_type?.name || "Visa Application"} {app.nationality ? `\u2022 ${app.nationality}` : ""}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <StatusBadge status={app.status} />
                    {hoursLeft !== null && (
                      <SlaIndicator hoursLeft={hoursLeft} isWithinSla={hoursLeft > 0} />
                    )}
                  </div>
                  <ChevronRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
        Quick Actions
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        <button
          onClick={() => router.push("/dashboard/mfa/escalations?queue=review_queue")}
          className="card hover:border-accent/30 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <FileCheck size={20} className="text-warning" />
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">Review Queue</p>
              <p className="text-xs text-text-muted">{metrics?.review_queue ?? 0} cases to review</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => router.push("/dashboard/mfa/escalations?queue=approval_queue")}
          className="card hover:border-accent/30 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
              <BadgeCheck size={20} className="text-info" />
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">Approval Queue</p>
              <p className="text-xs text-text-muted">{metrics?.approval_queue ?? 0} pending approval</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => router.push("/dashboard/mfa/escalations?status=approved")}
          className="card hover:border-accent/30 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={20} className="text-success" />
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">Approved Applications</p>
              <p className="text-xs text-text-muted">{metrics?.total_approved ?? 0} approved</p>
            </div>
          </div>
        </button>
      </div>
    </DashboardShell>
  );
}
