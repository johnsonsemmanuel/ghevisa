"use client";

import { X, Download, Printer, CheckCircle2, Shield, Fingerprint, Globe } from "lucide-react";
import { Button } from "./button";
import QRCode from "react-qr-code";

interface EVisaPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
  data: {
    reference_number: string;
    full_name: string;
    passport_number: string;
    nationality: string;
    visa_type: string;
    arrival_date: string;
    duration_days: number;
    issued_at: string;
    valid_until: string;
    qr_code: string;
  } | null;
}

export function EVisaPreview({ isOpen, onClose, onDownload, data }: EVisaPreviewProps) {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:static print:block">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm print:hidden" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-auto print:max-w-none print:shadow-none print:rounded-none animate-scale-in flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/80 hover:bg-white shadow-sm hover:shadow transition-all print:hidden z-10 group"
        >
          <X size={16} className="text-slate-500 group-hover:text-slate-700" />
        </button>

        {/* Visa Card */}
        <div className="m-3 sm:m-4 bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200/50">
          {/* Header */}
          <div className="bg-gradient-to-r from-accent via-accent/90 to-accent-dark text-white p-4 sm:p-5 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
            <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-white/5 rounded-full" />

            <div className="relative flex justify-between items-start">
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/gis-logo-new.png" alt="Ghana Immigration Service" width={64} height={64} className="drop-shadow-lg rounded-lg bg-white/10 p-1" />
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide mb-2">
                    <span className="text-base">🇬🇭</span>
                    <span>REPUBLIC OF GHANA</span>
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight mb-0.5">Electronic Visa</h1>
                  <p className="text-xs text-white/80 flex items-center gap-1.5">
                    <Globe size={12} />
                    Ghana Immigration Service • Official Document
                  </p>
                </div>
              </div>
              <div className="text-right bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl">
                <p className="text-[9px] uppercase tracking-widest text-white/70 mb-0.5">Reference No.</p>
                <p className="text-base font-bold font-mono tracking-wider">{data.reference_number}</p>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          <div className="bg-success text-white py-2 px-4 flex items-center justify-center gap-2">
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle2 size={12} />
            </div>
            <span className="font-bold tracking-wide uppercase text-xs">Visa Approved & Valid for Entry</span>
          </div>

          {/* Main Content */}
          <div className="p-4 py-3 sm:p-5 sm:py-4">
            {/* Traveler Information */}
            <div className="mb-4">
              <h3 className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mb-2 pb-1 border-b border-slate-100">
                Traveler Information
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2 bg-accent/5 rounded-xl p-3 border border-accent/10">
                  <p className="text-[9px] uppercase tracking-wider text-accent font-semibold mb-0.5">Full Name (as in passport)</p>
                  <p className="text-base font-bold text-slate-800">{data.full_name}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Passport Number</p>
                  <p className="text-sm font-bold text-slate-800 font-mono tracking-wider">{data.passport_number}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Nationality</p>
                  <p className="text-sm font-bold text-slate-800">{data.nationality}</p>
                </div>
              </div>
            </div>

            {/* Visa Details */}
            <div className="mb-4">
              <h3 className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mb-2 pb-1 border-b border-slate-100">
                Visa Details
              </h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-2 sm:col-span-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Visa Type</p>
                  <p className="text-sm font-bold text-slate-800 leading-tight">{data.visa_type}</p>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Duration</p>
                  <p className="text-sm font-bold text-slate-800 leading-tight">{data.duration_days} Days</p>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Issue Date</p>
                  <p className="text-sm font-bold text-slate-800 leading-tight">{data.issued_at}</p>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Valid Until</p>
                  <p className="text-sm font-bold text-success leading-tight">{data.valid_until}</p>
                </div>
                <div className="col-span-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Expected Arrival Date</p>
                  <p className="text-sm font-bold text-slate-800">{data.arrival_date}</p>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-primary rounded-2xl p-4 flex items-center gap-4">
              <div className="bg-white p-2 rounded-xl shadow-sm flex-shrink-0">
                <QRCode value={data.qr_code} size={84} level="H" />
              </div>
              <div className="flex-1 text-white">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center">
                    <Fingerprint size={14} />
                  </div>
                  <span className="font-bold text-sm">Digital Verification</span>
                </div>
                <p className="text-slate-300 text-[11px] mb-2 leading-snug">
                  Scan this QR code at any Ghana port of entry to instantly verify the authenticity of this electronic visa.
                </p>
                <div className="inline-block bg-white/10 text-white px-2 py-1 rounded font-mono text-xs">
                  {data.qr_code}
                </div>
                <p className="text-slate-400 text-[9px] mt-2">
                  Verify online: <span className="text-accent-light font-semibold">verify.ghanaevisa.gov.gh</span>
                </p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-4 bg-warning/10 border border-warning/20 rounded-xl p-3 flex gap-3 items-start sm:items-center">
              <div className="w-8 h-8 bg-warning rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield size={16} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-yellow-800 text-xs mb-0.5">Important Security Notice</p>
                <p className="text-[10px] text-yellow-700 leading-snug">
                  This electronic visa must be printed and presented with your valid passport upon arrival.
                  Tampering with or forging this document is a criminal offence under Ghanaian law.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/gis-logo-new.png" alt="Ghana Immigration Service" width={32} height={32} className="drop-shadow-sm" />
              <div>
                <p className="font-bold text-slate-700 text-xs">Ghana Immigration Service</p>
                <p className="text-[10px] text-slate-400">Ministry of the Interior</p>
              </div>
            </div>
            <div className="text-right text-[9px] text-slate-400 leading-tight">
              <p>Document generated electronically</p>
              <p>Valid without physical signature</p>
              <p>© {new Date().getFullYear()} Government of Ghana</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center p-3 sm:pb-4 print:hidden shrink-0">
          <Button variant="secondary" size="sm" leftIcon={<Printer size={16} />} onClick={handlePrint} className="shadow-sm">
            Print
          </Button>
          {onDownload && (
            <Button size="sm" leftIcon={<Download size={16} />} onClick={onDownload} className="shadow-sm bg-success hover:bg-success/90 border-0">
              Download PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
