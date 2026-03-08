"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
  Star,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Menu,
  X,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";

const roleRedirect: Record<string, string> = {
  applicant: "/dashboard/applicant",
  gis_officer: "/dashboard/gis",
  mfa_reviewer: "/dashboard/mfa",
  admin: "/dashboard/admin",
};

const DESTINATIONS = [
  "Accra", "Cape Coast", "Kumasi", "Tamale", "Elmina",
  "Kakum", "Mole Park", "Ada Foah", "Volta Region", "Busua Beach",
];

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
  const [destIndex, setDestIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const howItWorks = useInView();
  const visaTypes = useInView();
  const stats = useInView();
  const faq = useInView();

  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDestIndex((prev) => (prev + 1) % DESTINATIONS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const faqs = [
    { q: "Who needs a visa to enter Ghana?", a: "Citizens of most countries require a visa. ECOWAS nationals are exempt. Check the Visa Requirements page for specific country eligibility." },
    { q: "How long does the e-Visa process take?", a: "Standard processing takes 3–5 business days. Express processing is available for urgent travel within 24–48 hours." },
    { q: "What documents do I need?", a: "A valid passport (6+ months validity), passport photo, travel itinerary, proof of accommodation, and yellow fever vaccination certificate." },
    { q: "Can a visa be extended while in Ghana?", a: "Yes. Visit the nearest Ghana Immigration Service office before the visa expires to apply for an extension." },
    { q: "Is payment and personal data secure?", a: "Absolutely. All data is encrypted with bank-level SSL security. The portal complies with international data protection standards." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navigation ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-center justify-between h-18 py-4">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/gis-logo.png" alt="Republic of Ghana" width={40} height={40} className="drop-shadow-md" />
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
                { label: "Track Application", href: "/track" },
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
                href="/register"
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
              {["Home|/", "Visa Types|#visa-types", "Visa Requirements|/visa-requirements", "Track Application|/track", "Help|/help"].map((item) => {
                const [label, href] = item.split("|");
                return (
                  <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                    {label}
                  </Link>
                );
              })}
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-[#006B3F] text-white text-sm font-semibold px-4 py-3 rounded-lg mt-3">
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
              <span className="block text-xl sm:text-2xl font-medium text-white/70 mb-3">The Gateway to Ghana</span>
              <span className="block text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight">
                e-Visa <span className="bg-gradient-to-r from-[#C8962E] via-[#D4A94B] to-[#C8962E] bg-clip-text text-transparent">Portal</span>
              </span>
            </h1>

            <div className="animate-fade-in-up delay-200 flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-gradient-to-r from-[#CE1126] via-[#C8962E] to-[#006B3F]" />
              <p className="text-base sm:text-lg text-white/60">
                Discover{" "}
                <span key={destIndex} className="inline-block font-bold text-[#C8962E] transition-all duration-500">
                  {DESTINATIONS[destIndex]}
                </span>
              </p>
            </div>

            <p className="animate-fade-in-up delay-300 text-base sm:text-lg text-white/50 mb-10 max-w-xl leading-relaxed">
              Apply for a Ghana electronic visa online. Fast, secure, and fully digital — 
              processed in as little as 3 business days.
            </p>

            <div className="animate-fade-in-up delay-400 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2.5 bg-[#006B3F] hover:bg-[#005A34] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-[#006B3F]/30 text-sm sm:text-base"
              >
                Start Application
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/track"
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

      {/* ═══════════════════ OFFICIAL NOTICE ═══════════════════ */}
      <section className="bg-[#FFF8E7] border-b border-[#C8962E]/20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-4">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle size={18} className="text-[#C8962E] shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm text-[#8B6914] leading-relaxed">
              <strong>Official Government Notice:</strong> This is the official electronic visa portal of the Ghana Immigration Service. All visa applications are processed by the Ghana Immigration Service. Beware of fraudulent websites.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-white" ref={howItWorks.ref}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className={`text-center mb-16 ${howItWorks.inView ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 bg-[#006B3F]/5 border border-[#006B3F]/10 rounded-full px-4 py-1.5 mb-4">
              <Clock size={14} className="text-[#006B3F]" />
              <span className="text-[#006B3F] text-xs font-semibold uppercase tracking-wider">Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Get a Visa in <span className="text-[#006B3F]">3 Easy Steps</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              A streamlined digital process makes applying for a Ghana visa quick and hassle-free.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: "01",
                icon: <FileText size={28} />,
                title: "Fill Application",
                desc: "Complete the online form with personal details, travel plans, and upload required documents.",
                color: "#CE1126",
                delay: "delay-100",
              },
              {
                step: "02",
                icon: <CreditCard size={28} />,
                title: "Pay & Submit",
                desc: "Make a secure online payment. The application is instantly submitted for processing.",
                color: "#C8962E",
                delay: "delay-300",
              },
              {
                step: "03",
                icon: <CheckCircle2 size={28} />,
                title: "Receive e-Visa",
                desc: "Receive the approved e-Visa via email. Print or save digitally for travel to Ghana.",
                color: "#006B3F",
                delay: "delay-500",
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`relative group ${howItWorks.inView ? `animate-slide-up ${item.delay}` : "opacity-0"}`}
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
                {item.step !== "03" && (
                  <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 text-gray-200">
                    <ChevronRight size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ VISA TYPES ═══════════════════ */}
      <section id="visa-types" className="py-24 lg:py-32 bg-[#FAFBFC]" ref={visaTypes.ref}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className={`text-center mb-16 ${visaTypes.inView ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 bg-[#C8962E]/8 border border-[#C8962E]/15 rounded-full px-4 py-1.5 mb-4">
              <Globe size={14} className="text-[#C8962E]" />
              <span className="text-[#C8962E] text-xs font-semibold uppercase tracking-wider">Visa Categories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Choose a <span className="text-[#C8962E]">Visa Type</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Select the visa category that best matches the purpose of travel to Ghana.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: <Plane size={24} />,
                title: "Tourist Visa",
                duration: "Up to 90 days",
                price: "From $60",
                desc: "For leisure, sightseeing, and visiting friends or family in Ghana.",
                color: "#006B3F",
                popular: true,
              },
              {
                icon: <Users size={24} />,
                title: "Business Visa",
                duration: "Up to 90 days",
                price: "From $100",
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
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span className="text-xs font-bold" style={{ color: visa.color }}>{visa.price}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">{visa.desc}</p>
                <Link
                  href="/register"
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

      
      {/* ═══════════════════ STATS ═══════════════════ */}
      <section className="py-20 bg-gradient-to-r from-[#006B3F] via-[#007A47] to-[#006B3F] relative overflow-hidden" ref={stats.ref}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtOS45NDEtOC4wNTktMTgtMTgtMThTMCA4LjA1OSAwIDE4czguMDU5IDE4IDE4IDE4IDE4LTguMDU5IDE4LTE4Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-8 ${stats.inView ? "animate-fade-in" : "opacity-0"}`}>
            {[
              { value: "50,000+", label: "Visas Issued", icon: <FileText size={20} /> },
              { value: "190+", label: "Countries Served", icon: <Globe size={20} /> },
              { value: "98%", label: "Approval Rate", icon: <CheckCircle2 size={20} /> },
              { value: "3 Days", label: "Avg. Processing", icon: <Clock size={20} /> },
            ].map((stat, i) => (
              <div key={stat.label} className={`text-center ${stats.inView ? `animate-count-up delay-${(i + 1) * 200}` : "opacity-0"}`}>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-white/70">
                  {stat.icon}
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{stat.value}</p>
                <p className="text-white/60 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section id="faq" className="py-24 lg:py-32 bg-[#FAFBFC]" ref={faq.ref}>
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <div className={`text-center mb-14 ${faq.inView ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 bg-[#2E6B96]/5 border border-[#2E6B96]/10 rounded-full px-4 py-1.5 mb-4">
              <FileText size={14} className="text-[#2E6B96]" />
              <span className="text-[#2E6B96] text-xs font-semibold uppercase tracking-wider">FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Frequently Asked <span className="text-[#2E6B96]">Questions</span>
            </h2>
            <p className="text-gray-500">Common questions about the Ghana e-Visa process.</p>
          </div>

          <div className={`space-y-3 ${faq.inView ? "animate-slide-up delay-200" : "opacity-0"}`}>
            {faqs.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4.5 text-left cursor-pointer"
                >
                  <span className="font-semibold text-gray-900 text-sm pr-4">{item.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA BANNER ═══════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Ready to Visit <span className="text-[#006B3F]">Ghana</span>?
          </h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            Start an e-Visa application today. The entire process is digital, secure, and takes just minutes to complete.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2.5 bg-[#006B3F] hover:bg-[#005A34] text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-[#006B3F]/20 transition-all text-sm sm:text-base"
            >
              Begin Application
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/visa-requirements"
              className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 font-semibold px-7 py-4 rounded-xl transition-all text-sm sm:text-base"
            >
              View Visa Requirements
            </Link>
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

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-gray-300 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2.5">
                {["Apply for Visa|/register", "Visa Requirements|/visa-requirements", "Track Application|/track", "Help|/help"].map((item) => {
                  const [label, href] = item.split("|");
                  return (
                    <li key={href}>
                      <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-gray-300 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2.5">
                {["Privacy Policy|/privacy-policy", "Terms of Service|/terms", "Cookie Policy|/cookies", "Accessibility|/accessibility"].map((item, index) => {
                  const [label, href] = item.split("|");
                  return (
                    <li key={`legal-${index}`}>
                      <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-gray-300 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Phone size={14} className="text-gray-500" />
                  <span className="text-gray-400 text-sm">+233 (0) 302 258 250</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={14} className="text-gray-500" />
                  <span className="text-gray-400 text-sm">evisa@gis.gov.gh</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={14} className="text-gray-500 mt-0.5" />
                  <span className="text-gray-400 text-sm">Ghana Immigration Service<br />Independence Ave, Accra</span>
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
