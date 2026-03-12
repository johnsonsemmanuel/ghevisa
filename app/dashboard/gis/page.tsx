"use client";

import { useState } from "react";
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
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  FileCheck,
  Inbox,
  Shield,
  TrendingUp,
  BarChart3,
  FileText,
  AlertCircle,
  BadgeCheck,
} from "lucide-react";
import type { GisMetrics, Application } from "@/lib/types";

export default function GisDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["gis-metrics"],
    queryFn: () => api.get<GisMetrics>("/gis/metrics").then((r) => r.data),
    refetchInterval: 30000,
  });

  const { data: recentCases } = useQuery({
    queryKey: ["gis-recent-cases"],
    queryFn: () =>
      api.get<{ data: Application[] }>("/gis/cases", { params: { per_page: 6 } }).then((r) => r.data),
    refetchInterval: 60000,
  });

  const { data: areaData, isLoading: areaLoading } = useQuery({
    queryKey: ["gis-area-data", selectedArea],
    queryFn: async () => {
      if (!selectedArea) return null;
      if (selectedArea === "review_queue") {
        return api.get("/gis/cases?queue=review_queue&per_page=10").then(r => r.data);
      } else if (selectedArea === "approval_queue") {
        return api.get("/gis/cases?queue=approval_queue&per_page=10").then(r => r.data);
      } else if (selectedArea === "all_cases") {
        return api.get("/gis/cases?per_page=10").then(r => r.data);
      } else if (selectedArea === "sla_alerts") {
        return api.get("/gis/cases?sla_breached=true&per_page=10").then(r => r.data);
      }
      return null;
    },
    enabled: !!selectedArea,
    refetchInterval: 30000,
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <DashboardShell
      title="GIS Dashboard"
      description="Ghana Immigration Service — Case overview"
      actions={
        <Button
          leftIcon={<FolderOpen size={16} />}
          onClick={() => router.push("/dashboard/gis/cases")}
        >
          Case Queue
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
            {user?.first_name || "Officer"} {user?.last_name || ""}
          </h2>
          <p className="text-white/70 text-xs max-w-md leading-relaxed">
            Review and process visa applications assigned to the Ghana Immigration Service.
          </p>
          <div className="flex items-center gap-2.5 mt-4">
            <Button
              onClick={() => router.push("/dashboard/gis/cases?queue=review_queue")}
              leftIcon={<FolderOpen size={14} />}
              className="!bg-white !text-accent hover:!bg-white/90 !shadow-lg !font-semibold !text-sm !py-2 !px-4"
            >
              Review Queue
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/gis/cases")}
              className="!text-white/90 hover:!text-white hover:!bg-white/15 !text-sm !py-2 !px-3"
            >
              All Cases <ArrowRight size={13} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Area Selection Cards (aligned with applicant dashboard card style) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Review Queue (New / Draft-equivalent) */}
        <Card 
          variant="interactive"
          className={`${
            selectedArea === "review_queue" 
              ? "ring-2 ring-info bg-info/5 border-info" 
              : "hover:border-info/30"
          }`}
          onClick={() => setSelectedArea(selectedArea === "review_queue" ? null : "review_queue")}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-info/8 flex items-center justify-center">
              <FileText size={20} className="text-info" />
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-text-primary">{metrics?.review_queue ?? 0}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Cases</p>
            </div>
          </div>
          <h3 className="font-semibold text-text-primary text-sm mb-1">Assigned Cases</h3>
          <p className="text-xs text-text-secondary mb-3">Waiting for initial GIS review.</p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted">
              {selectedArea === "review_queue" ? "Click to hide details" : "Click to view details"}
            </span>
            <ChevronRight size={14} className={`text-text-muted transition-transform ${selectedArea === "review_queue" ? "rotate-90" : ""}`} />
          </div>
        </Card>

        {/* In Progress (Review + Approval) */}
        <Card 
          variant="interactive"
          className={`${
            selectedArea === "approval_queue" 
              ? "ring-2 ring-warning bg-warning/5 border-warning" 
              : "hover:border-warning/30"
          }`}
          onClick={() => setSelectedArea(selectedArea === "approval_queue" ? null : "approval_queue")}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/8 flex items-center justify-center">
              <TrendingUp size={20} className="text-warning" />
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-text-primary">{metrics?.approval_queue ?? 0}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Processing</p>
            </div>
          </div>
          <h3 className="font-semibold text-text-primary text-sm mb-1">In Progress</h3>
          <p className="text-xs text-text-secondary mb-3">Cases in review / approval queues.</p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted">
              {selectedArea === "approval_queue" ? "Click to hide details" : "Click to view details"}
            </span>
            <ChevronRight size={14} className={`text-text-muted transition-transform ${selectedArea === "approval_queue" ? "rotate-90" : ""}`} />
          </div>
        </Card>

        {/* Approved / Completed */}
        <Card 
          variant="interactive"
          className={`${
            selectedArea === "all_cases" 
              ? "ring-2 ring-success bg-success/5 border-success" 
              : "hover:border-success/30"
          }`}
          onClick={() => setSelectedArea(selectedArea === "all_cases" ? null : "all_cases")}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/8 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-success" />
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-text-primary">{metrics?.pending_review ?? 0}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Resolved</p>
            </div>
          </div>
          <h3 className="font-semibold text-text-primary text-sm mb-1">Completed</h3>
          <p className="text-xs text-text-secondary mb-3">Total cases cleared by GIS.</p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted">
              {selectedArea === "all_cases" ? "Click to hide details" : "Click to view details"}
            </span>
            <ChevronRight size={14} className={`text-text-muted transition-transform ${selectedArea === "all_cases" ? "rotate-90" : ""}`} />
          </div>
        </Card>

        {/* Needs Action / SLA Alerts */}
        <Card 
          variant="interactive"
          className={`${
            selectedArea === "sla_alerts" 
              ? "ring-2 ring-danger bg-danger/5 border-danger" 
              : "hover:border-danger/30"
          }`}
          onClick={() => setSelectedArea(selectedArea === "sla_alerts" ? null : "sla_alerts")}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-danger/8 flex items-center justify-center">
              <AlertCircle size={20} className="text-danger" />
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-text-primary">{metrics?.sla_breaches ?? 0}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Action</p>
            </div>
          </div>
          <h3 className="font-semibold text-text-primary text-sm mb-1">Needs Action</h3>
          <p className="text-xs text-text-secondary mb-3">Cases breaching SLA or urgent.</p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted">
              {selectedArea === "sla_alerts" ? "Click to hide details" : "Click to view details"}
            </span>
            <ChevronRight size={14} className={`text-text-muted transition-transform ${selectedArea === "sla_alerts" ? "rotate-90" : ""}`} />
          </div>
        </Card>
      </div>

      {/* ── Area Details ── */}
      {selectedArea && (
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div>
              <h2 className="text-sm font-bold text-text-primary">
                {selectedArea === "review_queue" && "Review Queue Details"}
                {selectedArea === "approval_queue" && "Approval Queue Details"}
                {selectedArea === "all_cases" && "All Cases"}
                {selectedArea === "sla_alerts" && "SLA Alerts"}
              </h2>
              <p className="text-[10px] text-text-muted mt-0.5">
                {selectedArea === "review_queue" && "Applications waiting for initial review"}
                {selectedArea === "approval_queue" && "Applications ready for final approval"}
                {selectedArea === "all_cases" && "Complete overview of all applications"}
                {selectedArea === "sla_alerts" && "Applications requiring urgent attention"}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/dashboard/gis/cases${selectedArea === "review_queue" ? "?queue=review_queue" : selectedArea === "approval_queue" ? "?queue=approval_queue" : selectedArea === "sla_alerts" ? "?sla_breached=true" : ""}`)}
              className="!text-xs !py-1.5 !px-3"
            >
              View All <ArrowRight size={12} className="ml-1" />
            </Button>
          </div>

          {areaLoading ? (
            <div className="p-5 space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-surface animate-pulse rounded-lg" />
              ))}
            </div>
          ) : !areaData?.data?.length ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center mx-auto mb-3">
                <Inbox size={20} className="text-text-muted" />
              </div>
              <p className="text-text-primary font-semibold text-sm mb-1">No cases found</p>
              <p className="text-xs text-text-muted mb-5 max-w-xs mx-auto">
                {selectedArea === "review_queue" && "No applications in review queue"}
                {selectedArea === "approval_queue" && "No applications pending approval"}
                {selectedArea === "all_cases" && "No applications found"}
                {selectedArea === "sla_alerts" && "No SLA breaches found"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {areaData.data.map((app: Application) => {
                const hoursLeft = app.sla_deadline
                  ? Math.max(0, (new Date(app.sla_deadline).getTime() - Date.now()) / 3600000)
                  : null;
                const isUrgent = hoursLeft !== null && hoursLeft < 12;

                return (
                  <div
                    key={app.id}
                    className={`flex items-center gap-3 px-5 py-3 hover:bg-surface/60 transition-colors cursor-pointer group ${isUrgent ? "bg-danger/3" : ""}`}
                    onClick={() => router.push(`/dashboard/gis/cases/${app.id}`)}
                  >
                    <div className={`w-8 h-8 rounded-lg ${isUrgent ? "bg-danger/10" : "bg-info/10"} flex items-center justify-center shrink-0`}>
                      {isUrgent ? (
                        <AlertTriangle size={16} className="text-danger" />
                      ) : (
                        <FileCheck size={16} className="text-info" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-text-primary truncate">{app.reference_number}</p>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-text-muted">
                        <span>{app.visa_type?.name}</span>
                        {app.assigned_officer && (
                          <span>{app.assigned_officer.first_name} {app.assigned_officer.last_name}</span>
                        )}
                        {app.current_queue && (
                          <span className="px-1.5 py-0.5 rounded-full bg-surface text-[9px]">
                            {app.current_queue.replace('_', ' ')}
                          </span>
                        )}
                        {hoursLeft !== null && (
                          <SlaIndicator hoursLeft={hoursLeft} isWithinSla={hoursLeft > 0} />
                        )}
                      </div>
                      {app.purpose_of_visit && (
                        <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2">{app.purpose_of_visit}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Recent Cases (shown when no area selected) ── */}
      {!selectedArea && (
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div>
              <h2 className="text-sm font-bold text-text-primary">Recent Cases</h2>
              <p className="text-[10px] text-text-muted mt-0.5">Latest applications in your queue</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push("/dashboard/gis/cases")}
              className="!text-xs !py-1.5 !px-3"
            >
              View All <ArrowRight size={12} className="ml-1" />
            </Button>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-surface animate-pulse rounded-lg" />
              ))}
            </div>
          ) : !recentCases?.data?.length ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center mx-auto mb-3">
                <Inbox size={20} className="text-text-muted" />
              </div>
              <p className="text-text-primary font-semibold text-sm mb-1">No cases yet</p>
              <p className="text-xs text-text-muted mb-5 max-w-xs mx-auto">
                Applications assigned to GIS will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentCases.data.slice(0, 6).map((app: Application) => {
                const hoursLeft = app.sla_deadline
                  ? Math.max(0, (new Date(app.sla_deadline).getTime() - Date.now()) / 3600000)
                  : null;
                const isUrgent = hoursLeft !== null && hoursLeft < 12;

                return (
                  <div
                    key={app.id}
                    className={`flex items-center gap-3 px-5 py-3 hover:bg-surface/60 transition-colors cursor-pointer group ${isUrgent ? "bg-danger/3" : ""}`}
                    onClick={() => router.push(`/dashboard/gis/cases/${app.id}`)}
                  >
                    <div className={`w-8 h-8 rounded-lg ${isUrgent ? "bg-danger/10" : "bg-info/10"} flex items-center justify-center shrink-0`}>
                      {isUrgent ? (
                        <AlertTriangle size={14} className="text-danger" />
                      ) : (
                        <FileCheck size={14} className="text-info" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-medium text-text-primary truncate">{app.reference_number}</p>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-text-muted">
                        <span>{app.visa_type?.name}</span>
                        {app.assigned_officer && (
                          <span>{app.assigned_officer.first_name} {app.assigned_officer.last_name}</span>
                        )}
                        {hoursLeft !== null && (
                          <SlaIndicator hoursLeft={hoursLeft} isWithinSla={hoursLeft > 0} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="mt-6">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2.5">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Card
            variant="interactive"
            size="sm"
            onClick={() => router.push("/dashboard/gis/cases?queue=review_queue")}
            className="hover:border-accent/30 text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center">
                <FolderOpen size={16} className="text-info" />
              </div>
              <div>
                <p className="font-semibold text-text-primary text-xs">Review Queue</p>
                <p className="text-[10px] text-text-muted">{metrics?.review_queue ?? 0} cases awaiting review</p>
              </div>
            </div>
          </Card>
          <Card
            variant="interactive"
            size="sm"
            onClick={() => router.push("/dashboard/gis/cases?queue=approval_queue")}
            className="hover:border-accent/30 text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                <BadgeCheck size={16} className="text-warning" />
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
            onClick={() => router.push("/dashboard/gis/sla-alerts")}
            className="hover:border-accent/30 text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-danger/10 rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-danger" />
              </div>
              <div>
                <p className="font-semibold text-text-primary text-xs">SLA Alerts</p>
                <p className="text-[10px] text-text-muted">{metrics?.sla_breaches ?? 0} breaches detected</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
