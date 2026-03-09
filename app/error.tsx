"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={36} className="text-danger" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-3">Something Went Wrong</h1>
        <p className="text-text-secondary mb-8">
          An unexpected error occurred. Please try again or return to the home page.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button variant="secondary" leftIcon={<ArrowLeft size={16} />}>
              Back to Home
            </Button>
          </Link>
          <Button onClick={() => reset()} leftIcon={<RefreshCw size={16} />}>
            Try Again
          </Button>
        </div>
        {process.env.NODE_ENV !== "production" && error?.message && (
          <div className="mt-8 p-4 bg-danger/5 border border-danger/20 rounded-xl text-left">
            <p className="text-xs font-mono text-danger break-all">{error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
