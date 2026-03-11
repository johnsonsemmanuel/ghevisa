"use client";

import React, { useState, useMemo } from "react";
import { X, Compass, ArrowRight, ArrowLeft, CheckCircle, Info, Globe, Briefcase, GraduationCap, Stethoscope, Plane, Users, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isEcowas, isAU, CARIBBEAN_CODES } from "@/lib/visa-matrix";
import { countries } from "@/lib/countries";
import type { VisaType } from "@/lib/types";

interface VisaAssistantProps {
  open: boolean;
  onClose: () => void;
  onSelectVisa: (visaTypeId: string) => void;
  visaTypes: VisaType[];
}

interface AssistantAnswers {
  nationality: string;
  purpose: string;
  duration: string;
  hasInvitation: string;
  isEmergency: string;
}

const PURPOSE_OPTIONS = [
  { value: "tourism", label: "Tourism & Sightseeing", icon: <Globe size={18} />, desc: "Visiting for leisure, culture, or family" },
  { value: "business", label: "Business & Trade", icon: <Briefcase size={18} />, desc: "Meetings, negotiations, investment" },
];

const DURATION_OPTIONS = [
  { value: "under_7", label: "Less than 1 week" },
  { value: "7_30", label: "1 week to 1 month" },
  { value: "30_90", label: "1 to 3 months" },
  { value: "90_180", label: "3 to 6 months" },
  { value: "180_365", label: "6 months to 1 year" },
  { value: "over_365", label: "More than 1 year" },
];

function getRecommendations(answers: AssistantAnswers, visaTypes: VisaType[]): { slug: string; reason: string; confidence: number }[] {
  const nat = answers.nationality;
  const results: { slug: string; reason: string; confidence: number }[] = [];

  // Emergency overrides everything
  if (answers.isEmergency === "yes") {
    results.push({ slug: "emergency", reason: "Emergency/humanitarian travel requires expedited processing.", confidence: 95 });
  }

  // ECOWAS citizens → ETA
  if (isEcowas(nat)) {
    results.push({ slug: "ecowas-eta", reason: "As an ECOWAS citizen, you qualify for visa-free entry with an Electronic Travel Authorization (ETA). This is the fastest and most affordable option.", confidence: 98 });
  }

  // AU citizens → AU ETA
  if (isAU(nat) && !isEcowas(nat)) {
    results.push({ slug: "au-eta", reason: "As an African Union member state citizen, you qualify for an AU Electronic Travel Authorization.", confidence: 95 });
  }

  // Caribbean citizens → Caribbean ETA
  if (CARIBBEAN_CODES.includes(nat)) {
    results.push({ slug: "caribbean-eta", reason: "Caribbean nationals qualify for a streamlined Electronic Travel Authorization.", confidence: 95 });
  }

  // Purpose-based recommendations - only tourism and business
  const purposeMap: Record<string, { slug: string; reason: string; base: number }> = {
    tourism: { slug: "tourism", reason: "Tourism visa is ideal for sightseeing, family visits, and cultural exploration.", base: 90 },
    business: { slug: "business", reason: "Business visa covers meetings, trade, and investment activities with multiple-entry option.", base: 90 },
  };

  if (answers.purpose && purposeMap[answers.purpose]) {
    const rec = purposeMap[answers.purpose];
    // Don't duplicate if already recommended via ETA and purpose is tourism
    if (!results.some(r => r.slug === rec.slug)) {
      // Adjust confidence based on duration match (only for tourism and business)
      let conf = rec.base;
      const dur = answers.duration;
      // No special duration adjustments needed for tourism and business
      results.push({ slug: rec.slug, reason: rec.reason, confidence: Math.max(conf, 50) });
    }
  }

  // Sort by confidence descending
  results.sort((a, b) => b.confidence - a.confidence);

  // Only return visa types that actually exist in the system
  const existingSlugs = new Set(visaTypes.map(v => v.slug));
  return results.filter(r => existingSlugs.has(r.slug)).slice(0, 3);
}

