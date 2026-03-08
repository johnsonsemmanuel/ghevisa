"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Menu,
  X,
  Shield,
  Lock,
  FileText,
  Database,
  UserCheck,
  Globe,
  AlertTriangle,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";

export default function PrivacyPolicyPage() {
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
      <section className="pt-28 pb-8 bg-gradient-to-b from-[#006B3F]/5 to-white">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-2 bg-[#006B3F]/5 border border-[#006B3F]/10 rounded-full px-4 py-1.5 mb-5">
            <Shield size={14} className="text-[#006B3F]" />
            <span className="text-[#006B3F] text-xs font-semibold uppercase tracking-wider">Privacy Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Privacy <span className="text-[#006B3F]">Policy</span>
          </h1>
          <p className="text-gray-500 leading-relaxed max-w-2xl mx-auto">
            How the Ghana Immigration Service collects, uses, and protects personal information in accordance with Ghana's Data Protection Act, 2012 (Act 843).
          </p>
          <p className="text-sm text-gray-400 mt-4">Last updated: March 2026</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-5">
          <div className="prose prose-gray max-w-none">
            {/* Introduction */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-[#006B3F]/10 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-[#006B3F]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">1. Introduction</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    The Ghana Immigration Service ("GIS") and the Ministry of Foreign Affairs ("MFA") are committed to protecting privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard information when using the GH-eVISA electronic visa application system.
                  </p>
                </div>
              </div>
            </div>

            {/* Information We Collect */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Database size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">2. Information We Collect</h2>

                  <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">2.1 Personal Information</h3>
                  <p className="text-gray-600 text-sm mb-3">We collect the following personal information when applying for an eVisa:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Full name (as it appears on passport)</li>
                    <li>• Date and place of birth</li>
                    <li>• Nationality and passport details</li>
                    <li>• Contact information (email, phone number, address)</li>
                    <li>• Travel itinerary and purpose of visit</li>
                    <li>• Passport photograph</li>
                    <li>• Supporting documents (invitation letters, hotel bookings, etc.)</li>
                  </ul>

                  <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">2.2 Payment Information</h3>
                  <p className="text-gray-600 text-sm">
                    Payment card details are processed through secure third-party payment gateways. GIS does not store complete payment card information.
                  </p>

                  <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">2.3 Technical Information</h3>
                  <p className="text-gray-600 text-sm mb-3">We automatically collect:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• IP address and browser type</li>
                    <li>• Device information and operating system</li>
                    <li>• Pages visited and time spent on the portal</li>
                    <li>• Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use Information */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                  <UserCheck size={20} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">3. How We Use Your Information</h2>
                  <p className="text-gray-600 text-sm mb-3">Information collected is used to:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Process and evaluate visa applications</li>
                    <li>• Verify identity and conduct security checks</li>
                    <li>• Communicate application status and decisions</li>
                    <li>• Improve portal functionality and user experience</li>
                    <li>• Comply with legal and regulatory requirements</li>
                    <li>• Prevent fraud and maintain system security</li>
                    <li>• Generate statistical reports (anonymized data)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                  <Globe size={20} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">4. Information Sharing and Disclosure</h2>
                  <p className="text-gray-600 text-sm mb-3">Information may be shared with:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Ghana Immigration Service and Ministry of Foreign Affairs</li>
                    <li>• Other government agencies for security and verification purposes</li>
                    <li>• Law enforcement agencies when legally required</li>
                    <li>• Authorized third-party service providers (payment processors, IT support)</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-3">
                    <strong>Note:</strong> Personal information is never sold to third parties for marketing purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <Lock size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">5. Data Security</h2>
                  <p className="text-gray-600 text-sm mb-3">We implement industry-standard security measures:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• 256-bit SSL encryption for data transmission</li>
                    <li>• Secure servers with restricted access</li>
                    <li>• Regular security audits and vulnerability assessments</li>
                    <li>• Employee training on data protection protocols</li>
                    <li>• Multi-factor authentication for system access</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Data Retention */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">6. Data Retention</h2>
                  <p className="text-gray-600 text-sm">
                    Personal information is retained for the duration required by law and for legitimate business purposes. Visa application records are typically retained for 7 years from the date of application or as required by Ghana's immigration laws.
                  </p>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">7. Your Rights</h2>
                  <p className="text-gray-600 text-sm mb-3">Under Ghana's Data Protection Act, 2012 (Act 843), individuals have the right to:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Access personal data held by GIS</li>
                    <li>• Request correction of inaccurate information</li>
                    <li>• Object to processing in certain circumstances</li>
                    <li>• Request deletion of data (subject to legal obligations)</li>
                    <li>• Lodge a complaint with the Data Protection Commission</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-3">
                    To exercise these rights, contact: <a href="mailto:evisa@gis.gov.gh" className="text-[#006B3F] hover:text-[#005A34] underline">evisa@gis.gov.gh</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Cookies */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                  <Globe size={20} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">8. Cookies and Tracking Technologies</h2>
                  <p className="text-gray-600 text-sm mb-3">
                    The portal uses cookies to enhance user experience and analyze usage patterns. Cookie preferences can be managed through browser settings or the cookie consent banner.
                  </p>
                </div>
              </div>
            </div>

            {/* Changes to Policy */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} className="text-teal-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">9. Changes to This Privacy Policy</h2>
                  <p className="text-gray-600 text-sm">
                    This Privacy Policy may be updated periodically. Changes will be posted on this page with an updated "Last updated" date. Continued use of the portal after changes constitutes acceptance of the revised policy.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-[#006B3F]/5 rounded-xl border border-[#006B3F]/10 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">10. Contact Information</h2>
              <p className="text-gray-600 text-sm mb-3">For questions or concerns about this Privacy Policy, contact:</p>
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
