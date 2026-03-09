"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/ui/payment-modal";
import { CardSkeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, CreditCard, FileText, User, Clock, CheckCircle,
  AlertCircle, Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Application } from "@/lib/types";
import { useState, useMemo } from "react";

export default function ApplicationPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "GHS">("USD");

  // Exchange rate: 1 USD = 12.5 GHS
  const exchangeRate = 12.5;

  // Calculate amount based on selected currency
  const getDisplayAmount = () => {
    return selectedCurrency === "GHS" ? fees.total * exchangeRate : fees.total;
  };

  const getCurrencySymbol = () => {
    return selectedCurrency === "USD" ? "$" : "GH₵";
  };

  const { data: appData, isLoading: appLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: () =>
      api.get<{ application: Application }>(`/applicant/applications/${id}`).then((r) => r.data),
  });

  const application = appData?.application;

  // Calculate fees
  const fees = useMemo(() => {
    if (!application) return { base: 0, entry: 0, processing: 0, total: 0 };

    const basePrice = parseFloat(application.visa_type?.base_fee || "260");
    const entryMultiplier = application.entry_type === "multiple" ? 1.8 : 1.0;
    const tierMultiplier = parseFloat(application.service_tier?.fee_multiplier || "1.0");
    const additionalFee = parseFloat(application.service_tier?.additional_fee || "0");

    const base = basePrice * entryMultiplier;
    const processing = additionalFee;
    const total = base + processing;

    return {
      base,
      entry: application.entry_type === "multiple" ? basePrice * 0.8 : 0,
      processing,
      total,
    };
  }, [application]);

  const handlePay = async (methodWithCurrency: string) => {
    if (!application) return;
    setProcessing(true);
    try {
      // Parse method and currency (format: "method|currency")
      const [method, currency] = methodWithCurrency.includes('|') 
        ? methodWithCurrency.split('|') 
        : [methodWithCurrency, 'USD'];
      
      const res = await api.post(`/applicant/applications/${application.id}/payment/initialize`, {
        payment_method: method,
        currency: currency
      });

      if (res.data.success) {
        setShowPaymentModal(false);

        if (res.data.authorization_url) {
          // Redirect to payment gateway
          window.location.href = res.data.authorization_url;
        } else if (res.data.provider === 'bank_transfer') {
          toast.success("Bank transfer initiated. Please follow the instructions.", { duration: 5000, icon: "🏦" });
          setTimeout(() => {
            router.push(`/dashboard/applicant/applications/${id}`);
          }, 2000);
        } else {
          toast.success("Payment initiated successfully!");
          router.push(`/dashboard/applicant/applications/${id}`);
        }
      } else {
        toast.error(res.data.message || "Payment initialization failed");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Payment failed to initialize");
    } finally {
      setProcessing(false);
    }
  };

  if (appLoading) {
    return (
      <DashboardShell title="Payment" description="Complete your payment">
        <CardSkeleton />
      </DashboardShell>
    );
  }

  if (!application) {
    return (
      <DashboardShell title="Application Not Found">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-text-muted" />
          </div>
          <p className="text-text-primary font-semibold mb-1">Application not found</p>
          <p className="text-sm text-text-muted mb-6">This application may have been removed or the link is invalid.</p>
          <Button variant="secondary" onClick={() => router.push("/dashboard/applicant/applications")}>
            Back to Applications
          </Button>
        </div>
      </DashboardShell>
    );
  }

  // Check if application is eligible for payment
  if (!["pending_payment", "submitted_awaiting_payment", "draft"].includes(application.status)) {
    return (
      <DashboardShell title="Payment Not Required">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-success" />
          </div>
          <p className="text-text-primary font-semibold mb-1">Payment already completed</p>
          <p className="text-sm text-text-muted mb-6">This application has already been paid for.</p>
          <Button onClick={() => router.push(`/dashboard/applicant/applications/${id}`)}>
            View Application
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Complete Payment"
      description={`Payment for ${application.reference_number}`}
      actions={
        <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.push(`/dashboard/applicant/applications/${id}`)}>
          Back to Application
        </Button>
      }
    >
      <div className="max-w-3xl mx-auto">
        {/* Payment Required Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-warning/10 via-warning/5 to-accent/5 border border-warning/20 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center shrink-0">
              <AlertCircle size={28} className="text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-text-primary mb-1">
                Payment Required to Process Application
              </h3>
              <p className="text-sm text-text-secondary">
                Your application will not be processed until payment is confirmed. Complete the payment below to submit your application.
              </p>
            </div>
          </div>
        </div>

        {/* Application Summary */}
        <div className="card mb-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/6 flex items-center justify-center">
              <FileText size={16} className="text-primary" />
            </div>
            <h2 className="text-base font-bold text-text-primary">Application Summary</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="info-field">
              <p className="info-label">Reference Number</p>
              <p className="info-value font-mono">{application.reference_number}</p>
            </div>
            <div className="info-field">
              <p className="info-label">Visa Type</p>
              <p className="info-value">{application.visa_type?.name || "N/A"}</p>
            </div>
            <div className="info-field">
              <p className="info-label">Applicant Name</p>
              <p className="info-value">{application.first_name} {application.last_name}</p>
            </div>
            <div className="info-field">
              <p className="info-label">Entry Type</p>
              <p className="info-value capitalize">{application.entry_type || "Single"} Entry</p>
            </div>
            <div className="info-field">
              <p className="info-label">Processing Speed</p>
              <p className="info-value">{application.service_tier?.name || "Standard"}</p>
            </div>
            <div className="info-field">
              <p className="info-label">Status</p>
              <p className="info-value">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                  <Clock size={12} />
                  Pending Payment
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Currency Selection */}
        <div className="card mb-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/6 flex items-center justify-center">
              <CreditCard size={16} className="text-primary" />
            </div>
            <h2 className="text-base font-bold text-text-primary">Select Currency</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedCurrency("USD")}
              disabled={processing}
              className={`p-4 rounded-xl border-2 transition-all ${
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
              className={`p-4 rounded-xl border-2 transition-all ${
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

          {selectedCurrency === "GHS" && (
            <div className="mt-3 p-3 bg-info/5 rounded-lg border border-info/20">
              <p className="text-xs text-info">
                <strong>Exchange Rate:</strong> $1 = GH₵{exchangeRate.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div className="card mb-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-accent/6 flex items-center justify-center">
              <CreditCard size={16} className="text-accent" />
            </div>
            <h2 className="text-base font-bold text-text-primary">Payment Details</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-text-secondary">Base Fee ({application.entry_type === "multiple" ? "Multiple" : "Single"} Entry)</span>
              <span className="text-sm font-medium text-text-primary">
                {getCurrencySymbol()}{(fees.base * (selectedCurrency === "GHS" ? exchangeRate : 1)).toFixed(2)}
              </span>
            </div>
            {fees.processing > 0 && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-text-secondary">Processing Fee ({application.service_tier?.name})</span>
                <span className="text-sm font-medium text-text-primary">
                  {getCurrencySymbol()}{(fees.processing * (selectedCurrency === "GHS" ? exchangeRate : 1)).toFixed(2)}
                </span>
              </div>
            )}
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="font-semibold text-text-primary">Total Amount</span>
              <span className="text-2xl font-bold text-accent">
                {getCurrencySymbol()}{getDisplayAmount().toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border mb-6">
          <Shield size={20} className="text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium text-text-primary">Secure Payment</p>
            <p className="text-xs text-text-muted mt-0.5">
              Your payment is secured with 256-bit SSL encryption. All transactions are processed through trusted payment gateways.
            </p>
          </div>
        </div>

        {/* Payment Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            leftIcon={<CreditCard size={18} />}
            onClick={() => setShowPaymentModal(true)}
            disabled={processing}
            className="!bg-accent hover:!bg-accent-dark min-w-[280px]"
          >
            Proceed to Payment ({getCurrencySymbol()}{getDisplayAmount().toFixed(2)})
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPay={handlePay}
        totalFee={fees.total}
        currency={selectedCurrency}
        breakdown={[
          { label: `Base Fee (${application.entry_type === "multiple" ? "Multiple" : "Single"} Entry)`, amount: fees.base },
          ...(fees.processing > 0 ? [{ label: "Processing Fee", amount: fees.processing }] : []),
        ]}
        visaTypeName={application.visa_type?.name || "Visa"}
        applicantName={`${application.first_name} ${application.last_name}`}
        referenceNumber={application.reference_number}
      />
    </DashboardShell>
  );
}
