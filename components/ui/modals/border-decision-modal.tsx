"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, AlertTriangle, XCircle, Shield, Search } from "lucide-react";
import { Button } from "./button";

interface ReasonCode {
  id: number;
  code: string;
  reason: string;
  description: string | null;
  action_type: string;
}

interface BorderDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (decision: string, reasonCode: string, notes: string) => void;
  decisionType: "admit" | "secondary" | "deny";
  travelerName: string;
  loading?: boolean;
}

export function BorderDecisionModal({
  isOpen,
  onClose,
  onSubmit,
  decisionType,
  travelerName,
  loading = false,
}: BorderDecisionModalProps) {
  const [selectedCode, setSelectedCode] = useState<ReasonCode | null>(null);
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Border reason codes based on decision type (BP-A, BP-S, BP-D format)
  const reasonCodes: ReasonCode[] = decisionType === "admit" ? [
    { id: 1, code: "BP-A01", reason: "Visa/ETA valid and matched", description: "Travel authorization verified and passport matched", action_type: "border_admit" },
    { id: 2, code: "BP-A02", reason: "Secondary cleared", description: "Cleared after secondary inspection", action_type: "border_admit" },
    { id: 3, code: "BP-A03", reason: "Supervisor override approved", description: "Entry approved by supervisor override", action_type: "border_admit" },
    { id: 4, code: "BP-A04", reason: "ECOWAS citizen - visa exempt", description: "ECOWAS national with valid travel document", action_type: "border_admit" },
    { id: 5, code: "BP-A05", reason: "Diplomatic passport holder", description: "Diplomatic immunity verified", action_type: "border_admit" },
  ] : decisionType === "secondary" ? [
    { id: 1, code: "BP-S01", reason: "Document clarity issue", description: "Documents require detailed inspection for clarity", action_type: "border_secondary" },
    { id: 2, code: "BP-S02", reason: "Host/accommodation verification", description: "Need to verify host or accommodation details", action_type: "border_secondary" },
    { id: 3, code: "BP-S03", reason: "Travel purpose clarification", description: "Purpose of visit requires clarification", action_type: "border_secondary" },
    { id: 4, code: "BP-S04", reason: "Payment confirmation pending", description: "Visa payment status needs verification", action_type: "border_secondary" },
    { id: 5, code: "BP-S05", reason: "PNR/flight mismatch", description: "Flight manifest does not match travel documents", action_type: "border_secondary" },
    { id: 6, code: "BP-S06", reason: "Interview required", description: "Traveler requires interview with immigration officer", action_type: "border_secondary" },
  ] : [
    { id: 1, code: "BP-D01", reason: "No valid authorization", description: "Traveler lacks valid visa or ETA", action_type: "border_deny" },
    { id: 2, code: "BP-D02", reason: "Passport mismatch", description: "Passport does not match visa/ETA record", action_type: "border_deny" },
    { id: 3, code: "BP-D03", reason: "Watchlist/Interpol hit", description: "Traveler flagged on security watchlist or Interpol", action_type: "border_deny" },
    { id: 4, code: "BP-D04", reason: "Suspected fraud", description: "Fraudulent documents or identity suspected", action_type: "border_deny" },
    { id: 5, code: "BP-D05", reason: "Expired/invalid entry window", description: "Visa expired or outside valid entry dates", action_type: "border_deny" },
    { id: 6, code: "BP-D06", reason: "Entry limit exceeded", description: "Maximum entries for visa type exceeded", action_type: "border_deny" },
  ];

  const filteredCodes = reasonCodes.filter(
    (c) => c.reason.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const config = {
    admit: {
      title: "Admit Entry",
      icon: CheckCircle2,
      bgGradient: "from-emerald-500 to-emerald-600",
      selectedCard: "border-emerald-500 bg-emerald-50",
      selectedBadge: "bg-emerald-100 text-emerald-700",
    },
    secondary: {
      title: "Refer to Secondary",
      icon: AlertTriangle,
      bgGradient: "from-amber-500 to-amber-600",
      selectedCard: "border-amber-500 bg-amber-50",
      selectedBadge: "bg-amber-100 text-amber-700",
    },
    deny: {
      title: "Deny Entry",
      icon: XCircle,
      bgGradient: "from-red-500 to-red-600",
      selectedCard: "border-red-500 bg-red-50",
      selectedBadge: "bg-red-100 text-red-700",
    },
  }[decisionType];

  useEffect(() => {
    if (!isOpen) {
      setSelectedCode(null);
      setNotes("");
      setSearchTerm("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.bgGradient} p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Icon size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{config.title}</h2>
                <p className="text-white/80 text-sm">{travelerName}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reason codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-4 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-0 text-sm transition-colors duration-150 ease-out"
            />
          </div>

          {/* Reason Codes */}
          <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
            {filteredCodes.map((code) => (
              <button
                key={code.id}
                onClick={() => setSelectedCode(code)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-colors duration-150 ease-out ${
                  selectedCode?.id === code.id
                    ? config.selectedCard
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    selectedCode?.id === code.id ? config.selectedBadge : "bg-slate-100 text-slate-600"
                  }`}>
                    {code.code}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{code.reason}</p>
                    {code.description && <p className="text-xs text-slate-500 mt-0.5">{code.description}</p>}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes..."
              rows={2}
              className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-0 text-sm resize-none transition-colors duration-150 ease-out"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className={`flex-1 ${decisionType === "admit" ? "!bg-emerald-600 hover:!bg-emerald-700" : decisionType === "secondary" ? "!bg-amber-600 hover:!bg-amber-700" : "!bg-red-600 hover:!bg-red-700"}`}
              onClick={() => selectedCode && onSubmit(decisionType, selectedCode.code, notes)}
              disabled={!selectedCode}
              loading={loading}
            >
              <Shield size={16} className="mr-2" />
              Confirm {config.title}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
