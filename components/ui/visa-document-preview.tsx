"use client";

import { countries } from "@/lib/countries";
import Image from "next/image";

interface VisaDocumentPreviewProps {
  formData: {
    visa_channel?: string;
    visa_type_id?: string;
    entry_type?: string;
    service_tier_id?: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    nationality?: string;
    passport_number?: string;
    passport_issue_date?: string;
    passport_expiry?: string;
    intended_arrival?: string;
    duration_days?: string;
    address_in_ghana?: string;
    purpose_of_visit?: string;
  };
  documents: Record<string, File | null>;
  visaTypes: Array<{ id: number; name: string; type: string }>;
  serviceTiers: Array<{ id: number; code: string; name: string }>;
}

export function VisaDocumentPreview({ 
  formData, 
  documents, 
  visaTypes, 
  serviceTiers 
}: VisaDocumentPreviewProps) {
  const getCountryName = (code: string) => {
    const country = countries.find(c => c.code === code);
    return country ? country.name : code;
  };

  const getVisaTypeName = () => {
    const visaType = visaTypes.find(vt => vt.id.toString() === formData.visa_type_id);
    return visaType?.name || "—";
  };

  const getServiceTierName = () => {
    const tier = serviceTiers.find(st => st.id.toString() === formData.service_tier_id);
    return tier?.name || "—";
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getDocumentTitle = () => {
    if (!formData.visa_channel) return "Ghana Visa Application";
    if (formData.visa_channel === "e-visa") {
      return "GHANA IMMIGRATION SERVICE — Visa Application";
    }
    return "MINISTRY OF FOREIGN AFFAIRS — Visa Application";
  };

  const requiredDocuments = [
    "passport_bio",
    "passport_photo",
    "proof_of_accommodation",
    "flight_itinerary",
    "proof_of_funds",
    "invitation_letter"
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* A4 Proportions */}
      <div className="max-w-[800px] mx-auto" style={{ aspectRatio: '210/297' }}>
        
        {/* Header */}
        <div className="border-b-2 border-gray-300 px-8 py-4">
          <div className="flex items-center justify-between">
            {/* GIS Logo */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">GIS</span>
              </div>
              {/* TODO: Replace with actual logo */}
              {/* <Image src="/gis-logo.png" alt="GIS Logo" width={48} height={48} /> */}
            </div>
            
            {/* Title */}
            <div className="text-center flex-1">
              <h1 className="text-lg font-bold text-gray-800">{getDocumentTitle()}</h1>
            </div>
            
            {/* MFA Logo */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">MFA</span>
              </div>
              {/* TODO: Replace with actual logo */}
              {/* <Image src="/mfa-logo.png" alt="MFA Logo" width={48} height={48} /> */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-3 gap-6">
            
            {/* Left Column - Applicant Details */}
            <div className="col-span-2 space-y-4">
              
              {/* Photo Placeholder */}
              <div className="flex justify-end">
                <div className="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">Photo</span>
                </div>
              </div>

              {/* Applicant Details Section */}
              <div>
                <h2 className="text-sm font-bold text-gray-700 mb-3 border-b border-gray-200 pb-1">
                  APPLICANT DETAILS
                </h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Full Name:</span>
                    <p className="font-medium">
                      {formData.first_name && formData.last_name 
                        ? `${formData.first_name} ${formData.last_name}`
                        : "—"
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date of Birth:</span>
                    <p className="font-medium">{formatDate(formData.date_of_birth || "")}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Nationality:</span>
                    <p className="font-medium">{getCountryName(formData.nationality || "")}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Passport Number:</span>
                    <p className="font-medium">{formData.passport_number || "—"}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Passport Expiry:</span>
                    <p className="font-medium">{formatDate(formData.passport_expiry || "")}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Country of Residence:</span>
                    <p className="font-medium">{getCountryName(formData.nationality || "")}</p>
                  </div>
                </div>
              </div>

              {/* Visa Details Section */}
              <div>
                <h2 className="text-sm font-bold text-gray-700 mb-3 border-b border-gray-200 pb-1">
                  VISA DETAILS
                </h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Visa Type:</span>
                    <p className="font-medium">{getVisaTypeName()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Entry Type:</span>
                    <p className="font-medium capitalize">
                      {formData.entry_type === "single" ? "Single" : 
                       formData.entry_type === "multiple" ? "Multiple" : "—"}
                    </p>
                  </div>
                  {formData.visa_channel === "e-visa" && (
                    <div>
                      <span className="text-gray-600">Processing Tier:</span>
                      <p className="font-medium">{getServiceTierName()}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Intended Arrival:</span>
                    <p className="font-medium">{formatDate(formData.intended_arrival || "")}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration of Stay:</span>
                    <p className="font-medium">
                      {formData.duration_days ? `${formData.duration_days} days` : "—"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Purpose of Visit:</span>
                    <p className="font-medium">{formData.purpose_of_visit || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Address in Ghana:</span>
                    <p className="font-medium">{formData.address_in_ghana || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Document Status */}
            <div>
              <h2 className="text-sm font-bold text-gray-700 mb-3 border-b border-gray-200 pb-1">
                REQUIRED DOCUMENTS
              </h2>
              <div className="space-y-2 text-sm">
                {requiredDocuments.map((docType) => {
                  const isUploaded = !!documents[docType];
                  return (
                    <div key={docType} className="flex items-center gap-2">
                      <span className={isUploaded ? "text-green-600" : "text-gray-400"}>
                        {isUploaded ? "✅" : "⬜"}
                      </span>
                      <span className="capitalize">
                        {docType.replace(/_/g, " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 px-8 py-4 mt-6">
          <div className="text-center">
            <p className="text-xs text-gray-500 italic mb-2">
              This is a preview only. The official document will be issued upon approval.
            </p>
            <p className="text-xs text-gray-600 font-mono">
              REF: — — —
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
