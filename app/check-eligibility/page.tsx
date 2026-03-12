"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/forms/input";
import { countries } from "@/lib/countries";
import { Globe, CheckCircle, XCircle, AlertTriangle, ArrowRight, Home } from "lucide-react";
import api from "@/lib/api";

export default function CheckEligibilityPage() {
  const router = useRouter();
  const [nationality, setNationality] = useState("");
  const [result, setResult] = useState<"visa_required" | "eta" | "no_visa" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = async () => {
    if (!nationality) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data } = await api.get("/eligibility/country/" + nationality);
      const authType = (data.authorization_type as string | undefined)?.toLowerCase();

      if (authType === "evisa") {
        setResult("visa_required");
      } else if (authType === "eta") {
        // Visa-free with mandatory ETA registration
        setResult("eta");
      } else {
        // Fallback: treat as visa-free without extra steps
        setResult("no_visa");
      }
    } catch {
      setError("We could not determine your eligibility at this time. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setNationality("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Globe size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">Ghana eVisa</h1>
                <p className="text-xs text-text-muted">Eligibility Checker</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" leftIcon={<Home size={14} />} onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Globe size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Check Visa Eligibility</h1>
            <p className="text-text-secondary">
              Find out if you need a visa, qualify for visa on arrival, or can enter Ghana visa-free
            </p>
          </div>

          {/* Checker Card */}
          <div className="bg-white rounded-2xl border border-border shadow-lg p-8">
            {!result ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Select Your Nationality
                  </label>
                  <Select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full"
                  >
                    <option value="">-- Select Your Country --</option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <Button
                  onClick={checkEligibility}
                  disabled={!nationality || loading}
                  className="w-full"
                  size="lg"
                  leftIcon={<CheckCircle size={18} />}
                >
                  {loading ? "Checking..." : "Check Eligibility"}
                </Button>
                {error && (
                  <p className="text-sm text-danger mt-1">
                    {error}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Result Display */}
                {result === "no_visa" && (
                  <div className="p-6 rounded-xl bg-success/5 border-2 border-success">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={24} className="text-success" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-success mb-2">No Visa Required!</h3>
                        <p className="text-text-secondary mb-4">
                          As an ECOWAS citizen, you can enter Ghana without a visa. You are allowed to stay for up to 90 days.
                        </p>
                        <div className="p-4 rounded-lg bg-white border border-success/20">
                          <p className="text-sm font-semibold text-text-primary mb-2">What you need:</p>
                          <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                            <li>Valid passport (at least 6 months validity)</li>
                            <li>Proof of accommodation in Ghana</li>
                            <li>Return or onward ticket</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {result === "eta" && (
                  <div className="p-6 rounded-xl bg-info/5 border-2 border-info">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={24} className="text-info" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-info mb-2">Visa-Free with ETA Registration</h3>
                        <p className="text-text-secondary mb-4">
                          You do not need a full visa, but you must complete a short Electronic Travel Authorization (ETA) form before you travel.
                        </p>
                        <div className="p-4 rounded-lg bg-white border border-info/20 mb-4">
                          <p className="text-sm font-semibold text-text-primary mb-2">ETA Requirements:</p>
                          <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                            <li>Valid passport (at least 6 months validity)</li>
                            <li>Basic travel details and contact information</li>
                            <li>Online ETA fee payment</li>
                          </ul>
                        </div>
                        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                          <p className="text-sm font-semibold text-accent mb-1">💡 Next step: Apply for ETA</p>
                          <p className="text-xs text-text-secondary">
                            Complete your ETA online now so your authorization is ready before you arrive in Ghana.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {result === "visa_required" && (
                  <div className="p-6 rounded-xl bg-warning/5 border-2 border-warning">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                        <XCircle size={24} className="text-warning" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-warning mb-2">Visa Required</h3>
                        <p className="text-text-secondary mb-4">
                          You need to obtain a visa before traveling to Ghana. The good news is you can apply online for an eVisa!
                        </p>
                        <div className="p-4 rounded-lg bg-white border border-warning/20">
                          <p className="text-sm font-semibold text-text-primary mb-2">eVisa Application Process:</p>
                          <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                            <li>Complete online application form</li>
                            <li>Upload required documents</li>
                            <li>Pay visa fee online</li>
                            <li>Receive eVisa via email (24-48 hours)</li>
                            <li>Print and present at airport</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={reset} className="flex-1">
                    Check Another Country
                  </Button>
                  {result === "visa_required" && (
                    <Button
                      onClick={() => router.push("/login")}
                      className="flex-1"
                      leftIcon={<ArrowRight size={16} />}
                    >
                      Apply for eVisa
                    </Button>
                  )}
                  {result === "eta" && (
                    <Button
                      onClick={() => router.push("/login?next=/eta/apply")}
                      className="flex-1"
                      leftIcon={<ArrowRight size={16} />}
                    >
                      Apply for ETA
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 p-6 rounded-xl bg-surface border border-border">
            <h3 className="text-sm font-bold text-text-primary mb-3">Important Information</h3>
            <ul className="text-sm text-text-secondary space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>All visitors must have a passport valid for at least 6 months from the date of entry</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>Visa requirements may change. Please verify current requirements before travel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>eVisa processing typically takes 24-48 hours for express applications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>For urgent travel, premium processing options are available</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
