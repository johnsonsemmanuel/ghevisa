"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={28} className="text-danger" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Dashboard Error</h2>
        <p className="text-text-secondary text-sm mb-6">
          Something went wrong loading this page. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard/applicant">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />}>
              Go to Dashboard
            </Button>
          </Link>
          <Button size="sm" onClick={() => reset()} leftIcon={<RefreshCw size={14} />}>
            Try Again
          </Button>
        </div>
        {process.env.NODE_ENV !== "production" && error?.message && (
          <div className="mt-6 p-3 bg-danger/5 border border-danger/20 rounded-lg text-left">
            <p className="text-xs font-mono text-danger break-all">{error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
