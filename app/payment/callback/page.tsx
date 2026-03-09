"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  // Support both legacy references and GCB merchantRef
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const merchantRef = searchParams.get("merchantRef") || searchParams.get("merchant_ref");
  const statusCode = searchParams.get("statusCode") || searchParams.get("status_code");

  useEffect(() => {
    // Handle GCB Payment Gateway redirect
    if (merchantRef) {
      verifyGcbPayment();
      return;
    }

    // Handle legacy payment providers (Paystack, Stripe)
    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference provided");
      return;
    }

    verifyLegacyPayment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyGcbPayment = async () => {
    if (isVerifying) return;
    setIsVerifying(true);

    try {
      const res = await api.get("/gcb/verify", {
        params: { merchantRef, statusCode }
      });

      if (res.data.success && res.data.status === "completed") {
        setStatus("success");
        setMessage(res.data.message || "Payment completed successfully! Your application has been submitted.");
        setReferenceNumber(res.data.reference_number);
        
        if (res.data.application_id) {
          setTimeout(() => {
            router.push(`/dashboard/applicant/applications/${res.data.application_id}`);
          }, 3000);
        }
      } else if (res.data.status === "pending" && retryCount < 10) {
        setStatus("loading");
        setMessage(`Payment is being processed. Please wait... (${retryCount + 1}/10)`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          setIsVerifying(false);
          verifyGcbPayment();
        }, 5000);
        return; // Don't reset isVerifying yet
      } else {
        setStatus("failed");
        setMessage(res.data.message || "Payment verification failed. Please contact support.");
      }
    } catch (err: any) {
      if (err.response?.status === 429 && retryCount < 10) {
        setStatus("loading");
        setMessage("Retrying verification...");
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          setIsVerifying(false);
          verifyGcbPayment();
        }, 10000);
        return;
      } else {
        setStatus("failed");
        setMessage(err.response?.data?.message || "Unable to verify payment. Please check your dashboard for status updates.");
      }
    }
    setIsVerifying(false);
  };

  const verifyLegacyPayment = async () => {
    try {
      console.log("Verifying payment with reference:", reference);
      const res = await api.post("/payment/verify", {
        reference: reference,
      });
      console.log("Payment verification response:", res.data);

      if (res.data.success && res.data.status === "completed") {
        setStatus("success");
        setMessage("Payment completed successfully! Your application has been submitted.");
        if (res.data.application_id) {
          setTimeout(() => {
            router.push(`/dashboard/applicant/applications/${res.data.application_id}`);
          }, 3000);
        }
      } else if (res.data.status === "pending") {
        if (retryCount < 10) {
          setStatus("loading");
          setMessage(`Payment is being processed. Please wait... (${retryCount + 1}/10)`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => verifyLegacyPayment(), 5000);
        } else {
          setStatus("success");
          setMessage("Payment is being processed. You will be notified once confirmed.");
        }
        return;
      } else {
        setStatus("failed");
        setMessage(res.data.message || "Payment verification failed. Please contact support.");
      }
    } catch (err: any) {
      console.error("Payment verification error:", err.response?.status, err.response?.data || err.message);
      
      // Retry on 401/network errors - token may just need a moment after redirect
      if ((err.response?.status === 401 || !err.response) && retryCount < 5) {
        setStatus("loading");
        setMessage("Verifying payment, please wait...");
        setRetryCount(prev => prev + 1);
        setTimeout(() => verifyLegacyPayment(), 3000);
        return;
      } else if (err.response?.status === 401) {
        setStatus("failed");
        setMessage("Session expired. Please login again and check your dashboard for payment status.");
      } else {
        setStatus("failed");
        setMessage(err.response?.data?.message || "Unable to verify payment. Please check your dashboard for status updates or contact support.");
      }
    }
  };

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/dashboard/applicant");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full p-8">
        {status === "loading" && (
          <div className="text-center py-8">
            <Loader2 size={48} className="mx-auto text-primary animate-spin mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">Processing Payment</h2>
            <p className="text-sm text-text-secondary">
              Please wait while we verify your payment...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} className="text-success" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Payment Successful!</h2>
            <p className="text-text-secondary mb-6">{message}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
              <Loader2 size={16} className="animate-spin" />
              Redirecting to dashboard...
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={40} className="text-danger" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Payment Failed</h2>
            <p className="text-text-secondary mb-6">{message}</p>
            <div className="space-y-3">
              <Button onClick={() => router.push("/dashboard/applicant")} className="w-full">
                Return to Dashboard
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => router.back()} 
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {reference && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-text-muted text-center">
              Reference: <span className="font-mono">{reference}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="text-center py-8">
            <Loader2 size={48} className="mx-auto text-primary animate-spin mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">Loading...</h2>
          </div>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
