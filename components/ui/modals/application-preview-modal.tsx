"use client";

import { useState, useEffect } from "react";
import { X, Download, FileText, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

interface ApplicationPreviewModalProps {
  open: boolean;
  onClose: () => void;
  applicationId: number;
}

export function ApplicationPreviewModal({ open, onClose, applicationId }: ApplicationPreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  useEffect(() => {
    if (open && applicationId) {
      fetchPreview();
    }
  }, [open, applicationId]);

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/applicant/applications/${applicationId}/preview`);
      if (response.data.success) {
        setPreview(response.data.preview);
      }
    } catch (error) {
      console.error('Failed to fetch preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/applicant/applications/${applicationId}/preview/pdf`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `application-preview-${preview?.reference_number || 'draft'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t('preview.title')}</h2>
              <p className="text-sm text-gray-500">{t('preview.review')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          ) : preview ? (
            <div className="space-y-6">
              {/* Reference Number */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Reference Number</p>
                <p className="text-lg font-bold text-gray-900">{preview.reference_number}</p>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">1</div>
                  {t('preview.personal_info')}
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm font-medium text-gray-900">{preview.personal.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="text-sm font-medium text-gray-900">{preview.personal.date_of_birth}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-sm font-medium text-gray-900">{preview.personal.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Nationality</p>
                    <p className="text-sm font-medium text-gray-900">{preview.personal.nationality}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{preview.personal.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{preview.personal.phone}</p>
                  </div>
                </div>
              </div>

              {/* Passport Information */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">2</div>
                  {t('preview.passport_info')}
                </h3>
                <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-500">Passport Number</p>
                    <p className="text-sm font-medium text-gray-900">{preview.passport.number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Issue Date</p>
                    <p className="text-sm font-medium text-gray-900">{preview.passport.issue_date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expiry Date</p>
                    <p className="text-sm font-medium text-gray-900">{preview.passport.expiry_date}</p>
                  </div>
                </div>
              </div>

              {/* Visa Information */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">3</div>
                  {t('preview.visa_info')}
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-500">Visa Type</p>
                    <p className="text-sm font-medium text-gray-900">{preview.visa.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Channel</p>
                    <p className="text-sm font-medium text-gray-900">{preview.visa.channel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Entry Type</p>
                    <p className="text-sm font-medium text-gray-900">{preview.visa.entry_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Processing Tier</p>
                    <p className="text-sm font-medium text-gray-900">{preview.visa.processing_tier}</p>
                  </div>
                </div>
              </div>

              {/* Travel Information */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">4</div>
                  {t('preview.travel_info')}
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-gray-500">Intended Arrival</p>
                    <p className="text-sm font-medium text-gray-900">{preview.travel.intended_arrival}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-medium text-gray-900">{preview.travel.duration_days} days</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Purpose of Visit</p>
                    <p className="text-sm font-medium text-gray-900">{preview.travel.purpose}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">5</div>
                  {t('preview.documents')}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {preview.documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.type}</p>
                        <p className="text-xs text-gray-500">{doc.filename}</p>
                      </div>
                      <p className="text-xs text-gray-500">{doc.uploaded_at}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fees */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">6</div>
                  {t('preview.fees')}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Government Fee</span>
                    <span className="text-sm font-medium text-gray-900">${preview.fees.government_fee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Platform Fee</span>
                    <span className="text-sm font-medium text-gray-900">${preview.fees.platform_fee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Processing Fee</span>
                    <span className="text-sm font-medium text-gray-900">${preview.fees.processing_fee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-blue-600">${preview.fees.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No preview data available
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" onClick={onClose}>
            {t('btn.close')}
          </Button>
          <Button onClick={handleDownloadPdf} className="flex items-center gap-2">
            <Download size={16} />
            {t('preview.download_pdf')}
          </Button>
        </div>
      </div>
    </div>
  );
}
