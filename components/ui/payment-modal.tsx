"use client";

import React, { useState } from "react";
import { X, CreditCard, Smartphone, Shield, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onPay: (method: string) => Promise<void>;
  totalFee: number;
  currency?: string;
  breakdown: { label: string; amount: number }[];
  visaTypeName: string;
  applicantName: string;
  referenceNumber?: string;
}

const PAYMENT_METHODS = [
  {
    id: "paystack_card",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, or Verve via Paystack",
    icon: <CreditCard size={22} className="text-info" />,
    badge: "Instant",
  },
  {
    id: "paystack_mobile_money",
    label: "Mobile Money",
    description: "MTN, Vodafone Cash, AirtelTigo via Paystack",
    icon: <Smartphone size={22} className="text-accent" />,
    badge: "Popular",
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer (GCB)",
    description: "Direct transfer to Ghana Commercial Bank",
    icon: <Shield size={22} className="text-text-muted" />,
  },
];

export function PaymentModal({
  open,
  onClose,
  onPay,
  totalFee,
  currency = "USD",
  breakdown,
  visaTypeName,
  applicantName,
  referenceNumber,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState("paystack_card");
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "GHS">("USD");
  const [processing, setProcessing] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Exchange rate: 1 USD = 12.5 GHS
  const exchangeRate = 12.5;

  // Calculate amount based on selected currency
  const getDisplayAmount = () => {
    return selectedCurrency === "GHS" ? totalFee * exchangeRate : totalFee;
  };

  const getCurrencySymbol = () => {
    return selectedCurrency === "USD" ? "$" : "GH₵";
  };

  if (!open) return null;

  const handlePay = async () => {
    if (!agreed) return;
    setProcessing(true);
    try {
      // Pass both method and currency to parent
      await onPay(selectedMethod + "|" + selectedCurrency);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={!processing ? onClose : undefined} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Complete Payment</h2>
            <p className="text-sm text-text-secondary mt-0.5">Secure payment for your visa application</p>
          </div>
          {!processing && (
            <button onClick={onClose} className="p-2 hover:bg-surface rounded-lg transition-colors duration-150 ease-out">
              <X size={20} className="text-text-muted" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Application Summary */}
          <div className="bg-surface rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Application</span>
              <span className="text-sm font-medium text-text-primary">{referenceNumber || "Draft"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Visa Type</span>
              <span className="text-sm font-medium text-text-primary">{visaTypeName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Applicant</span>
              <span className="text-sm font-medium text-text-primary">{applicantName}</span>
            </div>
          </div>

          {/* Currency Selection */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">Select Currency</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedCurrency("USD")}
                disabled={processing}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedCurrency === "USD"
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/30"
                } ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="text-center">
                  <p className="font-semibold text-text-primary">USD ($)</p>
                  <p className="text-xs text-text-muted mt-1">US Dollar</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCurrency("GHS")}
                disabled={processing}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedCurrency === "GHS"
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/30"
                } ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="text-center">
                  <p className="font-semibold text-text-primary">GHS (₵)</p>
                  <p className="text-xs text-text-muted mt-1">Ghana Cedi</p>
                </div>
              </button>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">Fee Breakdown</h3>
            {breakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <span className="text-sm text-text-secondary">{item.label}</span>
                <span className="text-sm text-text-primary">
                  {getCurrencySymbol()}{(item.amount * (selectedCurrency === "GHS" ? exchangeRate : 1)).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-2 flex items-center justify-between">
              <span className="font-semibold text-text-primary">Total</span>
              <span className="text-xl font-bold text-accent">
                {getCurrencySymbol()}{getDisplayAmount().toFixed(2)}
              </span>
            </div>
            {selectedCurrency === "GHS" && (
              <p className="text-xs text-text-muted mt-2">
                Exchange rate: $1 = GH₵{exchangeRate.toFixed(2)}
              </p>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Payment Method</h3>
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.id)}
                disabled={processing}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 ease-out cursor-pointer flex items-center gap-4
                  ${selectedMethod === method.id
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/30"
                  } ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="shrink-0">{method.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">{method.label}</span>
                    {method.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                        {method.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{method.description}</p>
                </div>
                {selectedMethod === method.id && (
                  <CheckCircle size={20} className="text-accent shrink-0" />
                )}
              </button>
            ))}
          </div>



          {/* Warning */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
            <AlertCircle size={18} className="text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">Payment Required</p>
              <p className="text-xs text-text-secondary mt-1">
                Your application will not be processed until payment is confirmed.
                Unpaid applications are automatically cancelled after 48 hours.
              </p>
            </div>
          </div>

          {/* Terms Agreement */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={processing}
              className="mt-1 w-4 h-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
            />
            <span className="text-xs text-text-secondary leading-relaxed">
              I confirm that all information provided is accurate. I understand that the visa fee is
              non-refundable once processing begins, and that providing false information may result
              in application denial and possible legal action.
            </span>
          </label>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
            <Shield size={14} />
            <span>Secured by 256-bit SSL encryption</span>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border rounded-b-2xl px-6 py-4 flex items-center justify-between">
          {!processing ? (
            <button
              onClick={onClose}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150 ease-out"
            >
              Pay Later
            </button>
          ) : (
            <span className="text-sm text-text-muted">Processing payment...</span>
          )}
          <Button
            onClick={handlePay}
            disabled={!agreed || processing}
            className="!bg-accent hover:!bg-accent-dark min-w-[180px]"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard size={16} /> Pay {getCurrencySymbol()}{getDisplayAmount().toFixed(2)}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
