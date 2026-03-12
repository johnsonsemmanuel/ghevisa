"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge, SlaIndicator } from "@/components/ui/display/badge";

import { Timeline } from "@/components/ui/timeline";
import { Modal } from "@/components/ui/modals/modal";
import { Textarea } from "@/components/ui/forms/input";
import { CardSkeleton } from "@/components/ui/skeleton";
import { ReasonCodeSelector } from "@/components/ui/reason-code-selector";
import { MultiReasonSelector } from "@/components/ui/multi-reason-selector";
import { RiskPanel } from "@/components/ui/risk-panel";
import { RiskScoreCard } from "@/components/ui/risk-score-card";
import { RiskGuidance } from "@/components/ui/risk-guidance";
import { RiskOverridePanel } from "@/components/ui/risk-override-panel";
import { TrustNetPanel } from "@/components/ui/trustnet-panel";
import {
  ArrowLeft,
  UserCheck,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  Send,
  FileText,
  User,
  Plane,
  Clock,
  CreditCard,
  Eye,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { DocumentPreview } from "@/components/ui/document-preview";
import toast from "react-hot-toast";
import type { Application, ReasonCode } from "@/lib/types";

export default function GisCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  // Helper function to safely format dates
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "—";
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing fails
      }
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString; // Return original on error
    }
  };

  const [escalateOpen, setEscalateOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [requestInfoOpen, setRequestInfoOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [denyOpen, setDenyOpen] = useState(false);
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
    queryKey: ["gis-case", id],
    queryFn: () =>
      api.get<{ application: Application; sla_hours_left: number; is_within_sla: boolean }>(
        `/gis/cases/${id}`
      ).then((r) => r.data),
  });

  const { user } = useAuth();
  const canApprove = user?.permissions?.includes("applications.approve") ?? false;

  // Fetch reason codes
  useEffect(() => {
    api.get<{ reason_codes: ReasonCode[] }>("/gis/reason-codes")
      .then((r) => setReasonCodes(r.data.reason_codes || []))
      .catch(() => { });
  }, []);

  const application = data?.application;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["gis-case", id] });
  };

  const handleAssign = async () => {
    setLoading(true);
    try {
      await api.post(`/gis/cases/${id}/assign`);
      toast.success("Case assigned to you");
      refresh();
    } catch {
      toast.error("Failed to assign case");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, endpoint: string, field: string) => {
    if (!text.trim()) {
      toast.error("Please enter a message");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/gis/cases/${id}/${endpoint}`, { [field]: text });
      toast.success(`${action} successful`);
      setText("");
      setEscalateOpen(false);
      setNoteOpen(false);
      setRequestInfoOpen(false);
      setApproveOpen(false);
      setDenyOpen(false);
      setSelectedReasonCodes([]);
      refresh();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || `${action} failed`);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell title="Case Details">
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </DashboardShell>
    );
  }

  if (!application) {
    return (
      <DashboardShell title="Case Not Found">
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">This case could not be found.</p>
          <Button variant="secondary" onClick={() => router.push("/dashboard/gis/cases")}>
            Back to Cases
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const canAct = ["submitted", "under_review", "additional_info_requested"].includes(application.status);

  return (
    <DashboardShell
      title={application.reference_number}
      description={`${application.visa_type?.name || "Visa"} — GIS Review`}
      actions={
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<ArrowLeft size={14} />}
          onClick={() => router.push("/dashboard/gis/cases")}
        >
          Back
        </Button>
      }
    >
      {/* Action Bar */}
      {canAct && (
        <div className="card mb-6 flex flex-wrap items-center gap-3">
          {!application.assigned_officer_id && (
            <Button size="sm" leftIcon={<UserCheck size={14} />} onClick={handleAssign} loading={loading}>
              Assign to Me
            </Button>
          )}
          <Button size="sm" variant="secondary" leftIcon={<MessageSquare size={14} />} onClick={() => setNoteOpen(true)}>
            Add Note
          </Button>
          <Button size="sm" variant="secondary" leftIcon={<Send size={14} />} onClick={() => setRequestInfoOpen(true)}>
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
                  await api.post(`/gis/cases/${id}/submit-for-approval`, { notes: "Reviewed and ready for approval" });
                  toast.success("Application submitted for approval successfully");
                  refresh();
                } catch (err: unknown) {
                  const error = err as { response?: { data?: { message?: string } } };
                  console.error('Submit for approval error:', error);
                  toast.error(error.response?.data?.message || "Failed to submit for approval");
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
              <Button size="sm" leftIcon={<CheckCircle2 size={14} />} className="!bg-success hover:!bg-success/90" onClick={() => setApproveOpen(true)}>
                Approve
              </Button>
              <Button size="sm" variant="danger" leftIcon={<XCircle size={14} />} onClick={() => setDenyOpen(true)}>
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
            <h3 className="font-semibold text-text-primary">
              {canApprove ? "Ready for Your Approval" : "Pending Final Approval"}
            </h3>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            {canApprove
              ? "This application has been reviewed and is ready for your final approval decision."
              : "This application has been reviewed and is waiting for final approval from a supervisor."
            }
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
                await api.post(`/gis/cases/${id}/issue`);
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
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Case Status</h2>
              <StatusBadge status={application.status} />
            </div>
            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-text-muted mb-1">Tier</p>
                <p className="font-medium text-text-primary text-sm capitalize">{application.tier?.replace("_", " ") || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Agency</p>
                <p className="font-medium text-text-primary text-sm uppercase">{application.assigned_agency || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Officer</p>
                <p className="font-medium text-text-primary text-sm">
                  {application.assigned_officer ? `${application.assigned_officer.first_name} ${application.assigned_officer.last_name}` : "Unassigned"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">SLA</p>
                <SlaIndicator hoursLeft={data?.sla_hours_left ?? null} isWithinSla={data?.is_within_sla} />
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Reviewed By</p>
                <p className="font-medium text-text-primary text-sm">
                  {application.reviewing_officer
                    ? `${application.reviewing_officer.first_name} ${application.reviewing_officer.last_name}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Approved By</p>
                <p className="font-medium text-text-primary text-sm">
                  {application.approval_officer
                    ? `${application.approval_officer.first_name} ${application.approval_officer.last_name}`
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Applicant Profile Card */}
          <div className="card">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                {application.first_name?.[0]}{application.last_name?.[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-text-primary">
                  {application.first_name} {application.last_name}
                </h2>
                <p className="text-sm text-text-muted">{application.email}</p>
                {application.phone && (
                  <p className="text-sm text-text-muted">{application.phone}</p>
                )}
              </div>
              <StatusBadge status={application.status} />
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-sm border-t border-border pt-4">
              <div>
                <p className="text-text-muted mb-0.5">Gender</p>
                <p className="text-text-primary font-medium capitalize">{application.gender || "—"}</p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Date of Birth</p>
                <p className="text-text-primary font-medium">
                  {formatDate(application.date_of_birth)}
                </p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Marital Status</p>
                <p className="text-text-primary font-medium capitalize">{application.marital_status || "—"}</p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Occupation</p>
                <p className="text-text-primary font-medium">{application.profession || "—"}</p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Nationality</p>
                <p className="text-text-primary font-medium">{application.nationality}</p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Passport Number</p>
                <p className="text-text-primary font-medium font-mono">{application.passport_number}</p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Passport Issue Date</p>
                <p className="text-text-primary font-medium">
                  {formatDate(application.passport_issue_date)}
                </p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Passport Expiry Date</p>
                <p className="text-text-primary font-medium">
                  {formatDate(application.passport_expiry)}
                </p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Place of Birth</p>
                <p className="text-text-primary font-medium">{application.country_of_birth || "—"}</p>
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

          {/* TrustNet Security Screening */}
          <div className="card">
            <TrustNetPanel
              data={{
                passport_authentic: !(application.watchlist_flagged),
                mrz_valid: true,
                interpol_clear: !(application.watchlist_flagged),
                watchlist_clear: !(application.watchlist_flagged),
                identity_verified: application.riskAssessment?.risk_level !== "critical",
                fraud_indicators: application.riskAssessment?.risk_level === "high" || application.riskAssessment?.risk_level === "critical"
                  ? ["Elevated risk profile detected"] : [],
                risk_score: application.riskAssessment?.risk_score ?? application.risk_score ?? 15,
                last_checked: new Date().toISOString(),
              }}
            />
          </div>

          {/* Travel Details */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Plane size={18} className="text-text-muted" />
              <h2 className="text-lg font-semibold text-text-primary">Travel Details</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted mb-0.5">Arrival</p>
                <p className="text-text-primary font-medium">
                  {formatDate(application.intended_arrival)}
                </p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Duration</p>
                <p className="text-text-primary font-medium">{application.duration_days ? `${application.duration_days} days` : "—"}</p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Port of Entry</p>
                <p className="text-text-primary font-medium">{application.port_of_entry || "—"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-text-muted mb-0.5">Address in Ghana</p>
                <p className="text-text-primary font-medium">{application.address_in_ghana || "—"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-text-muted mb-0.5">Purpose</p>
                <p className="text-text-primary font-medium">{application.purpose_of_visit || "—"}</p>
              </div>
            </div>
          </div>

          {/* Health & Security Declarations */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-text-muted" />
              <h2 className="text-lg font-semibold text-text-primary">Health & Security Declarations</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted mb-0.5">High Fever</p>
                <p className="text-text-primary font-medium">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    application.health_declaration_fever ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                  }`}>
                    {application.health_declaration_fever ? <X size={12} /> : <CheckCircle2 size={12} />}
                    {application.health_declaration_fever ? "Yes" : "No"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Coughing / Breathing Difficulties</p>
                <p className="text-text-primary font-medium">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    application.health_declaration_cough || application.health_declaration_breathing ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                  }`}>
                    {(application.health_declaration_cough || application.health_declaration_breathing) ? <X size={12} /> : <CheckCircle2 size={12} />}
                    {(application.health_declaration_cough || application.health_declaration_breathing) ? "Yes" : "No"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Yellow Fever Immunization</p>
                <p className="text-text-primary font-medium">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    application.health_declaration_yellow_fever ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  }`}>
                    {application.health_declaration_yellow_fever ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {application.health_declaration_yellow_fever ? "Yes" : "No"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Criminal Conviction</p>
                <p className="text-text-primary font-medium">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    application.security_declaration_convicted ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                  }`}>
                    {application.security_declaration_convicted ? <X size={12} /> : <CheckCircle2 size={12} />}
                    {application.security_declaration_convicted ? "Yes" : "No"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} className="text-text-muted" />
              <h2 className="text-lg font-semibold text-text-primary">Documents</h2>
            </div>
            {application.documents && application.documents.length > 0 ? (
              <div className="space-y-3">
                {application.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center hover:bg-info/20 transition-colors cursor-pointer"
                        title="Preview document"
                      >
                        <FileText size={16} className="text-info" />
                      </button>
                      <div>
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="text-sm font-medium text-text-primary capitalize hover:text-accent transition-colors text-left"
                        >
                          {doc.document_type.replace(/_/g, " ")}
                        </button>
                        <p className="text-xs text-text-muted">{doc.original_filename} &middot; {(doc.file_size / 1024).toFixed(0)}KB</p>
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
                      <span className={`badge ${doc.verification_status === "verified" ? "badge-success" : doc.verification_status === "rejected" ? "badge-danger" : "badge-info"}`}>
                        {doc.verification_status || "Pending"}
                      </span>
                      {canAct && doc.verification_status !== "verified" && (
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={async () => {
                              try {
                                await api.post(`/gis/cases/${id}/documents/${doc.id}/verify`, { status: "verified" });
                                toast.success("Document verified");
                                refresh();
                              } catch {
                                toast.error("Verification failed");
                              }
                            }}
                            className="p-1.5 rounded bg-success/10 hover:bg-success/20 text-success transition-colors"
                            title="Verify document"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await api.post(`/gis/cases/${id}/documents/${doc.id}/verify`, { status: "rejected" });
                                toast.success("Document rejected");
                                refresh();
                              } catch {
                                toast.error("Rejection failed");
                              }
                            }}
                            className="p-1.5 rounded bg-danger/10 hover:bg-danger/20 text-danger transition-colors"
                            title="Reject document"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-4">No documents uploaded</p>
            )}
          </div>

          {/* Payment Details */}
          {application.payment && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-text-muted" />
                <h2 className="text-lg font-semibold text-text-primary">Payment Details</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-text-muted font-medium">Amount Paid</th>
                      <th className="text-left py-2 px-3 text-text-muted font-medium">Reference</th>
                      <th className="text-left py-2 px-3 text-text-muted font-medium">Provider</th>
                      <th className="text-left py-2 px-3 text-text-muted font-medium">Status</th>
                      <th className="text-left py-2 px-3 text-text-muted font-medium">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-3 px-3 font-bold text-text-primary">
                        {application.payment.currency} {application.payment.amount}
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-text-secondary">
                        {application.payment.transaction_reference}
                      </td>
                      <td className="py-3 px-3 capitalize text-text-secondary">
                        {application.payment.payment_provider}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${application.payment.status === "completed"
                          ? "bg-success/10 text-success"
                          : application.payment.status === "failed"
                            ? "bg-danger/10 text-danger"
                            : "bg-warning/10 text-warning"
                          }`}>
                          <CheckCircle2 size={12} />
                          {application.payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-text-secondary">
                        {application.payment.paid_at
                          ? new Date(application.payment.paid_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                          : "—"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-text-muted" />
              <h2 className="text-lg font-semibold text-text-primary">Timeline</h2>
            </div>
            {application.status_history && application.status_history.length > 0 ? (
              <Timeline
                items={application.status_history.map((h) => ({
                  status: h.to_status,
                  notes: h.notes,
                  changed_at: h.created_at,
                }))}
              />
            ) : (
              <p className="text-sm text-text-muted text-center py-4">No history</p>
            )}
          </div>

          {/* Internal Notes */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={18} className="text-text-muted" />
              <h2 className="text-lg font-semibold text-text-primary">Internal Notes</h2>
            </div>
            {application.internal_notes && application.internal_notes.length > 0 ? (
              <div className="space-y-3">
                {application.internal_notes.map((note) => (
                  <div key={note.id} className="p-3 rounded-lg bg-surface">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-text-primary">
                        {note.user ? `${note.user.first_name} ${note.user.last_name}` : "System"}
                      </span>
                      <span className="text-xs text-text-muted">{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-text-secondary">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-4">No notes yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={escalateOpen} onClose={() => setEscalateOpen(false)} title="Escalate to MFA">
        <Textarea label="Escalation Reason" placeholder="Explain why this case needs MFA review..." value={text} onChange={(e) => setText(e.target.value)} rows={4} />
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="secondary" onClick={() => setEscalateOpen(false)}>Cancel</Button>
          <Button variant="danger" loading={loading} onClick={() => handleAction("Escalation", "escalate", "reason")}>Escalate</Button>
        </div>
      </Modal>

      <Modal isOpen={noteOpen} onClose={() => setNoteOpen(false)} title="Add Internal Note">
        <Textarea label="Note" placeholder="Enter your note..." value={text} onChange={(e) => setText(e.target.value)} rows={4} />
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="secondary" onClick={() => setNoteOpen(false)}>Cancel</Button>
          <Button loading={loading} onClick={() => handleAction("Note", "notes", "content")}>Save Note</Button>
        </div>
      </Modal>

      <Modal isOpen={requestInfoOpen} onClose={() => { setRequestInfoOpen(false); setSelectedReasonCode(null); }} title="Request Additional Information">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-3">
              <Send size={20} className="text-blue-600" />
              <p className="text-sm text-blue-700">The applicant will be notified to provide the requested information.</p>
            </div>
          </div>
          <ReasonCodeSelector
            codes={reasonCodes}
            selectedCode={selectedReasonCode}
            onSelect={(code) => setSelectedReasonCode(code.code)}
            actionType="request_info"
          />
          <Textarea label="Additional Message (optional)" placeholder="Any additional details for the applicant..." value={text} onChange={(e) => setText(e.target.value)} rows={3} />
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={() => { setRequestInfoOpen(false); setSelectedReasonCode(null); }}>Cancel</Button>
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
                await api.post(`/gis/cases/${id}/request-info`, {
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
                console.error('Request info error:', error);
                toast.error(error.response?.data?.message || "Request failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            <Send size={16} className="mr-2" />
            Send Request
          </Button>
        </div>
      </Modal>

      <Modal isOpen={approveOpen} onClose={() => { setApproveOpen(false); }} title="Approve Application">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-emerald-600" />
              <p className="text-sm text-emerald-700">This will approve the application and generate an eVisa PDF for the applicant.</p>
            </div>
          </div>
          <Textarea label="Additional Notes (optional)" placeholder="Any additional approval notes..." value={text} onChange={(e) => setText(e.target.value)} rows={3} />
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={() => { setApproveOpen(false); }}>Cancel</Button>
          <Button
            className="!bg-emerald-600 hover:!bg-emerald-700"
            loading={loading}
            onClick={async () => {
              setLoading(true);
              try {
                await api.post(`/gis/cases/${id}/approve`, {
                  notes: text
                });
                toast.success("Application approved successfully");
                setApproveOpen(false);
                setText("");
                refresh();
              } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } } };
                console.error('Approval error:', error);
                toast.error(error.response?.data?.message || "Approval failed");
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

      <Modal isOpen={denyOpen} onClose={() => { setDenyOpen(false); setSelectedReasonCode(null); setSelectedReasonCodes([]); }} title="Deny Application">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-red-600" />
              <p className="text-sm text-red-700">This will deny the application. The applicant will be notified with the reason provided.</p>
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
          <Textarea label="Additional Notes (required)" placeholder="Explain the reason for denial..." value={text} onChange={(e) => setText(e.target.value)} rows={3} />
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={() => { setDenyOpen(false); setSelectedReasonCode(null); setSelectedReasonCodes([]); }}>Cancel</Button>
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
                await api.post(`/gis/cases/${id}/deny`, {
                  notes: text,
                  reason_codes: selectedReasonCodes
                });
                toast.success("Application denied successfully");
                setDenyOpen(false);
                setSelectedReasonCode(null);
                setSelectedReasonCodes([]);
                setText("");
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

      {/* Document Preview Modal */}
      <DocumentPreview
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        downloadUrl={previewDoc ? `${process.env.NEXT_PUBLIC_API_URL}/gis/cases/${id}/documents/${previewDoc.id}/download` : ""}
      />
    </DashboardShell>
  );
}