export function VisaAssistant({ open, onClose, onSelectVisa, visaTypes }: VisaAssistantProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AssistantAnswers>({
    nationality: "",
    purpose: "",
    duration: "",
    hasInvitation: "",
    isEmergency: "",
  });

  const recommendations = useMemo(
    () => (step === 3 ? getRecommendations(answers, visaTypes) : []),
    [step, answers, visaTypes]
  );

  if (!open) return null;

  const setAnswer = (key: keyof AssistantAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const canNext = () => {
    if (step === 0) return !!answers.nationality;
    if (step === 1) return !!answers.purpose;
    if (step === 2) return !!answers.duration;
    return false;
  };

  const handleSelect = (slug: string) => {
    const vt = visaTypes.find((v) => v.slug === slug);
    if (vt) {
      onSelectVisa(vt.id.toString());
      onClose();
    }
  };

  const steps = ["Nationality", "Purpose", "Duration", "Recommendation"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Compass size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Visa Assistant</h2>
              <p className="text-xs text-text-secondary">Answer a few questions and we will recommend the best visa for you</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-lg transition-colors duration-150 ease-out">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-1.5 ${i <= step ? "text-accent" : "text-text-muted"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                    ${i < step ? "bg-accent text-white" : i === step ? "bg-accent/10 text-accent border border-accent" : "bg-surface border border-border"}`}>
                    {i < step ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:inline">{s}</span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-accent" : "bg-border"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Step 0: Nationality */}
          {step === 0 && (
            <div>
              <h3 className="font-semibold text-text-primary mb-2">What is your nationality?</h3>
              <p className="text-sm text-text-secondary mb-4">This determines which visa types you are eligible for.</p>
              <select
                value={answers.nationality}
                onChange={(e) => setAnswer("nationality", e.target.value)}
                className="input"
              >
                <option value="">-- Select your nationality --</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.nationality}</option>
                ))}
              </select>
              {answers.nationality && isEcowas(answers.nationality) && (
                <div className="mt-4 p-3 rounded-xl bg-accent/5 border border-accent/20 flex items-start gap-2">
                  <Info size={16} className="text-accent shrink-0 mt-0.5" />
                  <p className="text-sm text-accent">
                    As an ECOWAS citizen, you may qualify for visa-free entry with a simple Electronic Travel Authorization (ETA).
                  </p>
                </div>
              )}
              {answers.nationality && isAU(answers.nationality) && !isEcowas(answers.nationality) && (
                <div className="mt-4 p-3 rounded-xl bg-info/5 border border-info/20 flex items-start gap-2">
                  <Info size={16} className="text-info shrink-0 mt-0.5" />
                  <p className="text-sm text-info">
                    As an African Union member state citizen, you may qualify for an AU Electronic Travel Authorization.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Purpose */}
          {step === 1 && (
            <div>
              <h3 className="font-semibold text-text-primary mb-2">What is the primary purpose of your travel?</h3>
              <p className="text-sm text-text-secondary mb-4">Select the option that best describes your reason for visiting Ghana.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {PURPOSE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswer("purpose", opt.value)}
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-150 ease-out cursor-pointer
                      ${answers.purpose === opt.value ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-text-secondary">{opt.icon}</span>
                      <span className="font-medium text-sm text-text-primary">{opt.label}</span>
                    </div>
                    <p className="text-xs text-text-muted">{opt.desc}</p>
                  </button>
                ))}
              </div>
              {/* Emergency quick check */}
              <div className="mt-4 pt-4 border-t border-border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={answers.isEmergency === "yes"}
                    onChange={(e) => setAnswer("isEmergency", e.target.checked ? "yes" : "no")}
                    className="w-4 h-4 rounded border-border text-danger focus:ring-danger/20 cursor-pointer"
                  />
                  <span className="text-sm text-text-secondary">This is an <strong className="text-danger">emergency or humanitarian</strong> situation</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Duration */}
          {step === 2 && (
            <div>
              <h3 className="font-semibold text-text-primary mb-2">How long do you plan to stay in Ghana?</h3>
              <p className="text-sm text-text-secondary mb-4">This helps us determine the right visa type and validity period.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswer("duration", opt.value)}
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-150 ease-out cursor-pointer
                      ${answers.duration === opt.value ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}
                  >
                    <span className="font-medium text-sm text-text-primary">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Recommendations */}
          {step === 3 && (
            <div>
              <h3 className="font-semibold text-text-primary mb-2">Recommended Visa Types</h3>
              <p className="text-sm text-text-secondary mb-4">Based on your answers, here are our top recommendations:</p>
              {recommendations.length === 0 && (
                <p className="text-sm text-text-muted py-8 text-center">
                  No matching visa types found. Please try different options or browse all visa types.
                </p>
              )}
              <div className="space-y-4">
                {recommendations.map((rec, i) => {
                  const vt = visaTypes.find((v) => v.slug === rec.slug);
                  if (!vt) return null;
                  return (
                    <div key={rec.slug} className={`p-5 rounded-xl border-2 transition-all duration-150 ease-out
                      ${i === 0 ? "border-accent bg-accent/5" : "border-border"}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-text-primary">{vt.name}</h4>
                            {i === 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                                Best Match
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary mt-1">{rec.reason}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="text-xs text-text-muted">Match</div>
                          <div className="text-lg font-bold text-accent">{rec.confidence}%</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-4 text-xs text-text-muted">
                          <span>Max {vt.max_duration_days} days</span>
                          <span>{vt.entry_type === "multiple" ? "Multiple Entry" : "Single Entry"}</span>
                          <span>From ${vt.base_fee}</span>
                        </div>
                        <Button size="sm" onClick={() => handleSelect(rec.slug)}>
                          Select <ArrowRight size={14} className="ml-1" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border rounded-b-2xl px-6 py-4 flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors duration-150 ease-out"
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150 ease-out"
            >
              Browse All Visas Instead
            </button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
              Next <ArrowRight size={14} className="ml-1" />
            </Button>
          ) : (
            <button
              onClick={onClose}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150 ease-out"
            >
              Browse All Visas Instead
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
