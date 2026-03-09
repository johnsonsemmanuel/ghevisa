"use client";

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { FileUpload } from "@/components/ui/file-upload";
import { ProcessingSpeedModal } from "@/components/ui/processing-speed-modal";
import { PaymentModal } from "@/components/ui/payment-modal";
import { VisaAssistant } from "@/components/ui/visa-assistant";
import { EntryTypeModal } from "@/components/ui/entry-type-modal";
import {
  ArrowLeft, ArrowRight, Check, CreditCard, Compass, AlertTriangle,
  Info, Clock, TrendingUp, Crown, CheckCircle, ShieldCheck, Save, Globe, Monitor, X,
} from "lucide-react";
import toast from "react-hot-toast";
import type { VisaType, Application, ServiceTier } from "@/lib/types";
import { countries } from "@/lib/countries";
import {
  getVisaConfig, getMaxDuration, getDurationWarning,
  PORTS_OF_ENTRY, DESTINATION_CITIES, VISA_DURATION_OPTIONS, ACCOMMODATION_OPTIONS,
  type VisaFormField,
} from "@/lib/visa-matrix";

const STEPS = ["Purpose of Travel", "Applicant Details", "Travel Details", "Documents", "Health Declaration", "Security Declaration", "Review & Pay"];

const tierIcons: Record<string, React.ReactNode> = {
  standard: <Clock size={20} className="text-text-muted" />,
  fast_track: <TrendingUp size={20} className="text-warning" />,
  express: <Crown size={20} className="text-accent" />,
};

function DynField({ field, value, onChange, error }: { field: VisaFormField; value: string; onChange: (v: string) => void; error?: string }) {
  const isCty = ["nationality", "passport_issue_country", "final_destination"].includes(field.key);
  const isNationality = field.key === "nationality";
  if (field.type === "select") return (
    <div className={field.fullWidth ? "sm:col-span-2" : ""}>
      <Select label={field.label} value={value} onChange={(e) => onChange(e.target.value)} error={error} hint={field.hint} required={field.required}>
        <option value="">-- Select --</option>
        {isCty ? countries.map((c) => <option key={c.code} value={c.code}>{isNationality ? c.nationality : c.name}</option>)
          : field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </Select>
    </div>
  );
  if (field.type === "textarea") return (
    <div className={field.fullWidth ? "sm:col-span-2" : ""}>
      <Textarea label={field.label} value={value} onChange={(e) => onChange(e.target.value)} error={error}
        placeholder={field.placeholder} hint={field.hint} rows={3} required={field.required} />
    </div>
  );
  return (
    <div className={field.fullWidth ? "sm:col-span-2" : ""}>
      <Input label={field.label} type={field.type} value={value}
        onChange={(e) => onChange(field.key === "passport_number" ? e.target.value.toUpperCase() : e.target.value)}
        error={error} placeholder={field.placeholder} hint={field.hint} required={field.required}
        min={field.validation?.min} max={field.validation?.max} />
    </div>
  );
}

const DRAFT_STORAGE_KEY = "evisa_draft_form";
const DRAFT_STEP_KEY = "evisa_draft_step";
const DRAFT_APP_KEY = "evisa_draft_app_id";

function getSavedDraft(): { form: Record<string, string>; step: number; appId: string | null } | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const step = parseInt(localStorage.getItem(DRAFT_STEP_KEY) || "0") || 0;
    const appId = localStorage.getItem(DRAFT_APP_KEY) || null;
    return { form: parsed, step, appId };
  } catch { return null; }
}

function saveDraft(form: Record<string, string>, step: number, appId: string | null) {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
    localStorage.setItem(DRAFT_STEP_KEY, step.toString());
    if (appId) localStorage.setItem(DRAFT_APP_KEY, appId);
  } catch { /* quota exceeded */ }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    localStorage.removeItem(DRAFT_STEP_KEY);
    localStorage.removeItem(DRAFT_APP_KEY);
  } catch { /* ignore */ }
}

// ── Email & Phone Validation Helpers ────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function validateEmail(email: string): boolean {
  if (!EMAIL_REGEX.test(email)) return false;
  // Check for common typos
  const domain = email.split("@")[1]?.toLowerCase() || "";
  const suspiciousDomains = [
    "gmial.com", "gmali.com", "gmal.com", "gamil.com", "gmail.co", "gmail.com.com",
    "yaho.com", "yahooo.com", "yaho.co", "yahoo.co",
    "hotmal.com", "hotmil.com", "hotmail.co",
    "outlok.com", "olutlook.com", "outlook.co"
  ];
  if (suspiciousDomains.includes(domain)) return false;
  // Must have at least 2-char TLD
  const tld = domain.split(".").pop() || "";
  if (tld.length < 2) return false;
  return true;
}

interface CountryPhoneCode {
  code: string;
  country: string;
  digits: number[]; // Allowed digit counts (national number, without country code)
}

const COUNTRY_PHONE_CODES: CountryPhoneCode[] = [
  { code: "+233", country: "Ghana", digits: [9] },
  { code: "+234", country: "Nigeria", digits: [10] },
  { code: "+1", country: "USA/Canada", digits: [10] },
  { code: "+44", country: "UK", digits: [10] },
  { code: "+49", country: "Germany", digits: [10, 11] },
  { code: "+33", country: "France", digits: [9] },
  { code: "+39", country: "Italy", digits: [9, 10] },
  { code: "+34", country: "Spain", digits: [9] },
  { code: "+31", country: "Netherlands", digits: [9] },
  { code: "+32", country: "Belgium", digits: [8, 9] },
  { code: "+41", country: "Switzerland", digits: [9] },
  { code: "+46", country: "Sweden", digits: [7, 8, 9] },
  { code: "+47", country: "Norway", digits: [8] },
  { code: "+45", country: "Denmark", digits: [8] },
  { code: "+358", country: "Finland", digits: [9, 10] },
  { code: "+48", country: "Poland", digits: [9] },
  { code: "+43", country: "Austria", digits: [10, 11] },
  { code: "+351", country: "Portugal", digits: [9] },
  { code: "+30", country: "Greece", digits: [10] },
  { code: "+353", country: "Ireland", digits: [9] },
  { code: "+420", country: "Czech Rep.", digits: [9] },
  { code: "+36", country: "Hungary", digits: [9] },
  { code: "+40", country: "Romania", digits: [9] },
  { code: "+380", country: "Ukraine", digits: [9] },
  { code: "+7", country: "Russia", digits: [10] },
  { code: "+90", country: "Turkey", digits: [10] },
  { code: "+91", country: "India", digits: [10] },
  { code: "+86", country: "China", digits: [11] },
  { code: "+81", country: "Japan", digits: [10, 11] },
  { code: "+82", country: "South Korea", digits: [10, 11] },
  { code: "+61", country: "Australia", digits: [9] },
  { code: "+64", country: "New Zealand", digits: [8, 9, 10] },
  { code: "+55", country: "Brazil", digits: [10, 11] },
  { code: "+52", country: "Mexico", digits: [10] },
  { code: "+54", country: "Argentina", digits: [10] },
  { code: "+56", country: "Chile", digits: [9] },
  { code: "+57", country: "Colombia", digits: [10] },
  { code: "+27", country: "South Africa", digits: [9] },
  { code: "+254", country: "Kenya", digits: [9] },
  { code: "+255", country: "Tanzania", digits: [9] },
  { code: "+256", country: "Uganda", digits: [9] },
  { code: "+251", country: "Ethiopia", digits: [9] },
  { code: "+20", country: "Egypt", digits: [10] },
  { code: "+212", country: "Morocco", digits: [9] },
  { code: "+213", country: "Algeria", digits: [9] },
  { code: "+216", country: "Tunisia", digits: [8] },
  { code: "+237", country: "Cameroon", digits: [9] },
  { code: "+225", country: "Côte d'Ivoire", digits: [10] },
  { code: "+221", country: "Senegal", digits: [9] },
  { code: "+228", country: "Togo", digits: [8] },
  { code: "+229", country: "Benin", digits: [8] },
  { code: "+226", country: "Burkina Faso", digits: [8] },
  { code: "+223", country: "Mali", digits: [8] },
  { code: "+224", country: "Guinea", digits: [9] },
  { code: "+232", country: "Sierra Leone", digits: [8] },
  { code: "+231", country: "Liberia", digits: [7, 8] },
  { code: "+227", country: "Niger", digits: [8] },
  { code: "+235", country: "Chad", digits: [8] },
  { code: "+966", country: "Saudi Arabia", digits: [9] },
  { code: "+971", country: "UAE", digits: [9] },
  { code: "+974", country: "Qatar", digits: [8] },
  { code: "+965", country: "Kuwait", digits: [8] },
  { code: "+968", country: "Oman", digits: [8] },
  { code: "+973", country: "Bahrain", digits: [8] },
  { code: "+972", country: "Israel", digits: [9] },
  { code: "+962", country: "Jordan", digits: [9] },
  { code: "+961", country: "Lebanon", digits: [7, 8] },
  { code: "+60", country: "Malaysia", digits: [9, 10] },
  { code: "+65", country: "Singapore", digits: [8] },
  { code: "+63", country: "Philippines", digits: [10] },
  { code: "+66", country: "Thailand", digits: [9] },
  { code: "+84", country: "Vietnam", digits: [9, 10] },
  { code: "+62", country: "Indonesia", digits: [10, 11, 12] },
  { code: "+92", country: "Pakistan", digits: [10] },
  { code: "+880", country: "Bangladesh", digits: [10] },
  { code: "+94", country: "Sri Lanka", digits: [9] },
];

