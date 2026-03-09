"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  ArrowRight,
  Search,
  FileText,
  Clock,
  CheckCircle,
  Shield,
  Globe,
  HelpCircle,
  Mail,
  Menu,
  X,
  Phone,
  ArrowLeft,
  LogIn,
  AlertTriangle,
  Loader2,
} from "lucide-react";

type Step = "reference" | "otp" | "result" | "login_prompt";

interface TrackResult {
  applicant_name: string;
  reference_number: string;
  status: string;
  visa_type: string | null;
  submitted_at: string | null;
  decided_at: string | null;
  decision_notes: string | null;
  timeline: { status: string; changed_at: string }[];
}

export default function TrackPage() {
  const [step, setStep] = useState<Step>("reference");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Step 1: Submit reference number → backend sends OTP
  const handleInitiate = async () => {
    if (referenceNumber.trim().length < 5) {
      setError("Please enter a valid application reference number.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await api.post("/tracking/initiate", {
        reference_number: referenceNumber.trim(),
      });
      const data = res.data;
      if (data.verification_method === "login") {
        setStep("login_prompt");
      } else {
        setMaskedPhone(data.masked_phone || "");
        setDevOtp(data.dev_otp || null);
        setStep("otp");
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("No application found with this reference number. Please check and try again.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP → get result
  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await api.post("/tracking/verify", {
        reference_number: referenceNumber.trim(),
        otp: otp.trim(),
      });
      setSearchResult(res.data);
      setStep("result");
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("reference");
    setReferenceNumber("");
    setOtp("");
    setMaskedPhone("");
    setDevOtp(null);
    setSearchResult(null);
    setError("");
  };

  const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    approved: { bg: "bg-green-50 border-green-100", text: "text-green-700", icon: <CheckCircle size={16} className="text-green-600" /> },
    issued: { bg: "bg-green-50 border-green-100", text: "text-green-700", icon: <CheckCircle size={16} className="text-green-600" /> },
    denied: { bg: "bg-red-50 border-red-100", text: "text-red-700", icon: <AlertTriangle size={16} className="text-red-600" /> },
    under_review: { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", icon: <Clock size={16} className="text-amber-600" /> },
    pending_approval: { bg: "bg-blue-50 border-blue-100", text: "text-blue-700", icon: <Clock size={16} className="text-blue-600" /> },
    submitted: { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", icon: <Clock size={16} className="text-amber-600" /> },
  };

  const getStatusStyle = (status: string) =>
    statusColors[status] || { bg: "bg-gray-50 border-gray-100", text: "text-gray-700", icon: <Clock size={16} className="text-gray-600" /> };

  return (
    <div className="min-h-screen bg-white">
      {/* Ghana flag accent strip */}
      <div className="fixed top-0 left-0 right-0 z-[60] flex h-1">
        <div className="flex-1 bg-[#CE1126]" />
        <div className="flex-1 bg-[#C8962E]" />
        <div className="flex-1 bg-[#006B3F]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-1 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="flex items-center gap-2">
                <img src="/gis-logo-cxytxk.png" alt="Ministry of Foreign Affairs" width={40} height={40} className="drop-shadow-md" />
                <img src="/gis-logo-new.png" alt="Ghana Immigration Service" width={56} height={56} className="drop-shadow-md" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-900 tracking-wide leading-tight">Republic of Ghana</p>
                <p className="text-[10px] text-gray-400 tracking-widest uppercase">Electronic Visa Portal</p>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: "Home", href: "/" },
                { label: "Visa Types", href: "/#visa-types" },
                { label: "Visa Requirements", href: "/visa-requirements" },
                { label: "Track Application", href: "/track", active: true },
                { label: "Help", href: "/help" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-colors ${item.active ? "text-[#006B3F] bg-[#006B3F]/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="w-px h-6 bg-gray-200 mx-2" />
              <Link href="/register" className="inline-flex items-center gap-2 bg-[#006B3F] hover:bg-[#005A34] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-[#006B3F]/20 ml-1">
                Apply Now <ArrowRight size={14} />
              </Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-700 rounded-lg">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl animate-slide-down">
            <div className="px-5 py-4 space-y-1">
              {["Home|/", "Visa Types|/#visa-types", "Visa Requirements|/visa-requirements", "Track Application|/track", "Help|/help"].map((item) => {
                const [label, href] = item.split("|");
                return <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">{label}</Link>;
              })}
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-[#006B3F] text-white text-sm font-semibold px-4 py-3 rounded-lg mt-3">Apply Now</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Banner */}
      <section className="pt-28 pb-8 bg-gradient-to-b from-[#006B3F]/5 to-white">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-2 bg-[#006B3F]/5 border border-[#006B3F]/10 rounded-full px-4 py-1.5 mb-5">
            <Search size={14} className="text-[#006B3F]" />
            <span className="text-[#006B3F] text-xs font-semibold uppercase tracking-wider">Application Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Track Application</h1>
          <p className="text-gray-500 leading-relaxed">
            Enter your application reference number to check the status of your Ghana e-Visa application. We&apos;ll verify your identity via SMS before showing your results.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-xl mx-auto px-5">
          {/* ─── STEP 1: Reference Number ─── */}
          {step === "reference" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-8">
              {/* Step indicator */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#006B3F] text-white flex items-center justify-center text-sm font-bold">1</div>
                <div className="h-0.5 flex-1 bg-gray-200" />
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold">2</div>
                <div className="h-0.5 flex-1 bg-gray-200" />
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold">3</div>
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-1">Enter Reference Number</h2>
              <p className="text-sm text-gray-500 mb-5">Your reference number was emailed to you after submitting your application.</p>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2">Application Reference Number</label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => { setReferenceNumber(e.target.value.toUpperCase()); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleInitiate()}
                  placeholder="GH-EV-20260305-BF71435D"
                  className="w-full px-4 py-3.5 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all text-sm font-mono"
                />
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleInitiate}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#006B3F] hover:bg-[#005A34] text-white font-bold px-8 py-4 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-[#006B3F]/20"
              >
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> Searching&hellip;</>
                ) : (
                  <><Search size={18} /> Find Application</>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-5 text-gray-400 text-xs">
                <HelpCircle size={13} />
                <span>A verification code will be sent to your registered phone number.</span>
              </div>
            </div>
          )}

          {/* ─── STEP 2: OTP Verification ─── */}
          {step === "otp" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-8">
              {/* Step indicator */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#006B3F] text-white flex items-center justify-center text-sm font-bold">
                  <CheckCircle size={16} />
                </div>
                <div className="h-0.5 flex-1 bg-[#006B3F]" />
                <div className="w-8 h-8 rounded-full bg-[#006B3F] text-white flex items-center justify-center text-sm font-bold">2</div>
                <div className="h-0.5 flex-1 bg-gray-200" />
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold">3</div>
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-1">SMS Verification</h2>
              <p className="text-sm text-gray-500 mb-5">
                A 6-digit verification code has been sent to <span className="font-semibold text-gray-700">{maskedPhone}</span>.
              </p>

              {/* Dev OTP helper */}
              {devOtp && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-blue-700 text-xs font-medium">🔧 Dev Mode — Your OTP is: <span className="font-mono font-bold text-lg">{devOtp}</span></p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-4 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-300 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all text-2xl font-mono tracking-[0.5em] text-center"
                />
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={isLoading || otp.length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#006B3F] hover:bg-[#005A34] text-white font-bold px-8 py-4 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-[#006B3F]/20 mb-3"
              >
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> Verifying&hellip;</>
                ) : (
                  <><Shield size={18} /> Verify &amp; View Status</>
                )}
              </button>

              <div className="flex items-center justify-between">
                <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 cursor-pointer">
                  <ArrowLeft size={14} /> Change reference number
                </button>
                <button
                  onClick={handleInitiate}
                  disabled={isLoading}
                  className="text-sm text-[#006B3F] hover:text-[#005A34] font-medium cursor-pointer"
                >
                  Resend code
                </button>
              </div>
            </div>
          )}

          {/* ─── LOGIN PROMPT (no phone on file) ─── */}
          {step === "login_prompt" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#C8962E]/10 flex items-center justify-center mx-auto mb-5">
                <LogIn size={24} className="text-[#C8962E]" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Login Required</h2>
              <p className="text-sm text-gray-500 mb-6">
                Your application does not have a phone number on file for SMS verification. Please log in to your account to view your application status.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#006B3F] hover:bg-[#005A34] text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-[#006B3F]/20 w-full"
              >
                <LogIn size={18} /> Log In to View Status
              </Link>
              <button onClick={handleReset} className="mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 mx-auto cursor-pointer">
                <ArrowLeft size={14} /> Try a different reference number
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ─── STEP 3: Results ─── */}
      {step === "result" && searchResult && (
        <section className="py-4 pb-12">
          <div className="max-w-4xl mx-auto px-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              {/* Applicant Header */}
              <div className="bg-gradient-to-r from-[#006B3F] to-[#005A34] p-6 sm:p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Applicant</p>
                    <h2 className="text-2xl font-bold">{searchResult.applicant_name}</h2>
                    <p className="text-white/70 text-sm mt-1 font-mono">{searchResult.reference_number}</p>
                  </div>
                  <div className={`rounded-xl px-4 py-2 border ${getStatusStyle(searchResult.status).bg}`}>
                    <div className="flex items-center gap-2">
                      {getStatusStyle(searchResult.status).icon}
                      <span className={`text-sm font-bold capitalize ${getStatusStyle(searchResult.status).text}`}>
                        {searchResult.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3">
                <div className="lg:col-span-2 p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Application Details</h3>
                  <div className="space-y-0 divide-y divide-gray-100">
                    {[
                      ["Reference Number", searchResult.reference_number],
                      ["Visa Type", searchResult.visa_type || "—"],
                      ["Current Status", searchResult.status?.replace(/_/g, " ")],
                      ...(searchResult.submitted_at ? [["Submitted", new Date(searchResult.submitted_at).toLocaleDateString()]] : []),
                      ...(searchResult.decided_at ? [["Decision Date", new Date(searchResult.decided_at).toLocaleDateString()]] : []),
                    ].map(([label, value], idx) => (
                      <div key={idx} className="flex justify-between py-3.5">
                        <span className="text-gray-500 text-sm">{label}</span>
                        <span className={`font-semibold text-sm ${label === "Current Status" ? "text-[#006B3F] capitalize" : "text-gray-900"}`}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Decision Notes (for denied) */}
                  {searchResult.decision_notes && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                      <h4 className="text-sm font-bold text-red-700 mb-1">Decision Notes</h4>
                      <p className="text-sm text-red-600">{searchResult.decision_notes}</p>
                    </div>
                  )}

                  {/* Timeline */}
                  {searchResult.timeline && searchResult.timeline.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-base font-bold text-gray-900 mb-4">Timeline</h3>
                      <div className="space-y-3">
                        {searchResult.timeline.map((item, index: number) => (
                          <div key={index} className="flex gap-3 items-center">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${getStatusStyle(item.status).bg}`}>
                              {getStatusStyle(item.status).icon}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-gray-900 text-sm capitalize">{item.status?.replace(/_/g, " ")}</span>
                              <span className="text-xs text-gray-400 ml-2">{new Date(item.changed_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-6 sm:p-8 border-l border-gray-100">
                  <div className={`rounded-xl p-5 mb-4 border ${getStatusStyle(searchResult.status).bg}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusStyle(searchResult.status).icon}
                      <span className={`text-sm font-bold capitalize ${getStatusStyle(searchResult.status).text}`}>
                        {searchResult.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                    {searchResult.status === "approved" && <p className="text-xs text-green-600/80">The eVisa is ready for download.</p>}
                    {searchResult.status === "issued" && <p className="text-xs text-green-600/80">The eVisa has been issued. Log in to download.</p>}
                    {searchResult.status === "under_review" && <p className="text-xs text-amber-600/80">Being reviewed by an officer.</p>}
                    {searchResult.status === "denied" && <p className="text-xs text-red-600/80">Your application was not approved. See details for reason.</p>}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
                      <Shield size={16} className="text-[#006B3F]" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Verified via SMS</p>
                        <p className="text-xs text-gray-400">Identity confirmed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
                      <Globe size={16} className="text-[#C8962E]" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Track Anywhere</p>
                        <p className="text-xs text-gray-400">24/7 online access</p>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-6 space-y-2">
                    {searchResult.status === "denied" && (
                      <Link
                        href="/dashboard/applicant/support"
                        className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors"
                      >
                        <HelpCircle size={16} /> Talk to Support
                      </Link>
                    )}
                    <Link
                      href="/login"
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#006B3F] hover:bg-[#005A34] text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors"
                    >
                      <LogIn size={16} /> Log In for Full Details
                    </Link>
                    <button
                      onClick={handleReset}
                      className="w-full inline-flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <Search size={16} /> Track Another Application
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/gis-logo.png" alt="Republic of Ghana" width={36} height={36} className="opacity-80" />
                <div>
                  <p className="font-bold text-white text-sm">Republic of Ghana</p>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider">e-Visa Portal</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The official electronic visa application portal of the Ghana Immigration Service.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-gray-300 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2.5">
                {["Apply for Visa|/register", "Visa Requirements|/visa-requirements", "Track Application|/track", "Help|/help"].map((item, index) => {
                  const [label, href] = item.split("|");
                  return (
                    <li key={`quick-${index}`}>
                      <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-gray-300 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2.5">
                {["Privacy Policy|/privacy-policy", "Terms of Service|/terms", "Cookie Policy|/cookies", "Accessibility|/accessibility"].map((item, index) => {
                  const [label, href] = item.split("|");
                  return (
                    <li key={`legal-${index}`}>
                      <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-gray-300 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">+233 (0) 302 258 250</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">evisa@gis.gov.gh</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 text-sm">Ghana Immigration Service<br />Independence Ave, Accra</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">© {new Date().getFullYear()} Ghana Immigration Service. All rights reserved.</p>
            <p className="text-gray-600 text-xs">Powered by the Ministry of the Interior, Republic of Ghana</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
