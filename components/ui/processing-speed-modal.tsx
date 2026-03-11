"use client";

import React from "react";
import { X, Clock, TrendingUp, Crown, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServiceTier } from "@/lib/types";

interface ProcessingSpeedModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (tierId: string) => void;
  serviceTiers: ServiceTier[];
  selectedTierId: string;
  baseFee: number;
  visaTypeName: string;
}

const tierIcons: Record<string, React.ReactNode> = {
  standard: <Clock size={20} className="text-text-muted" />,
  fast_track: <TrendingUp size={20} className="text-warning" />,
  express: <Crown size={20} className="text-accent" />,
  ultra_express: <Crown size={20} className="text-danger" />, // Add ultra-express icon
};

const tierIconBg: Record<string, string> = {
  standard: "bg-surface",
  fast_track: "bg-warning/8",
  express: "bg-accent/8",
  ultra_express: "bg-danger/8",
};

const tierRing: Record<string, string> = {
  standard: "ring-text-muted/20",
  fast_track: "ring-warning/20",
  express: "ring-accent/20",
  ultra_express: "ring-danger/20",
};

const tierFeatures: Record<string, string[]> = {
  standard: ["Email notifications", "3-5 business days"],
  fast_track: ["Priority queue", "24-48 hours"],
  express: ["Dedicated officer", "Same day"],
  ultra_express: ["Highest priority", "4-6 hours"],
};

export function ProcessingSpeedModal({
  open,
  onClose,
  onSelect,
  serviceTiers,
  selectedTierId,
  baseFee,
  visaTypeName,
}: ProcessingSpeedModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center hover:bg-border-light transition-colors cursor-pointer">
              <ArrowLeft size={16} className="text-text-muted" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Processing Speed</h2>
              <p className="text-sm text-text-muted mt-0.5">How quickly do you need your visa?</p>
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
                <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Processing Fee</p>
                <p className="text-lg font-bold text-accent">Varies by speed</p>
                <p className="text-xs text-text-muted mt-0.5">Select option below</p>
              </div>
            </div>
          </div>
        </div>

        {/* Speed Cards Grid - Landscape Layout: 3 on top, 2 below */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-3 gap-4">
            {serviceTiers.filter(tier => tier.is_active).slice(0, 3).map((tier) => {
              const multiplier = parseFloat(tier.fee_multiplier);
              const additional = parseFloat(tier.additional_fee);
              const totalFee = (baseFee * multiplier) + additional;
              const isSelected = selectedTierId === tier.id.toString();
              const features = tierFeatures[tier.code] || [];

              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => onSelect(tier.id.toString())}
                  className={`relative text-left p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${isSelected
                    ? `border-accent bg-accent/5 ring-4 ${tierRing[tier.code] || "ring-accent/10"}`
                    : "border-border hover:border-accent/30 hover:bg-surface/50"
                    }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 size={20} className="text-accent" />
                    </div>
                  )}
                  <div className={`w-11 h-11 rounded-xl ${tierIconBg[tier.code] || "bg-surface"} flex items-center justify-center mb-4`}>
                    {tierIcons[tier.code] || <Clock size={20} />}
                  </div>
                  <h3 className="font-bold text-text-primary mb-1">{tier.name}</h3>
                  <p className="text-xs text-text-muted leading-relaxed mb-3">
                    {tier.processing_time_display}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {features.map((f, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-surface text-text-secondary">
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-border-light">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Base Fee</p>
                        <p className="text-sm font-medium text-text-primary">${baseFee.toFixed(2)}</p>
                      </div>
                      {tier.code !== "standard" && (
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Processing Fee</p>
                          <p className="text-sm font-medium text-accent">+${(totalFee - baseFee).toFixed(2)}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-border-light">
                        <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Total Amount</p>
                        <p className="text-xl font-bold text-accent">${totalFee.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Second row for remaining items */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {serviceTiers.filter(tier => tier.is_active).slice(3).map((tier) => {
              const multiplier = parseFloat(tier.fee_multiplier);
              const additional = parseFloat(tier.additional_fee);
              const totalFee = (baseFee * multiplier) + additional;
              const isSelected = selectedTierId === tier.id.toString();
              const features = tierFeatures[tier.code] || [];

              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => onSelect(tier.id.toString())}
                  className={`relative text-left p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${isSelected
                    ? `border-accent bg-accent/5 ring-4 ${tierRing[tier.code] || "ring-accent/10"}`
                    : "border-border hover:border-accent/30 hover:bg-surface/50"
                    }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 size={20} className="text-accent" />
                    </div>
                  )}
                  <div className={`w-11 h-11 rounded-xl ${tierIconBg[tier.code] || "bg-surface"} flex items-center justify-center mb-4`}>
                    {tierIcons[tier.code] || <Clock size={20} />}
                  </div>
                  <h3 className="font-bold text-text-primary mb-1">{tier.name}</h3>
                  <p className="text-xs text-text-muted leading-relaxed mb-3">
                    {tier.processing_time_display}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {features.map((f, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-surface text-text-secondary">
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-border-light">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Base Fee</p>
                        <p className="text-sm font-medium text-text-primary">${baseFee.toFixed(2)}</p>
                      </div>
                      {tier.code !== "standard" && (
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Processing Fee</p>
                          <p className="text-sm font-medium text-accent">+${(totalFee - baseFee).toFixed(2)}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-border-light">
                        <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Total Amount</p>
                        <p className="text-xl font-bold text-accent">${totalFee.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Note */}
          <div className="mt-4 p-3 rounded-xl bg-surface border border-border-light">
            <p className="text-xs text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Note:</strong> Processing times are estimates. Actual times may vary based on application completeness and verification requirements.
            </p>
          </div>

          {/* Confirm Button */}
          <div className="mt-5 flex justify-end">
            <Button
              onClick={onClose}
              disabled={!selectedTierId}
              className={!selectedTierId ? "opacity-50 cursor-not-allowed" : ""}
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
