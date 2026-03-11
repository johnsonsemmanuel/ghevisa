"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { MetricsSkeleton } from "@/components/ui/skeleton";
import type {
  AgencyAdminMetrics,
  AgencyApplicantSummary,
  AgencyOfficerSummary,
  PaginatedResponse,
  Application,
} from "@/lib/types";
import {
  Users,
  Shield,
  FileText,
  FolderOpen,
  BarChart3,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";

export default function MfaAdminOverviewPage() {
  const router = useRouter();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["mfa-admin-overview"],
    queryFn: () => api.get<{ metrics: AgencyAdminMetrics }>("/mfa/admin/overview").then((r) => r.data.metrics),
    refetchInterval: 60_000,
  });

  const { data: topApplicants } = useQuery({
    queryKey: ["mfa-admin-applicants", 1],
    queryFn: () => api.get<PaginatedResponse<AgencyApplicantSummary>>("/mfa/admin/applicants", { params: { per_page: 5 } }).then((r) => r.data),
  });

  const { data: topOfficers } = useQuery({
    queryKey: ["mfa-admin-officers", 1],
    queryFn: () => api.get<PaginatedResponse<AgencyOfficerSummary>>("/mfa/admin/officers", { params: { per_page: 5 } }).then((r) => r.data),
  });

  const { data: recentApplications } = useQuery({
    queryKey: ["mfa-admin-applications", 1],
    queryFn: () =>
      api
        .get<PaginatedResponse<Application>>("/mfa/admin/applications", {
          params: { per_page: 5 },
        })
        .then((r) => r.data),
  });

  const metricCards = metrics
    ? [
        {
          label: "Total Applications",
          value: metrics.total_applications.toLocaleString(),
          icon: <LayoutDashboard size={20} className="text-info" />,
          className: "bg-info/5 border-info/20",
          helper: `Under Review: ${metrics.under_review} • Pending Approval: ${metrics.pending_approval}`,
        },
        {
          label: "Review Queue",
          value: metrics.review_queue.toLocaleString(),
          icon: <FolderOpen size={20} className="text-warning" />,
          className: "bg-warning/5 border-warning/20",
        },
        {
          label: "Approval Queue",
          value: metrics.approval_queue.toLocaleString(),
          icon: <CheckCircle2 size={20} className="text-success" />,
          className: "bg-success/5 border-success/20",
        },
        {
          label: "Active Officers",
          value: metrics.active_officers.toLocaleString(),
          icon: <Shield size={20} className="text-primary" />,
          className: "bg-primary/5 border-primary/20",
          helper: `Completed Payments: ${Number(metrics.completed_payments).toLocaleString()} GHS`,
        },
      ]
    : [];

  return (
    <DashboardShell
      title="MFA Admin Overview"
      description="Mission-level insights for escalated applications"
      actions={
        <Button leftIcon={<BarChart3 size={16} />} onClick={() => router.push("/dashboard/mfa/escalations")}>
          Escalation Inbox
        </Button>
      }
    >
      {metricsLoading || !metrics ? (
        <MetricsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
          {metricCards.map((card) => (
            <div key={card.label} className={`p-5 rounded-2xl border ${card.className} shadow-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center shadow-inner">
                  {card.icon}
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide">{card.label}</p>
                  <p className="text-2xl font-bold text-text-primary">{card.value}</p>
                </div>
              </div>
              {card.helper && <p className="text-xs text-text-muted">{card.helper}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="grid xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="text-base font-bold text-text-primary">Recent Escalations</h2>
              <p className="text-xs text-text-muted">Latest MFA-handled cases</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => router.push("/dashboard/mfa/admin/applications")}>
              View All <ArrowRight size={13} className="ml-1" />
            </Button>
          </div>
          <div className="divide-y divide-border">
            {!recentApplications?.data?.length ? (
              <p className="text-sm text-text-muted px-6 py-10 text-center">No applications yet.</p>
            ) : (
              recentApplications.data.map((application) => (
                <button
                  key={application.id}
                  className="w-full text-left px-6 py-4 hover:bg-surface/70 transition-colors flex items-center justify-between"
                  onClick={() => router.push(`/dashboard/mfa/escalations/${application.id}`)}
                >
                  <div>
                    <p className="font-semibold text-text-primary">{application.reference_number}</p>
                    <p className="text-xs text-text-muted">
                      {application.visa_type?.name ?? "Visa Application"} • {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={application.status} />
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="text-base font-bold text-text-primary">SLA Watchlist</h2>
              <p className="text-xs text-text-muted">Queues nearing breach</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => router.push("/dashboard/mfa/escalations")}>Review</Button>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div className="p-4 rounded-xl bg-danger/5 border border-danger/20">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-danger" />
                <div>
                  <p className="font-semibold text-text-primary">{metrics?.review_queue ?? 0} in Review Queue</p>
                  <p className="text-xs text-text-muted">Prioritize expiring SLAs</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-warning" />
                <div>
                  <p className="font-semibold text-text-primary">{metrics?.approval_queue ?? 0} pending approvals</p>
                  <p className="text-xs text-text-muted">Move ageing cases forward</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="text-base font-bold text-text-primary">Key Applicants</h2>
              <p className="text-xs text-text-muted">Applicants with escalated cases</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => router.push("/dashboard/mfa/admin/applicants")}>
              Manage
            </Button>
          </div>
          {!topApplicants?.data?.length ? (
            <p className="text-sm text-text-muted px-6 py-10 text-center">No applicants found.</p>
          ) : (
            <div className="divide-y divide-border">
              {topApplicants.data.map((applicant) => (
                <div key={applicant.id} className="px-6 py-4">
                  <p className="font-semibold text-text-primary">
                    {applicant.first_name} {applicant.last_name}
                  </p>
                  <p className="text-xs text-text-muted">{applicant.email}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {applicant.mfa_applications_count ?? 0} applications
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="text-base font-bold text-text-primary">Officer Performance</h2>
              <p className="text-xs text-text-muted">Mission-level workloads</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => router.push("/dashboard/mfa/admin/officers")}>
              Manage
            </Button>
          </div>
          {!topOfficers?.data?.length ? (
            <p className="text-sm text-text-muted px-6 py-10 text-center">No officers on record.</p>
          ) : (
            <div className="divide-y divide-border">
              {topOfficers.data.map((officer) => (
                <div key={officer.id} className="px-6 py-4">
                  <p className="font-semibold text-text-primary">
                    {officer.first_name} {officer.last_name}
                  </p>
                  <p className="text-xs text-text-muted">{officer.email}</p>
                  <p className="text-xs text-text-muted mt-1 capitalize">{officer.role.replace(/_/g, " ")}</p>
                  <p className="text-xs text-text-muted">Assigned cases: {officer.assigned_cases_count}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
