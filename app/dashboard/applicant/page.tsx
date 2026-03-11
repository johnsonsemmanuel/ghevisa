"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { MetricsSkeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Plus, FileText, Clock, CheckCircle2, AlertCircle, HelpCircle,
  ArrowRight, Plane, ChevronRight, Inbox, X, TrendingUp,
} from "lucide-react";
import type { Application, PaginatedResponse } from "@/lib/types";


export default function ApplicantDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [showCongrats, setShowCongrats] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["applicant-applications"],
    queryFn: () =>
      api
        .get<PaginatedResponse<Application>>("/applicant/applications")
        .then((r) => r.data),
  });

  const apps = data?.data || [];
  const draft = apps.filter((a) => a.status === "draft").length;
  const pending = apps.filter((a) =>
    ["submitted_awaiting_payment", "pending_payment", "paid_submitted", "submitted", "under_review", "pending_approval", "escalated", "appealed"].includes(a.status)
  ).length;
  const approved = apps.filter((a) => ["approved", "issued"].includes(a.status)).length;
  const needsAction = apps.filter((a) =>
    ["additional_info_requested", "submitted_awaiting_payment", "pending_payment", "denied", "revoked", "expired"].includes(a.status)
  ).length;

  // Check if popup should be shown (only once per session)
  useEffect(() => {
    if (!isLoading && apps.some(a => ["approved", "issued"].includes(a.status))) {
      const hasSeenPopup = localStorage.getItem('congrats-popup-shown');
      if (!hasSeenPopup) {
        setShowCongrats(true);
        localStorage.setItem('congrats-popup-shown', 'true');
      }
    }
  }, [isLoading, apps]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <DashboardShell
      title="My Dashboard"
      description="Overview of your visa applications"
      actions={
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => router.push("/dashboard/applicant/applications/new")}
        >
          New Application
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
            {user?.first_name || "Applicant"} {user?.last_name || ""}
          </h2>
          <p className="text-white/70 text-xs max-w-md leading-relaxed">
            Track your visa applications, upload documents, and manage your travel to Ghana.
          </p>
          <div className="flex items-center gap-2.5 mt-4">
            <Button
              onClick={() => router.push("/dashboard/applicant/applications/new")}
              leftIcon={<Plane size={14} />}
              className="!bg-white !text-accent hover:!bg-white/90 !shadow-lg !font-semibold !text-sm !py-2 !px-4"
            >
              Start Application
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/applicant/applications")}
              className="!text-white/90 hover:!text-white hover:!bg-white/15 !text-sm !py-2 !px-3"
            >
              View All <ArrowRight size={13} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Denied Applications Support Banner ── */}
      {!isLoading && apps.some(a => a.status === "denied") && (
        <div className="rounded-lg bg-gradient-to-r from-danger/10 via-danger/5 to-rose-50/5 border border-danger/20 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-danger" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">Need Assistance?</h3>
              <p className="text-xs text-text-secondary">One or more applications were denied. Our support team can help.</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/dashboard/applicant/support")}
            leftIcon={<HelpCircle size={14} />}
            className="!text-xs"
          >
            Talk to Support
          </Button>
        </div>
      )}

      {/* ── Metric Cards ── */}
      {isLoading ? (
        <MetricsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Drafts */}
          <Card
            variant="interactive"
            onClick={() => router.push("/dashboard/applicant/applications")}
            className="hover:border-info/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-info/8 flex items-center justify-center">
                <FileText size={20} className="text-info" />
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-text-primary">{draft}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wide">Drafts</p>
              </div>
            </div>
            <h3 className="font-semibold text-text-primary text-sm mb-1">Saved Drafts</h3>
            <p className="text-xs text-text-secondary mb-3">Not yet submitted</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted">View details</span>
              <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Card>

          {/* In Progress */}
          <Card
            variant="interactive"
            onClick={() => router.push("/dashboard/applicant/applications")}
            className="hover:border-warning/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-warning/8 flex items-center justify-center">
                <TrendingUp size={20} className="text-warning" />
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-text-primary">{pending}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wide">Processing</p>
              </div>
            </div>
            <h3 className="font-semibold text-text-primary text-sm mb-1">In Progress</h3>
            <p className="text-xs text-text-secondary mb-3">Currently processing</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted">View details</span>
              <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Card>

          {/* Approved / Issued */}
          <Card
            variant="interactive"
            onClick={() => router.push("/dashboard/applicant/applications")}
            className="hover:border-success/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-success/8 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-success" />
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-text-primary">{approved}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wide">Approved</p>
              </div>
            </div>
            <h3 className="font-semibold text-text-primary text-sm mb-1">Approved</h3>
            <p className="text-xs text-text-secondary mb-3">Ready to download</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted">View details</span>
              <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Card>

          {/* Needs Action */}
          <Card
            variant="interactive"
            onClick={() => router.push("/dashboard/applicant/applications")}
            className="hover:border-danger/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-danger/8 flex items-center justify-center">
                <AlertCircle size={20} className="text-danger" />
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-text-primary">{needsAction}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wide">Action</p>
              </div>
            </div>
            <h3 className="font-semibold text-text-primary text-sm mb-1">Needs Action</h3>
            <p className="text-xs text-text-secondary mb-3">Requires attention</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted">View details</span>
              <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Card>
        </div>
      )}

      {/* ── Congratulations Popup (for approved/issued apps) ── */}
      {!isLoading && apps.some(a => ["approved", "issued"].includes(a.status)) && showCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCongrats(false)} />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setShowCongrats(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-surface/50 transition-colors"
              aria-label="Close congratulations message"
            >
              <X size={20} className="text-text-muted" />
            </button>

            {/* Content */}
            <div className="p-6 text-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle2 size={40} className="text-white" />
              </div>

              {/* Message */}
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                🎉 Congratulations!
              </h3>
              <p className="text-lg text-text-secondary mb-6">
                Your Recent Application Has Been Approved!
              </p>

              {/* Description */}
              <p className="text-text-muted mb-8 leading-relaxed">
                Your electronic visa is ready. View and download your eVisa to present upon arrival at any port of entry in Ghana.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <Button
                  variant="secondary"
                  onClick={() => setShowCongrats(false)}
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={() => {
                    router.push("/dashboard/applicant/applications");
                    setShowCongrats(false);
                  }}
                  className="bg-accent hover:bg-accent-dark shadow-lg"
                >
                  View eVisa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent Applications ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div>
            <h2 className="text-sm font-bold text-text-primary">Recent Applications</h2>
            <p className="text-[10px] text-text-muted mt-0.5">Your latest visa activity</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/dashboard/applicant/applications")}
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
        ) : apps.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center mx-auto mb-3">
              <Inbox size={20} className="text-text-muted" />
            </div>
            <p className="text-text-primary font-semibold text-sm mb-1">No applications yet</p>
            <p className="text-xs text-text-muted mb-5 max-w-xs mx-auto">
              Begin your journey — apply for a Ghana eVisa in minutes.
            </p>
            <Button
              leftIcon={<Plus size={14} />}
              onClick={() => router.push("/dashboard/applicant/applications/new")}
              size="sm"
            >
              Start Application
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {apps.slice(0, 6).map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-surface/60 transition-colors cursor-pointer group"
                onClick={() => router.push(`/dashboard/applicant/applications/${app.id}`)}
              >
                <div className="w-8 h-8 rounded-lg bg-accent/8 flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">{app.reference_number}</p>
                  <p className="text-[10px] text-text-muted truncate">{app.visa_type?.name || "Visa Application"}</p>
                </div>
                <div className="hidden sm:block shrink-0">
                  <StatusBadge status={app.status} />
                </div>
                <span className="text-[10px] text-text-muted shrink-0 hidden md:block">
                  {new Date(app.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
                <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
