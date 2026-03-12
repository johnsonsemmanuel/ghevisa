"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { countries } from "@/lib/countries";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Shield,
  CreditCard,
  Plane,
  Users,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Menu,
  X,
  Search,
  UserPlus,
  Send,
  Laptop,
  Lock,
  MailCheck,
  ExternalLink,
} from "lucide-react";

const roleRedirect: Record<string, string> = {
  applicant: "/dashboard/applicant",
  gis_officer: "/dashboard/gis",
  mfa_reviewer: "/dashboard/mfa",
  admin: "/dashboard/admin",
};

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Eligibility checker state
  const [nationality, setNationality] = useState("");
  const [eligibilityResult, setEligibilityResult] = useState<"visa_required" | "visa_on_arrival" | "no_visa" | null>(null);

  // Track application state
  const [trackRef, setTrackRef] = useState("");

  // ECOWAS countries - no visa required
  const ecowasCountries = [
    "BJ", "BF", "CV", "CI", "GM", "GN", "GW", "LR", "ML", "NE",
    "NG", "SN", "SL", "TG"
  ];

  // Countries eligible for Visa on Arrival
  const visaOnArrivalCountries = [
    "US", "GB", "CA", "AU", "NZ", "JP", "KR", "SG", "MY", "ZA",
    "DE", "FR", "IT", "ES", "NL", "BE", "SE", "NO", "DK", "FI",
    "AT", "CH", "IE", "PT", "GR", "PL", "CZ", "HU", "RO", "BG"
  ];

  const checkEligibility = () => {
    if (!nationality) return;
    if (ecowasCountries.includes(nationality)) {
      setEligibilityResult("no_visa");
    } else if (visaOnArrivalCountries.includes(nationality)) {
      setEligibilityResult("visa_on_arrival");
    } else {
      setEligibilityResult("visa_required");
    }
  };

  const resetEligibility = () => {
    setNationality("");
    setEligibilityResult(null);
  };

  // Section refs for animations
  const visaTypes = useInView();
  const eligibility = useInView();
  const appProcess = useInView();
  const trackSection = useInView();
  const whyPortal = useInView();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navigation ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-center justify-between h-18 py-4">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="flex items-center gap-2">
                <img src="/gis-logo-cxytxk.png" alt="Ministry of Foreign Affairs" width={40} height={40} className="drop-shadow-md" />
                <img src="/gis-logo-new.png" alt="Ghana Immigration Service" width={56} height={56} className="drop-shadow-md" />
              </div>
              <div className="hidden sm:block">
                <p className={`text-sm font-bold tracking-wide leading-tight ${scrolled ? "text-gray-900" : "text-white"}`}>
                  Republic of Ghana
                </p>
                <p className={`text-[10px] tracking-widest uppercase ${scrolled ? "text-gray-400" : "text-white/50"}`}>
                  Electronic Visa Portal
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: "Home", href: "/" },
                { label: "Visa Types", href: "#visa-types" },
                { label: "Visa Requirements", href: "/visa-requirements" },
                { label: "Track Application", href: "#track-application" },
                { label: "Help", href: "/help" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-colors ${scrolled ? "text-gray-600 hover:text-gray-900 hover:bg-gray-50" : "text-white/70 hover:text-white hover:bg-white/10"}`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="w-px h-6 bg-gray-200/30 mx-2" />
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-[#006B3F] hover:bg-[#005A34] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-[#006B3F]/20 ml-1"
              >
                Apply Now <ArrowRight size={14} />
              </Link>
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`md:hidden p-2 rounded-lg ${scrolled ? "text-gray-700" : "text-white"}`}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl animate-slide-down">
            <div className="px-5 py-4 space-y-1">
              {["Home|/", "Visa Types|#visa-types", "Visa Requirements|/visa-requirements", "Track Application|#track-application", "Help|/help"].map((item) => {
                const [label, href] = item.split("|");
                return (
                  <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                    {label}
                  </Link>
                );
              })}
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-[#006B3F] text-white text-sm font-semibold px-4 py-3 rounded-lg mt-3">
                Apply Now
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <iframe
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://www.youtube.com/embed/Mj6W3w1Eeys?autoplay=1&mute=1&loop=1&playlist=Mj6W3w1Eeys&controls=0&showinfo=0&modestbranding=1&iv_load_policy=3&rel=0"
          title="Ghana Tourism Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        {/* Ghana flag accent strip at the very top */}
        <div className="absolute top-0 left-0 right-0 z-[2] flex h-1">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-[#C8962E]" />
          <div className="flex-1 bg-[#006B3F]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 w-full pt-32 pb-20">
          <div className="max-w-3xl">
            <div className="animate-fade-in-up mb-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-[#C8962E] rounded-full animate-pulse" />
                <span className="text-white/80 text-xs font-semibold tracking-wider uppercase">
                  Official Government Portal
                </span>
              </div>
            </div>

            <h1 className="animate-fade-in-up delay-100 leading-[1.1] mb-6">
              <span className="block text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight">
                Apply for a Ghana
              </span>
              <span className="block text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight">
                <span className="bg-gradient-to-r from-[#C8962E] via-[#D4A94B] to-[#C8962E] bg-clip-text text-transparent">
                  e-Visa
                </span>{" "}
                Online
              </span>
            </h1>

            <p className="animate-fade-in-up delay-200 text-lg sm:text-xl text-white/60 mb-10 max-w-xl leading-relaxed">
              Fast, secure and fully digital visa processing.
            </p>

            <div className="animate-fade-in-up delay-300 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2.5 bg-[#006B3F] hover:bg-[#005A34] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-[#006B3F]/30 text-sm sm:text-base"
              >
                Apply Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#track-application"
                className="inline-flex items-center gap-2 border-2 border-white/20 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/5 font-semibold px-7 py-4 rounded-xl transition-all text-sm sm:text-base"
              >
                Track Application
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float">
          <ChevronDown size={24} className="text-white/30" />
        </div>
      </section>

      {/* ═══════════════════ VISA TYPES ═══════════════════ */}
      <section id="visa-types" className="py-24 lg:py-32 bg-[#FAFBFC]" ref={visaTypes.ref}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className={`text-center mb-16 ${visaTypes.inView ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 bg-[#C8962E]/8 border border-[#C8962E]/15 rounded-full px-4 py-1.5 mb-4">
              <Globe size={14} className="text-[#C8962E]" />
              <span className="text-[#C8962E] text-xs font-semibold uppercase tracking-wider">Visa Types</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Visa <span className="text-[#C8962E]">Types</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Select the visa type that best matches the purpose of travel to Ghana.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: <Plane size={24} />,
                title: "Tourist Visa",
                duration: "Up to 90 days",
                desc: "For leisure, sightseeing, and visiting friends or family in Ghana.",
                color: "#006B3F",
                popular: true,
              },
              {
                icon: <Users size={24} />,
                title: "Business Visa",
                duration: "Up to 90 days",
                desc: "For business meetings, conferences, and commercial activities in Ghana.",
                color: "#C8962E",
                popular: false,
              },
            ].map((visa, i) => (
              <div
                key={visa.title}
                className={`relative bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 group ${visaTypes.inView ? `animate-slide-up delay-${(i + 1) * 200}` : "opacity-0"}`}
              >
                {visa.popular && (
                  <div className="absolute -top-3 left-6 bg-[#006B3F] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${visa.color}10`, color: visa.color }}
                >
                  {visa.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{visa.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-gray-400">{visa.duration}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">{visa.desc}</p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors group-hover:gap-2.5"
                  style={{ color: visa.color }}
                >
                  Apply Now <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ VISA ELIGIBILITY ═══════════════════ */}
      <section id="visa-eligibility" className="py-24 lg:py-32 bg-white" ref={eligibility.ref}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className={`text-center mb-14 ${eligibility.inView ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 bg-[#006B3F]/5 border border-[#006B3F]/10 rounded-full px-4 py-1.5 mb-4">
              <Search size={14} className="text-[#006B3F]" />
              <span className="text-[#006B3F] text-xs font-semibold uppercase tracking-wider">Eligibility Check</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Visa <span className="text-[#006B3F]">Eligibility</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Check if you need a visa to travel to Ghana based on your nationality.
            </p>
          </div>

          <div className={`max-w-xl mx-auto ${eligibility.inView ? "animate-slide-up delay-200" : "opacity-0"}`}>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-8">
              {!eligibilityResult ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Nationality
                    </label>
                    <select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 rounded-xl text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Select Country</option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={checkEligibility}
                    disabled={!nationality}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#006B3F] hover:bg-[#005A34] text-white font-bold px-8 py-4 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-[#006B3F]/20"
                  >
                    <CheckCircle2 size={18} />
                    Check Eligibility
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Result display */}
                  {eligibilityResult === "no_visa" && (
                    <div className="p-5 rounded-xl bg-green-50 border-2 border-green-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 size={20} className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-green-700 mb-1">No Visa Required</h3>
                          <p className="text-sm text-green-600/80">
                            As an ECOWAS citizen, you can enter Ghana without a visa for up to 90 days.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {eligibilityResult === "visa_on_arrival" && (
                    <div className="p-5 rounded-xl bg-blue-50 border-2 border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Globe size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-blue-700 mb-1">Visa on Arrival Available</h3>
                          <p className="text-sm text-blue-600/80">
                            You are eligible for visa on arrival. We recommend applying for an e-Visa in advance for a smoother experience.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {eligibilityResult === "visa_required" && (
                    <div className="p-5 rounded-xl bg-amber-50 border-2 border-amber-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <FileText size={20} className="text-amber-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-amber-700 mb-1">Visa Required</h3>
                          <p className="text-sm text-amber-600/80">
                            Visa required for this nationality. You can apply online for a Ghana e-Visa.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={resetEligibility}
                      className="flex-1 px-5 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                    >
                      Check Another Country
                    </button>
                    {(eligibilityResult === "visa_required" || eligibilityResult === "visa_on_arrival") && (
                      <Link
                        href="/login"
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-[#006B3F] hover:bg-[#005A34] text-white font-bold px-5 py-3 rounded-xl transition-colors shadow-lg shadow-[#006B3F]/20 text-sm"
                      >
                        Apply Now <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ APPLICATION PROCESS (4 Steps) ═══════════════════ */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-[#FAFBFC]" ref={appProcess.ref}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className={`text-center mb-16 ${appProcess.inView ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 bg-[#006B3F]/5 border border-[#006B3F]/10 rounded-full px-4 py-1.5 mb-4">
              <Clock size={14} className="text-[#006B3F]" />
              <span className="text-[#006B3F] text-xs font-semibold uppercase tracking-wider">Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Application <span className="text-[#006B3F]">Process</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Follow these four simple steps to apply for your Ghana e-Visa.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                icon: <Search size={28} />,
                title: "Check Eligibility",
                desc: "Verify your visa requirements based on your nationality before starting the application.",
                color: "#CE1126",
                delay: "delay-100",
              },
              {
                step: "02",
                icon: <UserPlus size={28} />,
                title: "Create Account",
                desc: "Register on the portal with your email address to begin the application process.",
                color: "#C8962E",
                delay: "delay-300",
              },
              {
                step: "03",
                icon: <FileText size={28} />,
                title: "Complete Application",
                desc: "Fill in personal details, travel plans, and upload required documents.",
                color: "#006B3F",
                delay: "delay-500",
              },
              {
                step: "04",
                icon: <CreditCard size={28} />,
                title: "Pay and Submit",
                desc: "Make a secure online payment and submit your application for processing.",
                color: "#2E6B96",
                delay: "delay-700",
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`relative group ${appProcess.inView ? `animate-slide-up ${item.delay}` : "opacity-0"}`}
              >
                <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${item.color}10`, color: item.color }}
                    >
                      {item.icon}
                    </div>
                    <span className="text-5xl font-black text-gray-100 group-hover:text-gray-200 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
                {item.step !== "04" && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 text-gray-200">
                    <ChevronRight size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TRACK APPLICATION ═══════════════════ */}
      <section id="track-application" className="py-24 lg:py-32 bg-white" ref={trackSection.ref}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className={`text-center mb-14 ${trackSection.inView ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 bg-[#C8962E]/8 border border-[#C8962E]/15 rounded-full px-4 py-1.5 mb-4">
              <Search size={14} className="text-[#C8962E]" />
              <span className="text-[#C8962E] text-xs font-semibold uppercase tracking-wider">Application Tracking</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Track <span className="text-[#C8962E]">Application</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Enter your application reference number to check the status of your e-Visa application.
            </p>
          </div>

          <div className={`max-w-xl mx-auto ${trackSection.inView ? "animate-slide-up delay-200" : "opacity-0"}`}>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Application Reference Number
                  </label>
                  <input
                    type="text"
                    value={trackRef}
                    onChange={(e) => setTrackRef(e.target.value.toUpperCase())}
                    placeholder="GH-EV-20260305-BF71435D"
                    className="w-full px-4 py-3.5 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8962E]/20 focus:border-[#C8962E] transition-all text-sm"
                  />
                </div>

                <Link
                  href={`/track${trackRef ? `?ref=${encodeURIComponent(trackRef)}` : ""}`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#C8962E] hover:bg-[#B08425] text-white font-bold px-8 py-4 rounded-xl transition-colors cursor-pointer shadow-lg shadow-[#C8962E]/20"
                >
                  <Search size={18} />
                  Check Status
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHY USE THE PORTAL ═══════════════════ */}
      <section id="why-portal" className="py-24 lg:py-32 bg-[#FAFBFC]" ref={whyPortal.ref}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className={`text-center mb-16 ${whyPortal.inView ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 bg-[#2E6B96]/5 border border-[#2E6B96]/10 rounded-full px-4 py-1.5 mb-4">
              <Shield size={14} className="text-[#2E6B96]" />
              <span className="text-[#2E6B96] text-xs font-semibold uppercase tracking-wider">Benefits</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Why Use the <span className="text-[#2E6B96]">Portal</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Experience a seamless, secure, and fully digital visa application process.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Laptop size={32} />,
                title: "Online Application",
                desc: "Apply from anywhere in the world. No embassy visits required — the entire process is digital.",
                color: "#006B3F",
                delay: "delay-100",
              },
              {
                icon: <Lock size={32} />,
                title: "Secure Processing",
                desc: "Your data is protected with bank-level encryption and complies with international data protection standards.",
                color: "#C8962E",
                delay: "delay-300",
              },
              {
                icon: <MailCheck size={32} />,
                title: "Receive e-Visa by Email",
                desc: "Once approved, your e-Visa is delivered directly to your email. Print or save digitally for travel.",
                color: "#2E6B96",
                delay: "delay-500",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`group ${whyPortal.inView ? `animate-slide-up ${item.delay}` : "opacity-0"}`}
              >
                <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 h-full text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${item.color}10`, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        {/* Ghana flag accent strip */}
        <div className="flex h-1 mb-12">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-[#C8962E]" />
          <div className="flex-1 bg-[#006B3F]" />
        </div>

        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/gis-logo.png" alt="Ghana" width={36} height={36} className="opacity-80" />
                <div>
                  <p className="font-bold text-sm">GH-eVISA</p>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest">Republic of Ghana</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The official electronic visa application portal of the Ghana Immigration Service.
              </p>
            </div>

            {/* Visa Information */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-gray-300 uppercase tracking-wider">Visa Information</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Visa Types", href: "#visa-types" },
                  { label: "Visa Requirements", href: "/visa-requirements" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-gray-300 uppercase tracking-wider">Support</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Contact Support
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={13} className="text-gray-500" />
                  <span className="text-gray-400 text-sm">+233 (0) 302 258 250</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={13} className="text-gray-500" />
                  <span className="text-gray-400 text-sm">evisa@gis.gov.gh</span>
                </li>
              </ul>
            </div>

            {/* Government Links */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-gray-300 uppercase tracking-wider">Government Links</h4>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2">
                  <ExternalLink size={12} className="text-gray-500" />
                  <a href="https://gis.gov.gh" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Ghana Immigration Service
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <ExternalLink size={12} className="text-gray-500" />
                  <a href="https://mfa.gov.gh" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Embassy Contacts
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} Ghana Immigration Service. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs">
              Powered by the Ministry of the Interior, Republic of Ghana
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
