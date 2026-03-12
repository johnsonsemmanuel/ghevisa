"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Search, 
  QrCode, 
  User, 
  Plane, 
  Calendar,
  Clock,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface VerificationResult {
  valid: boolean;
  message: string;
  reference_number?: string;
  visa_type?: string;
  holder_name?: string;
  nationality?: string;
  valid_from?: string;
  valid_until?: string;
  duration_days?: number;
  purpose?: string;
  status?: string;
}

export default function VerifyEVisaPage() {
  const [code, setCode] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter a QR code or reference number");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify/evisa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code.trim(),
          ...(passportNumber && { passport_number: passportNumber.trim() }),
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch {
      setError("Failed to verify eVisa. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl">🇬🇭</span>
            <div>
              <h1 className="text-lg font-bold text-gray-900">GH-eVISA</h1>
              <p className="text-xs text-gray-500">Verification Portal</p>
            </div>
          </Link>
          <Link href="/">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">eVisa Verification</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Verify the authenticity of a Ghana eVisa by entering the QR code or reference number.
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <QrCode size={16} className="inline mr-2" />
                QR Code or Reference Number *
              </label>
              <Input
                placeholder="e.g., GHEVISA:GH-2026-000001:ABC12345 or GH-2026-000001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Scan the QR code on the eVisa document or enter the reference number manually
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="inline mr-2" />
                Passport Number (Optional)
              </label>
              <Input
                placeholder="Enter passport number for additional verification"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Providing the passport number adds an extra layer of verification
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg" leftIcon={<Search size={18} />}>
              Verify eVisa
            </Button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-2xl shadow-lg border p-8 ${
            result.valid 
              ? "bg-green-50 border-green-200" 
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center gap-4 mb-6">
              {result.valid ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle size={32} className="text-red-600" />
                </div>
              )}
              <div>
                <h2 className={`text-xl font-bold ${result.valid ? "text-green-800" : "text-red-800"}`}>
                  {result.valid ? "eVisa Verified" : "Verification Failed"}
                </h2>
                <p className={`text-sm ${result.valid ? "text-green-600" : "text-red-600"}`}>
                  {result.message}
                </p>
              </div>
            </div>

            {result.valid && (
              <div className="bg-white rounded-xl p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <InfoItem icon={<User size={16} />} label="Holder Name" value={result.holder_name} />
                  <InfoItem icon={<Plane size={16} />} label="Visa Type" value={result.visa_type} />
                  <InfoItem label="Reference Number" value={result.reference_number} />
                  <InfoItem label="Nationality" value={result.nationality} />
                  <InfoItem icon={<Calendar size={16} />} label="Valid From" value={result.valid_from} />
                  <InfoItem icon={<Calendar size={16} />} label="Valid Until" value={result.valid_until} highlight />
                  <InfoItem icon={<Clock size={16} />} label="Duration" value={result.duration_days ? `${result.duration_days} days` : undefined} />
                  <InfoItem label="Purpose" value={result.purpose} />
                </div>
              </div>
            )}

            {!result.valid && result.reference_number && (
              <div className="bg-white rounded-xl p-4 mt-4">
                <p className="text-sm text-gray-600">
                  <strong>Reference:</strong> {result.reference_number}
                </p>
                {result.status && (
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> {result.status}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
              <QrCode size={20} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">QR Code Scan</h3>
            <p className="text-sm text-gray-600">
              Each eVisa contains a unique QR code that can be scanned for instant verification.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
              <Shield size={20} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure Verification</h3>
            <p className="text-sm text-gray-600">
              Our verification system uses cryptographic checksums to prevent forgery.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
              <AlertTriangle size={20} className="text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Report Fraud</h3>
            <p className="text-sm text-gray-600">
              If you suspect a fraudulent eVisa, please contact Ghana Immigration Service immediately.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Ghana Immigration Service. All rights reserved.</p>
          <p className="mt-1">
            <Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
            {" · "}
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
            {" · "}
            <Link href="/contact" className="hover:text-primary">Contact</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

function InfoItem({ icon, label, value, highlight }: { icon?: React.ReactNode; label: string; value?: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
        {icon}
        {label}
      </p>
      <p className={`font-medium ${highlight ? "text-green-600" : "text-gray-900"}`}>
        {value || "—"}
      </p>
    </div>
  );
}
