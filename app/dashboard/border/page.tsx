"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BorderDecisionModal } from "@/components/ui/border-decision-modal";
import { TrustNetPanel } from "@/components/ui/trustnet-panel";
import { PnrFlightPanel } from "@/components/ui/pnr-flight-panel";
import {
  QrCode, Search, Shield, CheckCircle2, AlertTriangle, XCircle,
  Plane, Activity, Scan, MapPin,
  History, FileText, Settings,
} from "lucide-react";

interface VerificationResult {
  valid: boolean;
  status: string;
  message: string;
  document?: {
    type: string;
    reference_number?: string;
    eta_number?: string;
    holder_name: string;
    nationality: string;
    passport_number_masked: string;
    visa_type?: string;
    entry_type: string;
    valid_until: string;
    approved_on?: string;
  };
  alerts?: Array<{ type: string; message: string }>;
  risk_warnings?: string[];
  previous_entries?: Array<{ port: string; date: string }>;
  pnr_data?: {
    pnr_code: string;
    passenger_name: string;
    seat_number?: string;
    booking_class?: string;
    checked_bags?: number;
    flight: {
      flight_number: string;
      airline: string;
      departure_airport: string;
      arrival_airport: string;
      departure_time: string;
      arrival_time: string;
      status: "on_time" | "delayed" | "arrived" | "boarding";
      passenger_count?: number;
      gate?: string;
    };
    manifest_match: boolean;
    boarding_status: "not_boarded" | "boarded" | "no_show";
  };
  trustnet_data?: {
    passport_authentic: boolean;
    mrz_valid: boolean;
    interpol_clear: boolean;
    watchlist_clear: boolean;
    identity_verified: boolean;
    fraud_indicators: string[];
    risk_score: number;
    last_checked: string;
  };
}

