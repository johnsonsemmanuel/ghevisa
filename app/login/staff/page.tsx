"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Shield, Users, FileCheck, Briefcase, User } from "lucide-react";
import toast from "react-hot-toast";

const roleRedirect: Record<string, string> = {
  // Frontend role formats (converted by backend)
  GIS_REVIEWING_OFFICER: "/dashboard/gis",
  GIS_APPROVAL_OFFICER: "/dashboard/gis",
  GIS_ADMIN: "/dashboard/gis",
  MFA_REVIEWING_OFFICER: "/dashboard/mfa",
  MFA_APPROVAL_OFFICER: "/dashboard/mfa",
  MFA_ADMIN: "/dashboard/mfa",
  SYSTEM_ADMIN: "/dashboard/admin",
  APPLICANT: "/dashboard/applicant",
  // Database role formats (fallback)
  gis_officer: "/dashboard/gis",
  gis_approver: "/dashboard/gis", 
  gis_admin: "/dashboard/gis",
  mfa_reviewer: "/dashboard/mfa",
  mfa_approver: "/dashboard/mfa",
  mfa_admin: "/dashboard/mfa",
  admin: "/dashboard/admin",
  applicant: "/dashboard/applicant",
  border_officer: "/dashboard/border",
  border_supervisor: "/dashboard/border",
  airline_staff: "/dashboard/airline",
  airline_admin: "/dashboard/airline",
};


