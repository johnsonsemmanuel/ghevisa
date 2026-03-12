"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [applicationId, setApplicationId] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      // Get payment reference from various possible URL parameters
      // Paystack uses 'trxref' and 'reference'
      // GCB uses 'merchantRef' and 'checkoutId'
      const reference = searchParams.get('reference') || 
                       searchParams.get('trxref') || 
                       searchParams.get('merchantRef') ||
                       searchParams.get('checkoutId') ||
                       searchParams.get('transaction_id') ||
                       searchParams.get('tx_ref');
      
      console.log('Payment callback - all URL params:', Object.fromEntries(searchParams.entries()));
      console.log('Payment callback - extracted reference:', reference);
      
      if (!reference) {
        console.error('No payment reference found in URL parameters');
        setStatus('failed');
        toast.error("No payment reference found");
        return;
      }

      try {
        console.log('Verifying payment with reference:', reference);
        const res = await api.post('/payment/verify', {
          reference: reference
        });

        console.log('Payment verification response:', res.data);

        if (res.data.success) {
          setStatus('success');
          setApplicationId(res.data.application_id);
          toast.success("Payment verified successfully!");
        } else {
          setStatus('failed');
          toast.error(res.data.message || "Payment verification failed");
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        toast.error(error.response?.data?.message || "Payment verification failed");
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleContinue = () => {
    if (applicationId) {
      router.push(`/dashboard/applicant/applications/${applicationId}`);
    } else {
      router.push('/dashboard/applicant/applications');
    }
  };

  return (
    <DashboardShell title="Payment Status" description="Verifying your payment">
      <div className="max-w-md mx-auto text-center py-16">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Loader2 size={28} className="text-blue-600 animate-spin" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-sm text-gray-600">Please wait while we confirm your payment...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-sm text-gray-600 mb-6">
              Your payment has been confirmed and your application is now under review.
            </p>
            <Button onClick={handleContinue} className="w-full">
              View Application
            </Button>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle size={28} className="text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-sm text-gray-600 mb-6">
              We couldn't verify your payment. Please try again or contact support.
            </p>
            <div className="space-y-3">
              <Button onClick={handleContinue} className="w-full">
                Back to Applications
              </Button>
              <Button variant="secondary" onClick={() => router.back()} className="w-full">
                Try Again
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}