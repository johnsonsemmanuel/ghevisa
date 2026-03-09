"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge, SlaIndicator } from "@/components/ui/badge";
import { Timeline } from "@/components/ui/timeline";
import { CardSkeleton } from "@/components/ui/skeleton";

import { FileUpload } from "@/components/ui/file-upload";
import {
  ArrowLeft, Download, FileText, Clock, User, Plane,
  CreditCard, Upload, Eye, Edit, CheckCircle2, Shield, MessageSquare,
  AlertCircle, Send,
} from "lucide-react";
import { EVisaPreview } from "@/components/ui/evisa-preview";
import toast from "react-hot-toast";
import type { Application, ApplicationTimeline } from "@/lib/types";
import { useState, useMemo } from "react";

const statusGradient: Record<string, string> = {
  approved: "from-success/10 to-success/5 border-success/20",
  issued: "from-success/10 to-success/5 border-success/20",
  denied: "from-danger/10 to-danger/5 border-danger/20",
  revoked: "from-danger/10 to-danger/5 border-danger/20",
  expired: "from-surface to-white border-border",
  appealed: "from-warning/8 to-warning/3 border-warning/20",
  cancelled: "from-surface to-white border-border",
  draft: "from-surface to-white border-border",
  submitted: "from-gold/8 to-gold/3 border-gold/20",
  submitted_awaiting_payment: "from-warning/8 to-warning/3 border-warning/20",
  paid_submitted: "from-info/8 to-info/3 border-info/20",
  under_review: "from-info/8 to-info/3 border-info/20",
  pending_approval: "from-info/8 to-info/3 border-info/20",
  pending_payment: "from-warning/8 to-warning/3 border-warning/20",
  additional_info_requested: "from-danger/8 to-danger/3 border-danger/20",
  escalated: "from-warning/8 to-warning/3 border-warning/20",
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [showEvisaPreview, setShowEvisaPreview] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const { data: appData, isLoading: appLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: () =>
      api.get<{ application: Application }>(`/applicant/applications/${id}`).then((r) => r.data),
  });

  // Create eVisa preview data from application data
  const eVisaData = useMemo(() => {
    if (!appData?.application) return null;

    const app = appData.application;

    // Only show eVisa preview for approved/issued applications
    if (!["approved", "issued"].includes(app.status)) return null;

    return {
      reference_number: app.reference_number,
      full_name: app.first_name + ' ' + app.last_name,
      passport_number: app.passport_number || '',
      nationality: app.nationality || '',
      visa_type: app.visa_type?.name || 'N/A',
      arrival_date: app.intended_arrival ? new Date(app.intended_arrival).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
      duration_days: app.duration_days || 0,
      issued_at: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      valid_until: app.intended_arrival && app.duration_days ? new Date(new Date(app.intended_arrival).getTime() + (app.duration_days * 24 * 60 * 60 * 1000)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
      qr_code: app.evisa_qr_code || `GHEVISA:${app.reference_number}:VERIFY`,
    };
  }, [appData]);

  const { data: statusData } = useQuery({
    queryKey: ["application-status", id],
    queryFn: () =>
      api.get<ApplicationTimeline>(`/applicant/applications/${id}/status`).then((r) => r.data),
  });

  const application = appData?.application;
  const timeline = statusData?.timeline || [];

  const handleDownloadEvisa = async () => {
    try {
      const res = await api.get(`/applicant/applications/${id}/evisa`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `eVisa_${application?.reference_number}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download eVisa");
    }
  };

  const handleReupload = async (docId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post(`/applicant/documents/${docId}/reupload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Document re-uploaded successfully");
    } catch {
      toast.error("Re-upload failed");
    }
  };

  const handleSubmitResponse = async () => {
    setSubmittingResponse(true);
    try {
      await api.post(`/applicant/applications/${id}/submit-response`, {
        message: responseMessage,
      });
      toast.success("Response submitted successfully. Your application is now under review.");
      setShowResponseModal(false);
      setResponseMessage("");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit response");
    } finally {
      setSubmittingResponse(false);
    }
  };

  if (appLoading) {
    return (
      <DashboardShell title="Application Details">
        <div className="space-y-4"><CardSkeleton /><CardSkeleton /></div>
      </DashboardShell>
    );
  }

  if (!application) {
    return (
      <DashboardShell title="Application Not Found">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-text-muted" />
          </div>
          <p className="text-text-primary font-semibold mb-1">Application not found</p>
          <p className="text-sm text-text-muted mb-6">This application may have been removed or the link is invalid.</p>
          <Button variant="secondary" onClick={() => router.push("/dashboard/applicant/applications")}>Back to Applications</Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={application.reference_number}
      description={`${application.visa_type?.name || "Visa"} Application`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push("/dashboard/applicant/applications")}>Back</Button>
          {(application.status === "draft" || application.status === "additional_info_requested") && (
            <Button variant="secondary" size="sm" leftIcon={<Edit size={14} />} onClick={() => router.push(`/dashboard/applicant/applications/${id}/edit`)}>Edit</Button>
          )}
          {(application.status === "approved" || application.status === "issued") && (
            <>
              <Button variant="secondary" size="sm" leftIcon={<Eye size={14} />} onClick={() => setShowEvisaPreview(true)}>Preview eVisa</Button>
              <Button size="sm" leftIcon={<Download size={14} />} onClick={handleDownloadEvisa}>Download eVisa</Button>
            </>
          )}
        </div>
      }
    >
      {/* ── Status Hero Banner ── */}
      <div className={`rounded-2xl bg-gradient-to-br ${statusGradient[application.status] || statusGradient.draft} border p-6 mb-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm">
              {(application.status === "approved" || application.status === "issued") ? <CheckCircle2 size={24} className="text-success" /> : <Shield size={24} className="text-text-muted" />}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-bold text-text-primary">{application.reference_number}</h2>
                <StatusBadge status={application.status} />
              </div>
              <p className="text-sm text-text-secondary">
                {application.visa_type?.name || "Visa"} &middot; {application.tier?.replace("_", " ") || "Standard"} Processing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {statusData && (
              <div className="text-right">
                <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-0.5">SLA</p>
                <SlaIndicator hoursLeft={statusData.sla_hours_left} />
              </div>
            )}
            <div className="text-right">
              <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-0.5">Submitted</p>
              <p className="text-sm font-semibold text-text-primary">
                {new Date(application.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pending Payment Banner ── */}
      {(application.status === "pending_payment" || application.status === "submitted_awaiting_payment") && (
        <div className="rounded-2xl bg-gradient-to-r from-warning/10 via-warning/5 to-accent/5 border border-warning/20 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center shrink-0">
              <CreditCard size={28} className="text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-text-primary mb-1">
                Payment Required
              </h3>
              <p className="text-sm text-text-secondary">
                Your application is awaiting payment. Please complete the payment to submit your application for processing.
                You can retry with a different payment method if your previous attempt failed.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button size="sm" leftIcon={<CreditCard size={14} />} onClick={() => router.push(`/dashboard/applicant/applications/${id}/payment`)}>
                Complete Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Additional Info Request Banner ── */}
      {application.status === "additional_info_requested" && (
        <div className="rounded-2xl bg-gradient-to-r from-warning/10 via-warning/5 to-danger/5 border border-warning/20 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center shrink-0">
              <AlertCircle size={28} className="text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-text-primary mb-1">
                Additional Information Required
              </h3>
              <p className="text-sm text-text-secondary mb-3">
                The reviewing officer has requested additional information or documents. Please review the request below, update your application or upload the required documents, then submit your response.
              </p>
              {timeline.length > 0 && timeline[0].notes && (
                <div className="bg-white/50 rounded-xl p-4 border border-warning/10 mb-3">
                  <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">Officer's Request</p>
                  <p className="text-sm text-text-primary">{timeline[0].notes}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button variant="secondary" size="sm" leftIcon={<Edit size={14} />} onClick={() => router.push(`/dashboard/applicant/applications/${id}/edit`)}>
                Edit Application
              </Button>
              <Button size="sm" leftIcon={<Send size={14} />} onClick={() => setShowResponseModal(true)}>
                Submit Response
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── eVisa Download Banner ── */}
      {(application.status === "approved" || application.status === "issued") && (
        <div className="rounded-2xl bg-gradient-to-r from-success/10 via-success/5 to-accent/5 border border-success/20 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center shrink-0">
              <CheckCircle2 size={28} className="text-success" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-text-primary mb-1">
                {application.status === "issued" ? "Your eVisa Has Been Issued!" : "Your Application Has Been Approved!"}
              </h3>
              <p className="text-sm text-text-secondary">
                Your electronic visa is ready. Download and print it to present upon arrival at any port of entry in Ghana.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button variant="secondary" size="sm" leftIcon={<Eye size={14} />} onClick={() => setShowEvisaPreview(true)}>
                Preview
              </Button>
              <Button size="sm" leftIcon={<Download size={14} />} onClick={handleDownloadEvisa}>
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Denied Banner ── */}
      {application.status === "denied" && (
        <div className="rounded-2xl bg-gradient-to-r from-danger/10 via-danger/5 to-rose-50/5 border border-danger/20 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center shrink-0">
              <AlertCircle size={28} className="text-danger" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-text-primary mb-1">
                Application Denied
              </h3>
              <p className="text-sm text-text-secondary">
                Your visa application has been denied. Please review the decision notes below for more information. If you need assistance, contact our support team.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<MessageSquare size={14} />}
                onClick={() => router.push("/dashboard/applicant/support")}
              >
                Talk to Support
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 w-full">
          {/* Personal Info */}
          <div className="card">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/6 flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
              <h2 className="text-base font-bold text-text-primary">Personal Information</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="info-field"><p className="info-label">Full Name</p><p className="info-value">{application.first_name} {application.last_name}</p></div>
              <div className="info-field"><p className="info-label">Date of Birth</p><p className="info-value">{application.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"}</p></div>
              <div className="info-field"><p className="info-label">Gender</p><p className="info-value capitalize">{application.gender || "—"}</p></div>
              <div className="info-field"><p className="info-label">Place of Birth</p><p className="info-value uppercase">{application.country_of_birth || "—"}</p></div>
              <div className="info-field"><p className="info-label">Nationality</p><p className="info-value">{application.nationality || "—"}</p></div>
              <div className="info-field"><p className="info-label">Marital Status</p><p className="info-value capitalize">{application.marital_status || "—"}</p></div>
              <div className="info-field"><p className="info-label">Occupation</p><p className="info-value capitalize">{application.profession || "—"}</p></div>
              <div className="info-field"><p className="info-label">Passport Number</p><p className="info-value font-mono tracking-wide">{application.passport_number || "—"}</p></div>
              <div className="info-field"><p className="info-label">Passport Issue Date</p><p className="info-value">{application.passport_issue_date || "—"}</p></div>
              <div className="info-field"><p className="info-label">Passport Expiry Date</p><p className="info-value">{application.passport_expiry || "—"}</p></div>
            </div>
          </div>

          {/* Travel Details */}
          <div className="card">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-accent/8 flex items-center justify-center">
                <Plane size={16} className="text-accent" />
              </div>
              <h2 className="text-base font-bold text-text-primary">Travel Details</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="info-field"><p className="info-label">Intended Arrival</p><p className="info-value">{application.intended_arrival ? new Date(application.intended_arrival).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"}</p></div>
              <div className="info-field"><p className="info-label">Duration of Stay</p><p className="info-value">{application.duration_days ? `${application.duration_days} days` : "—"}</p></div>
              <div className="info-field sm:col-span-2"><p className="info-label">Port of Entry</p><p className="info-value">{application.port_of_entry || "—"}</p></div>
              <div className="info-field sm:col-span-2"><p className="info-label">Address in Ghana</p><p className="info-value">{application.address_in_ghana || "—"}</p></div>
              <div className="info-field sm:col-span-2"><p className="info-label">Purpose of Visit</p><p className="info-value">{application.purpose_of_visit || "—"}</p></div>
              {(application.visited_country_1 || application.visited_country_2 || application.visited_country_3) && (
                <div className="info-field sm:col-span-2">
                  <p className="info-label">Recently Visited Countries</p>
                  <p className="info-value">
                    {[application.visited_country_1, application.visited_country_2, application.visited_country_3].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Health & Security Declarations */}
          <div className="card">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-success/8 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-success" />
              </div>
              <h2 className="text-base font-bold text-text-primary">Health & Security Declarations</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="info-field">
                <p className="info-label">High Fever</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${application.health_declaration_fever ? 'bg-error-main' : 'bg-success-main'}`}></div>
                  <p className="info-value">{application.health_declaration_fever ? "Yes" : "No"}</p>
                </div>
              </div>
              <div className="info-field">
                <p className="info-label">Coughing / Breathing Difficulties</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${application.health_declaration_cough ? 'bg-error-main' : 'bg-success-main'}`}></div>
                  <p className="info-value">{application.health_declaration_cough || application.health_declaration_breathing ? "Yes" : "No"}</p>
                </div>
              </div>
              <div className="info-field">
                <p className="info-label">Yellow Fever Immunization</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${application.health_declaration_yellow_fever ? 'bg-success-main' : 'bg-error-main'}`}></div>
                  <p className="info-value">{application.health_declaration_yellow_fever ? "Yes" : "No"}</p>
                </div>
              </div>
              <div className="info-field">
                <p className="info-label">Criminal Conviction</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${application.security_declaration_convicted ? 'bg-error-main' : 'bg-success-main'}`}></div>
                  <p className="info-value">{application.security_declaration_convicted ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-info/8 flex items-center justify-center">
                <FileText size={16} className="text-info" />
              </div>
              <h2 className="text-base font-bold text-text-primary">Documents</h2>
            </div>
            {application.documents && application.documents.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {application.documents.map((doc) => (
                  <div key={doc.id} className="flex items-start gap-3 p-4 rounded-xl bg-surface border border-border-light">
                    <div className="w-10 h-10 bg-white rounded-xl border border-border flex items-center justify-center shrink-0 shadow-sm">
                      <FileText size={18} className="text-info" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary capitalize truncate">{doc.document_type.replace(/_/g, " ")}</p>
                      <p className="text-xs text-text-muted truncate mt-0.5">{doc.original_filename}</p>
                      <div className="mt-2">
                        {doc.verification_status === "reupload_requested" || doc.ocr_status === "failed" ? (
                          <FileUpload accept=".jpeg,.jpg,.png,.pdf" onFileSelect={(file) => handleReupload(doc.id, file)} />
                        ) : (
                          <span className={`badge text-[11px] ${doc.verification_status === "verified" ? "badge-success" : doc.verification_status === "rejected" ? "badge-danger" : "badge-info"}`}>
                            {doc.verification_status || "Pending"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Upload size={20} className="text-text-muted" />
                </div>
                <p className="text-sm text-text-muted">No documents uploaded yet</p>
              </div>
            )}
          </div>

          {/* Payment */}
          {application.payment && (
            <div className="card">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gold/8 flex items-center justify-center">
                  <CreditCard size={16} className="text-gold" />
                </div>
                <h2 className="text-base font-bold text-text-primary">Payment</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="info-field">
                  <p className="info-label">Amount</p>
                  <p className="info-value text-lg">{application.payment.currency} {application.payment.amount}</p>
                </div>
                <div className="info-field">
                  <p className="info-label">Status</p>
                  <div className="mt-1">
                    <span className={`badge ${application.payment.status === "completed" ? "badge-success" : application.payment.status === "failed" ? "badge-danger" : "badge-warning"}`}>
                      {application.payment.status}
                    </span>
                  </div>
                </div>
                <div className="info-field">
                  <p className="info-label">Reference</p>
                  <p className="info-value text-xs font-mono">{application.payment.transaction_reference}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 w-full">
          {/* Timeline */}
          <div className="card">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gold/8 flex items-center justify-center">
                <Clock size={16} className="text-gold" />
              </div>
              <h2 className="text-base font-bold text-text-primary">Timeline</h2>
            </div>
            {timeline.length > 0 ? (
              <Timeline items={timeline} />
            ) : (
              <div className="text-center py-6">
                <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Clock size={18} className="text-text-muted" />
                </div>
                <p className="text-xs text-text-muted">No status updates yet</p>
              </div>
            )}
          </div>

          {/* Decision Notes */}
          {application.decision_notes && (
            <div className="card border-l-[3px] border-l-accent">
              <div className="flex items-center gap-2.5 mb-3">
                <MessageSquare size={16} className="text-accent" />
                <h3 className="text-sm font-bold text-text-primary">Decision Notes</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{application.decision_notes}</p>
            </div>
          )}
        </div>
      </div>

      {showEvisaPreview && (
        <EVisaPreview
          isOpen={showEvisaPreview}
          onClose={() => setShowEvisaPreview(false)}
          data={eVisaData}
        />
      )}

      {/* ── Submit Response Modal ── */}
      {showResponseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowResponseModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Send size={24} className="text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Submit Response</h3>
                <p className="text-sm text-text-secondary">Confirm you've provided the requested information</p>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Optional Message to Officer
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none"
                rows={4}
                placeholder="Add any notes about the changes you made or documents you uploaded..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                maxLength={1000}
              />
              <p className="text-xs text-text-muted mt-1">{responseMessage.length}/1000 characters</p>
            </div>
            <div className="bg-info/5 rounded-xl p-4 mb-6 border border-info/10">
              <p className="text-sm text-text-secondary">
                <strong className="text-text-primary">Note:</strong> After submitting, your application will return to "Under Review" status and the assigned officer will be notified to review your updates.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowResponseModal(false)}
                disabled={submittingResponse}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitResponse}
                loading={submittingResponse}
                leftIcon={<Send size={16} />}
              >
                Submit Response
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
