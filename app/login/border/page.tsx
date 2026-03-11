"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Shield, Lock, Scan, User, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

export default function BorderLoginPage() {
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
      if (user.role !== "BORDER_OFFICER" && user.role !== "BORDER_SUPERVISOR") {
        sessionStorage.removeItem("user");
        toast.error("Access denied. This portal is for border officers only.");
        setMfaStep(false);
        return;
      }
      toast.success("Authentication successful");
      router.push("/dashboard/border");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Invalid or expired OTP.");
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

      // Check if user is border officer
      if (user.role !== "BORDER_OFFICER" && user.role !== "BORDER_SUPERVISOR") {
        sessionStorage.removeItem("user");
        toast.error("Access denied. This portal is for border officers only.");
        return;
      }

      toast.success("Authentication successful");
      router.push("/dashboard/border");
    } catch (err: unknown) {
      const error = err as Error & { mfaEmail?: string; response?: { data?: { message?: string; errors?: Record<string, string[]> }; status?: number } };

      if (error.message === "MFA_REQUIRED" && error.mfaEmail) {
        setMfaEmail(error.mfaEmail);
        setMfaStep(true);
        const devOtpValue = (error as any).devOtp;
        if (devOtpValue) {
          setDevOtp(devOtpValue);
        }
        toast.success("MFA code sent to your email. Please check your inbox.", { duration: 5000 });
        setLoading(false);
        return;
      }

      if (error.response?.status === 429) {
        toast.error(error.response?.data?.message || "Account temporarily locked.", { duration: 6000 });
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
      {/* Left Panel – Border themed (Violet/Indigo) */}
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
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/95 via-indigo-800/90 to-slate-900/85 z-[1]" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="flex items-center gap-3 mb-20">
              <img src="/gis-logo.png" alt="Ghana Immigration Service" width={54} height={44} className="drop-shadow-lg" />
              <div>
                <p className="text-sm font-bold tracking-wide">Ghana Immigration Service</p>
                <p className="text-white/50 text-[10px] tracking-widest uppercase">Border Control</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold leading-tight mb-4">
              Border
              <br />
              <span className="text-violet-300">Verification Portal</span>
            </h2>
            <div className="w-16 h-1 bg-violet-400 mb-6" />
            <p className="text-white/60 text-lg leading-relaxed max-w-md">
              Immigration entry point verification system for border officers.
              Verify traveler authorization and manage border crossings.
            </p>

            <div className="flex flex-wrap gap-3 mt-10">
              {[
                { icon: <Lock size={14} />, text: "Secure Access" },
                { icon: <Scan size={14} />, text: "QR Verification" },
                { icon: <Shield size={14} />, text: "Real-time Checks" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-violet-300">{item.icon}</span>
                  <span className="text-white/70 text-xs font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/20 text-sm">
            &copy; {new Date().getFullYear()} Ghana Immigration Service &middot; Border Control
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
              <p className="text-sm font-bold text-violet-700">Ghana Immigration Service</p>
              <p className="text-[10px] text-text-muted tracking-wider uppercase">Border Control</p>
            </div>
          </div>

          {mfaStep ? (
            <>
              <h1 className="text-2xl font-bold text-text-primary mb-1">Verify Identity</h1>
              <p className="text-text-secondary text-sm mb-2">A 6-digit verification code has been sent to</p>
              <p className="text-xs font-semibold text-violet-700 bg-violet-50 rounded-lg px-3 py-2 mb-5">{mfaEmail}</p>

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
                <Button type="submit" loading={loading} disabled={otp.length !== 6} className="w-full !bg-violet-600 hover:!bg-violet-700 !py-2.5">
                  Verify &amp; Sign In
                </Button>
              </form>
              <button onClick={() => { setMfaStep(false); setOtp(""); }} className="text-xs text-violet-600 hover:underline mt-4 block text-center w-full">
                ← Back to login
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-text-primary mb-1">Border Officer Sign In</h1>
              <p className="text-text-secondary text-sm mb-6">Enter your credentials to access the border portal</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {process.env.NODE_ENV !== "production" && (
                  <div className="flex justify-end mb-2">
                    <Button type="button" variant="secondary" size="sm"
                      onClick={() => { setEmail("border@ghevisa.gov.gh"); setPassword("password"); }} className="!text-xs !py-1.5 !px-3">
                      Border Officer
                    </Button>
                  </div>
                )}
                <Input label="Officer Email" type="email" placeholder="officer@ghevisa.gov.gh"
                  value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
                <Input label="Password" type="password" placeholder="Enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} required />
                <Button type="submit" loading={loading} className="w-full !bg-violet-600 hover:!bg-violet-700 !py-2.5">
                  Sign In to Border Portal
                </Button>
              </form>

              <p className="text-xs text-text-secondary text-center mt-4">
                Staff member?{" "}
                <Link href="/login/staff" className="text-violet-600 font-semibold hover:underline">Staff portal</Link>
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
                href="/login/staff"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold hover:bg-teal-100 transition-colors border border-teal-100"
              >
                <Briefcase size={14} />
                Staff
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
