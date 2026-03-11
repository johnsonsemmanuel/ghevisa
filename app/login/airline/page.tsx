"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Shield, Lock, Plane, User, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

export default function AirlineLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await login(email, password);
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");

      // Check if user is airline staff
      if (user.role !== "AIRLINE_STAFF" && user.role !== "AIRLINE_ADMIN") {
        sessionStorage.removeItem("user");
        toast.error("Access denied. This portal is for airline staff only.");
        return;
      }

      toast.success("Authentication successful");
      router.push("/dashboard/airline");
    } catch (err: unknown) {
      const error = err as Error & { response?: { data?: { message?: string; errors?: Record<string, string[]> }; status?: number } };

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
      {/* Left Panel – Airline themed (Blue/Cyan) */}
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-cyan-800/90 to-slate-900/85 z-[1]" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="flex items-center gap-3 mb-20">
              <img src="/gis-logo.png" alt="Ghana Immigration Service" width={54} height={44} className="drop-shadow-lg" />
              <div>
                <p className="text-sm font-bold tracking-wide">Ghana Immigration Service</p>
                <p className="text-white/50 text-[10px] tracking-widest uppercase">Airline Portal</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold leading-tight mb-4">
              Airline
              <br />
              <span className="text-cyan-300">Verification Portal</span>
            </h2>
            <div className="w-16 h-1 bg-cyan-400 mb-6" />
            <p className="text-white/60 text-lg leading-relaxed max-w-md">
              Ghana Travel Authorization Verification System (GTAVS).
              Verify passenger boarding eligibility for flights to Ghana.
            </p>

            <div className="flex flex-wrap gap-3 mt-10">
              {[
                { icon: <Lock size={14} />, text: "Secure Access" },
                { icon: <Plane size={14} />, text: "Real-time Verification" },
                { icon: <Shield size={14} />, text: "Compliance Checks" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-cyan-300">{item.icon}</span>
                  <span className="text-white/70 text-xs font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/20 text-sm">
            &copy; {new Date().getFullYear()} Ghana Immigration Service &middot; GTAVS
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
              <p className="text-sm font-bold text-blue-700">Ghana Immigration Service</p>
              <p className="text-[10px] text-text-muted tracking-wider uppercase">Airline Portal</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-1">Airline Staff Sign In</h1>
          <p className="text-text-secondary text-sm mb-6">Enter your credentials to access GTAVS</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {process.env.NODE_ENV !== "production" && (
              <div className="flex justify-end mb-2">
                <Button type="button" variant="secondary" size="sm"
                  onClick={() => { setEmail("airline@example.com"); setPassword("password"); }} className="!text-xs !py-1.5 !px-3">
                  Airline Staff
                </Button>
              </div>
            )}
            <Input label="Staff Email" type="email" placeholder="staff@airline.com"
              value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
            <Input label="Password" type="password" placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} required />
            <Button type="submit" loading={loading} className="w-full !bg-blue-600 hover:!bg-blue-700 !py-2.5">
              Sign In to Airline Portal
            </Button>
          </form>

          <p className="text-xs text-text-secondary text-center mt-4">
            Need access?{" "}
            <Link href="/contact" className="text-blue-600 font-semibold hover:underline">Contact support</Link>
          </p>

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
