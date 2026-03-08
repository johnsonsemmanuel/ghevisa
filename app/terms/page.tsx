"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Menu,
  X,
  FileText,
  Scale,
  UserX,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";

export default function TermsOfServicePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                { label: "Help", href: "/help" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium px-3.5 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
        <div className="max-w-4xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-2 bg-[#C8962E]/8 border border-[#C8962E]/15 rounded-full px-4 py-1.5 mb-5">
            <Scale size={14} className="text-[#C8962E]" />
            <span className="text-[#C8962E] text-xs font-semibold uppercase tracking-wider">Terms of Service</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Terms of <span className="text-[#C8962E]">Service</span>
          </h1>
          <p className="text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Legal terms and conditions governing the use of the Ghana Immigration Service electronic visa application portal.
          </p>
          <p className="text-sm text-gray-400 mt-4">Last updated: March 2026</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-5">
          <div className="prose prose-gray max-w-none">
            {/* Acceptance of Terms */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-[#006B3F]/10 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle size={20} className="text-[#006B3F]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">1. Acceptance of Terms</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    By accessing and using the Ghana Immigration Service (GIS) electronic visa portal ("Portal"), users agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Portal.
                  </p>
                </div>
              </div>
            </div>

            {/* Eligibility */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <UserX size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">2. Eligibility</h2>
                  <p className="text-gray-600 text-sm mb-3">To use this Portal, users must:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Be at least 18 years of age or have parental/guardian consent</li>
                    <li>• Possess a valid passport</li>
                    <li>• Provide accurate and truthful information</li>
                    <li>• Comply with all applicable laws and regulations</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* User Obligations */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">3. User Obligations</h2>
                  <p className="text-gray-600 text-sm mb-3">Users agree to:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Provide accurate, complete, and current information</li>
                    <li>• Maintain the confidentiality of account credentials</li>
                    <li>• Notify GIS immediately of any unauthorized use of the account</li>
                    <li>• Use the Portal only for lawful purposes</li>
                    <li>• Not attempt to gain unauthorized access to the Portal or its systems</li>
                    <li>• Not upload malicious software or engage in harmful activities</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Visa Application Process */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">4. Visa Application Process</h2>

                  <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">4.1 Application Submission</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Submission of a visa application does not guarantee approval. All applications are subject to review and verification by the Ghana Immigration Service.
                  </p>

                  <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">4.2 Processing Time</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Standard processing takes 3-5 business days. Processing times may vary based on application volume and complexity. Express processing is available for urgent cases.
                  </p>

                  <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">4.3 Application Fees</h3>
                  <p className="text-gray-600 text-sm">
                    All fees are non-refundable, regardless of application outcome. Fee structure is subject to change without prior notice.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">5. Payment Terms</h2>
                  <p className="text-gray-600 text-sm mb-3">
                    Payment must be made through the Portal's secure payment gateway. Accepted payment methods include major credit/debit cards and mobile money.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• All fees are in US Dollars (USD)</li>
                    <li>• Payments are processed in real-time</li>
                    <li>• Receipt confirmation is sent via email</li>
                    <li>• Refunds are not provided for rejected applications</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Intellectual Property */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                  <Scale size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">6. Intellectual Property</h2>
                  <p className="text-gray-600 text-sm">
                    All content on the Portal, including text, graphics, logos, and software, is the property of the Ghana Immigration Service and protected by copyright and intellectual property laws. Unauthorized use, reproduction, or distribution is prohibited.
                  </p>
                </div>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle size={20} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">7. Limitation of Liability</h2>
                  <p className="text-gray-600 text-sm mb-3">
                    The Ghana Immigration Service shall not be liable for:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Technical issues, system downtime, or service interruptions</li>
                    <li>• Loss of data or information</li>
                    <li>• Delays in visa processing due to unforeseen circumstances</li>
                    <li>• Decisions made by immigration officers at ports of entry</li>
                    <li>• Third-party payment processing errors</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Prohibited Activities */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                  <XCircle size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">8. Prohibited Activities</h2>
                  <p className="text-gray-600 text-sm mb-3">Users are strictly prohibited from:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Submitting false or fraudulent information</li>
                    <li>• Using the Portal for illegal purposes</li>
                    <li>• Attempting to hack, disrupt, or compromise system security</li>
                    <li>• Creating multiple accounts with false identities</li>
                    <li>• Reselling visa services without authorization</li>
                    <li>• Impersonating another person or entity</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-3">
                    <strong>Violation may result in account suspension, legal action, and visa denial.</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy and Data Protection */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">9. Privacy and Data Protection</h2>
                  <p className="text-gray-600 text-sm">
                    Use of the Portal is subject to the <Link href="/privacy-policy" className="text-[#006B3F] hover:text-[#005A34] underline">Privacy Policy</Link>. Personal data is collected, processed, and stored in accordance with Ghana's Data Protection Act, 2012 (Act 843).
                  </p>
                </div>
              </div>
            </div>

            {/* Termination */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <XCircle size={20} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">10. Termination</h2>
                  <p className="text-gray-600 text-sm">
                    GIS reserves the right to suspend or terminate user access to the Portal at any time, without prior notice, for violation of these Terms of Service or for any other reason deemed necessary.
                  </p>
                </div>
              </div>
            </div>

            {/* Governing Law */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                  <Scale size={20} className="text-teal-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">11. Governing Law</h2>
                  <p className="text-gray-600 text-sm">
                    These Terms of Service are governed by the laws of the Republic of Ghana. Any disputes arising from the use of the Portal shall be subject to the exclusive jurisdiction of Ghanaian courts.
                  </p>
                </div>
              </div>
            </div>

            {/* Changes to Terms */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle size={20} className="text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">12. Changes to Terms</h2>
                  <p className="text-gray-600 text-sm">
                    GIS reserves the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated "Last updated" date. Continued use of the Portal after changes constitutes acceptance of the revised terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-[#C8962E]/5 rounded-xl border border-[#C8962E]/10 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">13. Contact Information</h2>
              <p className="text-gray-600 text-sm mb-3">For questions about these Terms of Service, contact:</p>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Ghana Immigration Service</strong></p>
                <p>Independence Avenue, Accra, Ghana</p>
                <p>Email: <a href="mailto:evisa@gis.gov.gh" className="text-[#006B3F] hover:text-[#005A34] underline">evisa@gis.gov.gh</a></p>
                <p>Phone: +233 (0) 302 258 250</p>
              </div>
            </div>
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
