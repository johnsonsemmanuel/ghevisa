"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { countries } from "@/lib/countries";
import {
  ArrowRight,
  FileText,
  Camera,
  Folder,
  Plane,
  CreditCard,
  Mail,
  Syringe,
  Briefcase,
  Building2,
  FileCheck,
  Shield,
  MapPin,
  ChevronDown,
  Menu,
  X,
  Search,
  CheckCircle2,
  Globe,
  AlertTriangle,
  Phone,
  ExternalLink,
} from "lucide-react";

/* ── Visa on Arrival & ECOWAS lists ── */
const visaOnArrivalCountries = [
  "US", "GB", "CA", "AU", "NZ", "JP", "KR", "SG", "MY", "ZA",
  "DE", "FR", "IT", "ES", "NL", "BE", "SE", "NO", "DK", "FI",
  "AT", "CH", "IE", "PT", "GR", "PL", "CZ", "HU", "RO", "BG",
];
const ecowasCountries = [
  "BJ", "BF", "CV", "CI", "GM", "GN", "GW", "LR", "ML", "NE",
  "NG", "SN", "SL", "TG",
];

/* ── Requirement data ── */
const generalRequirements = [
  { icon: <FileText size={22} />, title: "Valid Passport", description: "A passport valid for at least six (6) months beyond the intended stay in Ghana." },
  { icon: <Camera size={22} />, title: "Passport-Sized Photo", description: "A clear, recent colored photo meeting standard visa photo guidelines." },
  { icon: <Folder size={22} />, title: "Supporting Documents", description: "Invitation letter, business letter, or other supporting documents depending on visa type." },
  { icon: <Plane size={22} />, title: "Travel Details", description: "Information about travel dates, purpose of visit, and accommodation arrangements." },
  { icon: <CreditCard size={22} />, title: "Proof of Payment", description: "Valid debit/credit card or mobile money method for secure online payment." },
  { icon: <Mail size={22} />, title: "Active Email Address", description: "To receive notifications and the approved e-Visa." },
  { icon: <Syringe size={22} />, title: "Yellow Fever Card", description: "Required at port of entry. Proof of yellow fever vaccination must be presented upon arrival in Ghana." },
];

const touristRequirements = [
  { icon: <MapPin size={22} />, title: "Travel Itinerary", description: "Detailed travel plans and places to visit in Ghana." },
  { icon: <Shield size={22} />, title: "Travel Insurance", description: "Medical and travel insurance covering Ghana." },
];

const businessRequirements = [
  { icon: <Briefcase size={22} />, title: "Employment Letter", description: "Letter from the employer confirming employment status." },
  { icon: <Building2 size={22} />, title: "Company Registration", description: "Certificate of incorporation of the inviting company." },
  { icon: <FileCheck size={22} />, title: "Business Invitation", description: "Official invitation letter from a Ghanaian company." },
];

