"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard } from "lucide-react";

export default function GcbTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const merchantRef = searchParams.get('merchantRef');
  const checkoutId = searchParams.get('checkoutId');

  const handlePaymentSuccess = () => {
    // Simulate successful payment by redirecting to callback with the reference
    const callbackUrl = `/payment/callback?reference=${merchantRef || checkoutId}`;
    router.push(callbackUrl);
  };

  const handlePaymentFailed = () => {
    // Simulate failed payment
    router.push('/dashboard/applicant/applications');
  };

  return (
    <DashboardShell title="GCB Test Payment" description="Test payment simulation">
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CreditCard size={28} className="text-blue-600" />
        </div>
        
        <h2 className="text-lg font-semibold text-gray-900 mb-2">GCB Test Payment</h2>
        <p className="text-sm text-gray-600 mb-6">
          This is a test payment simulation. Choose the outcome you want to test.
        </p>

        <div className="space-y-3">
          <Button onClick={handlePaymentSuccess} className="w-full bg-green-600 hover:bg-green-700">
            <CheckCircle size={16} className="mr-2" />
            Simulate Successful Payment
          </Button>
          
          <Button variant="secondary" onClick={handlePaymentFailed} className="w-full">
            Simulate Failed Payment
          </Button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Test Details:</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Merchant Ref:</strong> {merchantRef}</div>
            <div><strong>Checkout ID:</strong> {checkoutId}</div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}