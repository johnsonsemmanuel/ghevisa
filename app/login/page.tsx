"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Shield, Clock, Globe2, User, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
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
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Check if user is applicant - redirect others to appropriate portals
      const applicantRoles = ["applicant", "APPLICANT"];
      if (!applicantRoles.includes(user.role)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        const adminRoles = ["admin", "SYSTEM_ADMIN"];
        if (adminRoles.includes(user.role)) {
          toast.error("Please use the Admin portal to sign in.");
          router.push("/login/admin");
        } else {
          toast.error("Please use the Staff portal to sign in.");
          router.push("/login/staff");
        }
        return;
      }

      toast.success("Authentication successful");
      router.push("/dashboard/applicant");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]>; requires_email_verification?: boolean; email?: string } } };
      if (error.response?.data?.requires_email_verification) {
        // Handle email verification requirement
        toast.error(error.response.data.message || "Email verification required");
        // Optionally redirect to verification page or show verification message
        if (error.response.data.email) {
          console.log(`Verification email sent to: ${error.response.data.email}`);
        }
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
      {/* Left Panel – Photo with overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background photo from video frame */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-black/70 z-[1]" />

        {/* Content over the photo */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="flex items-center gap-3 mb-20">
              <img src="/gis-logo.png" alt="Ghana Immigration Service" width={54} height={44} className="drop-shadow-lg" />
              <div>
                <p className="text-sm font-bold tracking-wide">Republic of Ghana</p>
                <p className="text-white/50 text-[10px] tracking-widest uppercase">Electronic Visa Portal</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold leading-tight mb-4">
              Ghana Electronic
              <br />
              <span className="gold-accent">Visa Portal</span>
            </h2>
            <div className="divider-gold mb-6" />
            <p className="text-white/50 text-lg leading-relaxed max-w-md">
              Access the portal to manage visa applications, track processing
              status, and download approved electronic visas.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mt-10">
              {[
                { icon: <Shield size={14} />, text: "Secure & Encrypted" },
                { icon: <Clock size={14} />, text: "72-Hour Processing" },
                { icon: <Globe2 size={14} />, text: "24/7 Available" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-gold">{item.icon}</span>
                  <span className="text-white/70 text-xs font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/20 text-sm">
            &copy; {new Date().getFullYear()} Republic of Ghana &middot; Ghana Immigration Service
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
              <p className="text-sm font-bold text-primary">Republic of Ghana</p>
              <p className="text-[10px] text-text-muted tracking-wider uppercase">e-Visa Portal</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-1">
            Applicant Sign In
          </h1>
          <p className="text-text-secondary mb-8">
            Enter credentials to access your visa applications
          </p>


          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-end mb-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEmail("fatima@example.com");
                  setPassword("password");
                }}
                className="text-xs"
              >
                Demo: Applicant
              </Button>
            </div>
            <Input
              label="Email Address"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
            />
            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>

          <div className="flex items-center justify-between mt-4">
            <Link
              href="/forgot-password"
              className="text-sm text-accent hover:underline"
            >
              Forgot password?
            </Link>
            <p className="text-sm text-text-secondary">
              No account?{" "}
              <Link
                href="/register"
                className="text-accent font-medium hover:underline"
              >
                Register
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-text-muted text-center mb-3">Other portals</p>
            <div className="flex gap-3">
              <Link
                href="/login/staff"
                className="flex-1 text-center py-2 px-3 rounded-lg bg-teal-50 text-teal-700 text-xs font-medium hover:bg-teal-100 transition-colors"
              >
                Staff Portal
              </Link>
              <Link
                href="/login/admin"
                className="flex-1 text-center py-2 px-3 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100 transition-colors"
              >
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
