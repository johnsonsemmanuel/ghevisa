"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  FileText,
  Shield,
  Globe,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  ExternalLink,
} from "lucide-react";

const faqs = [
  {
    category: "General",
    items: [
      { q: "Who needs a visa to enter Ghana?", a: "Citizens of most countries require a visa to enter Ghana. ECOWAS nationals are exempt and can enter visa-free for up to 90 days. Check the Visa Requirements page for specific country eligibility." },
      { q: "How long does the e-Visa process take?", a: "Standard processing takes 3–5 business days. Express processing is available for urgent travel within 24–48 hours." },
      { q: "What documents are needed?", a: "A valid passport (6+ months validity), passport photo, travel itinerary, proof of accommodation, and yellow fever vaccination certificate. Additional documents may be required depending on visa type." },
      { q: "Can a visa be extended while in Ghana?", a: "Yes. Visit the nearest Ghana Immigration Service office before the visa expires to apply for an extension." },
    ],
  },
  {
    category: "Application Process",
    items: [
      { q: "How is an e-Visa application submitted?", a: "Create an account on the portal, fill in the application form, upload required documents, make a secure online payment, and submit. A confirmation email with the application reference number will be sent." },
      { q: "What payment methods are accepted?", a: "The portal accepts Visa, MasterCard, and mobile money payments. All transactions are processed through a secure, encrypted payment gateway." },
      { q: "What happens after submission?", a: "The application is reviewed by the Ghana Immigration Service. Track the status using the Application Reference Number on the Track Application page." },
      { q: "Can an application be edited after submission?", a: "No. Once submitted, the application cannot be edited. If changes are needed, contact the Ghana Immigration Service directly." },
    ],
  },
  {
    category: "Tracking & Status",
    items: [
      { q: "How is an application tracked?", a: "Visit the Track Application page, enter the Application Reference Number and passport number. The current status and timeline will be displayed." },
      { q: "What do the different statuses mean?", a: "Draft: not yet submitted. Submitted: received and pending review. Under Review: being processed by an officer. Approved: e-Visa is ready for download. Denied: application was not approved." },
      { q: "Where is the Application Reference Number found?", a: "The Application Reference Number is sent via email after submission. It follows the format GH-YYYY-XXXXX." },
    ],
  },
  {
    category: "Security & Privacy",
    items: [
      { q: "Is personal data secure on this portal?", a: "Absolutely. All data is encrypted with bank-level 256-bit SSL security. The portal complies with international data protection standards." },
      { q: "Is this the official Ghana e-Visa portal?", a: "Yes. This is the official electronic visa portal of the Ghana Immigration Service under the Ministry of the Interior, Republic of Ghana." },
    ],
  },
];

export default function HelpPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("General");

  const currentFaqs = faqs.find((f) => f.category === activeCategory)?.items || [];

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
                { label: "Visa Requirements", href: "/visa-requirements" },
                { label: "Track Application", href: "/#track-application" },
                { label: "Help", href: "/help", active: true },
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
      <section className="pt-28 pb-8 bg-gradient-to-b from-[#006B3F]/5 to-white">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-2 bg-[#006B3F]/5 border border-[#006B3F]/10 rounded-full px-4 py-1.5 mb-5">
            <HelpCircle size={14} className="text-[#006B3F]" />
            <span className="text-[#006B3F] text-xs font-semibold uppercase tracking-wider">Help Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Help & <span className="text-[#006B3F]">Support</span>
          </h1>
          <p className="text-gray-500 leading-relaxed max-w-lg mx-auto">
            Find answers to common questions about the Ghana e-Visa application process, tracking, and requirements.
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <FileText size={20} />, title: "Apply for e-Visa", desc: "Start a new application", href: "/register", color: "#006B3F" },
              { icon: <Globe size={20} />, title: "Track Application", desc: "Check application status", href: "/track", color: "#C8962E" },
              { icon: <Shield size={20} />, title: "Visa Requirements", desc: "View required documents", href: "/visa-requirements", color: "#2E6B96" },
              { icon: <MessageCircle size={20} />, title: "Contact Support", desc: "Get in touch", href: "#contact", color: "#CE1126" },
            ].map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${action.color}10`, color: action.color }}
                >
                  {action.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-0.5">{action.title}</h3>
                <p className="text-xs text-gray-400">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-[#FAFBFC]">
        <div className="max-w-4xl mx-auto px-5">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Frequently Asked Questions</h2>
          <p className="text-gray-500 text-sm mb-8">Browse by category to find the answer needed.</p>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {faqs.map((cat) => (
              <button
                key={cat.category}
                onClick={() => { setActiveCategory(cat.category); setOpenFaq(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeCategory === cat.category
                  ? "bg-[#006B3F] text-white shadow-lg shadow-[#006B3F]/20"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {currentFaqs.map((item, i) => {
              const key = `${activeCategory}-${i}`;
              return (
                <div key={key} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <button
                    onClick={() => setOpenFaq(openFaq === key ? null : key)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
                  >
                    <span className="font-semibold text-gray-900 text-sm pr-4">{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === key ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFaq === key && (
                    <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed animate-fade-in">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* Contact Section */}
      <section id="contact" className="py-12">
        <div className="max-w-4xl mx-auto px-5">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Contact the Ghana Immigration Service</h2>
          <p className="text-gray-500 text-sm mb-8">For further assistance, reach out through any of the channels below.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#006B3F]/8 text-[#006B3F] mb-4">
                <Phone size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">Phone</h3>
              <p className="text-sm text-gray-500">+233 (0) 302 258 250</p>
              <p className="text-xs text-gray-400 mt-1">Monday – Friday, 8:00 AM – 5:00 PM GMT</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#C8962E]/8 text-[#C8962E] mb-4">
                <Mail size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">Email</h3>
              <p className="text-sm text-gray-500">evisa@gis.gov.gh</p>
              <p className="text-xs text-gray-400 mt-1">Response within 1–2 business days</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#CE1126]/8 text-[#CE1126] mb-4">
                <MapPin size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">Office</h3>
              <p className="text-sm text-gray-500">Ghana Immigration Service</p>
              <p className="text-xs text-gray-400 mt-1">Independence Ave, Accra, Ghana</p>
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
              Start an e-Visa application today. The process is digital, secure, and takes just minutes.
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
