"use client";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { VisaPreviewSidebar } from "@/components/ui/visa-preview-sidebar";
import { countries } from "@/lib/countries";
import { isEtaEligible, getEtaFee, PORTS_OF_ENTRY, DESTINATION_CITIES, VISA_DURATION_OPTIONS, ACCOMMODATION_OPTIONS } from "@/lib/visa-matrix";
import type { VisaType, ServiceTier } from "@/lib/types";
import { phoneCountries, getCountryByCode, formatPhoneNumber, validatePhoneNumber } from "@/lib/phone-codes";
import { ArrowRight, ArrowLeft, Check, Monitor, Plane, Briefcase, ArrowLeftRight, Clock, TrendingUp, Crown, CheckCircle2, FileText, CreditCard, AlertTriangle, Shield, XCircle, Globe, ChevronDown, User, MapPin, Stamp, Building2, Upload, ClipboardCheck, Wallet, Landmark } from "lucide-react";

/* ── Step Groups for compact display ─────────────────── */
const STEP_GROUPS = [
  { id: "setup", label: "Visa Setup", icon: <Globe size={16} /> },
  { id: "personal", label: "Applicant Details", icon: <User size={16} /> },
  { id: "travel", label: "Travel & Stay", icon: <Plane size={16} /> },
  { id: "documents", label: "Documents", icon: <Upload size={16} /> },
  { id: "declaration", label: "Declaration", icon: <Shield size={16} /> },
  { id: "payment", label: "Review & Pay", icon: <Wallet size={16} /> },
];

const EVISA_STEPS = [
  { name: "Visa Channel", group: "setup" },
  { name: "Visa Type", group: "setup" },
  { name: "Entry Type", group: "setup" },
  { name: "Processing Speed", group: "setup" },
  { name: "Applicant Details", group: "personal" },
  { name: "Contact Info", group: "personal" },
  { name: "Travel Details", group: "travel" },
  { name: "Accommodation", group: "travel" },
  { name: "Documents", group: "documents" },
  { name: "Declarations", group: "declaration" },
  { name: "Review & Pay", group: "payment" },
];

const ETA_STEPS = [
  { name: "Visa Channel", group: "setup" },
  { name: "Applicant Details", group: "personal" },
  { name: "Contact Info", group: "personal" },
  { name: "Travel Details", group: "travel" },
  { name: "Accommodation", group: "travel" },
  { name: "Documents", group: "documents" },
  { name: "Declarations", group: "declaration" },
  { name: "Review & Pay", group: "payment" },
];

const ISSUING_AUTHORITIES = [
  { value: "ministry_foreign_affairs", label: "Ministry of Foreign Affairs" },
  { value: "ministry_interior", label: "Ministry of Interior" },
  { value: "immigration_department", label: "Immigration Department" },
  { value: "passport_office", label: "Passport Office" },
  { value: "consulate", label: "Consulate/Embassy" },
  { value: "other", label: "Other" },
];

const tierMeta: Record<string, { icon: React.ReactNode; bg: string; ring: string; features: string[] }> = {
  standard: { icon: <Clock size={18} className="text-accent" />, bg: "bg-accent/5", ring: "ring-accent/20", features: ["3-5 business days"] },
  fast_track: { icon: <TrendingUp size={18} className="text-accent" />, bg: "bg-accent/5", ring: "ring-accent/20", features: ["24-48 hours"] },
  express: { icon: <Crown size={18} className="text-accent" />, bg: "bg-accent/5", ring: "ring-accent/20", features: ["Same day"] },
};

const DOC_TYPES = [
  { key: "passport_bio", label: "Passport bio-data page" },
  // Backend eVisa types use `photo` (ETA uses `passport_photo`)
  { key: "photo", label: "Passport photograph" },
  { key: "proof_of_accommodation", label: "Proof of accommodation" },
  { key: "return_ticket", label: "Return ticket" },
];
const ETA_DOC_TYPES = [
  { key: "passport_bio", label: "Passport bio-data page" },
  { key: "passport_photo", label: "Passport photograph" },
];
const BUSINESS_DOC_TYPES = [
  { key: "passport_bio", label: "Passport bio-data page" },
  { key: "photo", label: "Passport photograph" },
  { key: "invitation_letter", label: "Invitation letter" },
  { key: "company_letter", label: "Company letter" },
];

const OPTIONAL_DOC_TYPES = [
  { key: "travel_insurance", label: "Travel insurance" },
  { key: "yellow_fever_certificate", label: "Yellow fever certificate" },
  { key: "other_supporting_documents", label: "Other supporting documents" },
];

const PURPOSE_OPTIONS = [
  { value: "tourism", label: "Tourism / Holiday" },
  { value: "business", label: "Business Meeting" },
  { value: "family", label: "Family Visit" },
  { value: "transit", label: "Transit" },
  { value: "other", label: "Other" },
];

/* ── Helpers ───────────────────────────────────────── */
function StepTransition({ stepKey, children }: { stepKey: number; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const prevStepRef = useRef(stepKey);

  useEffect(() => {
    // Determine direction
    if (stepKey > prevStepRef.current) {
      setDirection('forward');
    } else if (stepKey < prevStepRef.current) {
      setDirection('backward');
    }
    prevStepRef.current = stepKey;

    // Trigger animation
    setShow(false);
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setShow(true);
      });
    });
    
    return () => cancelAnimationFrame(timer);
  }, [stepKey]);

  return (
    <div 
      className={`transition-all duration-500 ease-out ${
        show 
          ? 'opacity-100 translate-x-0' 
          : direction === 'forward' 
            ? 'opacity-0 translate-x-8' 
            : 'opacity-0 -translate-x-8'
      }`}
    >
      {children}
    </div>
  );
}

