"use client";
import { Check, Eye } from "lucide-react";
import type { VisaType, ServiceTier } from "@/lib/types";

interface VisaPreviewSidebarProps {
  form: Record<string, string>;
  selVT?: VisaType;
  selST?: ServiceTier;
  documents: Record<string, File | null>;
  cName: (code: string) => string;
  fmtDate: (d: string) => string;
  docTypes: { key: string; label: string }[];
}

export function VisaPreviewSidebar({ form, selVT, selST, documents, cName, fmtDate, docTypes }: VisaPreviewSidebarProps) {
  const isEta = form.authorization_type === "eta";
  const baseFee = isEta ? 20 : (selVT ? parseFloat(selVT.base_fee) : 260);
  const entryMultiplier = form.entry_type === "multiple" ? 1.8 : 1;
  const adjustedBase = baseFee * entryMultiplier;
  const procFee = selST ? (adjustedBase * parseFloat(selST.fee_multiplier) + parseFloat(selST.additional_fee)) - adjustedBase : 0;
  const totalFee = adjustedBase + procFee;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header with Both Logos */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Left Logo - GIS */}
          <div className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/gis-logo-new.png" 
              alt="Ghana Immigration Service" 
              className="h-12 w-auto object-contain"
            />
          </div>
          
          {/* Center Text */}
          <div className="flex-1 text-center px-2">
            <p className="text-xs font-semibold text-white uppercase tracking-wider">Ghana Immigration</p>
            <p className="text-[10px] text-white/70 mt-0.5">Application Preview</p>
          </div>
          
          {/* Right Logo - Secondary */}
          <div className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/gis-logo-secondary.png" 
              alt="Ghana Government" 
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Photo + Name */}
        <div className="flex items-start gap-3">
          <div className="w-16 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center shrink-0">
            <span className="text-xs text-gray-400">Photo</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-gray-900 truncate">
              {form.first_name || form.last_name ? `${form.first_name} ${form.last_name}`.trim() : "Your Name"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{form.nationality ? cName(form.nationality) : "Nationality"}</p>
            <p className="text-xs text-gray-400 font-mono truncate mt-1">{form.passport_number || "Passport Number"}</p>
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Visa details */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
          <PreviewField label="Visa Type" value={isEta ? "ETA" : selVT?.name} />
          {!isEta && <PreviewField label="Entry Type" value={form.entry_type} capitalize />}
          {selST && <PreviewField label="Processing" value={selST?.name || ""} />}
          <PreviewField label="Arrival Date" value={fmtDate(form.intended_arrival)} />
          <PreviewField label="Duration" value={form.duration_days ? `${form.duration_days} days` : undefined} />
          {form.port_of_entry && <PreviewField label="Port of Entry" value={form.port_of_entry} fullWidth />}
          <PreviewField label="Passport Expiry" value={fmtDate(form.passport_expiry)} />
          {form.email && <PreviewField label="Email" value={form.email} fullWidth truncate />}
          {form.phone && <PreviewField label="Phone" value={form.phone} />}
          {form.destination_city && <PreviewField label="Destination" value={form.destination_city} capitalize />}
        </div>

        <div className="h-px bg-gray-200" />

        {/* Documents checklist */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Required Documents</p>
          <div className="space-y-1.5">
            {docTypes.map((d) => (
              <div key={d.key} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${documents[d.key] ? "bg-green-500" : "bg-gray-200"}`}>
                  {documents[d.key] && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-xs text-gray-700">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Summary */}
        {(form.visa_type_id || isEta) && (
          <>
            <div className="h-px bg-gray-200" />
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fee Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Fee</span>
                <span className="font-medium">${adjustedBase.toFixed(2)}</span>
              </div>
              {procFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing</span>
                  <span className="font-medium">${procFee.toFixed(2)}</span>
                </div>
              )}
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex justify-between text-base">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-green-600">${totalFee.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">Live preview of your application</p>
      </div>
    </div>
  );
}

function PreviewField({ label, value, capitalize, truncate, fullWidth }: { label: string; value?: string; capitalize?: boolean; truncate?: boolean; fullWidth?: boolean }) {
  const display = value && value !== "\u2014" ? value : "\u2014";
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`text-sm font-semibold text-gray-900 mt-0.5 ${capitalize ? "capitalize" : ""} ${truncate ? "truncate" : ""}`}>{display}</p>
    </div>
  );
}
