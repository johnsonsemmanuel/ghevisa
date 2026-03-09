"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge, SlaIndicator } from "@/components/ui/badge";
import { Timeline } from "@/components/ui/timeline";

import { CardSkeleton } from "@/components/ui/skeleton";
import { DocumentPreview } from "@/components/ui/document-preview";
import {
  ArrowLeft,
  FileText,
  User,
  Plane,
  Clock,
  CreditCard,
  Eye,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import type { Application } from "@/lib/types";

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

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
    queryKey: ["admin-application", id],
    queryFn: () =>
      api.get<{ application: Application }>(`/admin/applications/${id}`).then((r) => r.data),
  });

  const application = data?.application;

  if (isLoading) {
    return (
      <DashboardShell title="Application Details" description="Loading...">
        <CardSkeleton />
      </DashboardShell>
    );
  }

  if (!application) {
    return (
      <DashboardShell title="Application Not Found" description="">
        <div className="card text-center py-12">
          <p className="text-text-muted">Application not found or you don&apos;t have access.</p>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={`Application ${application.reference_number}`}
      description="Admin view of application details"
      actions={
        <Button variant="secondary" leftIcon={<ArrowLeft size={16} />} onClick={() => router.back()}>
          Back
        </Button>
      }
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Status</h2>
              <StatusBadge status={application.status} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-text-muted mb-1">Visa Type</p>
                <p className="text-sm font-medium text-text-primary">{application.visa_type?.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Processing Tier</p>
                <p className="text-sm font-medium text-text-primary capitalize">
                  {application.processing_tier?.replace("_", " ") || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Assigned Agency</p>
                <p className="text-sm font-medium text-text-primary uppercase">
                  {application.assigned_agency || "Not Assigned"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">SLA Deadline</p>
                {application.sla_deadline ? (
                  <p className="text-sm font-medium text-text-primary">
                    {new Date(application.sla_deadline).toLocaleString()}
                  </p>
                ) : (
                  <p className="text-sm text-text-muted">—</p>
                )}
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Reviewed By</p>
                <p className="text-sm font-medium text-text-primary">
                  {application.reviewing_officer
                    ? `${application.reviewing_officer.first_name} ${application.reviewing_officer.last_name}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Approved By</p>
                <p className="text-sm font-medium text-text-primary">
                  {application.approval_officer
                    ? `${application.approval_officer.first_name} ${application.approval_officer.last_name}`
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Applicant Info */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-accent" />
              <h2 className="text-lg font-semibold text-text-primary">Applicant Information</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Full Name</p>
                  <p className="text-sm font-medium text-text-primary">
                    {application.first_name} {application.last_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Date of Birth</p>
                  <p className="text-sm font-medium text-text-primary">{application.date_of_birth || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Gender</p>
                  <p className="text-sm font-medium text-text-primary capitalize">{application.gender || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Place of Birth</p>
                  <p className="text-sm font-medium text-text-primary uppercase">{application.country_of_birth || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Marital Status</p>
                  <p className="text-sm font-medium text-text-primary capitalize">{application.marital_status || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Occupation/Profession</p>
                  <p className="text-sm font-medium text-text-primary">{application.profession || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Passport Number</p>
                  <p className="text-sm font-medium text-text-primary font-mono">{application.passport_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Issue Date</p>
                  <p className="text-sm font-medium text-text-primary">{application.passport_issue_date || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Expiry Date</p>
                  <p className="text-sm font-medium text-text-primary">{application.passport_expiry || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Nationality</p>
                  <p className="text-sm font-medium text-text-primary">{application.nationality}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Email</p>
                  <p className="text-sm font-medium text-text-primary">{application.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Phone</p>
                  <p className="text-sm font-medium text-text-primary">{application.phone || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Travel Info */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Plane size={18} className="text-accent" />
              <h2 className="text-lg font-semibold text-text-primary">Travel Information</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Intended Arrival</p>
                  <p className="text-sm font-medium text-text-primary">{application.intended_arrival || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Duration</p>
                  <p className="text-sm font-medium text-text-primary">
                    {application.duration_days ? `${application.duration_days} days` : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin size={16} className="text-text-muted mt-0.5" />
                <div>
                  <p className="text-xs text-text-muted">Address in Ghana</p>
                  <p className="text-sm font-medium text-text-primary">{application.address_in_ghana || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin size={16} className="text-text-muted mt-0.5" />
                <div>
                  <p className="text-xs text-text-muted">Port of Entry</p>
                  <p className="text-sm font-medium text-text-primary">{application.port_of_entry || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <FileText size={16} className="text-text-muted mt-0.5" />
                <div>
                  <p className="text-xs text-text-muted">Purpose of Visit</p>
                  <p className="text-sm font-medium text-text-primary">{application.purpose_of_visit || "—"}</p>
                </div>
              </div>
              {(application.visited_country_1 || application.visited_country_2 || application.visited_country_3) && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <Globe size={16} className="text-text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-text-muted">Recently Visited Countries</p>
                    <p className="text-sm font-medium text-text-primary">
                      {[application.visited_country_1, application.visited_country_2, application.visited_country_3].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Health & Security Info */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={18} className="text-accent" />
              <h2 className="text-lg font-semibold text-text-primary">Health & Security Declarations</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${application.health_declaration_fever ? 'bg-error-main' : 'bg-success-main'}`}></div>
                <div>
                  <p className="text-xs text-text-muted">High Fever</p>
                  <p className="text-sm font-medium text-text-primary">{application.health_declaration_fever ? "Yes" : "No"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${application.health_declaration_cough ? 'bg-error-main' : 'bg-success-main'}`}></div>
                <div>
                  <p className="text-xs text-text-muted">Coughing / Breathing Difficulties</p>
                  <p className="text-sm font-medium text-text-primary">{application.health_declaration_cough || application.health_declaration_breathing ? "Yes" : "No"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${application.health_declaration_yellow_fever ? 'bg-success-main' : 'bg-error-main'}`}></div>
                <div>
                  <p className="text-xs text-text-muted">Yellow Fever Immunized</p>
                  <p className="text-sm font-medium text-text-primary">{application.health_declaration_yellow_fever ? "Yes" : "No"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${application.security_declaration_convicted ? 'bg-error-main' : 'bg-success-main'}`}></div>
                <div>
                  <p className="text-xs text-text-muted">Criminal Conviction</p>
                  <p className="text-sm font-medium text-text-primary">{application.security_declaration_convicted ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} className="text-accent" />
              <h2 className="text-lg font-semibold text-text-primary">Documents</h2>
            </div>
            {application.documents && application.documents.length > 0 ? (
              <div className="space-y-3">
                {application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-surface rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-accent" />
                      <div>
                        <p className="text-sm font-medium text-text-primary capitalize">
                          {doc.document_type.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-text-muted">{doc.original_filename}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Eye size={14} />}
                      onClick={() => setPreviewDoc({
                        id: doc.id,
                        document_type: doc.document_type,
                        original_filename: doc.original_filename,
                        stored_path: doc.stored_path,
                        mime_type: doc.mime_type,
                        file_size: doc.file_size,
                        verification_status: doc.verification_status,
                      })}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-4">No documents uploaded</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Info */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={18} className="text-accent" />
              <h2 className="text-lg font-semibold text-text-primary">Payment</h2>
            </div>
            {application.payment ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-text-muted">Amount</span>
                  <span className="text-sm font-medium text-text-primary">
                    {application.payment.currency} {application.payment.amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-muted">Status</span>
                  <span className={`text-sm font-medium ${application.payment.status === 'completed' ? 'text-success' :
                    application.payment.status === 'failed' ? 'text-danger' : 'text-warning'
                    }`}>
                    {application.payment.status.charAt(0).toUpperCase() + application.payment.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-muted">Reference</span>
                  <span className="text-xs font-mono text-text-primary">
                    {application.payment.transaction_reference}
                  </span>
                </div>
                {application.payment.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-text-muted">Paid At</span>
                    <span className="text-sm text-text-primary">
                      {new Date(application.payment.paid_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-4">No payment record</p>
            )}
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-accent" />
              <h2 className="text-lg font-semibold text-text-primary">Status History</h2>
            </div>
            {application.status_history && application.status_history.length > 0 ? (
              <Timeline items={application.status_history.map(h => ({
                status: h.to_status,
                notes: h.notes,
                changed_at: h.created_at,
              }))} />
            ) : (
              <p className="text-sm text-text-muted text-center py-4">No history available</p>
            )}
          </div>

          {/* Metadata */}
          <div className="card">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Metadata</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Created</span>
                <span className="text-text-primary">{new Date(application.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Updated</span>
                <span className="text-text-primary">{new Date(application.updated_at).toLocaleString()}</span>
              </div>
              {application.submitted_at && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Submitted</span>
                  <span className="text-text-primary">{new Date(application.submitted_at).toLocaleString()}</span>
                </div>
              )}
              {application.reviewing_officer && (
                <div className="flex justify-between gap-4">
                  <span className="text-text-muted">Reviewer</span>
                  <span className="text-text-primary text-right">
                    {application.reviewing_officer.first_name} {application.reviewing_officer.last_name}
                  </span>
                </div>
              )}
              {application.approval_officer && (
                <div className="flex justify-between gap-4">
                  <span className="text-text-muted">Approval Officer</span>
                  <span className="text-text-primary text-right">
                    {application.approval_officer.first_name} {application.approval_officer.last_name}
                  </span>
                </div>
              )}
              {application.decided_at && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Decided</span>
                  <span className="text-text-primary">{new Date(application.decided_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreview
          isOpen={true}
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
          downloadUrl={`${process.env.NEXT_PUBLIC_API_URL}/admin/applications/${application.id}/documents/${previewDoc.id}/download`}
        />
      )}
    </DashboardShell>
  );
}
