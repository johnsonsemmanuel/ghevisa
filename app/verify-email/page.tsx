"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  const verifyToken = async (verificationToken: string) => {
    setVerifying(true);
    setError("");
    try {
      const response = await api.post("/auth/verify-email", { token: verificationToken });
      
      if (response.data.message) {
        setVerified(true);
        toast.success("Email verified successfully! You can now log in.");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Invalid or expired verification link");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/resend-verification", { email });
      
      if (response.data.message) {
        toast.success("Verification email sent! Please check your inbox.");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.push("/login")} leftIcon={<ArrowLeft size={16} />}>
            Back to Login
          </Button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Mail size={32} className="text-primary" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-text-primary mb-2">
            Verify Your Email
          </h1>
          <p className="text-sm text-center text-text-secondary mb-8">
            {token ? "Verifying your email address..." : "Enter your email to receive a verification link"}
          </p>

          {/* Verification Status */}
          {verifying && (
            <div className="flex items-center justify-center p-4 bg-info/5 rounded-xl mb-6">
              <RefreshCw size={24} className="text-info animate-spin" />
              <span className="ml-3 text-sm text-info">Verifying...</span>
            </div>
          )}

          {verified && (
            <div className="flex flex-col items-center p-4 bg-success/5 rounded-xl mb-6">
              <CheckCircle size={48} className="text-success mb-2" />
              <p className="text-sm text-success font-medium text-center">
                Email verified successfully!
              </p>
              <p className="text-xs text-success/70 text-center mt-1">
                You can now log in to your account
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center p-4 bg-danger/5 rounded-xl mb-6">
              <AlertCircle size={20} className="text-danger mr-3" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {/* Email Input Form */}
          {!token && !verified && (
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full"
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleResend}
                disabled={loading || !email}
                className="w-full"
                loading={loading}
              >
                {loading ? "Sending..." : "Send Verification Email"}
              </Button>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-surface rounded-xl">
            <h3 className="text-sm font-semibold text-text-primary mb-2">What happens next?</h3>
            <ol className="text-xs text-text-secondary space-y-1">
              <li>1. Check your email inbox for the verification link</li>
              <li>2. Click the verification link to confirm your email</li>
              <li>3. Return to this page to complete verification</li>
              <li>4. Log in to your account</li>
            </ol>
            <p className="text-xs text-text-muted mt-3">
              <strong>Note:</strong> If you don't see the email, check your spam folder.
            </p>
          </div>

          {/* Login Button for verified users */}
          {verified && (
            <Button
              onClick={() => router.push("/login")}
              className="w-full mt-6"
            >
              Go to Login
            </Button>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-muted">
            Need help? Contact support at{" "}
            <a href="mailto:support@ghevisa.gov.gh" className="text-primary hover:underline">
              support@ghevisa.gov.gh
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-center">
              <RefreshCw size={24} className="text-primary animate-spin" />
            </div>
            <p className="text-center text-text-muted mt-4">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