export default function VisaRequirementsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return countries;
    const q = searchQuery.toLowerCase();
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.nationality.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const eligibility = useMemo(() => {
    if (!selectedCountry) return null;
    if (ecowasCountries.includes(selectedCountry)) return "no_visa";
    if (visaOnArrivalCountries.includes(selectedCountry)) return "visa_on_arrival";
    return "visa_required";
  }, [selectedCountry]);

  const countryName = useMemo(() => countries.find((c) => c.code === selectedCountry)?.name || "", [selectedCountry]);

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
                <img src="/gis-logo-new.png" alt="Ghana Immigration Service" width={40} height={40} className="drop-shadow-md" />
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
                { label: "Visa Requirements", href: "/visa-requirements", active: true },
                { label: "Track Application", href: "/#track-application" },
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
              {["Home|/", "Visa Types|/#visa-types", "Visa Requirements|/visa-requirements", "Track Application|/#track-application", "Help|/help"].map((item) => {
                const [label, href] = item.split("|");
                return <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">{label}</Link>;
              })}
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-[#006B3F] text-white text-sm font-semibold px-4 py-3 rounded-lg mt-3">Apply Now</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Banner */}
      <section className="pt-28 pb-8 bg-gradient-to-b from-[#C8962E]/5 to-white">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-2 bg-[#C8962E]/8 border border-[#C8962E]/15 rounded-full px-4 py-1.5 mb-5">
            <FileText size={14} className="text-[#C8962E]" />
            <span className="text-[#C8962E] text-xs font-semibold uppercase tracking-wider">Visa Requirements</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Visa <span className="text-[#006B3F]">Requirements</span>
          </h1>
          <p className="text-gray-500 leading-relaxed max-w-lg mx-auto">
            Check eligibility by nationality and review the documents required for a Ghana e-Visa application.
          </p>
        </div>
      </section>

      {/* ── Country Search / Eligibility Checker ── */}
      <section className="py-8">
        <div className="max-w-xl mx-auto px-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Check Eligibility</h2>
            <p className="text-sm text-gray-500 mb-5">Select a nationality to determine visa requirements for Ghana.</p>

            {/* Searchable Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality</label>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-left focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all text-sm"
              >
                <span className={selectedCountry ? "text-gray-900" : "text-gray-400"}>
                  {countryName || "Select nationality..."}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-30 overflow-hidden">
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search country or nationality..."
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F]"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filtered.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">No countries found</p>
                    ) : (
                      filtered.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => { setSelectedCountry(c.code); setDropdownOpen(false); setSearchQuery(""); }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#006B3F]/5 transition-colors flex items-center justify-between ${selectedCountry === c.code ? "bg-[#006B3F]/5 text-[#006B3F] font-semibold" : "text-gray-700"
                            }`}
                        >
                          <span>{c.name}</span>
                          {selectedCountry === c.code && <CheckCircle2 size={14} className="text-[#006B3F]" />}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Eligibility Result */}
            {eligibility && (
              <div className="mt-6">
                {eligibility === "no_visa" && (
                  <div className="p-5 rounded-xl bg-green-50 border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-green-700 mb-1">No Visa Required</h3>
                        <p className="text-sm text-green-600">
                          As an ECOWAS national, citizens of <strong>{countryName}</strong> can enter Ghana without a visa for up to 90 days. A valid passport and yellow fever vaccination certificate are still required at the port of entry.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {eligibility === "visa_on_arrival" && (
                  <div className="p-5 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Globe size={20} className="text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-blue-700 mb-1">Visa on Arrival Available</h3>
                        <p className="text-sm text-blue-600 mb-2">
                          Citizens of <strong>{countryName}</strong> are eligible for visa on arrival at Kotoka International Airport. However, applying for an eVisa in advance is recommended for a smoother experience.
                        </p>
                        <Link href="/register" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800">
                          Apply for eVisa <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                {eligibility === "visa_required" && (
                  <div className="p-5 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-amber-700 mb-1">Visa Required</h3>
                        <p className="text-sm text-amber-600 mb-2">
                          Citizens of <strong>{countryName}</strong> must obtain a visa before traveling to Ghana. An eVisa can be applied for online through this portal.
                        </p>
                        <Link href="/register" className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800">
                          Apply for eVisa <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── General Requirements ── */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">General Requirements</h2>
          <p className="text-gray-500 text-sm mb-8">Required for all visa types.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {generalRequirements.map((req, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-[#006B3F]/8 text-[#006B3F] group-hover:scale-105 transition-transform">
                  {req.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{req.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{req.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tourist & Business Requirements ── */}
      <section className="py-12 bg-[#FAFBFC]">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Tourist */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#006B3F]/8 text-[#006B3F]">
                  <Plane size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Tourist Visa</h3>
                  <p className="text-xs text-gray-400">Additional requirements for tourism</p>
                </div>
              </div>
              <div className="space-y-3">
                {touristRequirements.map((req, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#006B3F]/8 text-[#006B3F] shrink-0">
                      {req.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{req.title}</h4>
                      <p className="text-xs text-gray-500">{req.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#C8962E]/8 text-[#C8962E]">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Business Visa</h3>
                  <p className="text-xs text-gray-400">Additional requirements for business</p>
                </div>
              </div>
              <div className="space-y-3">
                {businessRequirements.map((req, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#C8962E]/8 text-[#C8962E] shrink-0">
                      {req.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{req.title}</h4>
                      <p className="text-xs text-gray-500">{req.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <div className="bg-gradient-to-br from-[#006B3F] to-[#005A34] rounded-2xl p-10 shadow-xl">
            <h3 className="text-2xl font-extrabold text-white mb-3">Ready to Apply?</h3>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Once all required documents are ready, start a Ghana e-Visa application online.
            </p>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2.5 bg-white hover:bg-white/90 text-[#006B3F] font-bold px-8 py-4 rounded-xl transition-all shadow-lg text-sm sm:text-base"
            >
              Begin Application
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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

            {/* Visa Information */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-gray-300 uppercase tracking-wider">Visa Information</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Visa Types", href: "/#visa-types" },
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
