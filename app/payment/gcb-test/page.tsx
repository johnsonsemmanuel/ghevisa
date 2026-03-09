"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function GcbTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<"success" | "failed" | null>(null);

  const merchantRef = searchParams.get("merchantRef");
  const checkoutId = searchParams.get("checkoutId");

  const handlePayment = async (success: boolean) => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setResult(success ? "success" : "failed");
    
    // Redirect to callback after 2 seconds
    setTimeout(() => {
      const callbackUrl = `${window.location.origin}/payment/callback?merchantRef=${merchantRef}&statusCode=${success ? '00' : '02'}`;
      window.location.href = callbackUrl;
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-surface to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">GCB Payment Gateway</h1>
            <p className="text-sm text-text-muted">Test Mode - Simulation</p>
          </div>

          {!result && !processing && (
            <>
              {/* Payment Details */}
              <div className="bg-surface rounded-xl p-4 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Merchant Ref:</span>
                    <span className="font-mono text-xs text-text-primary">{merchantRef}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Checkout ID:</span>
                    <span className="font-mono text-xs text-text-primary">{checkoutId}</span>
                  </div>
                </div>
              </div>

              {/* Test Mode Notice */}
              <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6">
                <p className="text-xs text-warning font-medium mb-2">⚠️ Test Mode Active</p>
                <p className="text-xs text-text-secondary">
                  This is a simulated payment page. In production, this would be the actual GCB payment gateway.
                  Click a button below to simulate the payment outcome.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => handlePayment(true)}
                  className="w-full !bg-success hover:!bg-success/90"
                  size="lg"
                >
                  <CheckCircle2 size={18} className="mr-2" />
                  Simulate Successful Payment
                </Button>
                <Button
                  onClick={() => handlePayment(false)}
                  variant="secondary"
                  className="w-full !bg-danger/10 !text-danger hover:!bg-danger/20"
                  size="lg"
                >
                  <XCircle size={18} className="mr-2" />
                  Simulate Failed Payment
                </Button>
              </div>
            </>
          )}

          {processing && (
            <div className="text-center py-8">
              <Loader2 size={48} className="text-primary animate-spin mx-auto mb-4" />
              <p className="text-text-primary font-medium mb-2">Processing Payment...</p>
              <p className="text-sm text-text-muted">Please wait while we process your transaction</p>
            </div>
          )}

          {result === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-success" />
              </div>
              <p className="text-text-primary font-bold text-lg mb-2">Payment Successful!</p>
              <p className="text-sm text-text-muted">Redirecting you back...</p>
            </div>
          )}

          {result === "failed" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} className="text-danger" />
              </div>
              <p className="text-text-primary font-bold text-lg mb-2">Payment Failed</p>
              <p className="text-sm text-text-muted">Redirecting you back...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-text-muted">
            Powered by Ghana Commercial Bank
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GcbTestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 size={48} className="text-primary animate-spin" />
      </div>
    }>
      <GcbTestContent />
    </Suspense>
  );
}