export default function StaffLoginPage() {
  const { login, verifyMfa } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaEmail, setMfaEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyMfa(mfaEmail, otp);
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      toast.success("Authentication successful");
      router.push(roleRedirect[user.role] || "/dashboard/gis");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Invalid or expired OTP. Please try again.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await login(email, password);
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");

      // Check if user is staff (GIS or MFA) - using frontend role formats
      const staffRoles = [
        "GIS_REVIEWING_OFFICER", "GIS_APPROVAL_OFFICER", "GIS_ADMIN",
        "MFA_REVIEWING_OFFICER", "MFA_APPROVAL_OFFICER", "MFA_ADMIN",
        "SYSTEM_ADMIN", "BORDER_OFFICER", "BORDER_SUPERVISOR",
        // Database formats (fallback)
        "gis_officer", "gis_approver", "gis_admin",
        "mfa_reviewer", "mfa_approver", "mfa_admin", 
        "admin", "border_officer", "border_supervisor"
      ];
      if (!staffRoles.includes(user.role)) {
        sessionStorage.removeItem("user");
        toast.error("Access denied. This portal is for GIS and MFA staff only.");
        return;
      }

      toast.success("Authentication successful");
      router.push(roleRedirect[user.role] || "/dashboard/gis");
    } catch (err: unknown) {
      const error = err as Error & { mfaEmail?: string; response?: { data?: { message?: string; errors?: Record<string, string[]> }; status?: number } };

      // Handle MFA requirement
      if (error.message === "MFA_REQUIRED" && error.mfaEmail) {
        setMfaEmail(error.mfaEmail);
        setMfaStep(true);
        // Store dev OTP if provided (development only)
        const devOtpValue = (error as any).devOtp;
        if (devOtpValue) {
          setDevOtp(devOtpValue);
        }
        toast.success("MFA code sent to your email. Please check your inbox.", { duration: 5000 });
        setLoading(false);
        return;
      }

      // Handle account lockout (429)
      if (error.response?.status === 429) {
        toast.error(error.response?.data?.message || "Account temporarily locked. Please try again later.", { duration: 6000 });
      } else if (error.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(error.response.data.errors)) {
          fieldErrors[key] = msgs[0];
        }
        setErrors(fieldErrors);
      } else {
        toast.error(error.response?.data?.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left Panel – Staff themed (Teal/Cyan) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Teal/Cyan overlay for staff */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-800/95 via-teal-700/90 to-cyan-900/85 z-[1]" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="flex items-center gap-3 mb-20">
              <img src="/gis-logo.png" alt="Ghana Immigration Service" width={54} height={44} className="drop-shadow-lg" />
              <div>
                <p className="text-sm font-bold tracking-wide">Ghana Immigration Service</p>
                <p className="text-white/50 text-[10px] tracking-widest uppercase">Staff Portal</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold leading-tight mb-4">
              Staff
              <br />
              <span className="text-cyan-300">Operations Portal</span>
            </h2>
            <div className="w-16 h-1 bg-cyan-400 mb-6" />
            <p className="text-white/60 text-lg leading-relaxed max-w-md">
              Access the case management system to review and process visa applications.
              GIS Officers and MFA Reviewers only.
            </p>

            <div className="flex flex-wrap gap-3 mt-10">
              {[
                { icon: <Shield size={14} />, text: "Secure Access" },
                { icon: <Users size={14} />, text: "GIS & MFA Staff" },
                { icon: <FileCheck size={14} />, text: "Case Management" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-cyan-300">{item.icon}</span>
                  <span className="text-white/70 text-xs font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/20 text-sm">
            &copy; {new Date().getFullYear()} Ghana Immigration Service &middot; Internal Use Only
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-6 left-6">
          <Link href="/">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>
              Back to home
            </Button>
          </Link>
        </div>

        <div className="w-full max-w-md mt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/gis-logo.png" alt="Ghana Immigration Service" width={50} height={40} />
            <div>
              <p className="text-sm font-bold text-teal-700">Ghana Immigration Service</p>
              <p className="text-[10px] text-text-muted tracking-wider uppercase">Staff Portal</p>
            </div>
          </div>

          {mfaStep ? (
            <>
              <h1 className="text-2xl font-bold text-text-primary mb-1">
                Verify Identity
              </h1>
              <p className="text-text-secondary text-sm mb-2">
                A 6-digit verification code has been sent to
              </p>
              <p className="text-xs font-semibold text-teal-700 bg-teal-50 rounded-lg px-3 py-2 mb-5">
                {mfaEmail}
              </p>

              {devOtp && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-[10px] font-semibold text-blue-700 mb-1">🔧 Development Mode - Your OTP:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xl font-mono font-bold text-blue-900 tracking-widest">{devOtp}</code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(devOtp);
                        toast.success("OTP copied to clipboard!");
                      }}
                      className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleMfaVerify} className="space-y-4">
                <Input
                  label="Verification Code"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  autoFocus
                />
                <p className="text-xs text-text-muted">
                  Enter the 6-digit code from your email. The code expires in 10 minutes.
                </p>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={otp.length !== 6}
                  className="w-full !bg-teal-600 hover:!bg-teal-700 !py-2.5"
                >
                  Verify &amp; Sign In
                </Button>
              </form>

              <button
                onClick={() => { setMfaStep(false); setOtp(""); }}
                className="text-xs text-teal-600 hover:underline mt-4 block text-center w-full"
              >
                ← Back to login
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-text-primary mb-1">
                Staff Sign In
              </h1>
              <p className="text-text-secondary text-sm mb-6">
                Enter your staff credentials to access the portal
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {process.env.NODE_ENV !== "production" && (
                  <div className="flex flex-wrap gap-2 justify-end mb-2">
                    <Button type="button" variant="secondary" size="sm"
                      onClick={() => { setEmail("kmensah@gis.gov.gh"); setPassword("password"); }} className="!text-xs !py-1.5 !px-2.5">
                      GIS Reviewer
                    </Button>
                    <Button type="button" variant="secondary" size="sm"
                      onClick={() => { setEmail("gis.approver@gis.gov.gh"); setPassword("password"); }} className="!text-xs !py-1.5 !px-2.5">
                      GIS Approver
                    </Button>
                    <Button type="button" variant="secondary" size="sm"
                      onClick={() => { setEmail("gis.admin@gis.gov.gh"); setPassword("password"); }} className="!text-xs !py-1.5 !px-2.5">
                      GIS Admin
                    </Button>
                    <Button type="button" variant="secondary" size="sm"
                      onClick={() => { setEmail("aadjei@mfa.gov.gh"); setPassword("password"); }} className="!text-xs !py-1.5 !px-2.5">
                      MFA Reviewer
                    </Button>
                    <Button type="button" variant="secondary" size="sm"
                      onClick={() => { setEmail("mfa.approver@mfa.gov.gh"); setPassword("password"); }} className="!text-xs !py-1.5 !px-2.5">
                      MFA Approver
                    </Button>
                    <Button type="button" variant="secondary" size="sm"
                      onClick={() => { setEmail("mfa.admin@mfa.gov.gh"); setPassword("password"); }} className="!text-xs !py-1.5 !px-2.5">
                      MFA Admin
                    </Button>
                  </div>
                )}
                <Input
                  label="Staff Email"
                  type="email"
                  placeholder="officer@gis.gov.gh"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  required
                />
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full !bg-teal-600 hover:!bg-teal-700 !py-2.5"
                >
                  Sign In to Staff Portal
                </Button>
              </form>

              <p className="text-xs text-text-secondary text-center mt-4">
                Applicant?{" "}
                <Link
                  href="/login"
                  className="text-teal-600 font-semibold hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </>
          )}

          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-[10px] text-text-muted text-center mb-3 uppercase tracking-wide">Other Portals</p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors border border-emerald-100"
              >
                <User size={14} />
                Applicant
              </Link>
              <Link
                href="/login/admin"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition-colors border border-purple-100"
              >
                <Shield size={14} />
                Admin
              </Link>
              <Link
                href="/login/airline"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-100"
              >
                <Briefcase size={14} />
                Airline
              </Link>
              <Link
                href="/login/border"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-violet-50 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition-colors border border-violet-100"
              >
                <Shield size={14} />
                Border
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
