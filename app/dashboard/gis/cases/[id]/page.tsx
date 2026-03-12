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
import { DocumentPreview } from "@/components/ui/document-preview";
import {
  ArrowLeft, UserCheck, AlertTriangle, MessageSquare, CheckCircle2, XCircle, X,
  AlertCircle, Send, FileText, User, Plane, Clock, CreditCard, Eye, Shield, ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";
import type { Application, ReasonCode } from "@/lib/types";

export default function GisCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  // State management
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
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'timeline'>('overview');

  // Data fetching
  const { data, isLoading } = useQuery({
    queryKey: ["gis-case", id],
    queryFn: () => api.get<{ application: Application; sla_hours_left: number; is_within_sla: boolean }>(`/gis/cases/${id}`).then((r) => r.data),
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

  // Helper functions
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      return dateString;
    }
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
      {/* Compact Header with Key Info */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              {application.first_name?.[0]}{application.last_name?.[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                {application.first_name} {application.last_name}
              </h1>
              <p className="text-sm text-text-muted">{application.nationality} • {application.passport_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={application.status} />
            <SlaIndicator hoursLeft={data?.sla_hours_left ?? null} isWithinSla={data?.is_within_sla} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-text-muted">Visa Type</p>
            <p className="font-medium text-text-primary">{application.visa_type?.name || "—"}</p>
          </div>
          <div>
            <p className="text-text-muted">Purpose</p>
            <p className="font-medium text-text-primary">{application.purpose_of_visit || "—"}</p>
          </div>
          <div>
            <p className="text-text-muted">Arrival</p>
            <p className="font-medium text-text-primary">{formatDate(application.intended_arrival)}</p>
          </div>
          <div>
            <p className="text-text-muted">Duration</p>
            <p className="font-medium text-text-primary">{application.duration_days ? `${application.duration_days} days` : "—"}</p>
          </div>
        </div>
      </div>
      {/* Action Bar */}
      {canAct && (
        <div className="bg-white rounded-xl border border-border shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
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
        </div>
      )}

      {/* Status-specific Action Cards */}
      {application.status === "pending_approval" && (
        <div className="bg-warning/5 border border-warning/30 rounded-xl p-4 mb-6">
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
      {application.status === "approved" && (
        <div className="bg-success/5 border border-success/30 rounded-xl p-4 mb-6">
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

      {application.status === "issued" && (
        <div className="bg-success/5 border border-success/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-success" />
            <div>
              <h3 className="font-semibold text-text-primary">eVisa Issued</h3>
              <p className="text-sm text-text-secondary">The eVisa has been issued and the applicant has been notified via email.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabbed Content */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        {/* Tab Navigation */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'timeline', label: 'Timeline', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Risk Assessment */}
              {application.riskAssessment && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Shield size={18} />
                    Risk Assessment
                  </h3>
                  <div className="bg-surface rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-text-muted">Risk Score</p>
                        <p className="text-2xl font-bold text-text-primary">{application.riskAssessment.risk_score || 0}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        application.riskAssessment.risk_level === 'low' ? 'bg-success/10 text-success' :
                        application.riskAssessment.risk_level === 'medium' ? 'bg-warning/10 text-warning' :
                        application.riskAssessment.risk_level === 'high' ? 'bg-danger/10 text-danger' :
                        'bg-gray/10 text-gray'
                      }`}>
                        {application.riskAssessment.risk_level?.toUpperCase() || 'UNKNOWN'}
                      </div>
                    </div>
                    {application.riskAssessment.risk_reasons && application.riskAssessment.risk_reasons.length > 0 && (
                      <div>
                        <p className="text-sm text-text-muted mb-2">Risk Factors:</p>
                        <ul className="text-sm text-text-secondary space-y-1">
                          {application.riskAssessment.risk_reasons.map((reason, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-warning rounded-full" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Gender', value: application.gender },
                    { label: 'Date of Birth', value: formatDate(application.date_of_birth) },
                    { label: 'Marital Status', value: application.marital_status },
                    { label: 'Occupation', value: application.profession },
                    { label: 'Country of Birth', value: application.country_of_birth },
                    { label: 'Passport Issue', value: formatDate(application.passport_issue_date) },
                    { label: 'Passport Expiry', value: formatDate(application.passport_expiry) },
                    { label: 'Email', value: application.email },
                    { label: 'Phone', value: application.phone },
                  ].map((item) => (
                    <div key={item.label} className="bg-surface rounded-lg p-3">
                      <p className="text-xs text-text-muted mb-1">{item.label}</p>
                      <p className="text-sm font-medium text-text-primary">{item.value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Travel Details */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Plane size={18} />
                  Travel Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface rounded-lg p-4">
                    <p className="text-sm text-text-muted mb-1">Port of Entry</p>
                    <p className="font-medium text-text-primary">{application.port_of_entry || "—"}</p>
                  </div>
                  <div className="bg-surface rounded-lg p-4">
                    <p className="text-sm text-text-muted mb-1">Address in Ghana</p>
                    <p className="font-medium text-text-primary">{application.address_in_ghana || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Health & Security */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Shield size={18} />
                  Health & Security Declarations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'High Fever', value: application.health_declaration_fever },
                    { label: 'Cough/Breathing Issues', value: application.health_declaration_cough || application.health_declaration_breathing },
                    { label: 'Yellow Fever Vaccination', value: application.health_declaration_yellow_fever, positive: true },
                    { label: 'Criminal Conviction', value: application.security_declaration_convicted },
                  ].map((item) => (
                    <div key={item.label} className="bg-surface rounded-lg p-4 flex items-center justify-between">
                      <p className="text-sm font-medium text-text-primary">{item.label}</p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.positive 
                          ? (item.value ? "bg-success/10 text-success" : "bg-warning/10 text-warning")
                          : (item.value ? "bg-danger/10 text-danger" : "bg-success/10 text-success")
                      }`}>
                        {item.positive 
                          ? (item.value ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />)
                          : (item.value ? <X size={12} /> : <CheckCircle2 size={12} />)
                        }
                        {item.value ? "Yes" : "No"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              {application.payments && application.payments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <CreditCard size={18} />
                    Payment Details
                  </h3>
                  <div className="bg-surface rounded-lg p-4">
                    {application.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium text-text-primary">{payment.currency} {payment.amount}</p>
                          <p className="text-xs text-text-muted">{payment.transaction_reference}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            payment.status === "completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                          }`}>
                            <CheckCircle2 size={12} />
                            {payment.status}
                          </span>
                          <p className="text-xs text-text-muted mt-1">
                            {payment.paid_at ? formatDate(payment.paid_at) : "—"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'documents' && (
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <FileText size={18} />
                Documents ({application.documents?.length || 0})
              </h3>
              {application.documents && application.documents.length > 0 ? (
                <div className="grid gap-4">
                  {application.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center hover:bg-info/20 transition-colors"
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
                          <p className="text-xs text-text-muted">{doc.original_filename} • {(doc.file_size / 1024).toFixed(0)}KB</p>
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
                <p className="text-sm text-text-muted text-center py-8">No documents uploaded</p>
              )}
            </div>
          )}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Clock size={18} />
                  Status Timeline
                </h3>
                {application.status_history && application.status_history.length > 0 ? (
                  <Timeline
                    items={application.status_history.map((h) => ({
                      status: h.to_status,
                      notes: h.notes,
                      changed_at: h.created_at,
                    }))}
                  />
                ) : (
                  <p className="text-sm text-text-muted text-center py-8">No timeline history</p>
                )}
              </div>

              {/* Internal Notes */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <MessageSquare size={18} />
                  Internal Notes
                </h3>
                {application.internal_notes && application.internal_notes.length > 0 ? (
                  <div className="space-y-3">
                    {application.internal_notes.map((note) => (
                      <div key={note.id} className="p-4 rounded-lg bg-surface border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-text-primary">
                            {note.user ? `${note.user.first_name} ${note.user.last_name}` : "System"}
                          </span>
                          <span className="text-xs text-text-muted">{new Date(note.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-text-secondary">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted text-center py-8">No notes yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modals */}
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
                await api.post(`/gis/cases/${id}/approve`, { notes: text });
                toast.success("Application approved successfully");
                setApproveOpen(false);
                setText("");
                refresh();
              } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } } };
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
            maxSelections={10}
            label="Rejection Reasons (select at least one)"
          />
          <Textarea label="Additional Notes (optional)" placeholder="Any additional details about the denial..." value={text} onChange={(e) => setText(e.target.value)} rows={3} />
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={() => { setDenyOpen(false); setSelectedReasonCode(null); setSelectedReasonCodes([]); }}>Cancel</Button>
          <Button
            variant="danger"
            loading={loading}
            disabled={selectedReasonCodes.length === 0}
            onClick={async () => {
              if (selectedReasonCodes.length === 0) {
                toast.error("Please select at least one reason code");
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