function validatePhone(code: string, number: string): string | null {
  const digits = number.replace(/\D/g, "");
  if (!digits) return "Phone number is required";
  const entry = COUNTRY_PHONE_CODES.find((c) => c.code === code);
  if (!entry) return null; // Unknown code, accept any
  const expectedLengths = entry.digits;
  const min = Math.min(...expectedLengths);
  const max = Math.max(...expectedLengths);
  if (digits.length < min || digits.length > max) {
    const expected = expectedLengths.length === 1 ? `${expectedLengths[0]}` : `${min}-${max}`;
    return `⚠ ${entry.country} phone numbers require ${expected} digits (you entered ${digits.length}). Please verify.`;
  }
  return null;
}

function getPhonePlaceholder(code: string): string {
  const entry = COUNTRY_PHONE_CODES.find((c) => c.code === code);
  if (!entry) return "Enter phone number";
  const len = entry.digits[0];
  return "X".repeat(len);
}

function NewApplicationPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeAppId = searchParams.get("resume");
  const isRestored = useRef(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showEntryTypeModal, setShowEntryTypeModal] = useState(false);
  const [declarationCertified, setDeclarationCertified] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [emailWarning, setEmailWarning] = useState("");
  const [phoneWarning, setPhoneWarning] = useState("");
  const [phoneCode, setPhoneCode] = useState("+233");

  const defaultForm: Record<string, string> = {
    visa_channel: "", visa_type_id: "", service_tier_id: "", entry_type: "",
    last_name: "", first_name: "", other_names: "",
    gender: "", date_of_birth: "",
    country_of_birth: "", nationality: "",
    passport_number: "", passport_issue_date: "", passport_expiry: "",
    marital_status: "", profession: "",
    email: "", phone: "", phone_code: "+233",
    intended_arrival: "", duration_days: "",
    visited_country_1: "", visited_country_2: "", visited_country_3: "",
  };

  const [form, setForm] = useState<Record<string, string>>(defaultForm);
  const [documents, setDocuments] = useState<Record<string, File>>({});

  const { data: vtData } = useQuery({ queryKey: ["visa-types"], queryFn: () => api.get<{ visa_types: VisaType[] }>("/visa-types").then((r) => r.data) });
  const { data: stData } = useQuery({ queryKey: ["service-tiers"], queryFn: () => api.get<{ service_tiers: ServiceTier[] }>("/service-tiers").then((r) => r.data) });

  const visaTypes = vtData?.visa_types || [];
  const serviceTiers = stData?.service_tiers || [];
  const selVT = visaTypes.find((v) => v.id.toString() === form.visa_type_id);
  const selST = serviceTiers.find((t) => t.id.toString() === form.service_tier_id);
  const visaConfig = useMemo(() => (selVT ? getVisaConfig(selVT.slug) : null), [selVT]);
  const maxDur = useMemo(() => (selVT ? getMaxDuration(selVT.slug) : 90), [selVT]);

  const durWarn = useMemo(() => {
    if (!selVT || !form.duration_days) return null;
    return getDurationWarning(selVT.slug, parseInt(form.duration_days));
  }, [selVT, form.duration_days]);

  // Fetch pricing from server-side API
  const [fees, setFees] = useState({ base: 0, entry: 0, processing: 0, total: 0, entryMultiplier: 1, tierMultiplier: 1 });

  useEffect(() => {
    const fetchPricing = async () => {
      if (!form.visa_channel || !form.entry_type || !selST?.code) return;

      try {
        const response = await api.post('/pricing/calculate', {
          visa_channel: form.visa_channel,
          entry_type: form.entry_type,
          service_tier_code: selST.code,
        });

        if (response.data.success) {
          const pricing = response.data.pricing;
          setFees({
            base: pricing.base_price,
            entry: pricing.entry_fee,
            processing: pricing.processing_fee,
            total: pricing.total,
            entryMultiplier: pricing.entry_multiplier,
            tierMultiplier: pricing.tier_multiplier,
          });
        }
      } catch (error) {
        console.error('Failed to fetch pricing:', error);
        // Fallback to zero if API fails
        setFees({ base: 0, entry: 0, processing: 0, total: 0, entryMultiplier: 1, tierMultiplier: 1 });
      }
    };

    fetchPricing();
  }, [form.visa_channel, form.entry_type, selST?.code]);

  const set = useCallback((k: string, v: string) => setForm((p) => ({ ...p, [k]: v })), []);

  // Restore saved draft on mount
  useEffect(() => {
    if (isRestored.current) return;
    isRestored.current = true;

    // Draft restoring disabled per user request
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (u.email) setForm((p) => ({ ...p, email: p.email || u.email, first_name: p.first_name || u.first_name || "", last_name: p.last_name || u.last_name || "", phone: p.phone || u.phone || "" }));
    } catch { /* ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Resume a specific application from the dashboard
  useEffect(() => {
    if (!resumeAppId) return;
    api.get(`/applicant/applications/${resumeAppId}`)
      .then(res => {
        const app = res.data.application;
        setApplication(app);

        // Map all fields from the backend application object to our form state
        setForm(prev => ({
          ...prev,
          visa_type_id: app.visa_type_id?.toString() || prev.visa_type_id,
          first_name: app.first_name || prev.first_name,
          last_name: app.last_name || prev.last_name,
          other_names: app.other_names || prev.other_names,
          gender: app.gender || prev.gender,
          date_of_birth: app.date_of_birth || prev.date_of_birth,
          marital_status: app.marital_status || prev.marital_status,
          profession: app.profession || prev.profession,
          country_of_birth: app.country_of_birth || prev.country_of_birth,
          nationality: app.nationality || prev.nationality,
          passport_number: app.passport_number || prev.passport_number,
          passport_issue_date: app.passport_issue_date || prev.passport_issue_date,
          passport_expiry: app.passport_expiry || prev.passport_expiry,
          email: app.email || prev.email,
          phone: app.phone || prev.phone,

          // Travel Details
          intended_arrival: app.intended_arrival ? app.intended_arrival.split('T')[0] : prev.intended_arrival,
          duration_days: app.duration_days?.toString() || prev.duration_days,
          visa_duration: app.visa_duration || prev.visa_duration,
          port_of_entry: app.port_of_entry || prev.port_of_entry,
          destination_city: app.destination_city || prev.destination_city,
          accommodation_type: app.accommodation_type || prev.accommodation_type,
          address_in_ghana: app.address_in_ghana || prev.address_in_ghana,
          purpose_of_visit: app.purpose_of_visit || prev.purpose_of_visit,
          visited_other_countries: app.visited_other_countries || prev.visited_other_countries,
          visited_country_1: app.visited_country_1 || prev.visited_country_1,
          visited_country_2: app.visited_country_2 || prev.visited_country_2,
          visited_country_3: app.visited_country_3 || prev.visited_country_3,

          // Health Details
          health_good_condition: app.health_good_condition || prev.health_good_condition,
          health_recent_illness: app.health_recent_illness || prev.health_recent_illness,
          health_contact_infectious: app.health_contact_infectious || prev.health_contact_infectious,
          health_yellow_fever_vaccinated: app.health_yellow_fever_vaccinated || prev.health_yellow_fever_vaccinated,
          health_chronic_conditions: app.health_chronic_conditions || prev.health_chronic_conditions,
          health_condition_details: app.health_condition_details || prev.health_condition_details,
        }));

        const step = app.current_step || 1;
        setCurrentStep(step >= 1 ? step : 1);
        toast.success("Resuming your application", { icon: "📋" });
      })
      .catch(() => toast.error("Could not load the application"));
  }, [resumeAppId]);

  // Scroll to top when component mounts or step changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Scroll to top on initial mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Auto-save form to localStorage on every change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasData = Object.entries(form).some(([k, v]) => k !== "visa_type_id" && k !== "service_tier_id" && k !== "entry_type" && v);
      if (hasData) {
        saveDraft(form, currentStep, application?.id?.toString() || null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form, currentStep, application]);

  const handleVisaSelect = (id: string) => {
    set("visa_type_id", id);
    const std = serviceTiers.find((t) => t.code === "standard");
    if (std) set("service_tier_id", std.id.toString());
    setShowEntryTypeModal(true);
  };

  const handleEntryTypeSelect = (entryType: "single" | "multiple") => set("entry_type", entryType);
  const handleEntryTypeConfirm = () => { setShowEntryTypeModal(false); setShowSpeedModal(true); };

  const minArrival = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().split("T")[0]; }, []);

  const reqDocs = useMemo(() => {
    if (visaConfig) return visaConfig.requiredDocuments;
    return (selVT?.required_documents || ["passport_bio", "passport_photo"]).map((d) => ({
      key: d, label: d.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()), description: "Required document", required: true,
    }));
  }, [visaConfig, selVT]);

  const declQuestions = visaConfig?.declarationQuestions || [];

  const handleCreateDraft = async () => {
    setErrors({}); setLoading(true);
    try {
      const res = await api.post("/applicant/applications", {
        visa_type_id: parseInt(form.visa_type_id),
        visa_channel: form.visa_channel || "e-visa",
        entry_type: form.entry_type || "single",
        service_tier_id: form.service_tier_id ? parseInt(form.service_tier_id) : undefined,
        first_name: form.first_name,
        last_name: form.last_name,
        date_of_birth: form.date_of_birth,
        nationality: form.nationality,
        email: form.email,
        phone: form.phone || undefined,
        gender: form.gender,
        marital_status: form.marital_status,
        profession: form.profession,
        passport_number: form.passport_number,
        passport_issue_date: form.passport_issue_date || undefined,
        passport_expiry: form.passport_expiry || undefined,
        country_of_birth: form.country_of_birth || undefined,
      });
      setApplication(res.data.application);
      saveDraft(form, 3, res.data.application.id?.toString());
      toast.success("Draft application created");
      setCurrentStep(3);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      if (error.response?.data?.errors) {
        const fe: Record<string, string> = {};
        for (const [k, m] of Object.entries(error.response.data.errors)) fe[k] = m[0];
        setErrors(fe);
        toast.error("Please fix the highlighted errors");
      } else toast.error(error.response?.data?.message || "Failed to create application");
    } finally { setLoading(false); }
  };

  const handleUpdateStep = async (nextStepNum: number) => {
    if (!application) return;
    setErrors({}); setLoading(true);
    try {
      const payload: Record<string, unknown> = { step: nextStepNum };
      payload.intended_arrival = form.intended_arrival;
      payload.duration_days = parseInt(form.duration_days || form.visa_duration) || null;
      payload.address_in_ghana = form.residential_address || form.address_in_ghana || "";
      payload.purpose_of_visit = form.purpose_of_visit || "";
      payload.port_of_entry = form.port_of_entry;
      payload.passport_expiry = form.passport_expiry;

      // Include any dynamic fields from visa-matrix.ts that exist in the form state
      if (visaConfig) {
        for (const field of visaConfig.specificFields) {
          if (form[field.key]) {
            payload[field.key] = form[field.key];
          }
        }
      }

      const res = await api.put(`/applicant/applications/${application.id}/step`, payload);
      setApplication(res.data.application);
      setCurrentStep((p) => p + 1);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to update");
    } finally { setLoading(false); }
  };

  const handleDocUpload = async (docType: string, file: File) => {
    if (!application) { setDocuments((p) => ({ ...p, [docType]: file })); toast.success(`${docType.replace(/_/g, " ")} selected`); return; }
    const fd = new FormData(); fd.append("file", file); fd.append("document_type", docType);
    try {
      await api.post(`/applicant/applications/${application.id}/documents`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setDocuments((p) => ({ ...p, [docType]: file }));
      toast.success(`${docType.replace(/_/g, " ")} uploaded`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Upload failed");
    }
  };

  const handleSaveAndExit = useCallback(() => {
    saveDraft(form, currentStep, application?.id?.toString() || null);
    setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    toast.success("Application saved! You can continue anytime from your dashboard.", { duration: 3000, icon: "💾" });
    setTimeout(() => router.push("/dashboard/applicant"), 1200);
  }, [form, currentStep, application, router]);

  const handlePay = async (method: string) => {
    if (!application) return;
    try {
      // Use GHS for Paystack methods, USD for others
      const currency = method.startsWith('paystack_') ? 'GHS' : 'USD';
      
      const res = await api.post(`/applicant/applications/${application.id}/payment/initialize`, {
        payment_method: method,
        currency: currency
      });

      if (res.data.success) {
        clearDraft();
        setShowPaymentModal(false);

        if (res.data.authorization_url) {
          // Redirect the user to Paystack's checkout page
          window.location.href = res.data.authorization_url;
        } else if (res.data.provider === 'bank_transfer') {
          // For bank transfer, show a success message then a completion prompt
          toast.success("Bank transfer initiated. Please follow the instructions to complete your payment.", { duration: 5000, icon: "🏦" });
          setTimeout(() => {
            setShowCompletionPopup(true);
          }, 1000);
        } else {
          // Fallback
          setShowCompletionPopup(true);
        }
      } else {
        toast.error(res.data.message || "Payment initialization failed");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Payment failed to initialize");
    }
  };

  const validate = (step: number): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.visa_type_id) e.visa_type_id = "Select your purpose of travel";
      if (!form.entry_type) e.entry_type = "Select entry type";
      if (!form.service_tier_id) e.service_tier_id = "Select processing speed";
    }
    if (step === 1) {
      if (!form.last_name.trim()) e.last_name = "Surname is required";
      if (!form.first_name.trim()) e.first_name = "First name is required";
      if (!form.gender) e.gender = "Gender is required";
      if (!form.date_of_birth) e.date_of_birth = "Date of birth is required";
      if (!form.country_of_birth) e.country_of_birth = "Country of birth is required";
      if (!form.nationality) e.nationality = "Nationality is required";
      if (!form.passport_number.trim()) e.passport_number = "Passport number is required";
      else if (!/^[A-Za-z0-9]{6,20}$/.test(form.passport_number.trim())) {
        e.passport_number = "Please enter a valid passport number (6-20 alphanumeric characters only)";
      }
      if (!form.passport_issue_date) e.passport_issue_date = "Issue date is required";
      if (!form.passport_expiry) e.passport_expiry = "Expiry date is required";
      else {
        const expiry = new Date(form.passport_expiry);
        const sixMonths = new Date();
        sixMonths.setMonth(sixMonths.getMonth() + 6);
        if (expiry < sixMonths) e.passport_expiry = "Passport must be valid for at least 6 months from today";
      }
      if (!form.marital_status) e.marital_status = "Marital status is required";
      if (!form.profession.trim()) e.profession = "Profession is required";
      if (!form.email.trim()) e.email = "Email is required";
      else if (!validateEmail(form.email)) e.email = "Please enter a valid email address";
      if (!form.phone.trim()) e.phone = "Phone number is required";
      else {
        const phoneErr = validatePhone(phoneCode, form.phone);
        if (phoneErr) e.phone = phoneErr;
      }
    }
    if (step === 2 && visaConfig) {
      if (!form.intended_arrival) e.intended_arrival = "Arrival date is required";
      for (const f of visaConfig.specificFields) {
        if (!f.required) continue;
        if (f.conditionalOn) { const dv = form[f.conditionalOn.field]; const show = Array.isArray(f.conditionalOn.value) ? f.conditionalOn.value.includes(dv) : dv === f.conditionalOn.value; if (!show) continue; }
        if (!form[f.key]?.trim()) e[f.key] = `${f.label} is required`;
      }
    } else if (step === 2) {
      if (!form.intended_arrival) e.intended_arrival = "Required";
      if (!form.duration_days) e.duration_days = "Required";
    }
    if (step === 3) {
      const miss = reqDocs.filter((d) => d.required && !documents[d.key]);
      if (miss.length) { toast.error(`Upload required: ${miss.map((d) => d.label).join(", ")}`); return false; }
    }
    if (step === 4) {
      // Health Declaration validation
      if (!form.health_good_condition) e.health_good_condition = "Required";
      if (!form.health_recent_illness) e.health_recent_illness = "Required";
      if (!form.health_contact_infectious) e.health_contact_infectious = "Required";
      if (!form.health_yellow_fever_vaccinated) e.health_yellow_fever_vaccinated = "Required";
      if (!form.health_chronic_conditions) e.health_chronic_conditions = "Required";
    }
    if (step === 5) {
      // Security Declaration validation
      if (declQuestions.length > 0) {
        for (const q of declQuestions) { if (!form[q.key]) e[q.key] = "Required"; }
      }
      if (!declarationCertified) { toast.error("You must certify the declaration to proceed"); return false; }
    }
    setErrors(e);
    if (Object.keys(e).length) { toast.error("Please fix the highlighted errors before continuing"); return false; }
    return true;
  };

  const nextStep = () => {
    if (!validate(currentStep)) return;
    if (currentStep === 1) handleCreateDraft();
    else if (currentStep === 2) handleUpdateStep(currentStep + 1);
    else setCurrentStep((p) => Math.min(p + 1, STEPS.length - 1));
  };

  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 0));

  const countryName = (code: string) => countries.find((c) => c.code === code)?.name || code;
  const optLabel = (options: { value: string; label: string }[] | undefined, val: string) => options?.find(o => o.value === val)?.label || val;

  return (
    <DashboardShell title="New Visa Application" description="Complete each section to submit your application">
      {/* Progress Stepper */}
      <div className="bg-white rounded-2xl border border-black/6 p-5 lg:p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ease-out
                  ${i < currentStep ? "bg-accent text-white shadow-sm ring-4 ring-accent/15"
                    : i === currentStep ? "bg-primary text-white shadow-sm ring-4 ring-primary/15"
                      : "bg-surface text-text-muted border border-border"}`}>
                  {i < currentStep ? <Check size={14} strokeWidth={3} /> : i + 1}
                </div>
                <span className={`text-[10px] hidden lg:block leading-tight text-center max-w-[72px]
                  ${i === currentStep ? "font-semibold text-text-primary" : i < currentStep ? "font-medium text-accent" : "text-text-muted"}`}>
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className={`w-3 lg:w-6 xl:w-10 h-[2px] mx-0.5 rounded-full transition-colors duration-200 ${i < currentStep ? "bg-accent" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Pricing Display - Shows ONLY on payment step (step 6) */}
      {currentStep === 6 && fees.total > 0 && (
        <div className="bg-gradient-to-r from-accent/5 to-primary/5 rounded-2xl border border-accent/20 p-5 mb-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-muted mb-1">Total Amount</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-accent">${fees.total.toFixed(2)}</p>
                  <p className="text-sm text-text-secondary">USD</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted">Calculation:</p>
                <p className="text-sm font-medium text-accent">
                  ${fees.base.toFixed(2)} + ${fees.entry.toFixed(2)} + ${fees.processing.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-accent/20">
              <div className="text-center">
                <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Base Fee</p>
                <p className="text-lg font-bold text-text-primary">${fees.base.toFixed(2)}</p>
                <p className="text-xs text-text-muted">Standard</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Entry Fee</p>
                <p className="text-lg font-bold text-text-primary">${fees.entry.toFixed(2)}</p>
                <p className="text-xs text-text-muted">{form.entry_type === "multiple" ? "Multiple" : "Single"}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Processing</p>
                <p className="text-lg font-bold text-text-primary">${fees.processing.toFixed(2)}</p>
                <p className="text-xs text-text-muted">{selST?.name || "Standard"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-black/6 p-6 lg:p-8 shadow-sm">

        {/* ── STEP 0: Purpose of Travel ── */}
        {currentStep === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Why are you traveling to Ghana?</h2>
            <p className="text-sm text-text-secondary mb-6">Select the option that best describes your visit.</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {visaTypes.filter((vt) => vt.category !== "eta").map((vt) => (
                <button key={vt.id} type="button" onClick={() => {
                  set("visa_type_id", vt.id.toString());
                  set("visa_channel", "e-visa");
                  const std = serviceTiers.find((t) => t.code === "standard");
                  if (std) set("service_tier_id", std.id.toString());
                  setShowEntryTypeModal(true);
                }}
                  className={`text-left p-5 rounded-xl border-2 transition-all duration-150 cursor-pointer
                    ${form.visa_type_id === vt.id.toString() ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}>
                  <h3 className="font-semibold text-text-primary mb-1">{vt.name}</h3>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{vt.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">{vt.validity_period || `Up to ${vt.max_duration_days} days`}</span>
                  </div>
                </button>
              ))}
              {visaTypes.length === 0 && <p className="text-text-muted text-sm col-span-3 text-center py-8">Loading visa types...</p>}
            </div>

            {/* Pricing Summary - Hidden during application process */}
            {selVT && false && (
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Base Fee</p>
                      <p className="text-lg font-bold text-text-primary">$260.00</p>
                      <p className="text-xs text-text-muted mt-0.5">{selVT?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Entry Fee</p>
                      <p className="text-lg font-bold text-text-primary">
                        {form.entry_type === "multiple" ? `+$${(260 * 0.8).toFixed(2)}` : form.entry_type === "single" ? "+$0.00" : "---"}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {form.entry_type ? (form.entry_type === "multiple" ? "Multiple Entry" : "Single Entry") : "Required"}
                      </p>
                    </div>
                  </div>

                  {form.entry_type && (
                    <div className="pt-3 border-t border-accent/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Total Amount</p>
                          <p className="text-2xl font-bold text-accent">
                            {form.entry_type === "multiple" ? `$${(260 * 1.8).toFixed(2)}` : "$260.00"}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">
                            {form.entry_type === "multiple" ? `$260 × 1.8 = $${(260 * 1.8).toFixed(2)}` : "$260 × 1.0 = $260.00"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setShowEntryTypeModal(true)} className="text-xs text-accent hover:underline cursor-pointer">
                              Change Entry Type
                            </button>
                            {!form.service_tier_id && (
                              <span className="text-xs text-warning">• Select processing speed next</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {selVT && form.entry_type && (
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/5 border border-accent/20">
                  <div className="flex items-center gap-4">
                    <CheckCircle size={20} className="text-accent" />
                    <div>
                      <p className="font-semibold text-text-primary">{selVT.name}</p>
                      <p className="text-xs text-text-muted">{form.entry_type === "multiple" ? "Multiple Entry" : "Single Entry"}{form.service_tier_id && selST ? ` • ${selST.name} • ${selST.processing_time_display || "3-5 days"}` : ""}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent">
                      ${fees.total > 0 ? fees.total.toFixed(2) : (260 * (form.entry_type === "multiple" ? 1.8 : 1) * Number(selST ? selST.fee_multiplier || 1 : 1)).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setShowEntryTypeModal(true)} className="text-xs text-accent hover:underline cursor-pointer">Entry type</button>
                      {form.service_tier_id && <><span className="text-text-muted">•</span><button type="button" onClick={() => setShowSpeedModal(true)} className="text-xs text-accent hover:underline cursor-pointer">Speed</button></>}
                      {!form.service_tier_id && <span className="text-xs text-warning">Select processing tier</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1: Applicant Details ── */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Applicant Details</h2>
            <p className="text-sm text-text-secondary mb-6">Please provide your personal and passport information.</p>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-light">
                <div className="w-6 h-6 rounded-md bg-primary/8 flex items-center justify-center"><span className="text-[11px] font-bold text-primary">1</span></div>
                <h3 className="text-sm font-bold text-text-primary">Personal Information</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Surname *" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} error={errors.last_name} placeholder="e.g. Mensah" required />
                <Input label="First Name *" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} error={errors.first_name} placeholder="e.g. Kwame" required />
                <Input label="Other Names" value={form.other_names} onChange={(e) => set("other_names", e.target.value)} placeholder="Middle name(s)" />
                <Select label="Gender *" value={form.gender} onChange={(e) => set("gender", e.target.value)} error={errors.gender} required>
                  <option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option>
                </Select>
                <Input label="Date of Birth *" type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} error={errors.date_of_birth} required />
                <Select label="Country of Birth *" value={form.country_of_birth} onChange={(e) => set("country_of_birth", e.target.value)} error={errors.country_of_birth} required>
                  <option value="">Select country</option>{countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </Select>
                <Select label="Nationality *" value={form.nationality} onChange={(e) => set("nationality", e.target.value)} error={errors.nationality} required>
                  <option value="">Select nationality</option>{countries.map((c) => <option key={c.code} value={c.code}>{c.nationality}</option>)}
                </Select>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-light">
                <div className="w-6 h-6 rounded-md bg-primary/8 flex items-center justify-center"><span className="text-[11px] font-bold text-primary">2</span></div>
                <h3 className="text-sm font-bold text-text-primary">Passport Information</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Passport Number *" value={form.passport_number} onChange={(e) => set("passport_number", e.target.value.toUpperCase())} error={errors.passport_number} placeholder="e.g. AB1234567" required />
                <Input label="Issue Date *" type="date" value={form.passport_issue_date} onChange={(e) => set("passport_issue_date", e.target.value)} error={errors.passport_issue_date} required />
                <Input label="Expiry Date *" type="date" value={form.passport_expiry} onChange={(e) => set("passport_expiry", e.target.value)} error={errors.passport_expiry} hint="Must be valid 6+ months" required />
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-light">
                <div className="w-6 h-6 rounded-md bg-primary/8 flex items-center justify-center"><span className="text-[11px] font-bold text-primary">3</span></div>
                <h3 className="text-sm font-bold text-text-primary">Additional Information</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Select label="Marital Status *" value={form.marital_status} onChange={(e) => set("marital_status", e.target.value)} error={errors.marital_status} required>
                  <option value="">Select status</option><option value="single">Single</option><option value="married">Married</option>
                  <option value="divorced">Divorced</option><option value="widowed">Widowed</option><option value="separated">Separated</option>
                </Select>
                <Input label="Profession / Occupation *" value={form.profession} onChange={(e) => set("profession", e.target.value)} error={errors.profession} placeholder="e.g. Software Engineer" required />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-light">
                <div className="w-6 h-6 rounded-md bg-primary/8 flex items-center justify-center"><span className="text-[11px] font-bold text-primary">4</span></div>
                <h3 className="text-sm font-bold text-text-primary">Contact Information</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Input label="Email Address *" type="email" value={form.email} onChange={(e) => {
                    set("email", e.target.value);
                    const val = e.target.value.trim();
                    if (val && !validateEmail(val)) {
                      setEmailWarning("⚠ This does not appear to be a valid email address. Please check for typos.");
                    } else {
                      setEmailWarning("");
                    }
                  }} error={errors.email} placeholder="you@example.com" required />
                  {emailWarning && !errors.email && (
                    <div className="flex items-start gap-2 mt-1.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                      <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 font-medium">{emailWarning}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Phone Number *</label>
                  <div className="flex gap-2">
                    <select
                      value={phoneCode}
                      onChange={(e) => {
                        setPhoneCode(e.target.value);
                        set("phone_code", e.target.value);
                        // Re-validate
                        if (form.phone.trim()) {
                          const err = validatePhone(e.target.value, form.phone);
                          setPhoneWarning(err || "");
                        }
                      }}
                      className="w-[140px] px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                    >
                      {COUNTRY_PHONE_CODES.map((c) => (
                        <option key={c.code + c.country} value={c.code}>{c.code} {c.country}</option>
                      ))}
                    </select>
                    <div className="flex-1">
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/[^\d]/g, "");
                          set("phone", digits);
                          if (digits) {
                            const err = validatePhone(phoneCode, digits);
                            setPhoneWarning(err || "");
                          } else {
                            setPhoneWarning("");
                          }
                        }}
                        placeholder={getPhonePlaceholder(phoneCode)}
                        className={`w-full px-4 py-2.5 bg-surface border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 ${errors.phone ? "border-danger" : "border-border"}`}
                        required
                      />
                    </div>
                  </div>
                  {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone}</p>}
                  {phoneWarning && !errors.phone && (
                    <div className="flex items-start gap-2 mt-1.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                      <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 font-medium">{phoneWarning}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-text-muted mt-1">Enter digits only, without the country code prefix</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Travel Details (visa-specific merged) ── */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">{visaConfig?.stepTitle || "Travel Details"}</h2>
            <p className="text-sm text-text-secondary mb-6">{visaConfig?.stepDescription || "Provide your travel and stay information."}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Intended Arrival Date *" type="date" value={form.intended_arrival} onChange={(e) => set("intended_arrival", e.target.value)} error={errors.intended_arrival} min={minArrival} required />
              {visaConfig ? (
                visaConfig.specificFields.map((field) => {
                  if (field.conditionalOn) {
                    const depVal = form[field.conditionalOn.field];
                    const show = Array.isArray(field.conditionalOn.value) ? field.conditionalOn.value.includes(depVal) : depVal === field.conditionalOn.value;
                    if (!show) return null;
                  }
                  return <DynField key={field.key} field={field} value={form[field.key] || ""} onChange={(v) => set(field.key, v)} error={errors[field.key]} />;
                })
              ) : (
                <>
                  <Select label="Port of Entry *" value={form.port_of_entry} onChange={(e) => set("port_of_entry", e.target.value)} error={errors.port_of_entry} required>
                    <option value="">-- Select Port --</option>
                    {PORTS_OF_ENTRY.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </Select>
                  <Input label="Duration of Stay (Days) *" type="number" value={form.duration_days} onChange={(e) => set("duration_days", e.target.value)} error={errors.duration_days} placeholder="e.g. 14" min={1} max={maxDur} required />
                  <div className="sm:col-span-2">
                    <Textarea label="Purpose of Visit *" value={form.purpose_of_visit || ""} onChange={(e) => set("purpose_of_visit", e.target.value)} error={errors.purpose_of_visit} placeholder="Describe your reason for visiting Ghana" rows={3} required />
                  </div>
                </>
              )}
            </div>

            {/* Visited Countries Section */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-light">
                <Globe size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-text-primary">Countries Visited (Optional)</h3>
              </div>
              <p className="text-xs text-text-muted mb-4">List up to 3 countries you have visited in the past 5 years</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <Select label="Country 1" value={form.visited_country_1} onChange={(e) => set("visited_country_1", e.target.value)}>
                  <option value="">-- Select Country --</option>
                  {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </Select>
                <Select label="Country 2" value={form.visited_country_2} onChange={(e) => set("visited_country_2", e.target.value)}>
                  <option value="">-- Select Country --</option>
                  {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </Select>
                <Select label="Country 3" value={form.visited_country_3} onChange={(e) => set("visited_country_3", e.target.value)}>
                  <option value="">-- Select Country --</option>
                  {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Document Upload ── */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Document Upload</h2>
            <p className="text-sm text-text-secondary mb-2">Upload the required documents to support your application.</p>

            {/* Upload Progress Bar */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border mb-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-text-primary">
                    {reqDocs.filter(d => documents[d.key]).length}/{reqDocs.length} Uploaded
                  </span>
                  <span className={`text-xs font-semibold ${reqDocs.filter(d => d.required).every(d => documents[d.key]) ? "text-accent" : "text-warning"}`}>
                    {reqDocs.filter(d => d.required && documents[d.key]).length} of {reqDocs.filter(d => d.required).length} required documents uploaded
                  </span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{ width: `${(reqDocs.filter(d => documents[d.key]).length / Math.max(reqDocs.length, 1)) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Required Documents */}
            {reqDocs.filter(d => d.required).length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-text-primary mb-4">Required Documents</h3>
                <div className="space-y-5">
                  {reqDocs.filter(d => d.required).map((doc) => (
                    <div key={doc.key} className="p-4 rounded-xl border border-border-light bg-surface/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-text-primary">{doc.label} *</span>
                        {documents[doc.key] && <CheckCircle size={16} className="text-accent" />}
                      </div>
                      <p className="text-xs text-text-muted mb-3">{doc.description}</p>
                      <FileUpload onFileSelect={(file) => handleDocUpload(doc.key, file)} currentFile={documents[doc.key]?.name} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Documents */}
            {reqDocs.filter(d => !d.required).length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-text-primary mb-4">Optional Documents</h3>
                <div className="space-y-5">
                  {reqDocs.filter(d => !d.required).map((doc) => (
                    <div key={doc.key} className="p-4 rounded-xl border border-border-light bg-surface/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-text-primary">{doc.label}</span>
                        {documents[doc.key] && <CheckCircle size={16} className="text-accent" />}
                      </div>
                      <p className="text-xs text-text-muted mb-3">{doc.description}</p>
                      <FileUpload onFileSelect={(file) => handleDocUpload(doc.key, file)} currentFile={documents[doc.key]?.name} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: Health Declaration ── */}
        {currentStep === 4 && (
          <div>
            <div className="flex items-center gap-3 mb-1">
              <ShieldCheck size={22} className="text-success" />
              <h2 className="text-lg font-semibold text-text-primary">Health Declaration</h2>
            </div>
            <p className="text-sm text-text-secondary mb-6">Please answer the following health-related questions truthfully. This information is required for entry into Ghana.</p>

            <div className="space-y-4 mb-8">
              {/* Question 1: General Health */}
              <div className={`p-5 rounded-xl border transition-colors ${errors.health_good_condition ? "border-danger/30 bg-danger/3" : "border-border-light bg-surface/50"}`}>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-success/8 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-success">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary mb-3">Are you currently in good health and free from any communicable diseases? *</p>
                    <Select value={form.health_good_condition || ""} onChange={(e) => set("health_good_condition", e.target.value)} error={errors.health_good_condition} required>
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Question 2: Recent Illness */}
              <div className={`p-5 rounded-xl border transition-colors ${errors.health_recent_illness ? "border-danger/30 bg-danger/3" : "border-border-light bg-surface/50"}`}>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-success/8 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-success">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary mb-3">Have you experienced any fever, cough, difficulty breathing, or other flu-like symptoms in the past 14 days? *</p>
                    <Select value={form.health_recent_illness || ""} onChange={(e) => set("health_recent_illness", e.target.value)} error={errors.health_recent_illness} required>
                      <option value="">Select</option>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Question 3: Contact with Infectious Disease */}
              <div className={`p-5 rounded-xl border transition-colors ${errors.health_contact_infectious ? "border-danger/30 bg-danger/3" : "border-border-light bg-surface/50"}`}>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-success/8 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-success">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary mb-3">Have you been in close contact with anyone diagnosed with an infectious disease in the past 21 days? *</p>
                    <Select value={form.health_contact_infectious || ""} onChange={(e) => set("health_contact_infectious", e.target.value)} error={errors.health_contact_infectious} required>
                      <option value="">Select</option>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Question 4: Yellow Fever Vaccination */}
              <div className={`p-5 rounded-xl border transition-colors ${errors.health_yellow_fever_vaccinated ? "border-danger/30 bg-danger/3" : "border-border-light bg-surface/50"}`}>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-success/8 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-success">4</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary mb-3">Have you received the Yellow Fever vaccination? (Required for entry into Ghana) *</p>
                    <Select value={form.health_yellow_fever_vaccinated || ""} onChange={(e) => set("health_yellow_fever_vaccinated", e.target.value)} error={errors.health_yellow_fever_vaccinated} required>
                      <option value="">Select</option>
                      <option value="yes">Yes — I have a valid Yellow Fever certificate</option>
                      <option value="scheduled">Scheduled — I will get vaccinated before travel</option>
                      <option value="exempt">Exempt — I have a medical exemption</option>
                    </Select>
                    <p className="text-xs text-text-muted mt-2">Note: Yellow Fever vaccination certificate is required at port of entry. You must present proof upon arrival in Ghana.</p>
                  </div>
                </div>
              </div>

              {/* Question 5: Medical Conditions */}
              <div className={`p-5 rounded-xl border transition-colors ${errors.health_chronic_conditions ? "border-danger/30 bg-danger/3" : "border-border-light bg-surface/50"}`}>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-success/8 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-success">5</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary mb-3">Do you have any chronic medical conditions that may require medical attention during your stay? *</p>
                    <Select value={form.health_chronic_conditions || ""} onChange={(e) => set("health_chronic_conditions", e.target.value)} error={errors.health_chronic_conditions} required>
                      <option value="">Select</option>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Conditional: Details if chronic conditions */}
              {form.health_chronic_conditions === "yes" && (
                <div className="p-5 rounded-xl border border-warning/30 bg-warning/5">
                  <div className="flex items-start gap-3">
                    <Info size={18} className="text-warning shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary mb-3">Please briefly describe your medical condition(s):</p>
                      <Textarea
                        value={form.health_condition_details || ""}
                        onChange={(e) => set("health_condition_details", e.target.value)}
                        placeholder="e.g., Diabetes, Asthma, Heart condition..."
                        rows={3}
                      />
                      <p className="text-xs text-text-muted mt-2">This information will be kept confidential and is only used for health screening purposes.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Health Declaration Notice */}
            <div className="p-4 rounded-xl bg-info/5 border border-info/20">
              <div className="flex items-start gap-3">
                <Info size={18} className="text-info shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-text-primary mb-1">Important Health Information</p>
                  <p className="text-xs text-text-muted">
                    Ghana requires all travelers to present a valid Yellow Fever vaccination certificate upon arrival.
                    Travelers may also be subject to health screening at the port of entry. Please ensure you have
                    adequate travel health insurance covering medical expenses during your stay.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: Security & Travel Declaration ── */}
        {currentStep === 5 && (
          <div>
            <div className="flex items-center gap-3 mb-1">
              <ShieldCheck size={22} className="text-primary" />
              <h2 className="text-lg font-semibold text-text-primary">Security & Travel Declaration</h2>
            </div>
            <p className="text-sm text-text-secondary mb-6">Please answer all questions truthfully.</p>

            {declQuestions.length > 0 ? (
              <div className="space-y-4 mb-8">
                {declQuestions.map((q, i) => (
                  <div key={q.key} className={`p-5 rounded-xl border transition-colors ${errors[q.key] ? "border-danger/30 bg-danger/3" : "border-border-light bg-surface/50"}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary mb-3">{q.question} *</p>
                        <Select value={form[q.key] || ""} onChange={(e) => set(q.key, e.target.value)} error={errors[q.key]} required>
                          <option value="">Select</option>
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                <div className="p-5 rounded-xl border border-border-light bg-surface/50">
                  <p className="text-sm text-text-secondary">No specific declaration questions are required for this visa type. Please confirm the certification below to proceed.</p>
                </div>
              </div>
            )}

            {/* Certification */}
            <div className={`p-5 rounded-xl border-2 transition-colors ${declarationCertified ? "border-accent/30 bg-accent/3" : "border-border"}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={declarationCertified}
                  onChange={(e) => setDeclarationCertified(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-border accent-accent cursor-pointer"
                />
                <span className="text-sm text-text-primary leading-relaxed">
                  I certify that all information provided is true and accurate to the best of my knowledge. I understand that providing false information may result in visa denial or deportation.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* ── STEP 6: Review & Payment ── */}
        {currentStep === 6 && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Review Your Application</h2>
            <p className="text-sm text-text-secondary mb-6">Please confirm all details before proceeding to payment.</p>

            <div className="space-y-4 mb-8">
              {/* Visa Information */}
              <div className="bg-surface rounded-xl p-5">
                <h3 className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">Visa Information</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><p className="text-xs text-text-muted">Channel</p><p className="text-sm font-medium text-text-primary">{form.visa_channel === "regular" ? "Regular Visa" : "E-Visa"}</p></div>
                  <div><p className="text-xs text-text-muted">Visa Type</p><p className="text-sm font-medium text-text-primary">{selVT?.name}</p></div>
                  <div><p className="text-xs text-text-muted">Entry Type</p><p className="text-sm font-medium text-text-primary">{form.entry_type === "multiple" ? "Multiple Entry" : "Single Entry"}</p></div>
                  <div><p className="text-xs text-text-muted">Processing</p><p className="text-sm font-medium text-text-primary">{selST?.name}</p></div>
                  <div><p className="text-xs text-text-muted">Processing Time</p><p className="text-sm font-medium text-text-primary">{selST?.processing_time_display}</p></div>
                </div>
              </div>

              {/* Applicant Details */}
              <div className="bg-surface rounded-xl p-5">
                <h3 className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">Applicant Details</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><p className="text-xs text-text-muted">Full Name</p><p className="text-sm font-medium text-text-primary">{form.last_name.toUpperCase()}, {form.first_name}{form.other_names ? ` ${form.other_names}` : ""}</p></div>
                  <div><p className="text-xs text-text-muted">Gender</p><p className="text-sm font-medium text-text-primary capitalize">{form.gender}</p></div>
                  <div><p className="text-xs text-text-muted">Date of Birth</p><p className="text-sm font-medium text-text-primary">{form.date_of_birth}</p></div>
                  <div><p className="text-xs text-text-muted">Nationality</p><p className="text-sm font-medium text-text-primary">{countryName(form.nationality)}</p></div>
                  <div><p className="text-xs text-text-muted">Passport</p><p className="text-sm font-medium text-text-primary">{form.passport_number}</p></div>
                  <div><p className="text-xs text-text-muted">Passport Expiry</p><p className="text-sm font-medium text-text-primary">{form.passport_expiry}</p></div>
                  <div><p className="text-xs text-text-muted">Email</p><p className="text-sm font-medium text-text-primary">{form.email}</p></div>
                  <div><p className="text-xs text-text-muted">Phone</p><p className="text-sm font-medium text-text-primary">{form.phone}</p></div>
                </div>
              </div>

              {/* Travel Details */}
              <div className="bg-surface rounded-xl p-5">
                <h3 className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">Travel Details</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><p className="text-xs text-text-muted">Arrival Date</p><p className="text-sm font-medium text-text-primary">{form.intended_arrival}</p></div>
                  <div><p className="text-xs text-text-muted">Duration</p><p className="text-sm font-medium text-text-primary">{form.visa_duration ? optLabel(VISA_DURATION_OPTIONS, form.visa_duration) : `${form.duration_days} days`}</p></div>
                  {form.port_of_entry && <div><p className="text-xs text-text-muted">Port of Entry</p><p className="text-sm font-medium text-text-primary">{optLabel(PORTS_OF_ENTRY, form.port_of_entry)}</p></div>}
                  {form.destination_city && <div><p className="text-xs text-text-muted">Destination</p><p className="text-sm font-medium text-text-primary">{optLabel(DESTINATION_CITIES, form.destination_city)}</p></div>}
                  {form.accommodation_type && <div><p className="text-xs text-text-muted">Accommodation</p><p className="text-sm font-medium text-text-primary">{optLabel(ACCOMMODATION_OPTIONS, form.accommodation_type)}</p></div>}
                  {form.visited_other_countries === "yes" && <div className="sm:col-span-2"><p className="text-xs text-text-muted">Recently Visited Countries</p><p className="text-sm font-medium text-text-primary">{[form.visited_country_1, form.visited_country_2, form.visited_country_3].filter(Boolean).map(c => countryName(c!)).join(", ") || "None listed"}</p></div>}
                  {form.purpose_of_visit && <div className="sm:col-span-2"><p className="text-xs text-text-muted">Purpose</p><p className="text-sm font-medium text-text-primary">{form.purpose_of_visit}</p></div>}
                </div>
              </div>

              {/* Health Declaration */}
              <div className="bg-surface rounded-xl p-5">
                <h3 className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">Health Declaration</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><p className="text-xs text-text-muted">Good Health</p><p className="text-sm font-medium text-text-primary capitalize">{form.health_good_condition || "—"}</p></div>
                  <div><p className="text-xs text-text-muted">Recent Symptoms</p><p className="text-sm font-medium text-text-primary capitalize">{form.health_recent_illness || "—"}</p></div>
                  <div><p className="text-xs text-text-muted">Infectious Contact</p><p className="text-sm font-medium text-text-primary capitalize">{form.health_contact_infectious || "—"}</p></div>
                  <div><p className="text-xs text-text-muted">Yellow Fever Vaccination</p><p className="text-sm font-medium text-text-primary capitalize">{form.health_yellow_fever_vaccinated || "—"}</p></div>
                  <div><p className="text-xs text-text-muted">Chronic Conditions</p><p className="text-sm font-medium text-text-primary capitalize">{form.health_chronic_conditions || "—"}</p></div>
                  {form.health_condition_details && <div className="sm:col-span-2"><p className="text-xs text-text-muted">Condition Details</p><p className="text-sm font-medium text-text-primary">{form.health_condition_details}</p></div>}
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="bg-surface rounded-xl p-5">
                <h3 className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">Uploaded Documents</h3>
                {Object.keys(documents).length > 0 ? (
                  <div className="space-y-2">
                    {reqDocs.map((doc) => (
                      <div key={doc.key} className="flex items-center justify-between">
                        <span className="text-sm text-text-primary">{doc.label}</span>
                        {documents[doc.key] ? (
                          <span className="flex items-center gap-1 text-xs text-accent"><CheckCircle size={14} /> Uploaded</span>
                        ) : (
                          <span className="text-xs text-text-muted">{doc.required ? "Missing" : "Not uploaded"}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">No documents uploaded.</p>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border-2 border-accent/20 rounded-xl p-6 bg-accent/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">Payment Summary</h3>
                <CreditCard size={20} className="text-accent" />
              </div>
              <div className="mb-4 p-3 bg-surface rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  {selST && tierIcons[selST.code]}
                  <p className="text-sm font-medium text-text-primary">{selST?.name || "Standard Processing"}</p>
                </div>
                <p className="text-xs text-text-muted">{selST?.processing_time_display} • {form.entry_type === "multiple" ? "Multiple Entry" : "Single Entry"}</p>
              </div>
              <div className="flex justify-between mb-2"><span className="text-text-secondary">Base Fee ({form.entry_type === "multiple" ? "Multiple" : "Single"} Entry)</span><span className="text-text-primary">${fees.base.toFixed(2)}</span></div>
              {fees.processing > 0 && <div className="flex justify-between mb-2"><span className="text-text-secondary">Processing Fee</span><span className="text-text-primary">+${fees.processing.toFixed(2)}</span></div>}
              <div className="border-t border-accent/20 my-3" />
              <div className="flex justify-between"><span className="font-semibold text-text-primary">Total</span><span className="text-xl font-bold text-accent">${fees.total.toFixed(2)}</span></div>
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={currentStep === 0 ? () => router.back() : prevStep} leftIcon={<ArrowLeft size={16} />}>
              {currentStep === 0 ? "Cancel" : "Back"}
            </Button>
            {currentStep > 0 && (
              <Button variant="secondary" onClick={handleSaveAndExit} leftIcon={<Save size={14} />}
                className="!text-text-secondary hover:!text-text-primary">
                Save & Exit
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && <span className="text-[11px] text-text-muted hidden sm:block">Saved at {lastSaved}</span>}
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={nextStep} loading={loading}
                disabled={(currentStep === 0 && (!form.visa_type_id || !form.entry_type || !form.service_tier_id))}>
                Continue <ArrowRight size={16} className="ml-1" />
              </Button>
            ) : (
              <Button onClick={() => setShowPaymentModal(true)} loading={loading}
                leftIcon={<CreditCard size={16} />} className="!bg-accent hover:!bg-accent-dark">
                Proceed to Payment
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <EntryTypeModal open={showEntryTypeModal} onClose={handleEntryTypeConfirm} onSelect={handleEntryTypeSelect}
        selected={form.entry_type as "single" | "multiple" | ""} baseFee={260}
        multipleEntryFee={260 * 0.8} visaTypeName={selVT?.name || ""} />

      <ProcessingSpeedModal open={showSpeedModal} onClose={() => setShowSpeedModal(false)}
        onSelect={(id) => set("service_tier_id", id)} serviceTiers={serviceTiers} selectedTierId={form.service_tier_id}
        baseFee={form.entry_type === "multiple" ? 260 * 1.8 : 260}
        visaTypeName={selVT?.name || ""} />

      <PaymentModal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} onPay={handlePay}
        totalFee={fees.total}
        breakdown={[
          { label: `Base Fee (${form.entry_type === "multiple" ? "Multiple" : "Single"} Entry)`, amount: fees.base },
          ...(fees.processing > 0 ? [{ label: "Processing Fee", amount: fees.processing }] : []),
        ]}
        visaTypeName={selVT?.name || ""} applicantName={`${form.first_name} ${form.last_name}`}
        referenceNumber={application?.reference_number} />

      <VisaAssistant open={showAssistant} onClose={() => setShowAssistant(false)}
        onSelectVisa={(id) => { set("visa_type_id", id); const std = serviceTiers.find((t) => t.code === "standard"); if (std) set("service_tier_id", std.id.toString()); setShowEntryTypeModal(true); }}
        visaTypes={visaTypes} />

      {/* Application Completion Popup */}
      {showCompletionPopup && application && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCompletionPopup(false)} />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setShowCompletionPopup(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-surface/50 transition-colors"
            >
              <X size={20} className="text-text-muted" />
            </button>

            {/* Content */}
            <div className="p-6 text-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle size={32} className="text-white" />
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-text-primary mb-2">
                Application Submitted Successfully!
              </h2>

              {/* Message */}
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                Congratulations! Your visa application has been submitted and is now under review.
                You can track the status of your application and view all details in your dashboard.
              </p>

              {/* Application Reference */}
              <div className="bg-surface rounded-xl p-4 mb-6">
                <p className="text-xs text-text-muted mb-1">Application Reference</p>
                <p className="text-lg font-bold text-accent">{application.reference_number}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    router.push(`/dashboard/applicant/applications/${application.id}`);
                    setShowCompletionPopup(false);
                  }}
                  className="bg-accent hover:bg-accent-dark shadow-lg"
                >
                  View Application Details
                </Button>
                <Button
                  onClick={() => {
                    router.push("/dashboard/applicant");
                    setShowCompletionPopup(false);
                  }}
                  className="border border-border hover:bg-surface bg-white text-text-primary"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

export default function NewApplicationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>}>
      <NewApplicationPageInner />
    </Suspense>
  );
}
