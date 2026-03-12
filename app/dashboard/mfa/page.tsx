"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge, SlaIndicator } from "@/components/ui/display/badge";
import { MetricsSkeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/display/card";
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
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-accent via-accent-light to-accent p-5 lg:p-6 mb-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-gold/15 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-white/80 text-xs font-medium mb-0.5">{greeting()},</p>
          <h2 className="text-white text-xl font-bold mb-1.5">
            {user?.first_name || "Reviewer"} {user?.last_name || ""}
          </h2>
          <p className="text-white/70 text-xs max-w-md leading-relaxed">
            Review and decide on cases escalated from GIS requiring diplomatic review.
          </p>
          <div className="flex items-center gap-2.5 mt-4">
            <Button
              onClick={() => router.push("/dashboard/mfa/escalations")}
              leftIcon={<Shield size={14} />}
              className="!bg-white !text-accent hover:!bg-white/90 !shadow-lg !font-semibold !text-sm !py-2 !px-4"
            >
              Open Inbox
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/mfa/escalations?queue=approval_queue")}
              className="!text-white/90 hover:!text-white hover:!bg-white/15 !text-sm !py-2 !px-3"
            >
              Approval Queue <ArrowRight size={13} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      {isLoading ? (
        <MetricsSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card variant="interactive" size="sm" onClick={() => router.push("/dashboard/mfa/escalations?queue=review_queue")}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-warning/8 flex items-center justify-center group-hover:bg-warning/12 transition-colors">
                <Clock size={20} className="text-warning" />
              </div>
              <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xl font-bold text-text-primary tracking-tight">{metrics?.pending_decision ?? 0}</p>
            <p className="text-[10px] text-text-muted font-medium mt-1 uppercase tracking-wide">Pending Review</p>
          </Card>

          <Card variant="interactive" size="sm" onClick={() => router.push("/dashboard/mfa/escalations?queue=approval_queue")}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-info/8 flex items-center justify-center group-hover:bg-info/12 transition-colors">
                <BadgeCheck size={20} className="text-info" />
              </div>
              <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xl font-bold text-text-primary tracking-tight">{metrics?.pending_approval ?? 0}</p>
            <p className="text-[10px] text-text-muted font-medium mt-1 uppercase tracking-wide">Pending Approval</p>
          </Card>

          <Card variant="interactive" size="sm" onClick={() => router.push("/dashboard/mfa/escalations")}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-success/8 flex items-center justify-center group-hover:bg-success/12 transition-colors">
                <CheckCircle2 size={20} className="text-success" />
              </div>
              <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xl font-bold text-text-primary tracking-tight">{metrics?.total_approved ?? 0}</p>
            <p className="text-[10px] text-text-muted font-medium mt-1 uppercase tracking-wide">Approved / Issued</p>
            {(metrics?.approved_today ?? 0) > 0 && (
              <p className="text-[10px] text-success font-medium mt-0.5">+{metrics?.approved_today} today</p>
            )}
          </Card>

          <Card variant="interactive" size="sm" onClick={() => router.push("/dashboard/mfa/escalations?status=denied")}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-danger/8 flex items-center justify-center group-hover:bg-danger/12 transition-colors">
                <XCircle size={20} className="text-danger" />
              </div>
              <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xl font-bold text-text-primary tracking-tight">{metrics?.denied_today ?? 0}</p>
            <p className="text-[10px] text-text-muted font-medium mt-1 uppercase tracking-wide">Denied Today</p>
          </Card>
        </div>
      )}

      {/* ── SLA Warning ── */}
      {metrics?.sla_breaches ? (
        <Card className="border-2 border-danger/20 bg-danger/5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-danger" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-danger text-sm">
                {metrics.sla_breaches} SLA Breach{metrics.sla_breaches > 1 ? "es" : ""} Detected
              </p>
              <p className="text-xs text-text-muted">
                Some escalated cases have exceeded their SLA deadline. Immediate action required.
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => router.push("/dashboard/mfa/escalations")} className="!text-xs !py-1.5 !px-3">
              View <ArrowRight size={12} className="ml-1" />
            </Button>
          </div>
        </Card>
      ) : null}

      {/* ── Recent Escalations ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm mb-6">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div>
            <h2 className="text-sm font-bold text-text-primary">Approved Applications</h2>
            <p className="text-[10px] text-text-muted mt-0.5">Applications approved or issued via MFA</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/dashboard/mfa/escalations")}
            className="!text-xs !py-1.5 !px-3"
          >
            View All <ArrowRight size={12} className="ml-1" />
          </Button>
        </div>

        {!recentEscalations?.data?.length ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center mx-auto mb-3">
              <Inbox size={20} className="text-text-muted" />
            </div>
            <p className="text-text-primary font-semibold text-sm mb-1">No approved applications yet</p>
            <p className="text-xs text-text-muted mb-5 max-w-xs mx-auto">
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
                  className={`flex items-center gap-3 px-5 py-3 hover:bg-surface/60 transition-colors cursor-pointer group ${isUrgent ? "bg-danger/3" : ""}`}
                  onClick={() => router.push(`/dashboard/mfa/escalations/${app.id}`)}
                >
                  <div className={`w-8 h-8 rounded-lg ${isUrgent ? "bg-danger/10" : "bg-warning/10"} flex items-center justify-center shrink-0`}>
                    {isUrgent ? (
                      <AlertTriangle size={14} className="text-danger" />
                    ) : (
                      <FileCheck size={14} className="text-warning" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">{app.reference_number}</p>
                    <p className="text-[10px] text-text-muted truncate">
                      {app.visa_type?.name || "Visa Application"} {app.nationality ? `• ${app.nationality}` : ""}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <StatusBadge status={app.status} />
                    {hoursLeft !== null && (
                      <SlaIndicator hoursLeft={hoursLeft} isWithinSla={hoursLeft > 0} />
                    )}
                  </div>
                  <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2.5">
        Quick Actions
      </h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <Card
          variant="interactive"
          size="sm"
          onClick={() => router.push("/dashboard/mfa/escalations?queue=review_queue")}
          className="hover:border-accent/30 text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
              <FileCheck size={16} className="text-warning" />
            </div>
            <div>
              <p className="font-semibold text-text-primary text-xs">Review Queue</p>
              <p className="text-[10px] text-text-muted">{metrics?.review_queue ?? 0} cases to review</p>
            </div>
          </div>
        </Card>
        <Card
          variant="interactive"
          size="sm"
          onClick={() => router.push("/dashboard/mfa/escalations?queue=approval_queue")}
          className="hover:border-accent/30 text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center">
              <BadgeCheck size={16} className="text-info" />
            </div>
            <div>
              <p className="font-semibold text-text-primary text-xs">Approval Queue</p>
              <p className="text-[10px] text-text-muted">{metrics?.approval_queue ?? 0} pending approval</p>
            </div>
          </div>
        </Card>
        <Card
          variant="interactive"
          size="sm"
          onClick={() => router.push("/dashboard/mfa/escalations?status=approved")}
          className="hover:border-accent/30 text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={16} className="text-success" />
            </div>
            <div>
              <p className="font-semibold text-text-primary text-xs">Approved Applications</p>
              <p className="text-[10px] text-text-muted">{metrics?.total_approved ?? 0} approved</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
