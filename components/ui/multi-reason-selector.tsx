"use client";

import { useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Button } from "./button";

interface ReasonCode {
  id: number;
  code: string;
  action_type: string;
  reason: string;
  description: string | null;
}

interface MultiReasonSelectorProps {
  codes: ReasonCode[];
  selectedCodes: string[];
  onSelect: (codes: ReasonCode[]) => void;
  actionType: "approve" | "reject" | "request_info" | "escalate";
  label?: string;
  maxSelections?: number;
}

const actionTypeLabels = {
  approve: { label: "Approval Reasons", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  reject: { label: "Rejection Reasons", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  request_info: { label: "Information Request", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  escalate: { label: "Escalation Reasons", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
};

export function MultiReasonSelector({
  codes,
  selectedCodes,
  onSelect,
  actionType,
  label,
  maxSelections = 5,
}: MultiReasonSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [localSelected, setLocalSelected] = useState<ReasonCode[]>([]);

  const config = actionTypeLabels[actionType];
  const filteredCodes = codes.filter(
    (c) =>
      c.action_type === actionType &&
      (c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.reason.toLowerCase().includes(search.toLowerCase()))
  );

  // Initialize local selected when dropdown opens
  const handleOpen = () => {
    const currentSelected = codes.filter(c => selectedCodes.includes(c.code));
    setLocalSelected(currentSelected);
    setIsOpen(true);
  };

  const handleToggle = (code: ReasonCode) => {
    const isSelected = localSelected.some(c => c.id === code.id);
    let newSelection: ReasonCode[];

    if (isSelected) {
      // Remove from selection
      newSelection = localSelected.filter(c => c.id !== code.id);
    } else {
      // Add to selection if not at max
      if (localSelected.length < maxSelections) {
        newSelection = [...localSelected, code];
      } else {
        // At max selection, replace the last one
        newSelection = [...localSelected.slice(1), code];
      }
    }

    setLocalSelected(newSelection);
  };

  const handleConfirm = () => {
    onSelect(localSelected);
    setIsOpen(false);
    setSearch("");
  };

  const handleCancel = () => {
    setIsOpen(false);
    setSearch("");
    // Reset to original selection
    const currentSelected = codes.filter(c => selectedCodes.includes(c.code));
    setLocalSelected(currentSelected);
  };

  const handleRemove = (codeId: number) => {
    const newSelection = localSelected.filter(c => c.id !== codeId);
    setLocalSelected(newSelection);
    onSelect(newSelection);
  };

  return (
    <div className="space-y-2">
      {/* Selected Reasons Display */}
      {selectedCodes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {codes
            .filter(c => selectedCodes.includes(c.code))
            .map((code) => (
              <div
                key={code.id}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${config.bg} ${config.border} ${config.color}`}
              >
                <span className="font-mono text-xs font-bold">{code.code}</span>
                <span>{code.reason}</span>
                <button
                  onClick={() => handleRemove(code.id)}
                  className="ml-1 hover:opacity-70 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Dropdown */}
      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label || config.label} {maxSelections > 1 ? `(Select up to ${maxSelections})` : ""} <span className="text-red-500">*</span>
        </label>
        
        <button
          type="button"
          onClick={handleOpen}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
            selectedCodes.length > 0
              ? `${config.bg} ${config.border}`
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {selectedCodes.length > 0 ? (
              <>
                <span className={`font-medium ${config.color}`}>
                  {selectedCodes.length} reason{selectedCodes.length > 1 ? "s" : ""} selected
                </span>
              </>
            ) : (
              <span className="text-slate-400">Select reason{maxSelections > 1 ? "s" : ""}...</span>
            )}
          </div>
          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={handleCancel}
            />
            <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-800">{config.label}</h3>
                  <div className="text-xs text-slate-500">
                    {localSelected.length}/{maxSelections} selected
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="p-3 border-b border-slate-100">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search reason codes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="max-h-64 overflow-y-auto">
                {filteredCodes.length > 0 ? (
                  filteredCodes.map((code) => {
                    const isSelected = localSelected.some(c => c.id === code.id);
                    const isDisabled = !isSelected && localSelected.length >= maxSelections;
                    
                    return (
                      <button
                        key={code.id}
                        type="button"
                        onClick={() => handleToggle(code)}
                        disabled={isDisabled}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? `${config.bg}`
                            : isDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <span className={`font-mono text-xs font-bold px-2 py-1 rounded ${config.bg} ${config.color}`}>
                          {code.code}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {code.reason}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {code.description || ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected && <Check size={16} className={config.color} />}
                          {isDisabled && (
                            <span className="text-xs text-slate-400">Max reached</span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    No matching reason codes found
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 flex justify-between">
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={localSelected.length === 0}
                  className={`${config.bg} ${config.color} hover:opacity-90`}
                >
                  Confirm ({localSelected.length})
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
