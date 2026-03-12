"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent to your email");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/gis-logo.png" alt="GH-eVISA" className="w-12 h-10" />
            <div className="text-left">
              <h1 className="text-xl font-bold text-text-primary">GH-eVISA</h1>
              <p className="text-xs text-text-muted">Electronic Visa Platform</p>
            </div>
          </div>
        </div>

        <div className="card">
          {!sent ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={32} className="text-primary" />
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-2">Forgot Password?</h2>
                <p className="text-sm text-text-secondary">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                <Button type="submit" className="w-full" loading={loading}>
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-success" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Check Your Email</h2>
              <p className="text-sm text-text-secondary mb-6">
                We&apos;ve sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions.
              </p>
              <p className="text-xs text-text-muted">
                Didn&apos;t receive the email? Check your spam folder or{" "}
                <button 
                  onClick={() => setSent(false)} 
                  className="text-accent hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
