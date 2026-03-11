"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge, SlaIndicator } from "@/components/ui/badge";

import { Timeline } from "@/components/ui/timeline";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/input";
import { CardSkeleton } from "@/components/ui/skeleton";
import { ReasonCodeSelector } from "@/components/ui/reason-code-selector";
import { MultiReasonSelector } from "@/components/ui/multi-reason-selector";
import {
  ArrowLeft,
  UserCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
  User,
  Plane,
  Clock,
  MessageSquare,
  CreditCard,
  Eye,
  Send,
  ShieldCheck,
  Shield,
} from "lucide-react";
import { DocumentPreview } from "@/components/ui/document-preview";
import { RiskPanel } from "@/components/ui/risk-panel";
import { RiskScoreCard } from "@/components/ui/risk-score-card";
import { RiskGuidance } from "@/components/ui/risk-guidance";
import { RiskOverridePanel } from "@/components/ui/risk-override-panel";
import toast from "react-hot-toast";
import type { Application, ReasonCode } from "@/lib/types";

export default function MfaEscalationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [approveOpen, setApproveOpen] = useState(false);
  const [denyOpen, setDenyOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [requestInfoOpen, setRequestInfoOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedReasonCode, setSelectedReasonCode] = useState<string | null>(null);
  const [selectedReasonCodes, setSelectedReasonCodes] = useState<string[]>([]);
  const [reasonCodes, setReasonCodes] = useState<ReasonCode[]>([]);
  const [previewDoc, setPreviewDoc] = useState<{
    id: number;
    document_type: string;
    original_filename: string;
    stored_path: string;
    mime_type: string;
    file_size: number;
    verification_status: string | null;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["mfa-escalation", id],
    queryFn: () =>
      api
        .get<{
          application: Application;
          sla_hours_left: number;
          is_within_sla: boolean;
        }>(`/mfa/escalations/${id}`)
        .then((r) => r.data),
  });

  const { user } = useAuth();
  const canApprove = user?.permissions?.includes("applications.approve") ?? false;

  // Fetch reason codes
  useEffect(() => {
    api.get<{ reason_codes: ReasonCode[] }>("/mfa/reason-codes")
      .then((r) => setReasonCodes(r.data.reason_codes || []))
      .catch(() => { });
  }, []);

  const application = data?.application;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["mfa-escalation", id] });
  };

  const handleAssign = async () => {
    setLoading(true);
    try {
      await api.post(`/mfa/escalations/${id}/assign`);
      toast.success("Case assigned to you");
      refresh();
    } catch {
      toast.error("Failed to assign case");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    label: string,
    endpoint: string,
    field: string,
    required: boolean
  ) => {
    if (required && !text.trim()) {
      toast.error("Please enter a message");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/mfa/escalations/${id}/${endpoint}`, {
        [field]: text || undefined,
      });
      toast.success(`${label} successful`);
      setText("");
      setApproveOpen(false);
      setDenyOpen(false);
      setReturnOpen(false);
      setSelectedReasonCodes([]);
      refresh();
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
      };
      toast.error(error.response?.data?.message || `${label} failed`);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell title="Escalation Details">
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </DashboardShell>
    );
  }

  if (!application) {
    return (
      <DashboardShell title="Escalation Not Found">
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">
            This escalation could not be found.
          </p>
          <Button
            variant="secondary"
            onClick={() => router.push("/dashboard/mfa/escalations")}
          >
            Back to Escalations
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const canAct = ["escalated", "under_review"].includes(application.status);

  return (
    <DashboardShell
      title={application.reference_number}
      description={`${application.visa_type?.name || "Visa"} — MFA Review`}
      actions={
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<ArrowLeft size={14} />}
          onClick={() => router.push("/dashboard/mfa/escalations")}
        >
          Back
        </Button>
      }
    >
      {/* Action Bar */}
      {canAct && (
        <div className="card mb-6 flex flex-wrap items-center gap-3">
          {!application.assigned_officer_id && (
            <Button
              size="sm"
              leftIcon={<UserCheck size={14} />}
              onClick={handleAssign}
              loading={loading}
            >
              Assign to Me
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<RotateCcw size={14} />}
            onClick={() => setReturnOpen(true)}
          >
            Return to GIS
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<MessageSquare size={14} />}
            onClick={() => setRequestInfoOpen(true)}
          >
            Request Info
          </Button>
          <div className="flex-1" />
          {/* Reviewers: Submit for Approval | Approvers: Approve & Deny */}
          {!canApprove && (
            <Button
              size="sm"
              leftIcon={<Send size={14} />}
              className="!bg-info hover:!bg-info/90"
              onClick={async () => {
                setLoading(true);
                try {
                  await api.post(`/mfa/escalations/${id}/submit-for-approval`, { notes: "Reviewed and ready for approval" });
                  toast.success("Submitted for approval");
                  refresh();
                } catch {
                  toast.error("Failed to submit for approval");
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
            >
              Submit for Approval
            </Button>
          )}
          {canApprove && (
            <>
              <Button
                size="sm"
                leftIcon={<CheckCircle2 size={14} />}
                className="!bg-success hover:!bg-success/90"
                onClick={() => setApproveOpen(true)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                leftIcon={<XCircle size={14} />}
                onClick={() => setDenyOpen(true)}
              >
                Deny
              </Button>
            </>
          )}
        </div>
      )}

      {/* Pending Approval Actions */}
      {application.status === "pending_approval" && (
        <div className="card mb-6 bg-warning/5 border-warning/30">
          <div className="flex items-center gap-3 mb-3">
            <Clock size={18} className="text-warning" />
            <h3 className="font-semibold text-text-primary">Pending Final Approval</h3>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            This escalated application is waiting for final approval.
          </p>
          {canApprove && (
            <div className="flex gap-3">
              <Button size="sm" leftIcon={<CheckCircle2 size={14} />} className="!bg-success hover:!bg-success/90" onClick={() => setApproveOpen(true)}>
                Approve Application
              </Button>
              <Button size="sm" variant="danger" leftIcon={<XCircle size={14} />} onClick={() => setDenyOpen(true)}>
                Deny Application
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Approved — Issue Visa */}
      {application.status === "approved" && (
        <div className="card mb-6 bg-success/5 border-success/30">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 size={18} className="text-success" />
            <h3 className="font-semibold text-text-primary">Application Approved</h3>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            This application has been approved. Issue the eVisa to finalize the process and notify the applicant.
          </p>
          <Button
            size="sm"
            leftIcon={<ShieldCheck size={14} />}
            className="!bg-success hover:!bg-success/90"
            loading={loading}
            onClick={async () => {
              setLoading(true);
              try {
                await api.post(`/mfa/escalations/${id}/issue`);
                toast.success("eVisa issued successfully! Applicant has been notified.");
                refresh();
              } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } } };
                toast.error(error.response?.data?.message || "Failed to issue visa");
              } finally {
                setLoading(false);
              }
            }}
          >
            Issue eVisa
          </Button>
        </div>
      )}

      {/* Issued — Confirmation */}
      {application.status === "issued" && (
        <div className="card mb-6 bg-success/5 border-success/30">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-success" />
            <div>
              <h3 className="font-semibold text-text-primary">eVisa Issued</h3>
              <p className="text-sm text-text-secondary">The eVisa has been issued and the applicant has been notified via email.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Escalation Status
              </h2>
              <StatusBadge status={application.status} />
            </div>
            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-text-muted mb-1">Tier</p>
                <p className="font-medium text-text-primary text-sm capitalize">
                  {application.tier?.replace("_", " ") || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Agency</p>
                <p className="font-medium text-text-primary text-sm uppercase">
                  {application.assigned_agency || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Officer</p>
                <p className="font-medium text-text-primary text-sm">
                  {application.assigned_officer
                    ? `${application.assigned_officer.first_name} ${application.assigned_officer.last_name}`
                    : "Unassigned"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">SLA</p>
                <SlaIndicator
                  hoursLeft={data?.sla_hours_left ?? null}
                  isWithinSla={data?.is_within_sla}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User size={18} className="text-text-muted" />
                <h2 className="text-lg font-semibold text-text-primary">Applicant Profile</h2>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {/* Profile Photo - We'll use a placeholder or initials if real photo isn't available yet */}
              <div className="hidden md:flex flex-col items-center">
                <div className="w-32 h-32 bg-background rounded-lg border-2 border-border overflow-hidden flex items-center justify-center relative mb-2">
                  <User size={48} className="text-text-muted opacity-50 absolute" />
                  {/* Photo would go here once we have a dedicated photo endpoint */}
                  <div className="absolute inset-x-0 bottom-0 bg-background/80 flex items-center justify-center mt-20 h-10 backdrop-blur-sm shadow-sm py-1">
                    <span className="text-[14px] text-text-secondary tracking-widest font-mono font-bold font-black pointer-events-none select-none">SCAN MATCH</span>
                  </div>
                </div>
              </div>

              {/* Core Details */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <h3 className="text-xs text-text-muted uppercase tracking-wider mb-0.5">Surname</h3>
                    <p className="text-lg font-semibold text-text-primary uppercase">{application.last_name}</p>
                  </div>
                  <div>
                    <h3 className="text-xs text-text-muted uppercase tracking-wider mb-0.5">Given Names</h3>
                    <p className="text-lg font-semibold text-text-primary uppercase">{application.first_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div className="flex items-center justify-between border-b border-border pb-1">
                    <span className="text-xs text-text-muted">Nationality</span>
                    <span className="text-sm font-medium text-text-primary uppercase text-right">{application.nationality}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-1">
                    <span className="text-xs text-text-muted">Gender</span>
                    <span className="text-sm font-medium text-text-primary uppercase text-right">{application.gender || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-1">
                    <span className="text-xs text-text-muted">Date of Birth</span>
                    <span className="text-sm font-medium text-text-primary text-right">{application.date_of_birth}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-1">
                    <span className="text-xs text-text-muted">Place of Birth</span>
                    <span className="text-sm font-medium text-text-primary uppercase text-right">{application.country_of_birth || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-1">
                    <span className="text-xs text-text-muted">Marital Status</span>
                    <span className="text-sm font-medium text-text-primary capitalize text-right">{application.marital_status || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-1">
                    <span className="text-xs text-text-muted">Occupation</span>
                    <span className="text-sm font-medium text-text-primary uppercase text-right">{application.profession || "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub Details Grid */}
            <div className="grid sm:grid-cols-3 gap-4 text-sm border-t border-border pt-4">
              <div>
                <p className="text-text-muted mb-0.5">Passport Number</p>
                <p className="text-text-primary font-medium font-mono">{application.passport_number}</p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Issue Date</p>
                <p className="text-text-primary font-medium">{application.passport_issue_date || "—"}</p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Expiry Date</p>
                <p className="text-text-primary font-medium">{application.passport_expiry || "—"}</p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Email</p>
                <p className="text-text-primary font-medium">{application.email}</p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Phone</p>
                <p className="text-text-primary font-medium">{application.phone || "—"}</p>
              </div>
            </div>
          </div>

          {/* Risk Score Card */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-text-muted" />
              <h2 className="text-lg font-semibold text-text-primary">Risk Assessment</h2>
            </div>
            <RiskScoreCard
              riskScore={application.riskAssessment?.risk_score ?? null}
              riskLevel={application.riskAssessment?.risk_level ?? null}
              riskReasons={application.riskAssessment?.risk_reasons ?? []}
              overrideFlag={application.riskAssessment?.override_flag ?? false}
              overrideBy={application.riskAssessment?.override_by}
              overrideTimestamp={application.riskAssessment?.override_timestamp}
            />
          </div>

          {/* Review Guidance */}
          <RiskGuidance riskLevel={application.riskAssessment?.risk_level ?? null} />

          {/* Risk Override Panel */}
          <RiskOverridePanel 
            applicationId={application.id.toString()}
            riskAssessment={application.riskAssessment as any}
          />

          {/* Risk Intelligence Panel */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-text-muted" />
              <h2 className="text-lg font-semibold text-text-primary">Risk Intelligence</h2>
            </div>
            <RiskPanel
              riskScore={application.riskAssessment?.risk_score ?? application.risk_score ?? null}
              riskLevel={(application.riskAssessment?.risk_level ?? application.risk_level) as "low" | "medium" | "high" | "critical" | null}
              watchlistFlagged={application.riskAssessment?.watchlist_match ?? application.watchlist_flagged ?? false}
              factors={application.riskAssessment?.factors ?? []}
              recommendations={
                application.risk_level === "high" || application.risk_level === "critical"
                  ? [
                    { priority: "high", action: "MANUAL_REVIEW_REQUIRED", reason: "High risk score detected" },
                    { priority: "medium", action: "VERIFY_DOCUMENTS", reason: "Additional document verification recommended" },
                  ]
                  : application.risk_level === "medium"
                    ? [
                      { priority: "medium", action: "ENHANCED_SCREENING", reason: "Medium risk - enhanced screening advised" },
                    ]
                    : [
                      { priority: "info", action: "APPROVE_RECOMMENDED", reason: "Low risk profile - standard processing" },
                    ]
              }
            />
          </div>

          {/* Travel & Accommodation */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Plane size={18} className="text-text-muted" />
              <h2 className="text-lg font-semibold text-text-primary">Travel & Accommodation</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-text-muted mb-0.5 uppercase tracking-wider">Arrival Date</p>
                  <p className="text-text-primary font-medium">{application.intended_arrival ? new Date(application.intended_arrival).toLocaleDateString() : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5 uppercase tracking-wider">Duration of Stay</p>
                  <p className="text-text-primary font-medium">{application.duration_days ? `${application.duration_days} days` : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5 uppercase tracking-wider">Port of Entry</p>
                  <p className="text-text-primary font-medium">{application.port_of_entry || "—"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-text-muted mb-0.5 uppercase tracking-wider">Purpose of Visit</p>
                  <p className="text-text-primary font-medium">{application.purpose_of_visit || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5 uppercase tracking-wider">Address in Ghana</p>
                  <p className="text-text-primary font-medium leading-relaxed">{application.address_in_ghana || "—"}</p>
                </div>
              </div>

              {/* Visited Countries */}
              {(application.visited_country_1 || application.visited_country_2 || application.visited_country_3) && (
                <div className="sm:col-span-2 pt-3 border-t border-border mt-1">
                  <p className="text-xs text-text-muted mb-2 uppercase tracking-wider">Recently Visited Countries</p>
                  <div className="flex flex-wrap gap-2">
                    {application.visited_country_1 && <span className="px-2.5 py-1 bg-background text-text-secondary text-xs rounded-md border border-border">{application.visited_country_1}</span>}
                    {application.visited_country_2 && <span className="px-2.5 py-1 bg-background text-text-secondary text-xs rounded-md border border-border">{application.visited_country_2}</span>}
                    {application.visited_country_3 && <span className="px-2.5 py-1 bg-background text-text-secondary text-xs rounded-md border border-border">{application.visited_country_3}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} className="text-text-muted" />
              <h2 className="text-lg font-semibold text-text-primary">
                Documents
              </h2>
            </div>
            {application.documents && application.documents.length > 0 ? (
              <div className="space-y-3">
                {application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="w-8 h-8 bg-info/10 rounded flex items-center justify-center hover:bg-info/20 transition-colors"
                        title="Preview document"
                      >
                        <FileText size={14} className="text-info" />
                      </button>
                      <div>
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="text-sm font-medium text-text-primary capitalize hover:text-accent transition-colors text-left"
                        >
                          {doc.document_type.replace(/_/g, " ")}
                        </button>
                        <p className="text-xs text-text-muted">
                          {doc.original_filename}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 rounded bg-info/10 hover:bg-info/20 text-info transition-colors"
                        title="Preview"
                      >
                        <Eye size={14} />
                      </button>
                      <span
                        className={`badge ${doc.verification_status === "verified"
                          ? "badge-success"
                          : doc.verification_status === "rejected"
                            ? "badge-danger"
                            : "badge-info"
                          }`}
                      >
                        {doc.verification_status || "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-4">
                No documents
              </p>
            )}
          </div>

          {/* Payment */}
          {application.payment && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-text-muted" />
                <h2 className="text-lg font-semibold text-text-primary">
                  Payment
                </h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-text-muted mb-0.5">Amount</p>
                  <p className="text-text-primary font-bold">
                    {application.payment.currency}{" "}
                    {application.payment.amount}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted mb-0.5">Status</p>
                  <span
                    className={`badge ${application.payment.status === "completed"
                      ? "badge-success"
                      : "badge-warning"
                      }`}
                  >
                    {application.payment.status}
                  </span>
                </div>
                <div>
                  <p className="text-text-muted mb-0.5">Paid At</p>
                  <p className="text-text-primary font-medium">
                    {application.payment.paid_at
                      ? new Date(
                        application.payment.paid_at
                      ).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-text-muted" />
              <h2 className="text-lg font-semibold text-text-primary">
                Timeline
              </h2>
            </div>
            {application.status_history &&
              application.status_history.length > 0 ? (
              <Timeline
                items={application.status_history.map((h) => ({
                  status: h.to_status,
                  notes: h.notes,
                  changed_at: h.created_at,
                }))}
              />
            ) : (
              <p className="text-sm text-text-muted text-center py-4">
                No history
              </p>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={18} className="text-text-muted" />
              <h2 className="text-lg font-semibold text-text-primary">
                Internal Notes
              </h2>
            </div>
            {application.internal_notes &&
              application.internal_notes.length > 0 ? (
              <div className="space-y-3">
                {application.internal_notes.map((note) => (
                  <div key={note.id} className="p-3 rounded-lg bg-surface">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-text-primary">
                        {note.user
                          ? `${note.user.first_name} ${note.user.last_name}`
                          : "System"}
                      </span>
                      <span className="text-xs text-text-muted">
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-4">
                No notes yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={approveOpen}
        onClose={() => { setApproveOpen(false); setSelectedReasonCode(null); }}
        title="Approve Application"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-emerald-600" />
              <p className="text-sm text-emerald-700">This will approve the application and generate an eVisa PDF for the applicant.</p>
            </div>
          </div>
          <ReasonCodeSelector
            codes={reasonCodes}
            selectedCode={selectedReasonCode}
            onSelect={(code) => setSelectedReasonCode(code.code)}
            actionType="approve"
          />
          <Textarea
            label="Additional Notes (optional)"
            placeholder="Approval notes..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={() => { setApproveOpen(false); setSelectedReasonCode(null); }}>
            Cancel
          </Button>
          <Button
            className="!bg-emerald-600 hover:!bg-emerald-700"
            loading={loading}
            disabled={!selectedReasonCode}
            onClick={async () => {
              if (!selectedReasonCode) {
                toast.error("Please select a reason code");
                return;
              }
              setLoading(true);
              try {
                await api.post(`/mfa/escalations/${id}/approve`, {
                  notes: text,
                  reason_code: selectedReasonCode,
                });
                toast.success("Application approved");
                setApproveOpen(false);
                setSelectedReasonCode(null);
                setText("");
                refresh();
              } catch {
                toast.error("Approval failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            <CheckCircle2 size={16} className="mr-2" />
            Approve Application
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={denyOpen}
        onClose={() => { setDenyOpen(false); setSelectedReasonCode(null); setSelectedReasonCodes([]); }}
        title="Deny Application"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-center gap-3">
              <XCircle size={20} className="text-red-600" />
              <p className="text-sm text-red-700">The applicant will be notified with the reason provided.</p>
            </div>
          </div>
          <MultiReasonSelector
            codes={reasonCodes}
            selectedCodes={selectedReasonCodes}
            onSelect={(codes) => {
              setSelectedReasonCodes(codes.map(c => c.code));
              setSelectedReasonCode(codes.length > 0 ? codes[0].code : null);
            }}
            actionType="reject"
            maxSelections={5}
            label="Rejection Reasons"
          />
          <Textarea
            label="Additional Notes (required)"
            placeholder="Explain the reason for denial..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={() => { setDenyOpen(false); setSelectedReasonCode(null); setSelectedReasonCodes([]); }}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={loading}
            disabled={selectedReasonCodes.length === 0 || !text.trim()}
            onClick={async () => {
              if (selectedReasonCodes.length === 0) {
                toast.error("Please select at least one reason code");
                return;
              }
              if (!text.trim()) {
                toast.error("Please provide denial notes");
                return;
              }
              setLoading(true);
              try {
                await api.post(`/mfa/escalations/${id}/deny`, {
                  notes: text,
                  reason_codes: selectedReasonCodes,
                });
                toast.success("Application denied");
                setDenyOpen(false);
                setSelectedReasonCode(null);
                setSelectedReasonCodes([]);
                setText("");
                refresh();
              } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } } };
                toast.error(error.response?.data?.message || "Failed to deny application");
              } finally {
                setLoading(false);
              }
            }}
          >
            <XCircle size={16} className="mr-2" />
            Deny Application
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={returnOpen}
        onClose={() => setReturnOpen(false)}
        title="Return to GIS"
      >
        <p className="text-sm text-text-secondary mb-4">
          This will return the case to GIS for further review.
        </p>
        <Textarea
          label="Reason for Return (required)"
          placeholder="Explain why this case is being returned..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
        />
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="secondary" onClick={() => setReturnOpen(false)}>
            Cancel
          </Button>
          <Button
            loading={loading}
            onClick={() =>
              handleAction("Return", "return", "notes", true)
            }
          >
            Return to GIS
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={requestInfoOpen}
        onClose={() => { setRequestInfoOpen(false); setSelectedReasonCode(null); }}
        title="Request Additional Information"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-3">
              <MessageSquare size={18} className="text-blue-600" />
              <p className="text-sm text-blue-700">The applicant will be notified to provide the requested information.</p>
            </div>
          </div>
          <ReasonCodeSelector
            codes={reasonCodes}
            selectedCode={selectedReasonCode}
            onSelect={(code) => setSelectedReasonCode(code.code)}
            actionType="request_info"
          />
          <Textarea
            label="Additional Message (optional)"
            placeholder="Any additional details for the applicant..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={() => { setRequestInfoOpen(false); setSelectedReasonCode(null); }}>
            Cancel
          </Button>
          <Button
            className="!bg-blue-600 hover:!bg-blue-700"
            loading={loading}
            disabled={!selectedReasonCode}
            onClick={async () => {
              if (!selectedReasonCode) {
                toast.error("Please select a reason code");
                return;
              }
              setLoading(true);
              try {
                await api.post(`/mfa/escalations/${id}/request-info`, {
                  message: text,
                  reason_code: selectedReasonCode
                });
                toast.success("Information request sent successfully");
                setRequestInfoOpen(false);
                setSelectedReasonCode(null);
                setText("");
                refresh();
              } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } } };
                console.error('MFA request info error:', error);
                toast.error(error.response?.data?.message || "Request failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            <MessageSquare size={16} className="mr-2" />
            Request Information
          </Button>
        </div>
      </Modal>

      {/* Document Preview Modal */}
      <DocumentPreview
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        downloadUrl={previewDoc ? `${process.env.NEXT_PUBLIC_API_URL}/mfa/escalations/${id}/documents/${previewDoc.id}/download` : ""}
      />
    </DashboardShell>
  );
}
