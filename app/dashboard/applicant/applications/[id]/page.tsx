"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge, SlaIndicator } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/ui/skeleton";
import { FileUpload } from "@/components/ui/file-upload";
import {
  ArrowLeft, Download, FileText, Clock, User, Plane,
  CreditCard, Upload, Eye, Edit, CheckCircle2, Shield, MessageSquare,
  AlertCircle, Send, X,
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
  const currentStatus = application?.status ?? "draft";

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
      <div className={`rounded-2xl bg-gradient-to-br ${statusGradient[application.status] || statusGradient.draft} border p-6 mb-4`}>
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
                  {application.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
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
                  {application.passport_issue_date ? new Date(application.passport_issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
                </p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Passport Expiry Date</p>
                <p className="text-text-primary font-medium">
                  {application.passport_expiry ? new Date(application.passport_expiry).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
                </p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Place of Birth</p>
                <p className="text-text-primary font-medium">{application.country_of_birth || "—"}</p>
              </div>
            </div>
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
                  {application.intended_arrival ? new Date(application.intended_arrival).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
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
                      <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                        <FileText size={16} className="text-info" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary capitalize">{doc.document_type.replace(/_/g, " ")}</p>
                        <p className="text-xs text-text-muted">{doc.original_filename} &middot; {(doc.file_size / 1024).toFixed(0)}KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.verification_status === "reupload_requested" || doc.ocr_status === "failed" ? (
                        <FileUpload accept=".jpeg,.jpg,.png,.pdf" onFileSelect={(file) => handleReupload(doc.id, file)} />
                      ) : (
                        <span className={`badge ${doc.verification_status === "verified" ? "badge-success" : doc.verification_status === "rejected" ? "badge-danger" : "badge-info"}`}>
                          {doc.verification_status || "Pending"}
                        </span>
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
          {statusData && statusData.timeline && statusData.timeline.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={18} className="text-text-muted" />
                <h2 className="text-lg font-semibold text-text-primary">Timeline</h2>
              </div>
              <div className="space-y-3">
                {statusData.timeline.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <Clock size={14} className="text-accent" />
                      </div>
                      {index !== statusData.timeline.length - 1 && (
                        <div className="w-0.5 flex-1 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={item.status} />
                        <span className="text-xs text-text-muted">
                          {new Date(item.changed_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-text-secondary mt-1">{item.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decision Notes */}
          {application.decision_notes && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={18} className="text-text-muted" />
                <h2 className="text-lg font-semibold text-text-primary">Decision Notes</h2>
              </div>
              <div className="p-3 rounded-lg bg-surface">
                <p className="text-sm text-text-secondary">{application.decision_notes}</p>
              </div>
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
