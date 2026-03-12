"use client";

import { X, ArrowRight, ArrowLeft, ArrowLeftRight, CheckCircle2 } from "lucide-react";
import { Button } from "./button";

interface EntryTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (entryType: "single" | "multiple") => void;
  selected: "single" | "multiple" | "";
  baseFee: number;
  multipleEntryFee: number;
  visaTypeName: string;
}

export function EntryTypeModal({
  open,
  onClose,
  onSelect,
  selected,
  baseFee,
  multipleEntryFee,
  visaTypeName,
}: EntryTypeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center hover:bg-border-light transition-colors cursor-pointer">
              <ArrowLeft size={16} className="text-text-muted" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Entry Type</h2>
              <p className="text-sm text-text-muted mt-0.5">How many times will you enter Ghana?</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center hover:bg-border-light transition-colors cursor-pointer">
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        {/* Pricing Summary */}
        <div className="px-6 pb-4 border-b border-border-light">
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Base Fee</p>
                <p className="text-lg font-bold text-text-primary">${baseFee.toFixed(2)}</p>
                <p className="text-xs text-text-muted mt-0.5">{visaTypeName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Total Amount</p>
                <p className="text-lg font-bold text-accent">
                  {selected === "multiple" 
                    ? (baseFee * 1.8).toFixed(2) 
                    : selected === "single" 
                    ? baseFee.toFixed(2) 
                    : "---"
                  }
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {selected === "multiple" 
                    ? `$${baseFee.toFixed(2)} + $${(baseFee * 0.8).toFixed(2)}`
                    : selected === "single" 
                    ? `$${baseFee.toFixed(2)} + $0.00`
                    : "Select entry type"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Entry Type Cards */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Single Entry */}
            <button
              type="button"
              onClick={() => onSelect("single")}
              className={`relative text-left p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                selected === "single"
                  ? "border-accent bg-accent/5 ring-4 ring-accent/10"
                  : "border-border hover:border-accent/30 hover:bg-surface/50"
              }`}
            >
              {selected === "single" && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 size={20} className="text-accent" />
                </div>
              )}
              <div className="w-11 h-11 rounded-xl bg-primary/6 flex items-center justify-center mb-4">
                <ArrowRight size={20} className="text-primary" />
              </div>
              <h3 className="font-bold text-text-primary mb-1">Single Entry</h3>
              <p className="text-xs text-text-muted leading-relaxed mb-4">
                Enter Ghana once. Visa expires after you leave.
              </p>
              <div className="pt-3 border-t border-border-light">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Base Fee</p>
                    <p className="text-sm font-medium text-text-primary">${baseFee.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Entry Fee</p>
                    <p className="text-sm font-medium text-accent">+$0.00</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border-light">
                    <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Total</p>
                    <p className="text-xl font-bold text-accent">${baseFee.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </button>

            {/* Multiple Entry */}
            <button
              type="button"
              onClick={() => onSelect("multiple")}
              className={`relative text-left p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                selected === "multiple"
                  ? "border-accent bg-accent/5 ring-4 ring-accent/10"
                  : "border-border hover:border-accent/30 hover:bg-surface/50"
              }`}
            >
              {selected === "multiple" && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 size={20} className="text-accent" />
                </div>
              )}
              <div className="w-11 h-11 rounded-xl bg-gold/8 flex items-center justify-center mb-4">
                <ArrowLeftRight size={20} className="text-gold" />
              </div>
              <h3 className="font-bold text-text-primary mb-1">Multiple Entry</h3>
              <p className="text-xs text-text-muted leading-relaxed mb-4">
                Enter and leave Ghana multiple times within the validity period.
              </p>
              <div className="pt-3 border-t border-border-light">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Base Fee</p>
                    <p className="text-sm font-medium text-text-primary">${baseFee.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Entry Fee</p>
                    <p className="text-sm font-medium text-accent">+${(baseFee * 0.8).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border-light">
                    <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Total</p>
                    <p className="text-xl font-bold text-accent">${(baseFee * 1.8).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Info Note */}
          <div className="mt-4 p-3 rounded-xl bg-surface border border-border-light">
            <p className="text-xs text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Note:</strong> Multiple entry visas allow you to enter and exit Ghana
              as many times as needed during the visa validity period. Single entry visas are valid for one entry only.
            </p>
          </div>

          {/* Confirm Button */}
          <div className="mt-5 flex justify-end">
            <Button
              onClick={onClose}
              disabled={!selected}
              className={!selected ? "opacity-50 cursor-not-allowed" : ""}
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
