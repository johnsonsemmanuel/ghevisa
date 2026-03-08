"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ArrowLeft, Shield, Clock, Globe2, ChevronRight, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  // Multi-step state
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [form, setForm] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    locale: "en" | "fr";
  }>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    locale: "en",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error for the field being typed in
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!form.first_name.trim()) { newErrors.first_name = "First name is required"; isValid = false; }
      if (!form.last_name.trim()) { newErrors.last_name = "Last name is required"; isValid = false; }
    } else if (currentStep === 2) {
      if (!form.email.trim()) {
        newErrors.email = "Email is required";
        isValid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
        newErrors.email = "Invalid email format";
        isValid = false;
      }
    } else if (currentStep === 3) {
      if (!form.password) { newErrors.password = "Password is required"; isValid = false; }
      else if (form.password.length < 8) { newErrors.password = "Password must be at least 8 characters"; isValid = false; }

      if (form.password !== form.password_confirmation) {
        newErrors.password_confirmation = "Passwords do not match";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      await register(form);
      toast.success("Registration successful");
      router.push("/dashboard/applicant");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      if (error.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(error.response.data.errors)) {
          fieldErrors[key] = msgs[0];
        }
        setErrors(fieldErrors);
      } else {
        toast.error(error.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex font-sans">
      {/* Left Panel – Photo with overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-black/70 z-[1]" />
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
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4 text-white">
              Electronic Visa
              <br />
              <span className="text-gold">Application Registration</span>
            </h2>
            <div className="divider-gold mb-6" />
            <p className="text-white/60 text-lg leading-relaxed max-w-md font-medium">
              Register an account to begin a Tourism or Business visa application
              to the Republic of Ghana. The application process takes approximately
              15 minutes.
            </p>
            <div className="flex flex-wrap gap-3 mt-10">
              {[
                { icon: <Shield size={14} />, text: "Secure & Encrypted" },
                { icon: <Clock size={14} />, text: "72-Hour Processing" },
                { icon: <Globe2 size={14} />, text: "24/7 Available" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/5">
                  <span className="text-gold">{item.icon}</span>
                  <span className="text-white/80 text-xs font-semibold tracking-wide">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-white/30 text-xs font-medium tracking-wide">
            &copy; {new Date().getFullYear()} Republic of Ghana &middot; Ghana Immigration Service
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col p-6 sm:p-8 lg:p-12 relative overflow-y-auto">
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
          <Link href="/">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />} className="text-gray-500 hover:text-gray-900 font-semibold tracking-wide px-3">
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto my-auto pt-16 lg:pt-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <img src="/gis-logo.png" alt="Ghana Immigration Service" width={44} height={34} />
            <div>
              <p className="text-sm font-extrabold text-primary tracking-tight">Republic of Ghana</p>
              <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">e-Visa Portal</p>
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Create Account
            </h1>
            <p className="text-gray-500 font-medium text-sm sm:text-base">
              {step === 1 && "Start by providing your personal details."}
              {step === 2 && "Enter your contact information."}
              {step === 3 && "Secure your account with a password."}
            </p>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2 flex-1 relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 ${s < step ? "bg-accent text-white" : s === step ? "bg-accent border-2 border-accent text-white ring-4 ring-accent/10" : "bg-gray-100 text-gray-400 border-2 border-gray-100"
                    }`}
                >
                  {s < step ? <Check size={14} /> : s}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${s <= step ? "text-gray-900" : "text-gray-400"}`}>
                  {s === 1 ? "Personal" : s === 2 ? "Contact" : "Security"}
                </span>
                {s !== 3 && (
                  <div className={`absolute top-4 left-[50%] w-full h-0.5 -z-0 transition-colors duration-300 ${s < step ? "bg-accent" : "bg-gray-100"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/20">
            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">

              {/* Step 1: Personal Details */}
              <div className={`space-y-5 transition-all duration-500 ${step === 1 ? "block animate-fade-in-up" : "hidden"}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">First Name</label>
                    <Input
                      placeholder="e.g. John"
                      value={form.first_name}
                      onChange={(e) => set("first_name", e.target.value)}
                      error={errors.first_name}
                      autoFocus={step === 1}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Last Name</label>
                    <Input
                      placeholder="e.g. Doe"
                      value={form.last_name}
                      onChange={(e) => set("last_name", e.target.value)}
                      error={errors.last_name}
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Contact Information */}
              <div className={`space-y-5 transition-all duration-500 ${step === 2 ? "block animate-fade-in-up" : "hidden"}`}>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Email Address</label>
                  <Input
                    type="email"
                    placeholder="john.doe@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    error={errors.email}
                    autoFocus={step === 2}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 flex justify-between">
                    <span>Phone Number</span>
                    <span className="text-gray-400 font-normal">Optional</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="+233 XX XXX XXXX"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    error={errors.phone}
                  />
                </div>
              </div>

              {/* Step 3: Security & Preferences */}
              <div className={`space-y-5 transition-all duration-500 ${step === 3 ? "block animate-fade-in-up" : "hidden"}`}>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Password</label>
                  <Input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    error={errors.password}
                    autoFocus={step === 3}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="Re-enter password"
                    value={form.password_confirmation}
                    onChange={(e) => set("password_confirmation", e.target.value)}
                    error={errors.password_confirmation}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Preferred Language</label>
                  <Select
                    value={form.locale}
                    onChange={(e) => set("locale", e.target.value)}
                    options={[
                      { value: "en", label: "English" },
                      { value: "fr", label: "Français" },
                    ]}
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-2 flex gap-3">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleBack}
                    className="flex-1 font-bold tracking-wide"
                  >
                    Back
                  </Button>
                )}
                {step < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-accent hover:bg-accent-dark text-white font-bold tracking-wide shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                  >
                    Next Step <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex-1 bg-accent hover:bg-accent-dark text-white font-bold tracking-wide shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                  >
                    Register Account <Check size={16} />
                  </Button>
                )}
              </div>
            </form>
          </div>

          <p className="text-sm text-gray-500 font-medium text-center mt-8">
            Already registered?{" "}
            <Link
              href="/login"
              className="text-accent font-bold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