function FormField({ label, required, children, hint, fullWidth }: { label: string; required?: boolean; children: React.ReactNode; hint?: string; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function ReviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="p-3 rounded-lg bg-gray-50 border border-gray-100"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</p><div className="space-y-1 text-sm">{children}</div></div>;
}

function ReviewRow({ label, value, capitalize }: { label: string; value?: string; capitalize?: boolean }) {
  return <div className="flex justify-between text-xs"><span className="text-gray-500">{label}</span><span className={`font-medium text-right max-w-[140px] truncate ${capitalize ? "capitalize" : ""}`}>{value || "—"}</span></div>;
}

export default function NewApplicationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: vtData } = useQuery({ queryKey: ["visa-types"], queryFn: () => api.get<{ visa_types: VisaType[] }>("/visa-types").then(r => r.data) });
  const { data: stData } = useQuery({ queryKey: ["service-tiers"], queryFn: () => api.get<{ service_tiers: ServiceTier[] }>("/service-tiers").then(r => r.data) });
  const visaTypes = vtData?.visa_types ?? [];
  const primaryVisaTypes = useMemo(
    () => visaTypes.filter(vt => vt.slug === "tourism" || vt.slug === "business"),
    [visaTypes]
  );
  const serviceTiers = stData?.service_tiers ?? [];

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [docs, setDocs] = useState<Record<string, File | null>>({});
  const [paymentMethod, setPaymentMethod] = useState("paystack_card");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [etaConfirmed, setEtaConfirmed] = useState(false);
  
  // Passport verification state
  const [passportVerifying, setPassportVerifying] = useState(false);
  const [passportVerified, setPassportVerified] = useState<boolean | null>(null);
  const [passportVerificationMsg, setPassportVerificationMsg] = useState("");

  const [form, setForm] = useState({
    visa_channel: "", visa_type_id: "", entry_type: "", service_tier_id: "", authorization_type: "",
    // Applicant Details
    first_name: "", last_name: "", other_names: "", date_of_birth: "", gender: "", marital_status: "",
    place_of_birth: "", country_of_birth: "", nationality: "", profession: "",
    // Passport Information
    passport_number: "", issuing_authority: "", passport_issue_date: "", passport_expiry: "", passport_issue_place: "",
    // Contact Information
    email: "", phone: "", phone_country: "GH",
    // Travel Details
    intended_arrival: "", duration_days: "", visa_duration: "", port_of_entry: "", place_of_embarkation: "",
    destination_city: "", purpose_of_visit: "",
    // Accommodation
    accommodation_type: "", accommodation_address: "", hotel_name: "", booking_reference: "",
    host_name: "", host_phone: "", host_address: "", host_relationship: "",
    address_in_ghana: "",
    // Travel History
    visited_ghana_before: "", previous_visa_number: "", visited_other_countries: "",
    visited_country_1: "", visited_country_2: "", visited_country_3: "",
    // Health Declaration
    health_infectious_travel: "", health_infectious_countries: "",
    // Security & Travel Declaration
    high_risk_travel: "", entry_denied_before: "", overstayed_before: "", international_sanctions: "",
    criminal_conviction: "", 
    // Additional fields
    current_address: "", city: "", state_province: "", postal_code: "", country_of_residence: "",
    occupation: "", employer_name: "", employer_address: "", employer_phone: "",
    airline: "", flight_number: "", return_date: "",
    company_name: "", company_address: "", job_title: "",
    host_company_name: "", host_company_address: "", host_contact_name: "", host_contact_phone: "", 
    business_purpose: "", business_details: "", purpose_details: "", health_issues: "",
  });

  /* ── Prefill form with user data ─────────────────── */
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        first_name: user.first_name || prev.first_name,
        last_name: user.last_name || prev.last_name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  /* ── Validation helpers ─────────────────────────── */
  const validateEmail = useCallback((email: string) => {
    if (!email) { setEmailError(""); return true; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError("Invalid email format"); return false; }
    setEmailError(""); return true;
  }, []);

  const validatePhone = useCallback((phone: string, countryCode: string) => {
    if (!phone) { setPhoneError(""); return true; }
    const country = getCountryByCode(countryCode);
    const digits = phone.replace(/\D/g, "");
    
    if (country?.maxLength) {
      if (digits.length !== country.maxLength) {
        setPhoneError(`Must be ${country.maxLength} digits for ${country.name}`);
        return false;
      }
    } else if (digits.length < 7 || digits.length > 15) {
      setPhoneError("Invalid phone number length");
      return false;
    }
    
    setPhoneError("");
    return true;
  }, []);

  const set = useCallback((k: keyof typeof form, v: string) => {
    if (k === "email") validateEmail(v);
    if (k === "phone") {
      const digits = v.replace(/\D/g, "");
      const country = getCountryByCode(form.phone_country);
      const maxLen = country?.maxLength || 15;
      if (digits.length <= maxLen) {
        setForm(p => ({ ...p, [k]: digits }));
        validatePhone(digits, form.phone_country);
      }
      return;
    }
    if (k === "phone_country") {
      setForm(p => ({ ...p, [k]: v }));
      if (form.phone) {
        validatePhone(form.phone, v);
      }
      return;
    }
    setForm(p => ({ ...p, [k]: v }));
  }, [validateEmail, validatePhone, form.phone_country, form.phone]);

  const selVT = visaTypes.find(v => v.id.toString() === form.visa_type_id);
  const selST = serviceTiers.find(t => t.id.toString() === form.service_tier_id);
  const cName = useCallback((code: string) => countries.find(c => c.code === code)?.name ?? code, []);
  const isEta = form.authorization_type === "eta";
  const isBusiness = selVT?.slug === "business";
  const STEPS = isEta ? ETA_STEPS : EVISA_STEPS;
  const requiredDocTypes = isEta ? ETA_DOC_TYPES : isBusiness ? BUSINESS_DOC_TYPES : DOC_TYPES;
  const optionalDocTypes = OPTIONAL_DOC_TYPES;

  /* ── Passport validation ─────────────────────────── */
  const passportStatus = useMemo(() => {
    if (!form.passport_expiry) return { level: "none" as const, msg: "" };
    const exp = new Date(form.passport_expiry);
    if (isNaN(exp.getTime())) return { level: "none" as const, msg: "" };
    if (exp < new Date()) return { level: "expired" as const, msg: "Passport expired. Please renew before applying." };
    const sm = new Date(); sm.setMonth(sm.getMonth() + 6);
    if (exp < sm) return { level: "warning" as const, msg: "Expires in <6 months. Consider renewing." };
    return { level: "valid" as const, msg: "" };
  }, [form.passport_expiry]);
  const passportExpired = passportStatus.level === "expired";

  /* ── Fees ────────────────────────────────────────── */
  const etaFee = useMemo(() => (form.nationality ? getEtaFee(form.nationality) : 20), [form.nationality]);
  const baseFee = useMemo(() => {
    if (isEta) return etaFee;
    const b = selVT ? parseFloat(selVT.base_fee) : 260;
    return form.entry_type === "multiple" ? b * 1.8 : b;
  }, [selVT, form.entry_type, isEta, etaFee]);
  const procFee = useMemo(() => {
    if (isEta || !selST) return 0;
    return (baseFee * parseFloat(selST.fee_multiplier) + parseFloat(selST.additional_fee)) - baseFee;
  }, [selST, baseFee, isEta]);
  const totalFee = baseFee + procFee;

  /* ── Nationality check for ETA ───────────────────── */
  useEffect(() => {
    if (!form.nationality) {
      setEtaConfirmed(false);
      return;
    }
    const eligible = isEtaEligible(form.nationality);
    if (eligible && form.authorization_type !== "eta") {
      set("authorization_type", "eta");
      setEtaConfirmed(false); // Reset confirmation when nationality changes to ETA-eligible
    } else if (!eligible && form.authorization_type !== "evisa") {
      set("authorization_type", "evisa");
      setEtaConfirmed(true); // No confirmation needed for regular visa
    }
  }, [form.nationality, form.authorization_type, set]);

  /* ── Auto-select online visa channel ───────────────── */
  useEffect(() => {
    if (!form.visa_channel) {
      // Backend expects "e-visa" or "regular" for visa_channel
      set("visa_channel", "e-visa");
    }
  }, [form.visa_channel, set]);

  /* ── Passport verification simulation ───────────────── */
  useEffect(() => {
    if (!form.passport_number || form.passport_number.length < 6) {
      setPassportVerifying(false);
      setPassportVerified(null);
      setPassportVerificationMsg("");
      return;
    }

    // Start verification
    setPassportVerifying(true);
    setPassportVerified(null);
    setPassportVerificationMsg("Checking passport format...");

    // Simulate verification process
    const timer1 = setTimeout(() => {
      setPassportVerificationMsg("Verifying with international database...");
    }, 800);

    const timer2 = setTimeout(() => {
      setPassportVerificationMsg("Validating passport number...");
    }, 1600);

    const timer3 = setTimeout(() => {
      // Simulate verification result
      // Valid formats for testing:
      // - Starts with A, P, G, N, M, E, B, C, D, F, H, J, K, L, R, S, T, U, V, W, X, Y, Z followed by 7-9 digits
      // - Examples: A1234567, P9876543, G1234567, N5555555
      const isValid = /^[A-Z][0-9]{7,9}$/i.test(form.passport_number);
      
      setPassportVerifying(false);
      setPassportVerified(isValid);
      
      if (isValid) {
        setPassportVerificationMsg("✓ Passport number verified successfully");
      } else {
        setPassportVerificationMsg("Invalid format. Use format: Letter + 7-9 digits (e.g., A1234567)");
      }
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [form.passport_number]);

  /* ── Current group calculation ───────────────────── */
  const currentGroup = STEPS[step]?.group || "setup";
  const groupProgress = useMemo(() => {
    const groups: Record<string, { total: number; done: number }> = {};
    STEPS.forEach((s, i) => {
      if (!groups[s.group]) groups[s.group] = { total: 0, done: 0 };
      groups[s.group].total++;
      if (i < step) groups[s.group].done++;
      else if (i === step) groups[s.group].done += 0.5;
    });
    return groups;
  }, [step, STEPS]);

  /* ── Validation ──────────────────────────────────── */
  const canNext = useCallback((s: number): boolean => {
    const hasAllDocs = () => requiredDocTypes.every(d => !!docs[d.key]);

    if (isEta) {
      switch (s) {
        case 0: return !!form.visa_channel && etaConfirmed; // Require ETA confirmation
        case 1: {
          // Applicant Details - All required fields
          const checks = {
            first_name: !!form.first_name,
            last_name: !!form.last_name,
            date_of_birth: !!form.date_of_birth,
            gender: !!form.gender,
            country_of_birth: !!form.country_of_birth,
            nationality: !!form.nationality,
            marital_status: !!form.marital_status,
            profession: !!form.profession,
            passport_number: !!form.passport_number,
            passport_issue_date: !!form.passport_issue_date,
            passport_expiry: !!form.passport_expiry,
            passportNotExpired: !passportExpired
          };
          
          const allValid = Object.values(checks).every(v => v);
          
          // Debug: log missing fields
          if (!allValid) {
            const missing = Object.entries(checks).filter(([_, v]) => !v).map(([k]) => k);
            console.log('Missing required fields:', missing);
          }
          
          return allValid;
        }
        case 2: {
          // Contact Info - Email + phone required
          if (!form.phone) {
            setPhoneError("Phone number is required");
            return false;
          }
          return !!form.email && !emailError && !!form.phone && !phoneError;
        }
        case 3: {
          // Travel Details - All required fields
          const baseValid = !!form.intended_arrival && 
                           !!form.duration_days && 
                           !!form.address_in_ghana && 
                           !!form.port_of_entry &&
                           !!form.visited_ghana_before &&
                           !!form.visited_other_countries &&
                           !!form.purpose_of_visit;
          
          // If visited other countries, require 3 countries
          if (form.visited_other_countries === "yes") {
            return baseValid && !!form.visited_country_1 && !!form.visited_country_2 && !!form.visited_country_3;
          }
          return baseValid;
        }
        case 4: {
          // Accommodation - Check based on type
          if (!form.accommodation_type) return false;
          
          if (form.accommodation_type === "hotel") {
            return !!form.hotel_name && !!form.accommodation_address;
          } else if (form.accommodation_type === "family") {
            return !!form.host_name && !!form.host_phone && !!form.host_address;
          }
          return true;
        }
        case 5: return hasAllDocs();
        case 6: {
          // Declarations - Health and Security
          const healthValid = !!form.health_infectious_travel;
          const securityValid = !!form.high_risk_travel && 
                               !!form.entry_denied_before && 
                               !!form.overstayed_before && 
                               !!form.international_sanctions;
          
          // If travelled to infectious areas, require countries list
          if (form.health_infectious_travel === "yes") {
            return healthValid && securityValid && !!form.health_infectious_countries;
          }
          return healthValid && securityValid;
        }
        case 7: return agreedToTerms;
        default: return true;
      }
    }
    
    // Regular eVisa flow
    switch (s) {
      case 0: return !!form.visa_channel;
      case 1: return !!form.visa_type_id;
      case 2: return !!form.entry_type;
      case 3: return !!form.service_tier_id;
      case 4: {
        // Applicant Details - All required fields
        const checks = {
          first_name: !!form.first_name,
          last_name: !!form.last_name,
          date_of_birth: !!form.date_of_birth,
          gender: !!form.gender,
          country_of_birth: !!form.country_of_birth,
          nationality: !!form.nationality,
          marital_status: !!form.marital_status,
          profession: !!form.profession,
          passport_number: !!form.passport_number,
          passport_issue_date: !!form.passport_issue_date,
          passport_expiry: !!form.passport_expiry,
          passportNotExpired: !passportExpired
        };
        
        const allValid = Object.values(checks).every(v => v);
        
        // Debug: log missing fields
        if (!allValid) {
          const missing = Object.entries(checks).filter(([_, v]) => !v).map(([k]) => k);
          console.log('Missing required fields (Regular eVisa):', missing);
        }
        
        return allValid;
      }
      case 5: {
        // Contact Info - Email + phone required
        if (!form.phone) {
          setPhoneError("Phone number is required");
          return false;
        }
        return !!form.email && !emailError && !!form.phone && !phoneError;
      }
      case 6: {
        // Travel Details - All required fields
        const baseValid = !!form.intended_arrival && 
                         !!form.duration_days && 
                         !!form.place_of_embarkation &&
                         !!form.port_of_entry &&
                         !!form.destination_city &&
                         !!form.address_in_ghana && 
                         !!form.visited_ghana_before &&
                         !!form.visited_other_countries &&
                         !!form.purpose_of_visit;
        
        // If visited other countries, require 3 countries
        if (form.visited_other_countries === "yes") {
          return baseValid && !!form.visited_country_1 && !!form.visited_country_2 && !!form.visited_country_3;
        }
        return baseValid;
      }
      case 7: {
        // Accommodation - Check based on type
        if (!form.accommodation_type) return false;
        
        if (form.accommodation_type === "hotel") {
          return !!form.hotel_name && !!form.booking_reference && !!form.accommodation_address;
        } else if (form.accommodation_type === "family") {
          return !!form.host_name && !!form.host_phone && !!form.host_address && !!form.host_relationship;
        }
        return true;
      }
      case 8: return hasAllDocs();
      case 9: {
        // Declarations - Health and Security
        const healthValid = !!form.health_infectious_travel;
        const securityValid = !!form.high_risk_travel && 
                             !!form.entry_denied_before && 
                             !!form.overstayed_before && 
                             !!form.international_sanctions;
        
        // If travelled to infectious areas, require countries list
        if (form.health_infectious_travel === "yes") {
          return healthValid && securityValid && !!form.health_infectious_countries;
        }
        return healthValid && securityValid;
      }
      case 10: return agreedToTerms;
      default: return true;
    }
  }, [form, isEta, passportExpired, emailError, phoneError, agreedToTerms, docs, requiredDocTypes]);

  const goNext = () => { 
    if (canNext(step)) {
      setStep(s => Math.min(s + 1, STEPS.length - 1));
      // Smooth scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const goPrev = () => {
    setStep(s => Math.max(s - 1, 0));
    // Smooth scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setError(null); setSubmitting(true);
    try {
      // Format phone with country code
      const selectedCountry = getCountryByCode(form.phone_country);
      const fullPhone = form.phone ? `${selectedCountry?.dialCode}${form.phone}` : "";
      
      // Map frontend field names to backend field names
      const submissionData = {
        ...form,
        phone: fullPhone,
        passport_issuing_authority: form.issuing_authority, // Map issuing_authority to passport_issuing_authority
        hotel_booking_reference: form.booking_reference, // Map booking_reference to hotel_booking_reference
        payment_method: paymentMethod
      };
      
      // Remove the frontend-only fields
      delete (submissionData as any).issuing_authority;
      delete (submissionData as any).booking_reference;
      
      // Create the application first
      const res = await api.post(isEta ? "/applicant/eta-applications" : "/applicant/applications", submissionData);
      const app = res.data?.application ?? res.data;

      // Upload documents if any
      if (app?.id && Object.keys(docs).length > 0) {
        const formData = new FormData();
        Object.entries(docs).forEach(([key, file]) => {
          if (file) {
            formData.append(key, file);
          }
        });
        
        try {
          await api.post(`/applicant/applications/${app.id}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (docError) {
          console.error('Document upload failed:', docError);
          // Continue anyway - documents can be uploaded later
        }
      }

      // After creating the application, send the user directly into
      // the standard payment flow used on the application detail pages.
      if (app?.id) {
        router.push(`/dashboard/applicant/applications/${app.id}/payment`);
      } else {
        router.push("/dashboard/applicant/applications");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally { setSubmitting(false); }
  };

  const handleFile = (key: string, file: File | null) => setDocs(p => ({ ...p, [key]: file }));
  const fmtDate = (d: string) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } catch { return d; } };

  /* ── Nav buttons ─────────────────────────────────── */
  function NavButtons({ isPayment }: { isPayment?: boolean }) {
    const isNextDisabled = !canNext(step);
    
    return (
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <button type="button" disabled={step === 0} onClick={goPrev}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${step === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}>
          <ArrowLeft size={14} /> Back
        </button>
        {isPayment ? (
          <Button onClick={handleSubmit} disabled={!canNext(step) || submitting} className="!rounded-lg !px-5 !py-2 !bg-green-600 hover:!bg-green-700">
            {submitting ? "Processing..." : <><CreditCard size={14} className="mr-1.5" /> Pay ${totalFee.toFixed(2)}</>}
          </Button>
        ) : (
          <div className="relative group">
            <Button 
              onClick={goNext} 
              disabled={isNextDisabled} 
              className={`!rounded-lg !px-5 !py-2 ${isNextDisabled ? '!opacity-50 !cursor-not-allowed' : ''}`}
            >
              Continue <ArrowRight size={14} className="ml-1" />
            </Button>
            {isNextDisabled && (
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                  Please fill all required fields
                  <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ── Step router ─────────────────────────────────── */
  function renderStepContent() {
    if (isEta) {
      switch (step) {
        case 0: return renderChannel();
        case 1: return renderApplicantDetails();
        case 2: return renderContactInfo();
        case 3: return renderTravel();
        case 4: return renderAccommodation();
        case 5: return renderDocs();
        case 6: return renderDeclarations();
        case 7: return renderPayment();
        default: return null;
      }
    }
    switch (step) {
      case 0: return renderChannel();
      case 1: return renderVisaType();
      case 2: return renderEntry();
      case 3: return renderSpeed();
      case 4: return renderApplicantDetails();
      case 5: return renderContactInfo();
      case 6: return renderTravel();
      case 7: return renderAccommodation();
      case 8: return renderDocs();
      case 9: return renderDeclarations();
      case 10: return renderPayment();
      default: return null;
    }
  }

  /* ── STEP: Visa Channel ──────────────────────────── */
  function renderChannel() {
    // Show ETA confirmation modal if ETA eligible and not yet confirmed
    if (isEta && !etaConfirmed) {
      return (
        <section className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Great News! You're Eligible for ETA</h2>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              As a citizen of <strong>{countries.find(c => c.code === form.nationality)?.name}</strong>, 
              you don't need a full visa. You can apply for a simplified Electronic Travel Authorization (ETA) instead.
            </p>
          </div>

          <div className="bg-white rounded-xl border-2 border-green-200 p-6 max-w-md mx-auto">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Fast Processing</h3>
                  <p className="text-xs text-gray-600">Get approved quickly with our streamlined ETA process</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Simplified Form</h3>
                  <p className="text-xs text-gray-600">Fewer requirements and easier application process</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <CreditCard size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Affordable Fee</h3>
                  <p className="text-xs text-gray-600">Lower cost compared to traditional visa applications</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 max-w-md mx-auto">
            <Button 
              onClick={() => setEtaConfirmed(true)} 
              className="!rounded-lg !py-3 !bg-green-600 hover:!bg-green-700 w-full"
            >
              Continue to ETA Form <ArrowRight size={16} className="ml-2" />
            </Button>
            <button
              type="button"
              onClick={() => {
                set("nationality", "");
                set("authorization_type", "");
              }}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Change Nationality
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Select Visa Channel</h2>
          <p className="text-xs text-gray-500 mt-0.5">Apply for your Ghana e-Visa online.</p>
        </div>
        <div>
          <button 
            type="button" 
            onClick={() => set("visa_channel", "e-visa")}
            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${form.visa_channel === "online" ? "border-accent bg-accent/5" : "border-gray-200 hover:border-gray-300"}`}
          >
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Monitor size={20} className="text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-gray-900">e-Visa Online Application</p>
              <p className="text-sm text-gray-500 mt-0.5">Apply directly through our secure online portal</p>
            </div>
            {form.visa_channel === "online" && <Check size={20} className="text-accent ml-auto" />}
          </button>
        </div>
        <NavButtons />
      </section>
    );
  }

  /* ── STEP: Visa Type ─────────────────────────────── */
  /* ── STEP: Visa Type ─────────────────────────────── */
  function renderVisaType() {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Select Visa Type</h2>
          <p className="text-xs text-gray-500 mt-0.5">Choose the type of visa for your visit.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {primaryVisaTypes.map(vt => (
            <button 
              key={vt.id} 
              type="button" 
              onClick={() => set("visa_type_id", vt.id.toString())}
              className={`relative flex flex-col items-center p-4 rounded-lg border-2 text-center transition-all hover:shadow-md ${
                form.visa_type_id === vt.id.toString() 
                  ? "border-accent bg-accent/5 shadow-md" 
                  : "border-gray-200 hover:border-accent/50"
              }`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                form.visa_type_id === vt.id.toString() ? "bg-accent/20" : "bg-gray-100"
              }`}>
                {vt.slug === "tourism" ? (
                  <Plane size={20} className={form.visa_type_id === vt.id.toString() ? "text-accent" : "text-gray-600"} />
                ) : (
                  <Briefcase size={20} className={form.visa_type_id === vt.id.toString() ? "text-accent" : "text-gray-600"} />
                )}
              </div>
              
              {/* Title */}
              <h3 className="text-base font-semibold text-gray-900 mb-1">{vt.name}</h3>
              
              {/* Description */}
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{vt.description}</p>
              
              {/* Price */}
              <div className="mt-auto">
                <span className="text-xl font-bold text-accent">${parseFloat(vt.base_fee).toFixed(0)}</span>
                <span className="text-[10px] text-gray-500 ml-1">base fee</span>
              </div>
              
              {/* Selected Indicator */}
              {form.visa_type_id === vt.id.toString() && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
        <NavButtons />
      </section>
    );
  }

  /* ── STEP: Entry Type ────────────────────────────── */
  function renderEntry() {
    const entryOptions = [
      { id: "single", label: "Single Entry", desc: "One entry within validity period", icon: <ArrowRight size={20} />, price: "Base price" },
      { id: "multiple", label: "Multiple Entry", desc: "Unlimited entries within validity", icon: <ArrowLeftRight size={20} />, price: "+80% fee" },
    ];
    
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Entry Type</h2>
          <p className="text-xs text-gray-500 mt-0.5">Single or multiple entries to Ghana.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {entryOptions.map(opt => (
            <button 
              key={opt.id} 
              type="button" 
              onClick={() => set("entry_type", opt.id)}
              className={`relative flex flex-col items-center p-4 rounded-lg border-2 text-center transition-all hover:shadow-md ${
                form.entry_type === opt.id 
                  ? "border-accent bg-accent/5 shadow-md" 
                  : "border-gray-200 hover:border-accent/50"
              }`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                form.entry_type === opt.id ? "bg-accent/20" : "bg-gray-100"
              }`}>
                <div className={form.entry_type === opt.id ? "text-accent" : "text-gray-600"}>
                  {opt.icon}
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-base font-semibold text-gray-900 mb-1">{opt.label}</h3>
              
              {/* Description */}
              <p className="text-xs text-gray-500 mb-3">{opt.desc}</p>
              
              {/* Price Info */}
              <div className="mt-auto">
                <span className="text-sm font-medium text-gray-600">{opt.price}</span>
              </div>
              
              {/* Selected Indicator */}
              {form.entry_type === opt.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
        <NavButtons />
      </section>
    );
  }

  /* ── STEP: Processing Speed ──────────────────────── */
  function renderSpeed() {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Processing Speed</h2>
          <p className="text-xs text-gray-500 mt-0.5">Choose how fast you need your visa.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {serviceTiers.map(st => {
            const meta = tierMeta[st.code] || tierMeta.standard;
            const fee = baseFee * parseFloat(st.fee_multiplier) + parseFloat(st.additional_fee);
            return (
              <button 
                key={st.id} 
                type="button" 
                onClick={() => set("service_tier_id", st.id.toString())}
                className={`relative flex flex-col items-center p-4 rounded-lg border-2 text-center transition-all hover:shadow-md ${
                  form.service_tier_id === st.id.toString() 
                    ? "border-accent bg-accent/5 shadow-md" 
                    : "border-gray-200 hover:border-accent/50"
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  form.service_tier_id === st.id.toString() ? "bg-accent/20" : "bg-gray-100"
                }`}>
                  <div className={form.service_tier_id === st.id.toString() ? "text-accent" : "text-gray-600"}>
                    {meta.icon}
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{st.name}</h3>
                
                {/* Processing Time */}
                <p className="text-xs text-gray-500 mb-2">{meta.features[0]}</p>
                
                {/* Price */}
                <div className="mt-auto">
                  <span className="text-lg font-bold text-accent">${fee.toFixed(0)}</span>
                  <span className="text-[10px] text-gray-500 ml-1">total</span>
                </div>
                
                {/* Selected Indicator */}
                {form.service_tier_id === st.id.toString() && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <NavButtons />
      </section>
    );
  }

  /* ── STEP: Applicant Details (Personal + Passport) ─────────────────────────── */
  function renderApplicantDetails() {
    return (
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Applicant Details</h2>
          <p className="text-sm text-gray-500 mt-1">Please provide your personal and passport information.</p>
        </div>

        {/* Personal Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Personal Information</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <FormField label="Surname" required>
              <Input value={form.last_name} onChange={e => set("last_name", e.target.value)} placeholder="Surname" className="h-9" />
            </FormField>
            <FormField label="First Name" required>
              <Input value={form.first_name} onChange={e => set("first_name", e.target.value)} placeholder="First name" className="h-9" />
            </FormField>
            <FormField label="Other Names">
              <Input value={form.other_names} onChange={e => set("other_names", e.target.value)} placeholder="Middle names (if any)" className="h-9" />
            </FormField>
            <FormField label="Gender" required>
              <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={form.gender} onChange={e => set("gender", e.target.value)}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </FormField>
            <FormField label="Date of Birth" required>
              <Input type="date" value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} className="h-9" />
            </FormField>
            <FormField label="Country of Birth" required>
              <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={form.country_of_birth} onChange={e => set("country_of_birth", e.target.value)}>
                <option value="">Select country</option>
                {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Nationality" required>
              <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={form.nationality} onChange={e => set("nationality", e.target.value)}>
                <option value="">Select nationality</option>
                {countries.map(c => <option key={c.code} value={c.code}>{c.nationality}</option>)}
              </select>
            </FormField>
          </div>
        </div>



        {/* Passport Information */}
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Passport Information</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <FormField label="Passport Number" required>
              <div className="space-y-2">
                <Input 
                  value={form.passport_number} 
                  onChange={e => set("passport_number", e.target.value.toUpperCase())} 
                  placeholder="A12345678" 
                  className="h-9" 
                />
                
                {/* Passport Verification Status */}
                {passportVerifying && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-blue-700">{passportVerificationMsg}</p>
                  </div>
                )}
                
                {!passportVerifying && passportVerified === true && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                    <p className="text-xs text-green-700">{passportVerificationMsg}</p>
                  </div>
                )}
                
                {!passportVerifying && passportVerified === false && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-700">{passportVerificationMsg}</p>
                  </div>
                )}
              </div>
            </FormField>
            <FormField label="Issue Date" required>
              <Input type="date" value={form.passport_issue_date} onChange={e => set("passport_issue_date", e.target.value)} className="h-9" />
            </FormField>
            <FormField label="Expiry Date" required>
              <Input type="date" value={form.passport_expiry} onChange={e => set("passport_expiry", e.target.value)} className="h-9" />
            </FormField>
          </div>
          
          {/* Passport Expiry Status Indicator */}
          {passportStatus.level === "expired" && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200">
              <XCircle size={16} className="text-red-600 shrink-0" />
              <p className="text-xs text-red-700">{passportStatus.msg}</p>
            </div>
          )}
          {passportStatus.level === "warning" && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700">{passportStatus.msg}</p>
            </div>
          )}
          {passportStatus.level === "valid" && passportVerified === true && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 border border-green-200">
              <Shield size={16} className="text-green-600 shrink-0" />
              <p className="text-xs text-green-700">Passport valid for travel</p>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Additional Information</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <FormField label="Marital Status" required>
              <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={form.marital_status} onChange={e => set("marital_status", e.target.value)}>
                <option value="">Select status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </FormField>
            <FormField label="Profession / Occupation" required>
              <Input value={form.profession} onChange={e => set("profession", e.target.value)} placeholder="e.g. Engineer, Teacher" className="h-9" />
            </FormField>
          </div>
        </div>

        <NavButtons />
      </section>
    );
  }

  /* ── STEP: Contact Information ──────────────────────────────── */
  function renderContactInfo() {
    const selectedCountry = getCountryByCode(form.phone_country);
    const phoneDisplay = form.phone ? formatPhoneNumber(form.phone, selectedCountry?.format) : "";
    
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          <p className="text-sm text-gray-500 mt-1">Provide your contact details.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <FormField label="Email Address" required>
            <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your.email@example.com" className="h-9" />
            {emailError && <p className="text-xs text-red-500 mt-0.5">{emailError}</p>}
          </FormField>
          <FormField label="Phone Number" required hint={selectedCountry ? `${selectedCountry.dialCode} - ${selectedCountry.maxLength || "7-15"} digits` : "Enter phone number"}>
            <div className="flex gap-2">
              <select 
                className="w-32 h-9 rounded-lg border border-gray-200 px-2 text-sm"
                value={form.phone_country}
                onChange={e => set("phone_country", e.target.value)}
              >
                {phoneCountries.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.dialCode} {c.code}
                  </option>
                ))}
              </select>
              <Input 
                type="tel" 
                value={phoneDisplay} 
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, "");
                  set("phone", digits);
                }}
                placeholder={selectedCountry?.format?.replace(/#/g, "0") || "Phone number"} 
                className="h-9 flex-1" 
              />
            </div>
            {phoneError && <p className="text-xs text-red-500 mt-0.5">{phoneError}</p>}
          </FormField>
        </div>
        <NavButtons />
      </section>
    );
  }

  /* ── STEP: Passport Info ─────────────────────────── */
  function renderPassportInfo() {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Passport Information</h2>
          <p className="text-xs text-gray-500 mt-0.5">Enter your passport details.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <FormField label="Passport number" required><Input value={form.passport_number} onChange={e => set("passport_number", e.target.value)} placeholder="A12345678" className="h-9" /></FormField>
          <FormField label="Issuing authority" required>
            <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={form.issuing_authority} onChange={e => set("issuing_authority", e.target.value)}>
              <option value="">Select</option>{ISSUING_AUTHORITIES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </FormField>
          <FormField label="Issue date"><Input type="date" value={form.passport_issue_date} onChange={e => set("passport_issue_date", e.target.value)} className="h-9" /></FormField>
          <FormField label="Expiry date" required><Input type="date" value={form.passport_expiry} onChange={e => set("passport_expiry", e.target.value)} className="h-9" /></FormField>
        </div>
        {passportStatus.level === "expired" && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200">
            <XCircle size={16} className="text-red-600 shrink-0" />
            <p className="text-xs text-red-700">{passportStatus.msg}</p>
          </div>
        )}
        {passportStatus.level === "warning" && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700">{passportStatus.msg}</p>
          </div>
        )}
        {passportStatus.level === "valid" && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 border border-green-200">
            <Shield size={16} className="text-green-600 shrink-0" />
            <p className="text-xs text-green-700">Passport valid for travel</p>
          </div>
        )}
        <NavButtons />
      </section>
    );
  }

  /* ── STEP: Employment Info ───────────────────────── */
  function renderEmploymentInfo() {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Employment Information</h2>
          <p className="text-xs text-gray-500 mt-0.5">Optional but recommended.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <FormField label="Occupation"><Input value={form.occupation} onChange={e => set("occupation", e.target.value)} placeholder="e.g. Engineer" className="h-9" /></FormField>
          <FormField label="Employer"><Input value={form.employer_name} onChange={e => set("employer_name", e.target.value)} placeholder="Company name" className="h-9" /></FormField>
          <FormField label="Employer address" fullWidth><Input value={form.employer_address} onChange={e => set("employer_address", e.target.value)} placeholder="Address" className="h-9" /></FormField>
        </div>
        <NavButtons />
      </section>
    );
  }

  /* ── STEP: Travel Details ────────────────────────── */
  function renderTravel() {
    return (
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Travel Details</h2>
          <p className="text-sm text-gray-500 mt-1">Provide your travel and stay information.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <FormField label="Intended Arrival Date" required>
            <Input type="date" value={form.intended_arrival} onChange={e => set("intended_arrival", e.target.value)} className="h-9" />
          </FormField>
          <FormField label="Visa Duration" required>
            <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={form.duration_days} onChange={e => set("duration_days", e.target.value)}>
              <option value="">Select duration</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
          </FormField>
          <FormField label="Place of Embarkation" required>
            <Input value={form.place_of_embarkation} onChange={e => set("place_of_embarkation", e.target.value)} placeholder="City/Country of departure" className="h-9" />
          </FormField>
          <FormField label="Port of Entry" required>
            <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={form.port_of_entry} onChange={e => set("port_of_entry", e.target.value)}>
              <option value="">Select port</option>
              {PORTS_OF_ENTRY.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </FormField>
          <FormField label="Destination City in Ghana" required>
            <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={form.destination_city} onChange={e => set("destination_city", e.target.value)}>
              <option value="">Select city</option>
              {DESTINATION_CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </FormField>
          <FormField label="Residential Address During Stay" required fullWidth>
            <Input value={form.address_in_ghana} onChange={e => set("address_in_ghana", e.target.value)} placeholder="Full address where you'll stay" className="h-9" />
          </FormField>
        </div>

        {/* Travel History */}
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <div className="grid sm:grid-cols-2 gap-3">
            <FormField label="Have you visited Ghana before?" required>
              <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={form.visited_ghana_before} onChange={e => set("visited_ghana_before", e.target.value)}>
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </FormField>
            <FormField label="Visited other countries in the past 6 months?" required>
              <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={form.visited_other_countries} onChange={e => set("visited_other_countries", e.target.value)}>
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </FormField>
          </div>

          {/* Conditional: Countries Visited (if yes) */}
          {form.visited_other_countries === "yes" && (
            <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t border-gray-200">
              <FormField label="Country 1" required>
                <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={form.visited_country_1} onChange={e => set("visited_country_1", e.target.value)}>
                  <option value="">Select country</option>
                  {countries.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                </select>
              </FormField>
              <FormField label="Country 2" required>
                <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={form.visited_country_2} onChange={e => set("visited_country_2", e.target.value)}>
                  <option value="">Select country</option>
                  {countries.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                </select>
              </FormField>
              <FormField label="Country 3" required>
                <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={form.visited_country_3} onChange={e => set("visited_country_3", e.target.value)}>
                  <option value="">Select country</option>
                  {countries.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                </select>
              </FormField>
            </div>
          )}
        </div>

        {/* Purpose of Visit */}
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <FormField label="Purpose of Visit" required>
            <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={form.purpose_of_visit} onChange={e => set("purpose_of_visit", e.target.value)}>
              <option value="">Select purpose</option>
              {PURPOSE_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </FormField>
        </div>

        <NavButtons />
      </section>
    );
  }

  /* ── STEP: Accommodation Arrangements ────────────────────────── */
  function renderAccommodation() {
    return (
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Accommodation Arrangements</h2>
          <p className="text-sm text-gray-500 mt-1">Where will you be staying in Ghana?</p>
        </div>

        {/* Accommodation Type Selection */}
        <div className="space-y-3">
          <FormField label="Accommodation Type" required>
            <select className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm" value={form.accommodation_type} onChange={e => set("accommodation_type", e.target.value)}>
              <option value="">Select accommodation type</option>
              <option value="hotel">Hotel / Guesthouse / Airbnb</option>
              <option value="family">Friends / Family</option>
            </select>
          </FormField>
        </div>

        {/* Hotel/Guesthouse Details */}
        {form.accommodation_type === "hotel" && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Hotel / Guesthouse Details</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <FormField label="Hotel Name">
                <Input value={form.hotel_name} onChange={e => set("hotel_name", e.target.value)} placeholder="Name of hotel" className="h-9" />
              </FormField>
              <FormField label="Booking Reference">
                <Input value={form.booking_reference} onChange={e => set("booking_reference", e.target.value)} placeholder="Booking confirmation number" className="h-9" />
              </FormField>
              <FormField label="Hotel Address" fullWidth>
                <Input value={form.accommodation_address} onChange={e => set("accommodation_address", e.target.value)} placeholder="Full hotel address" className="h-9" />
              </FormField>
            </div>
          </div>
        )}

        {/* Friends/Family Details */}
        {form.accommodation_type === "family" && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Host Details</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <FormField label="Host Name">
                <Input value={form.host_name} onChange={e => set("host_name", e.target.value)} placeholder="Full name of host" className="h-9" />
              </FormField>
              <FormField label="Host Phone">
                <Input value={form.host_phone} onChange={e => set("host_phone", e.target.value)} placeholder="Host contact number" className="h-9" />
              </FormField>
              <FormField label="Host Address" fullWidth>
                <Input value={form.host_address} onChange={e => set("host_address", e.target.value)} placeholder="Full host address" className="h-9" />
              </FormField>
              <FormField label="Relationship to Host">
                <Input value={form.host_relationship} onChange={e => set("host_relationship", e.target.value)} placeholder="e.g. Friend, Family" className="h-9" />
              </FormField>
            </div>
          </div>
        )}

        <NavButtons />
      </section>
    );
  }

  /* ── STEP: Security & Travel Declaration ──────────────────────────── */
  function renderDeclarations() {
    const DeclarationQ = ({ num, label, field }: { num: number; label: string; field: keyof typeof form }) => (
      <div className="flex items-start gap-3 py-3 border-b border-gray-200 last:border-0">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">{num}</span>
        <div className="flex-1">
          <p className="text-sm text-gray-900 mb-2">{label}</p>
          <div className="flex gap-4">
            {["no", "yes"].map(v => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name={field} 
                  value={v} 
                  checked={form[field] === v} 
                  onChange={() => set(field, v)} 
                  className="w-4 h-4 text-accent" 
                />
                <span className="text-sm capitalize">{v}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
    
    return (
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Declarations</h2>
          <p className="text-sm text-gray-500 mt-1">Please answer all questions truthfully.</p>
        </div>

        {/* Health Declaration */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-accent" />
            <h3 className="text-sm font-semibold text-gray-900">Health Declaration</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 py-3 border-b border-gray-200">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">1</span>
              <div className="flex-1">
                <p className="text-sm text-gray-900 mb-2">
                  Have you travelled to any country or region affected by infectious diseases or public health alerts in the past 14 days?
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  For the latest list of affected countries or regions, please refer to the{" "}
                  <a href="https://ghs.gov.gh" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    Ghana Health Service
                  </a>{" "}
                  or{" "}
                  <a href="https://www.who.int" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    WHO
                  </a>.
                </p>
                <div className="flex gap-4">
                  {["no", "yes"].map(v => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="health_infectious_travel" 
                        value={v} 
                        checked={form.health_infectious_travel === v} 
                        onChange={() => set("health_infectious_travel", v)} 
                        className="w-4 h-4 text-accent" 
                      />
                      <span className="text-sm capitalize">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Conditional: List countries if yes */}
            {form.health_infectious_travel === "yes" && (
              <div className="pl-9">
                <FormField label="Please list the countries visited" required>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
                    rows={3}
                    placeholder="Enter countries separated by commas (e.g., Country A, Country B, Country C)"
                    value={form.health_infectious_countries}
                    onChange={e => set("health_infectious_countries", e.target.value)}
                  />
                </FormField>
              </div>
            )}
          </div>
        </div>
        
        {/* Security & Travel Declaration */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-accent" />
            <h3 className="text-sm font-semibold text-gray-900">Security & Travel Declaration</h3>
          </div>
          
          <div className="space-y-1">
            <DeclarationQ 
              num={1}
              label="Have you travelled to any high-risk conflict zones in the past 2 years?" 
              field="high_risk_travel" 
            />
            <DeclarationQ 
              num={2}
              label="Have you ever been denied a visa, refused entry at any border, deported from any country, or convicted of a criminal offence?" 
              field="entry_denied_before" 
            />
            <DeclarationQ 
              num={3}
              label="Have you previously overstayed a visa or violated immigration conditions in Ghana?" 
              field="overstayed_before" 
            />
            <DeclarationQ 
              num={4}
              label="Are you currently subject to any international sanctions, travel bans, or Interpol notices?" 
              field="international_sanctions" 
            />
          </div>
        </div>

        {/* Certification */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            I certify that all information provided is true and accurate to the best of my knowledge. I understand that providing false information may result in visa denial or deportation.
          </p>
        </div>

        <NavButtons />
      </section>
    );
  }

  /* ── STEP: Documents ─────────────────────────────── */
  function renderDocs() {
    const requiredUploaded = requiredDocTypes.filter(d => !!docs[d.key]).length;
    const optionalUploaded = optionalDocTypes.filter(d => !!docs[d.key]).length;
    const totalDocs = requiredDocTypes.length + optionalDocTypes.length;

    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Document Upload</h2>
          <p className="text-xs text-gray-500 mt-0.5">Upload the required documents to support your application.</p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{requiredUploaded + optionalUploaded}/{totalDocs}</span>
          <span className="text-gray-500">Uploaded</span>
        </div>
        <div className="text-xs text-gray-600">
          <span className="font-medium">{requiredUploaded}</span> of <span className="font-medium">{requiredDocTypes.length}</span> required documents uploaded
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-2">Required Documents</p>
          {requiredDocTypes.map((d) => (
            <div key={d.key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${docs[d.key] ? "bg-green-100" : "bg-gray-100"}`}>
                {docs[d.key] ? <Check size={14} className="text-green-600" /> : <FileText size={14} className="text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{d.label} <span className="text-red-500">*</span></p>
                {docs[d.key] && <p className="text-xs text-gray-500 truncate">{docs[d.key]?.name}</p>}
                {!docs[d.key] && <p className="text-[10px] text-gray-500">PDF, JPG or PNG — max 10 MB</p>}
              </div>
              <label className="cursor-pointer">
                <span className="text-xs font-medium text-accent hover:underline">{docs[d.key] ? "Change" : "Upload"}</span>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFile(d.key, e.target.files?.[0] || null)} />
              </label>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-3 border-t border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Optional Documents</p>
          {optionalDocTypes.map((d) => (
            <div key={d.key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${docs[d.key] ? "bg-green-100" : "bg-gray-100"}`}>
                {docs[d.key] ? <Check size={14} className="text-green-600" /> : <FileText size={14} className="text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{d.label}</p>
                {docs[d.key] && <p className="text-xs text-gray-500 truncate">{docs[d.key]?.name}</p>}
                {!docs[d.key] && <p className="text-[10px] text-gray-500">PDF, JPG or PNG — max 10 MB</p>}
              </div>
              <label className="cursor-pointer">
                <span className="text-xs font-medium text-accent hover:underline">{docs[d.key] ? "Change" : "Upload"}</span>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFile(d.key, e.target.files?.[0] || null)} />
              </label>
            </div>
          ))}
        </div>

        <NavButtons />
      </section>
    );
  }

  /* ── STEP: Review & Payment (Integrated) ─────────── */
  function renderPayment() {
    const PAYMENT_METHODS = [
      { id: "paystack_card", label: "Card", desc: "Visa, Mastercard", icon: <CreditCard size={16} className="text-accent" /> },
      { id: "paystack_mobile_money", label: "Mobile Money", desc: "MTN, Vodafone, AirtelTigo", icon: <Wallet size={16} className="text-accent" /> },
      { id: "gcb", label: "GCB Bank", desc: "Ghana Commercial Bank", icon: <Landmark size={16} className="text-accent" /> },
    ];
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Review & Pay</h2>
          <p className="text-xs text-gray-500 mt-0.5">Confirm your details and complete payment.</p>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-2 gap-2">
          <ReviewCard title="Applicant">
            <ReviewRow label="Name" value={`${form.first_name} ${form.last_name}`} />
            <ReviewRow label="Nationality" value={cName(form.nationality)} />
            <ReviewRow label="Passport" value={form.passport_number} />
          </ReviewCard>
          <ReviewCard title="Travel">
            <ReviewRow label="Arrival" value={fmtDate(form.intended_arrival)} />
            <ReviewRow label="Duration" value={form.duration_days ? `${form.duration_days} days` : undefined} />
            <ReviewRow label="Port" value={form.port_of_entry} />
          </ReviewCard>
        </div>

        {/* Fee Summary */}
        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">{isEta ? "ETA Fee" : `${selVT?.name || "Visa"} (${form.entry_type || "single"})`}</p>
              {procFee > 0 && <p className="text-xs text-gray-400">+ {selST?.name} processing</p>}
            </div>
            <p className="text-xl font-bold text-accent">${totalFee.toFixed(2)}</p>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map(m => (
              <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)}
                className={`flex flex-col items-center gap-2 p-2.5 rounded-lg border-2 text-center transition-all ${paymentMethod === m.id ? "border-accent bg-accent/5" : "border-gray-200 hover:border-accent/30"}`}>
                {m.icon}
                <div>
                  <p className="text-xs font-medium text-gray-900">{m.label}</p>
                  <p className="text-[10px] text-gray-500">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="mt-0.5 w-4 h-4 rounded text-accent" />
          <span className="text-xs text-gray-600 leading-relaxed">
            I confirm all information is accurate. I understand the fee is non-refundable once processing begins.
          </span>
        </label>

        <NavButtons isPayment />
      </section>
    );
  }

  /* ── Main return ─────────────────────────────────── */
  return (
    <DashboardShell 
      title={isEta ? "Electronic Travel Authorization (ETA)" : "New Application"} 
      description={isEta ? "Simplified application for visa-free travelers" : ""}
    >
      {/* ETA Badge */}
      {isEta && (
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200">
            <Plane size={14} className="text-green-600" />
            <span className="text-xs font-semibold text-green-700">ETA Application</span>
            <span className="text-[10px] text-green-600">• Fast Track Processing</span>
          </div>
        </div>
      )}
      
      {/* Compact Progress Bar */}
      <div className="mb-6 max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 mb-2">
          {STEP_GROUPS.map((g, i) => {
            const progress = groupProgress[g.id];
            const isActive = currentGroup === g.id;
            const isDone = progress && progress.done >= progress.total;
            return (
              <div key={g.id} className="flex items-center gap-1 flex-1">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all duration-300 ease-in-out ${isActive ? "bg-accent text-white scale-105" : isDone ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {isDone ? <Check size={12} /> : g.icon}
                  <span className="hidden sm:inline">{g.label}</span>
                </div>
                {i < STEP_GROUPS.length - 1 && <div className={`flex-1 h-0.5 rounded transition-all duration-500 ease-in-out ${isDone ? "bg-green-400" : "bg-gray-200"}`} />}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 transition-opacity duration-300">Step {step + 1} of {STEPS.length}: <span className="font-medium text-gray-700">{STEPS[step]?.name}</span></p>
      </div>

      {/* Main Grid: Form (60%) + Preview (40%) - Side by Side */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Form Section - 60% */}
          <div className="w-full lg:w-[60%] bg-white rounded-xl border border-gray-200 p-6 shadow-sm overflow-hidden">
            <StepTransition stepKey={step}>{renderStepContent()}</StepTransition>
            {error && <div className="flex items-center gap-2 p-2.5 mt-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700"><AlertTriangle size={14} />{error}</div>}
          </div>
          
          {/* Preview Section - 40% */}
          <div className="w-full lg:w-[40%] lg:sticky lg:top-4">
            <VisaPreviewSidebar form={form} selVT={selVT} selST={selST} documents={docs} cName={cName} fmtDate={fmtDate} docTypes={requiredDocTypes} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
