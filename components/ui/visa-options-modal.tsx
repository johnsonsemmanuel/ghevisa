"use client";

import { useState } from "react";
import { X, ArrowLeft, ArrowLeftRight, CheckCircle2, Clock, TrendingUp, Crown } from "lucide-react";
import { Button } from "./button";
import type { ServiceTier } from "@/lib/types";

interface VisaOptionsModalProps {
  open: boolean;
  onClose: () => void;
  onEntryTypeSelect: (entryType: "single" | "multiple") => void;
  onProcessingSpeedSelect: (tierId: string) => void;
  serviceTiers: ServiceTier[];
  selectedEntryType: "single" | "multiple" | "";
  selectedTierId: string;
  baseFee: number;
  visaTypeName: string;
}

const tierIcons: Record<string, React.ReactNode> = {
  standard: <Clock size={20} className="text-text-muted" />,
  fast_track: <TrendingUp size={20} className="text-warning" />,
  express: <Crown size={20} className="text-accent" />,
};

const tierIconBg: Record<string, string> = {
  standard: "bg-surface",
  fast_track: "bg-warning/8",
  express: "bg-accent/8",
};

const tierRing: Record<string, string> = {
  standard: "ring-text-muted/20",
  fast_track: "ring-warning/20",
  express: "ring-accent/20",
};

const tierFeatures: Record<string, string[]> = {
  standard: ["Email notifications", "3-5 business days"],
  fast_track: ["Priority queue", "24-48 hours"],
  express: ["Dedicated officer", "Same day"],
};

export function VisaOptionsModal({
  open,
  onClose,
  onEntryTypeSelect,
  onProcessingSpeedSelect,
  serviceTiers,
  selectedEntryType,
  selectedTierId,
  baseFee,
  visaTypeName,
}: VisaOptionsModalProps) {
  const [currentStep, setCurrentStep] = useState<'entry' | 'speed'>('entry');
  const [localEntryType, setLocalEntryType] = useState<"single" | "multiple" | "">(selectedEntryType);
  const [localTierId, setLocalTierId] = useState(selectedTierId);

  if (!open) return null;

  const handleEntryNext = () => {
    if (localEntryType) {
      onEntryTypeSelect(localEntryType);
      setCurrentStep('speed');
    }
  };

  const handleSpeedConfirm = () => {
    if (localTierId) {
      onProcessingSpeedSelect(localTierId);
      onClose();
    }
  };

  const calculateTotal = () => {
    const entryFee = localEntryType === "multiple" ? baseFee * 0.8 : 0;
    return baseFee + entryFee;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            {currentStep === 'speed' && (
              <button 
                onClick={() => setCurrentStep('entry')} 
                className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center hover:bg-border-light transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} className="text-text-muted" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                {currentStep === 'entry' ? 'Entry Type' : 'Processing Speed'}
              </h2>
              <p className="text-sm text-text-muted mt-0.5">
                {currentStep === 'entry' ? 'How many times will you enter Ghana?' : 'How quickly do you need your visa?'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center hover:bg-border-light transition-colors cursor-pointer">
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 'entry' && (
            <div>
              {/* Pricing Summary */}
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary">{visaTypeName}</h3>
                    <p className="text-sm text-text-muted">Choose your entry preference</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-muted">Base Fee</p>
                    <p className="text-lg font-bold text-text-primary">${baseFee.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Entry Type Options */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Single Entry */}
                <button
                  onClick={() => setLocalEntryType("single")}
                  className={`text-left p-5 rounded-xl border-2 transition-all duration-150 cursor-pointer
                    ${localEntryType === "single" ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <ArrowLeftRight size={20} className="text-accent" />
                    <h3 className="font-bold text-text-primary">Single Entry</h3>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed mb-4">
                    Enter Ghana once during the visa validity period.
                  </p>
                  <div className="pt-3 border-t border-border-light">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Total</p>
                      <p className="text-xl font-bold text-accent">${baseFee.toFixed(2)}</p>
                    </div>
                  </div>
                </button>

                {/* Multiple Entry */}
                <button
                  onClick={() => setLocalEntryType("multiple")}
                  className={`text-left p-5 rounded-xl border-2 transition-all duration-150 cursor-pointer
                    ${localEntryType === "multiple" ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <ArrowLeftRight size={20} className="text-accent" />
                    <h3 className="font-bold text-text-primary">Multiple Entry</h3>
                  </div>
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

              {/* Navigation */}
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleEntryNext}
                  disabled={!localEntryType}
                  className={!localEntryType ? "opacity-50 cursor-not-allowed" : ""}
                >
                  Continue to Processing Speed
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'speed' && (
            <div>
              {/* Processing Speed Options */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {serviceTiers.map((tier) => {
                  const isSelected = localTierId === tier.id.toString();
                  const total = calculateTotal();
                  const processingFee = tier.code === 'standard' ? 0 : tier.code === 'fast_track' ? 50 : 100;
                  
                  return (
                    <button
                      key={tier.id}
                      onClick={() => setLocalTierId(tier.id.toString())}
                      className={`text-left p-5 rounded-xl border-2 transition-all duration-150 cursor-pointer
                        ${isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg ${tierIconBg[tier.code]} flex items-center justify-center ${tierRing[tier.code]} ring-2`}>
                          {tierIcons[tier.code]}
                        </div>
                        <h3 className="font-bold text-text-primary">{tier.name}</h3>
                      </div>
                      <p className="text-xs text-text-muted mb-3">{tier.description}</p>
                      <div className="space-y-1 mb-3">
                        {tierFeatures[tier.code]?.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-success" />
                            <span className="text-xs text-text-secondary">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-border-light">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Total</p>
                          <p className="text-xl font-bold text-accent">${(total + processingFee).toFixed(2)}</p>
                        </div>
                        {processingFee > 0 && (
                          <p className="text-xs text-text-muted mt-1">+${processingFee} processing fee</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Confirm Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSpeedConfirm}
                  disabled={!localTierId}
                  className={!localTierId ? "opacity-50 cursor-not-allowed" : ""}
                >
                  Confirm Selection
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