export default function BorderPortalPage() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<"qr" | "manual">("qr");
  const [qrData, setQrData] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [documentType, setDocumentType] = useState<"evisa" | "eta">("evisa");
  const [selectedPort, setSelectedPort] = useState("KIA");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decisionModal, setDecisionModal] = useState<{ open: boolean; type: "admit" | "secondary" | "deny" }>({ open: false, type: "admit" });
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["border-stats", selectedPort],
    queryFn: () => api.get(`/border/statistics?port=${selectedPort}`).then((r) => r.data),
    refetchInterval: 30000,
  });

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = searchType === "qr"
        ? await api.post("/border/verify-qr", { qr_data: qrData, port_of_entry: selectedPort, passport_number: passportNumber })
        : await api.post("/border/verify", { document_type: documentType, reference_number: referenceNumber, passport_number: passportNumber });
      setVerificationResult(response.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: VerificationResult } };
      setVerificationResult(e.response?.data || null);
      if (!e.response?.data) setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const getColor = (r: VerificationResult) => !r.valid ? "red" : (r.alerts?.length || r.risk_warnings?.length) ? "amber" : "green";

  const handleDecision = async (decision: string, reasonCode: string, notes: string) => {
    if (!verificationResult?.document) return;
    setLoading(true);
    setError(null);
    try {
      await api.post("/border/crossing", {
        crossing_type: "entry",
        port_of_entry: selectedPort,
        document_type: verificationResult.document.type,
        passport_number: passportNumber,
        traveler_name: verificationResult.document.holder_name,
        nationality: verificationResult.document.nationality,
        verification_status: decision === "admit" ? "valid" : decision === "secondary" ? "secondary_inspection" : "invalid",
        verification_notes: `[${reasonCode}] ${notes}`.trim(),
        flight_number: verificationResult.pnr_data?.flight?.flight_number || null,
        airline: verificationResult.pnr_data?.flight?.airline || null,
      });
      setDecisionModal({ open: false, type: "admit" });
      setVerificationResult(null);
      setQrData("");
      setPassportNumber("");
      setReferenceNumber("");
      queryClient.invalidateQueries({ queryKey: ["border-stats"] });
    } catch {
      setError("Failed to record entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    {
      label: "Entries",
      value: stats?.entries ?? 0,
      icon: CheckCircle2,
      wrapperClass: "rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-4",
      iconClass: "text-emerald-600",
      labelClass: "text-emerald-600",
    },
    {
      label: "Exits",
      value: stats?.exits ?? 0,
      icon: Plane,
      wrapperClass: "rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4",
      iconClass: "text-blue-600",
      labelClass: "text-blue-600",
    },
    {
      label: "Secondary",
      value: stats?.by_status?.secondary_inspection ?? 0,
      icon: AlertTriangle,
      wrapperClass: "rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-4",
      iconClass: "text-amber-600",
      labelClass: "text-amber-600",
    },
    {
      label: "Denied",
      value: stats?.by_status?.invalid ?? 0,
      icon: XCircle,
      wrapperClass: "rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-4",
      iconClass: "text-red-600",
      labelClass: "text-red-600",
    },
  ];

  return (
    <DashboardShell
      title="Border Verification Portal"
      description="Ghana Immigration Service — Entry Point Verification"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => router.push("/dashboard/border/reports")}>
            <FileText size={14} className="mr-1" /> Reports
          </Button>
          <Button variant="secondary" size="sm" onClick={() => router.push("/dashboard/border/operations")}>
            <Settings size={14} className="mr-1" /> Operations
          </Button>
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricCards.map((card, i) => (
          <div key={i} className={card.wrapperClass}>
            <div className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center mb-2">
              <card.icon size={20} className={card.iconClass} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            <p className={`text-sm font-semibold ${card.labelClass}`}>{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Verification Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-violet-50 rounded-xl flex items-center justify-center">
                <Scan size={24} className="text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Traveler Verification</h2>
                <p className="text-sm text-slate-500">Scan QR or enter details</p>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              {["qr", "manual"].map((t) => (
                <button key={t} onClick={() => setSearchType(t as "qr" | "manual")}
                  className={`flex-1 p-4 rounded-xl border-2 font-semibold transition-colors duration-150 ease-out ${searchType === t ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 hover:border-slate-300"}`}>
                  {t === "qr" ? <><QrCode size={18} className="inline mr-2" />QR Scan</> : <><Search size={18} className="inline mr-2" />Manual</>}
                </button>
              ))}
            </div>

            {searchType === "qr" ? (
              <div className="space-y-4">
                <Input placeholder="Scan QR code..." value={qrData} onChange={(e) => setQrData(e.target.value)} />
                <Input placeholder="Passport number..." value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} />
              </div>
            ) : (
              <div className="space-y-4">
                <select value={documentType} onChange={(e) => setDocumentType(e.target.value as "evisa" | "eta")} className="w-full p-4 rounded-xl border transition-colors duration-150 ease-out focus:border-accent">
                  <option value="evisa">eVisa</option>
                  <option value="eta">ETA</option>
                </select>
                <Input placeholder="Reference number..." value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} />
                <Input placeholder="Passport number..." value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} />
              </div>
            )}

            {error && <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-700">{error}</div>}
            <Button className="w-full mt-6" size="lg" onClick={handleVerify} loading={loading}><Shield size={20} className="mr-2" />Verify</Button>
          </div>

          {/* Result */}
          {verificationResult && (
            <div className={`bg-white rounded-2xl border-2 shadow-lg overflow-hidden ${getColor(verificationResult) === "green" ? "border-emerald-300" : getColor(verificationResult) === "amber" ? "border-amber-300" : "border-red-300"}`}>
              <div className={`p-6 ${getColor(verificationResult) === "green" ? "bg-emerald-500" : getColor(verificationResult) === "amber" ? "bg-amber-500" : "bg-red-500"}`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    {getColor(verificationResult) === "green" ? <CheckCircle2 size={32} className="text-white" /> : getColor(verificationResult) === "amber" ? <AlertTriangle size={32} className="text-white" /> : <XCircle size={32} className="text-white" />}
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Result</p>
                    <p className="text-white text-2xl font-bold">{getColor(verificationResult).toUpperCase()}</p>
                  </div>
                </div>
              </div>
              {verificationResult.document && (
                <div className="p-6">
                  {/* Fast View Card */}
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    {[
                      ["Name", verificationResult.document.holder_name],
                      ["Nationality", verificationResult.document.nationality],
                      ["Passport", verificationResult.document.passport_number_masked],
                      ["Document Type", verificationResult.document.type.toUpperCase()],
                      ["Valid Until", verificationResult.document.valid_until],
                      ["Entry Type", verificationResult.document.entry_type],
                    ].map(([l, v]) => (
                      <div key={l} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-xs text-slate-500">{l}</p>
                        <p className="font-bold text-slate-800">{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* TrustNET & PNR Panels */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <TrustNetPanel data={verificationResult.trustnet_data} compact />
                    <PnrFlightPanel data={verificationResult.pnr_data} compact />
                  </div>

                  {/* Alerts Section */}
                  {(verificationResult.alerts && verificationResult.alerts.length > 0) && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={18} className="text-red-600" />
                        <span className="font-bold text-red-700">ALERTS ({verificationResult.alerts.length})</span>
                      </div>
                      <div className="space-y-2">
                        {verificationResult.alerts.map((alert, i) => (
                          <div key={i} className="p-3 rounded-lg bg-red-100 text-red-700 text-sm font-medium">
                            {alert.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Previous Entries */}
                  {verificationResult.previous_entries && verificationResult.previous_entries.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <History size={16} className="text-slate-500" />
                        <span className="text-sm font-semibold text-slate-700">Previous Entries</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {verificationResult.previous_entries.map((entry, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                            {entry.port} • {entry.date}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-slate-200">
                    <Button className="flex-1 !bg-emerald-600 hover:!bg-emerald-700" size="lg" onClick={() => setDecisionModal({ open: true, type: "admit" })}>
                      <CheckCircle2 size={18} className="mr-2" />Admit Entry
                    </Button>
                    <Button className="flex-1 !bg-amber-600 hover:!bg-amber-700" size="lg" onClick={() => setDecisionModal({ open: true, type: "secondary" })}>
                      <AlertTriangle size={18} className="mr-2" />Secondary
                    </Button>
                    <Button variant="danger" className="flex-1" size="lg" onClick={() => setDecisionModal({ open: true, type: "deny" })}>
                      <XCircle size={18} className="mr-2" />Deny Entry
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Port Info */}
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <MapPin size={24} className="text-white/80" />
              <h3 className="text-lg font-bold">Current Port</h3>
            </div>
            <p className="text-xl font-bold mb-2">
              {selectedPort === "KIA" ? "Kotoka Int'l Airport" :
                selectedPort === "ACC" ? "Tema Port" :
                  selectedPort === "TKD" ? "Takoradi Port" :
                    selectedPort === "AFL" ? "Aflao Border" :
                      selectedPort === "ELB" ? "Elubo Border" : selectedPort}
            </p>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Activity size={14} />
              <span>Online • Active</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <Button
                variant="secondary"
                size="sm"
                className="w-full !bg-white/20 !text-white hover:!bg-white/30"
                onClick={() => router.push("/dashboard/border/operations")}
              >
                <Settings size={14} className="mr-2" />
                Supervisor Dashboard
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center">
                <Activity size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Today&apos;s Stats</h3>
                <p className="text-xs text-slate-500">Your shift summary</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">Admitted</span>
                </div>
                <span className="text-lg font-bold text-emerald-600">{stats?.entries ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <span className="text-sm font-medium text-slate-700">Secondary</span>
                </div>
                <span className="text-lg font-bold text-amber-600">{stats?.by_status?.secondary_inspection ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-2">
                  <XCircle size={16} className="text-red-600" />
                  <span className="text-sm font-medium text-slate-700">Denied</span>
                </div>
                <span className="text-lg font-bold text-red-600">{stats?.by_status?.invalid ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-slate-400" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button variant="secondary" size="sm" className="w-full justify-start">
                <History size={14} className="mr-2" /> View Entry Log
              </Button>
              <Button variant="secondary" size="sm" className="w-full justify-start">
                <Shield size={14} className="mr-2" /> Watchlist Alerts
              </Button>
              <Button variant="secondary" size="sm" className="w-full justify-start">
                <Plane size={14} className="mr-2" /> Flight Manifest
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      <BorderDecisionModal
        isOpen={decisionModal.open}
        onClose={() => setDecisionModal({ open: false, type: "admit" })}
        onSubmit={handleDecision}
        decisionType={decisionModal.type}
        travelerName={verificationResult?.document?.holder_name || "Unknown Traveler"}
        loading={loading}
      />
    </DashboardShell>
  );
}
