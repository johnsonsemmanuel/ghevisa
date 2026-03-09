/* ── eVisa Matrix — Per-visa-type configuration ──────────── */

export interface VisaFormField {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "select" | "textarea" | "email" | "tel";
  placeholder?: string;
  hint?: string;
  required: boolean;
  options?: { value: string; label: string }[];
  validation?: { min?: number; max?: number; minDate?: "today" | "future_3d" };
  fullWidth?: boolean;
  conditionalOn?: { field: string; value: string | string[] };
}

export interface RequiredDocument {
  key: string;
  label: string;
  description: string;
  required: boolean;
}

export interface DeclarationQuestion {
  key: string;
  question: string;
}

export interface VisaTypeConfig {
  slug: string;
  stepTitle: string;
  stepDescription: string;
  maxDurationDays: number;
  durationWarningDays: number;
  requiredDocuments: RequiredDocument[];
  specificFields: VisaFormField[];
  declarationQuestions?: DeclarationQuestion[];
  tips: string[];
}

export const VISA_DURATION_OPTIONS = [
  { value: "30", label: "Up to 30 days" },
  { value: "60", label: "Up to 60 days" },
  { value: "90", label: "Up to 90 days" },
];

export const ACCOMMODATION_OPTIONS = [
  { value: "hotel", label: "Hotel / Guesthouse / Airbnb" },
  { value: "friends_family", label: "Friends / Family" },
  { value: "other", label: "Other" },
];

export const DESTINATION_CITIES = [
  { value: "accra", label: "Accra" },
  { value: "kumasi", label: "Kumasi" },
  { value: "tamale", label: "Tamale" },
  { value: "takoradi", label: "Takoradi" },
  { value: "cape-coast", label: "Cape Coast" },
  { value: "sunyani", label: "Sunyani" },
  { value: "ho", label: "Ho" },
  { value: "koforidua", label: "Koforidua" },
  { value: "bolgatanga", label: "Bolgatanga" },
  { value: "wa", label: "Wa" },
  { value: "tema", label: "Tema" },
  { value: "obuasi", label: "Obuasi" },
  { value: "techiman", label: "Techiman" },
  { value: "winneba", label: "Winneba" },
];

export const ECOWAS_CODES = ["NG", "SN", "CI", "ML", "BF", "NE", "BJ", "TG", "GN", "SL", "LR", "GM", "GW", "CV"];
export const AU_CODES = [...ECOWAS_CODES, "KE", "TZ", "RW", "UG", "ET", "DJ", "SO", "SS", "SD", "ER", "ZA", "NA", "BW", "ZW", "ZM", "MW", "MZ", "AO", "SZ", "LS", "MA", "TN", "DZ", "EG", "LY", "GA", "CM", "CG", "CD", "CF", "TD", "GQ", "ST"];
export const CARIBBEAN_CODES = ["BB", "BS", "GD", "JM", "TT", "AG", "DM", "KN", "LC", "VC"];
export const EVISA_REQUIRED_CODES = ["GB", "DE", "FR", "IT", "ES", "NL", "BE", "US", "CA", "CN", "IN", "JP", "KR", "AU", "NZ", "BR", "MX", "AE", "SA", "RU"];

// Authorization types
export type AuthorizationType = 'visa_free' | 'eta' | 'voa' | 'evoa' | 'evisa' | 'embassy_visa' | 'transit' | 'conditional';

export function isEcowas(c: string) { return ECOWAS_CODES.includes(c); }
export function isAU(c: string) { return AU_CODES.includes(c); }
export function isCaribbean(c: string) { return CARIBBEAN_CODES.includes(c); }
export function isEtaEligible(c: string) { return ECOWAS_CODES.includes(c) || AU_CODES.includes(c) || CARIBBEAN_CODES.includes(c); }
export function requiresEvisa(c: string) { return EVISA_REQUIRED_CODES.includes(c) || !isEtaEligible(c); }

export function getAuthorizationType(countryCode: string): AuthorizationType {
  if (ECOWAS_CODES.includes(countryCode)) return 'eta';
  if (AU_CODES.includes(countryCode)) return 'eta';
  if (CARIBBEAN_CODES.includes(countryCode)) return 'eta';
  return 'evisa';
}

export function getEtaFee(countryCode: string): number {
  if (ECOWAS_CODES.includes(countryCode)) return 10;
  if (AU_CODES.includes(countryCode)) return 20;
  if (CARIBBEAN_CODES.includes(countryCode)) return 15;
  return 60; // Default eVisa fee
}

export const PORTS_OF_ENTRY = [
  { value: "KIA", label: "Kotoka International Airport (Accra)" },
  { value: "TMA", label: "Tema Harbour" },
  { value: "TKD", label: "Takoradi Harbour" },
  { value: "AFL", label: "Aflao Border (Togo)" },
  { value: "ELB", label: "Elubo Border (Côte d'Ivoire)" },
  { value: "PRG", label: "Paga Border (Burkina Faso)" },
];

export const GHANA_REGIONS = [
  { value: "greater-accra", label: "Greater Accra" },
  { value: "ashanti", label: "Ashanti" },
  { value: "western", label: "Western" },
  { value: "western-north", label: "Western North" },
  { value: "eastern", label: "Eastern" },
  { value: "central", label: "Central" },
  { value: "volta", label: "Volta" },
  { value: "oti", label: "Oti" },
  { value: "northern", label: "Northern" },
  { value: "savannah", label: "Savannah" },
  { value: "north-east", label: "North East" },
  { value: "upper-east", label: "Upper East" },
  { value: "upper-west", label: "Upper West" },
  { value: "bono", label: "Bono" },
  { value: "bono-east", label: "Bono East" },
  { value: "ahafo", label: "Ahafo" },
];

export const GHANA_CITIES: Record<string, { value: string; label: string }[]> = {
  "greater-accra": [
    { value: "accra", label: "Accra" },
    { value: "tema", label: "Tema" },
    { value: "madina", label: "Madina" },
    { value: "ashaiman", label: "Ashaiman" },
    { value: "teshie", label: "Teshie" },
    { value: "nungua", label: "Nungua" },
    { value: "lashibi", label: "Lashibi" },
    { value: "kasoa", label: "Kasoa" },
  ],
  "ashanti": [
    { value: "kumasi", label: "Kumasi" },
    { value: "obuasi", label: "Obuasi" },
    { value: "ejisu", label: "Ejisu" },
    { value: "mampong", label: "Mampong" },
    { value: "konongo", label: "Konongo" },
    { value: "bekwai", label: "Bekwai" },
    { value: "agogo", label: "Agogo" },
  ],
  "western": [
    { value: "takoradi", label: "Takoradi" },
    { value: "sekondi", label: "Sekondi" },
    { value: "tarkwa", label: "Tarkwa" },
    { value: "axim", label: "Axim" },
    { value: "prestea", label: "Prestea" },
  ],
  "western-north": [
    { value: "sefwi-wiawso", label: "Sefwi Wiawso" },
    { value: "bibiani", label: "Bibiani" },
    { value: "enchi", label: "Enchi" },
  ],
  "eastern": [
    { value: "koforidua", label: "Koforidua" },
    { value: "nkawkaw", label: "Nkawkaw" },
    { value: "nsawam", label: "Nsawam" },
    { value: "akosombo", label: "Akosombo" },
    { value: "akim-oda", label: "Akim Oda" },
    { value: "suhum", label: "Suhum" },
  ],
  "central": [
    { value: "cape-coast", label: "Cape Coast" },
    { value: "winneba", label: "Winneba" },
    { value: "saltpond", label: "Saltpond" },
    { value: "mankessim", label: "Mankessim" },
    { value: "dunkwa", label: "Dunkwa-on-Offin" },
    { value: "kasoa", label: "Kasoa" },
  ],
  "volta": [
    { value: "ho", label: "Ho" },
    { value: "hohoe", label: "Hohoe" },
    { value: "keta", label: "Keta" },
    { value: "aflao", label: "Aflao" },
    { value: "kpando", label: "Kpando" },
  ],
  "oti": [
    { value: "dambai", label: "Dambai" },
    { value: "jasikan", label: "Jasikan" },
    { value: "nkwanta", label: "Nkwanta" },
  ],
  "northern": [
    { value: "tamale", label: "Tamale" },
    { value: "yendi", label: "Yendi" },
    { value: "savelugu", label: "Savelugu" },
    { value: "bimbilla", label: "Bimbilla" },
  ],
  "savannah": [
    { value: "damongo", label: "Damongo" },
    { value: "salaga", label: "Salaga" },
    { value: "bole", label: "Bole" },
  ],
  "north-east": [
    { value: "nalerigu", label: "Nalerigu" },
    { value: "gambaga", label: "Gambaga" },
    { value: "walewale", label: "Walewale" },
  ],
  "upper-east": [
    { value: "bolgatanga", label: "Bolgatanga" },
    { value: "bawku", label: "Bawku" },
    { value: "navrongo", label: "Navrongo" },
    { value: "zebilla", label: "Zebilla" },
  ],
  "upper-west": [
    { value: "wa", label: "Wa" },
    { value: "tumu", label: "Tumu" },
    { value: "lawra", label: "Lawra" },
    { value: "nandom", label: "Nandom" },
  ],
  "bono": [
    { value: "sunyani", label: "Sunyani" },
    { value: "berekum", label: "Berekum" },
    { value: "dormaa-ahenkro", label: "Dormaa Ahenkro" },
  ],
  "bono-east": [
    { value: "techiman", label: "Techiman" },
    { value: "kintampo", label: "Kintampo" },
    { value: "atebubu", label: "Atebubu" },
    { value: "nkoranza", label: "Nkoranza" },
  ],
  "ahafo": [
    { value: "goaso", label: "Goaso" },
    { value: "bechem", label: "Bechem" },
    { value: "duayaw-nkwanta", label: "Duayaw Nkwanta" },
  ],
};

export const VISA_CONFIGS: Record<string, VisaTypeConfig> = {
  eta: {
    slug: "eta", stepTitle: "Travel Registration", stepDescription: "Complete your Electronic Travel Authorization for Ghana.",
    maxDurationDays: 90, durationWarningDays: 60,
    requiredDocuments: [
      { key: "passport_bio", label: "Passport Bio-data Page", description: "Clear scan of passport bio page", required: true },
      { key: "passport_photo", label: "Passport-Sized Photograph", description: "Recent photo (white background)", required: true },
    ],
    specificFields: [
      { key: "intended_arrival", label: "Intended Arrival Date", type: "date", required: true, validation: { minDate: "future_3d" } },
      { key: "port_of_entry", label: "Port of Entry", type: "select", required: true, options: PORTS_OF_ENTRY },
      { key: "airline", label: "Airline", type: "text", placeholder: "e.g. Kenya Airways, Ethiopian Airlines", required: true },
      { key: "flight_number", label: "Flight Number", type: "text", placeholder: "e.g. KQ507", required: true },
      { key: "purpose_of_visit", label: "Purpose of Visit", type: "select", required: true, options: [
        { value: "tourism", label: "Tourism / Holiday" },
        { value: "business", label: "Business Meeting" },
        { value: "family", label: "Family Visit" },
        { value: "transit", label: "Transit" },
        { value: "other", label: "Other" },
      ]},
      { key: "address_in_ghana", label: "Address in Ghana", type: "text", placeholder: "Hotel or host address", required: true, fullWidth: true },
      { key: "host_name", label: "Host Name (if applicable)", type: "text", placeholder: "Full name of host", required: false },
      { key: "host_phone", label: "Host Phone", type: "tel", placeholder: "+233 XX XXX XXXX", required: false },
      { key: "hotel_booking_reference", label: "Hotel Booking Reference", type: "text", placeholder: "Booking confirmation number", required: false },
    ],
    declarationQuestions: [
      { key: "entry_denied_before", question: "Have you ever been denied entry to Ghana?" },
      { key: "criminal_conviction", question: "Do you have any criminal convictions?" },
      { key: "previous_ghana_visa", question: "Have you previously held a Ghana visa?" },
    ],
    tips: [
      "ETA is processed within 24-48 hours.",
      "You will receive a QR code for airport scanning.",
      "ETA is valid for 90 days from approval.",
      "Yellow fever vaccination certificate required at port of entry.",
    ],
  },

  voa: {
    slug: "voa", stepTitle: "Visa on Arrival Pre-Registration", stepDescription: "Pre-register for your visa on arrival in Ghana.",
    maxDurationDays: 30, durationWarningDays: 14,
    requiredDocuments: [
      { key: "passport_bio", label: "Passport Bio-data Page", description: "Clear scan of passport bio page", required: true },
      { key: "passport_photo", label: "Passport-Sized Photograph", description: "Recent photo (white background)", required: true },
      { key: "return_ticket", label: "Return/Onward Ticket", description: "Confirmed flight itinerary", required: true },
    ],
    specificFields: [
      { key: "intended_arrival", label: "Intended Arrival Date", type: "date", required: true, validation: { minDate: "future_3d" } },
      { key: "port_of_entry", label: "Port of Entry", type: "select", required: true, options: PORTS_OF_ENTRY },
      { key: "airline", label: "Airline", type: "text", placeholder: "e.g. British Airways", required: true },
      { key: "flight_number", label: "Flight Number", type: "text", placeholder: "e.g. BA078", required: true },
      { key: "purpose_of_visit", label: "Purpose of Visit", type: "select", required: true, options: [
        { value: "tourism", label: "Tourism / Holiday" },
        { value: "business", label: "Business Meeting" },
        { value: "family", label: "Family Visit" },
        { value: "other", label: "Other" },
      ]},
      { key: "address_in_ghana", label: "Address in Ghana", type: "text", placeholder: "Hotel or host address", required: true, fullWidth: true },
      { key: "host_name", label: "Host Name", type: "text", placeholder: "Full name of host", required: false },
      { key: "host_phone", label: "Host Phone", type: "tel", placeholder: "+233 XX XXX XXXX", required: false },
    ],
    declarationQuestions: [
      { key: "entry_denied_before", question: "Have you ever been denied entry to Ghana?" },
      { key: "criminal_conviction", question: "Do you have any criminal convictions?" },
    ],
    tips: [
      "Pre-registration speeds up your arrival process.",
      "Bring printed confirmation to the airport.",
      "VOA fee is payable at the port of entry.",
    ],
  },

  tourism: {
    slug: "tourism", stepTitle: "Travel Details", stepDescription: "Provide your travel and stay information.",
    maxDurationDays: 90, durationWarningDays: 60,
    requiredDocuments: [
      { key: "passport_bio", label: "Passport Bio-data Page", description: "PDF, JPG or PNG — max 10 MB", required: true },
      { key: "passport_photo", label: "Passport Sized Photograph", description: "PDF, JPG or PNG — max 10 MB", required: true },
      { key: "proof_of_accommodation", label: "Proof of Accommodation", description: "Hotel booking or host invitation", required: true },
      { key: "return_ticket", label: "Return Flight Ticket", description: "Return flight or travel itinerary", required: true },
      { key: "travel_insurance", label: "Travel Insurance", description: "Upload travel insurance document", required: false },
      { key: "yellow_fever", label: "Yellow Fever Certificate (Optional)", description: "Entry requirement — you may upload now or present at port of entry", required: false },
      { key: "other_supporting", label: "Other Supporting Documents", description: "Any additional documents", required: false },
    ],
    specificFields: [
      { key: "visa_duration", label: "Visa Duration", type: "select", required: true, options: VISA_DURATION_OPTIONS },
      { key: "place_of_embarkation", label: "Place of Embarkation", type: "text", placeholder: "e.g. London, UK", required: true },
      { key: "port_of_entry", label: "Port of Entry", type: "select", required: true, options: PORTS_OF_ENTRY },
      { key: "destination_city", label: "Destination City in Ghana", type: "select", required: true, options: DESTINATION_CITIES },
      { key: "residential_address", label: "Residential Address During Stay", type: "text", placeholder: "Hotel or host address", required: true, fullWidth: true },
      {
        key: "visited_ghana_before", label: "Have you visited Ghana before?", type: "select", required: true, options: [
          { value: "no", label: "No" }, { value: "yes", label: "Yes" },
        ]
      },
      {
        key: "visited_other_countries", label: "Visited other countries in the past 6 months?", type: "select", required: true, options: [
          { value: "no", label: "No" }, { value: "yes", label: "Yes" },
        ]
      },
      { key: "visited_country_1", label: "African Country 1 (Optional)", type: "select", required: false, options: [], conditionalOn: { field: "visited_other_countries", value: "yes" } },
      { key: "visited_country_2", label: "African Country 2 (Optional)", type: "select", required: false, options: [], conditionalOn: { field: "visited_other_countries", value: "yes" } },
      { key: "visited_country_3", label: "African Country 3 (Optional)", type: "select", required: false, options: [], conditionalOn: { field: "visited_other_countries", value: "yes" } },
      { key: "purpose_of_visit", label: "Purpose of Visit", type: "textarea", placeholder: "Describe your purpose for visiting Ghana...", required: true, fullWidth: true },
      { key: "accommodation_type", label: "Accommodation Arrangements", type: "select", required: true, options: ACCOMMODATION_OPTIONS },
    ],
    declarationQuestions: [
      { key: "decl_conflict_zones", question: "Have you travelled to any high-risk conflict zones in the past 2 years?" },
      { key: "decl_visa_denied", question: "Have you ever been denied a visa, refused entry at any border, deported from any country, or convicted of a criminal offence?" },
      { key: "decl_overstayed", question: "Have you previously overstayed a visa or violated immigration conditions in Ghana?" },
      { key: "decl_sanctions", question: "Are you currently subject to any international sanctions, travel bans, or Interpol notices?" },
    ],
    tips: [
      "Passport must be valid for at least 6 months beyond your stay.",
      "Hotel booking must show your name and matching dates.",
      "Yellow fever vaccination is an entry requirement — you must present proof upon arrival in Ghana (not required for visa application).",
    ],
  },

  business: {
    slug: "business", stepTitle: "Business & Commercial Details", stepDescription: "Provide details about your business activities in Ghana.",
    maxDurationDays: 90, durationWarningDays: 60,
    requiredDocuments: [
      { key: "passport_bio", label: "Passport Bio Page", description: "Clear colour scan of passport bio/data page", required: true },
      { key: "passport_photo", label: "Passport-Size Photo", description: "Recent photo (white background, 35×45mm)", required: true },
      { key: "invitation_letter", label: "Invitation Letter from Ghana", description: "From host company on official letterhead", required: true },
      { key: "company_letter", label: "Company Introduction Letter", description: "From your employer confirming business purpose", required: true },
      { key: "proof_of_funds", label: "Proof of Funds", description: "Bank statement or company sponsorship", required: true },
      { key: "return_ticket", label: "Return/Onward Ticket", description: "Confirmed flight itinerary", required: true },
      { key: "business_registration", label: "Business Registration", description: "Company registration (if self-employed)", required: false },
    ],
    specificFields: [
      { key: "company_name", label: "Your Company/Organisation", type: "text", placeholder: "e.g. Acme Corporation Ltd", required: true },
      { key: "company_address", label: "Company Address", type: "text", placeholder: "Full registered address", required: true, fullWidth: true },
      { key: "job_title", label: "Your Position/Title", type: "text", placeholder: "e.g. Regional Director", required: true },
      { key: "host_company_name", label: "Host Company in Ghana", type: "text", placeholder: "Company you are visiting", required: true },
      { key: "host_company_address", label: "Host Company Address", type: "text", placeholder: "Full address in Ghana", required: true, fullWidth: true },
      { key: "host_contact_name", label: "Contact Person at Host", type: "text", placeholder: "Full name", required: true },
      { key: "host_contact_phone", label: "Contact Phone", type: "tel", placeholder: "+233 XX XXX XXXX", required: true },
      {
        key: "business_purpose", label: "Nature of Business", type: "select", required: true, options: [
          { value: "meetings", label: "Business Meetings" }, { value: "negotiation", label: "Contract Negotiation" },
          { value: "trade", label: "Trade & Export/Import" }, { value: "investment", label: "Investment Exploration" },
          { value: "consulting", label: "Consulting/Advisory" }, { value: "other", label: "Other" },
        ]
      },
      { key: "business_details", label: "Business Activity Details", type: "textarea", placeholder: "Describe planned activities...", required: true, fullWidth: true },
      { key: "address_in_ghana", label: "Accommodation in Ghana", type: "text", placeholder: "Hotel or residence", required: true, fullWidth: true },
    ],
    tips: [
      "Invitation letter must be on official letterhead with company registration number.",
      "Multiple-entry business visas available for frequent travelers.",
      "GIPC registration may be required for investment visits.",
    ],
  },

  student: {
    slug: "student", stepTitle: "Student & Academic Details", stepDescription: "Provide details about your educational programme.",
    maxDurationDays: 365, durationWarningDays: 180,
    requiredDocuments: [
      { key: "passport_bio", label: "Passport Bio Page", description: "Clear scan of passport bio page", required: true },
      { key: "passport_photo", label: "Passport-Size Photo", description: "Recent photo (white background)", required: true },
      { key: "admission_letter", label: "Admission Letter", description: "From accredited Ghanaian institution", required: true },
      { key: "academic_transcripts", label: "Academic Transcripts", description: "Most recent transcripts/certificates", required: true },
      { key: "financial_proof", label: "Proof of Financial Support", description: "Scholarship letter or bank statement", required: true },
      { key: "medical_certificate", label: "Medical Certificate", description: "Health clearance certificate", required: false },
    ],
    specificFields: [
      { key: "institution_name", label: "Institution in Ghana", type: "text", placeholder: "e.g. University of Ghana, Legon", required: true, fullWidth: true },
      { key: "course_of_study", label: "Programme / Course", type: "text", placeholder: "e.g. MSc International Relations", required: true },
      {
        key: "study_level", label: "Level of Study", type: "select", required: true, options: [
          { value: "undergraduate", label: "Undergraduate" }, { value: "postgraduate", label: "Postgraduate (Master's)" },
          { value: "doctoral", label: "Doctoral (PhD)" }, { value: "diploma", label: "Diploma/Certificate" },
          { value: "exchange", label: "Exchange Programme" },
        ]
      },
      { key: "study_start_date", label: "Programme Start Date", type: "date", required: true },
      { key: "study_end_date", label: "Expected Completion", type: "date", required: true },
      {
        key: "sponsor_type", label: "Funding Source", type: "select", required: true, options: [
          { value: "self", label: "Self-Funded" }, { value: "scholarship", label: "Scholarship" },
          { value: "government", label: "Government Sponsorship" }, { value: "family", label: "Family" },
        ]
      },
      { key: "sponsor_name", label: "Sponsor Name", type: "text", placeholder: "Name of sponsor/scholarship body", required: false },
      {
        key: "accommodation_type", label: "Accommodation", type: "select", required: true, options: [
          { value: "campus", label: "On-Campus" }, { value: "hostel", label: "Student Hostel" },
          { value: "private", label: "Private Accommodation" }, { value: "pending", label: "To Be Arranged" },
        ]
      },
      { key: "address_in_ghana", label: "Address in Ghana", type: "text", placeholder: "Student accommodation address", required: false, fullWidth: true },
    ],
    tips: [
      "Admission letter must be from a GTEC-accredited institution.",
      "Student visa is renewable — initial entry allows up to 1 year.",
      "Register with Ghana Immigration Service within 48 hours of arrival.",
    ],
  },

  work: {
    slug: "work", stepTitle: "Employment & Work Details", stepDescription: "Provide details about your employment in Ghana.",
    maxDurationDays: 365, durationWarningDays: 180,
    requiredDocuments: [
      { key: "passport_bio", label: "Passport Bio Page", description: "Clear scan of passport bio page", required: true },
      { key: "passport_photo", label: "Passport-Size Photo", description: "Recent photo (white background)", required: true },
      { key: "employment_contract", label: "Employment Contract", description: "Signed contract with Ghanaian employer", required: true },
      { key: "company_letter", label: "Employer Letter", description: "From Ghanaian employer on letterhead", required: true },
      { key: "qualifications", label: "Professional Qualifications", description: "Degree certificates and certifications", required: true },
      { key: "police_clearance", label: "Police Clearance", description: "Criminal background check", required: true },
      { key: "medical_report", label: "Medical Report", description: "Full medical examination report", required: true },
    ],
    specificFields: [
      { key: "employer_name", label: "Employer in Ghana", type: "text", placeholder: "Company name", required: true, fullWidth: true },
      { key: "employer_address", label: "Employer Address", type: "text", placeholder: "Full address", required: true, fullWidth: true },
      { key: "employer_phone", label: "Employer Phone", type: "tel", placeholder: "+233 XX XXX XXXX", required: true },
      { key: "job_title", label: "Job Title/Position", type: "text", placeholder: "e.g. Senior Engineer", required: true },
      { key: "employment_start", label: "Employment Start Date", type: "date", required: true },
      {
        key: "employment_duration", label: "Contract Duration", type: "select", required: true, options: [
          { value: "6months", label: "6 Months" }, { value: "1year", label: "1 Year" }, { value: "2years", label: "2 Years" },
        ]
      },
      {
        key: "salary_range", label: "Annual Salary Range (USD)", type: "select", required: true, options: [
          { value: "under_20k", label: "Under $20,000" }, { value: "20k_50k", label: "$20,000 - $50,000" },
          { value: "50k_100k", label: "$50,000 - $100,000" }, { value: "over_100k", label: "Over $100,000" },
        ]
      },
      { key: "address_in_ghana", label: "Residential Address in Ghana", type: "text", placeholder: "Where you will reside", required: true, fullWidth: true },
    ],
    tips: [
      "Work permit must be obtained through Ghana Immigration Service.",
      "GIPC approval required for certain employment categories.",
      "Police clearance must be from country of residence (last 5 years).",
    ],
  },

  transit: {
    slug: "transit", stepTitle: "Transit Details", stepDescription: "Provide details about your transit through Ghana.",
    maxDurationDays: 3, durationWarningDays: 2,
    requiredDocuments: [
      { key: "passport_bio", label: "Passport Bio Page", description: "Clear scan of passport bio page", required: true },
      { key: "passport_photo", label: "Passport-Size Photo", description: "Recent photo (white background)", required: true },
      { key: "onward_ticket", label: "Onward/Connecting Ticket", description: "Confirmed ticket to final destination", required: true },
    ],
    specificFields: [
      { key: "arrival_flight", label: "Arrival Flight Number", type: "text", placeholder: "e.g. KQ507", required: true },
      { key: "departure_flight", label: "Departure Flight Number", type: "text", placeholder: "e.g. ET920", required: true },
      { key: "final_destination", label: "Final Destination Country", type: "select", required: true },
      { key: "transit_hours", label: "Transit Duration (Hours)", type: "number", placeholder: "e.g. 12", required: true, validation: { min: 1, max: 72 } },
      { key: "address_in_ghana", label: "Address During Transit (if overnight)", type: "text", placeholder: "Airport hotel or transit accommodation", required: false, fullWidth: true },
    ],
    tips: [
      "Transit visa valid for max 72 hours (3 days).",
      "You must have a confirmed onward ticket.",
      "Leaving the airport transit zone requires a transit visa.",
    ],
  },

  medical: {
    slug: "medical", stepTitle: "Medical Visit Details", stepDescription: "Provide details about your medical treatment in Ghana.",
    maxDurationDays: 180, durationWarningDays: 90,
    requiredDocuments: [
      { key: "passport_bio", label: "Passport Bio Page", description: "Clear scan of passport bio page", required: true },
      { key: "passport_photo", label: "Passport-Size Photo", description: "Recent photo", required: true },
      { key: "hospital_letter", label: "Hospital Appointment Letter", description: "From Ghanaian hospital/clinic confirming treatment", required: true },
      { key: "medical_records", label: "Medical Records", description: "Relevant medical history/records", required: true },
      { key: "doctor_referral", label: "Doctor Referral Letter", description: "Referral from home country doctor", required: false },
      { key: "proof_of_funds", label: "Proof of Funds", description: "Ability to cover medical and living expenses", required: true },
    ],
    specificFields: [
      { key: "hospital_name", label: "Hospital/Clinic Name", type: "text", placeholder: "e.g. Korle Bu Teaching Hospital", required: true, fullWidth: true },
      {
        key: "treatment_type", label: "Type of Treatment", type: "select", required: true, options: [
          { value: "surgery", label: "Surgery" }, { value: "specialist", label: "Specialist Consultation" },
          { value: "therapy", label: "Ongoing Therapy" }, { value: "diagnostic", label: "Diagnostic Tests" },
          { value: "traditional", label: "Traditional Medicine" }, { value: "other", label: "Other" },
        ]
      },
      { key: "appointment_date", label: "Appointment/Admission Date", type: "date", required: true },
      { key: "treating_doctor", label: "Treating Doctor Name", type: "text", placeholder: "Doctor's name at Ghana hospital", required: false },
      { key: "accompanying_persons", label: "Accompanying Persons", type: "number", placeholder: "0", required: true, validation: { min: 0, max: 5 } },
      { key: "address_in_ghana", label: "Accommodation During Treatment", type: "text", placeholder: "Hospital ward or nearby accommodation", required: true, fullWidth: true },
    ],
    tips: [
      "Hospital letter must confirm scheduled treatment and dates.",
      "Medical visa can be extended if treatment requires longer stay.",
      "Accompanying family members need separate visa applications.",
    ],
  },

  conference: {
    slug: "conference", stepTitle: "Conference & Event Details", stepDescription: "Provide details about the event you are attending.",
    maxDurationDays: 30, durationWarningDays: 14,
    requiredDocuments: [
      { key: "passport_bio", label: "Passport Bio Page", description: "Clear scan of passport bio page", required: true },
      { key: "passport_photo", label: "Passport-Size Photo", description: "Recent photo", required: true },
      { key: "conference_invitation", label: "Conference Invitation", description: "Official invitation from event organisers", required: true },
      { key: "registration_confirmation", label: "Registration Confirmation", description: "Proof of event registration/payment", required: true },
      { key: "return_ticket", label: "Return Ticket", description: "Confirmed flight itinerary", required: true },
    ],
    specificFields: [
      { key: "event_name", label: "Event/Conference Name", type: "text", placeholder: "e.g. Africa Tech Summit 2026", required: true, fullWidth: true },
      { key: "event_start", label: "Event Start Date", type: "date", required: true },
      { key: "event_end", label: "Event End Date", type: "date", required: true },
      { key: "event_venue", label: "Event Venue/Location", type: "text", placeholder: "e.g. Accra International Conference Centre", required: true, fullWidth: true },
      { key: "organizer_name", label: "Organiser Name", type: "text", placeholder: "Organisation hosting the event", required: true },
      {
        key: "role_at_event", label: "Your Role", type: "select", required: true, options: [
          { value: "attendee", label: "Attendee" }, { value: "speaker", label: "Speaker/Presenter" },
          { value: "exhibitor", label: "Exhibitor" }, { value: "organizer", label: "Co-Organiser" },
        ]
      },
      { key: "address_in_ghana", label: "Accommodation in Ghana", type: "text", placeholder: "Hotel or residence", required: true, fullWidth: true },
    ],
    tips: [
      "Conference visa valid for duration of event plus buffer days.",
      "Invitation must be on official event letterhead.",
    ],
  },

  diplomatic: {
    slug: "diplomatic", stepTitle: "Diplomatic Mission Details", stepDescription: "Provide details about your diplomatic posting.",
    maxDurationDays: 365, durationWarningDays: 180,
    requiredDocuments: [
      { key: "diplomatic_passport", label: "Diplomatic Passport", description: "Scan of diplomatic passport bio page", required: true },
      { key: "passport_photo", label: "Passport-Size Photo", description: "Recent photo", required: true },
      { key: "diplomatic_note", label: "Diplomatic Note Verbale", description: "Official note from sending government/ministry", required: true },
    ],
    specificFields: [
      { key: "diplomatic_rank", label: "Diplomatic Rank/Title", type: "text", placeholder: "e.g. Third Secretary", required: true },
      { key: "sending_ministry", label: "Sending Ministry/Department", type: "text", placeholder: "Ministry of Foreign Affairs", required: true, fullWidth: true },
      {
        key: "mission_type", label: "Mission Type", type: "select", required: true, options: [
          { value: "embassy", label: "Embassy Posting" }, { value: "consular", label: "Consular Mission" },
          { value: "international_org", label: "International Organisation" }, { value: "special_mission", label: "Special Mission" },
        ]
      },
      { key: "diplomatic_note_number", label: "Note Verbale Reference", type: "text", placeholder: "Reference number", required: true },
      {
        key: "posting_duration", label: "Expected Duration of Posting", type: "select", required: true, options: [
          { value: "6months", label: "Up to 6 Months" }, { value: "1year", label: "1 Year" },
          { value: "2years", label: "2 Years" }, { value: "3years", label: "3+ Years" },
        ]
      },
      { key: "dependents_count", label: "Number of Dependents", type: "number", placeholder: "0", required: true, validation: { min: 0, max: 10 } },
    ],
    tips: [
      "Diplomatic visas are fee-exempt.",
      "Note Verbale must be from an accredited diplomatic mission.",
      "Dependents require separate applications.",
    ],
  },

  emergency: {
    slug: "emergency", stepTitle: "Emergency / Humanitarian Details", stepDescription: "Provide details about your emergency travel.",
    maxDurationDays: 30, durationWarningDays: 14,
    requiredDocuments: [
      { key: "passport_bio", label: "Passport Bio Page", description: "Clear scan of passport bio page", required: true },
      { key: "passport_photo", label: "Passport-Size Photo", description: "Recent photo", required: true },
      { key: "emergency_proof", label: "Emergency Supporting Document", description: "Hospital letter, death certificate, or relevant proof", required: true },
    ],
    specificFields: [
      {
        key: "emergency_type", label: "Type of Emergency", type: "select", required: true, options: [
          { value: "family_illness", label: "Family Member Illness" }, { value: "family_death", label: "Family Member Death" },
          { value: "medical_self", label: "Personal Medical Emergency" }, { value: "natural_disaster", label: "Natural Disaster" },
          { value: "other", label: "Other Humanitarian" },
        ]
      },
      { key: "emergency_description", label: "Emergency Description", type: "textarea", placeholder: "Describe the emergency situation...", required: true, fullWidth: true },
      { key: "contact_in_ghana", label: "Contact Person in Ghana", type: "text", placeholder: "Full name", required: true },
      { key: "contact_phone", label: "Contact Phone in Ghana", type: "tel", placeholder: "+233 XX XXX XXXX", required: true },
      { key: "relationship", label: "Relationship to Contact", type: "text", placeholder: "e.g. Brother, Business Partner", required: true },
      { key: "address_in_ghana", label: "Address in Ghana", type: "text", placeholder: "Where you will stay", required: true, fullWidth: true },
    ],
    tips: [
      "Emergency visas are processed within 4-6 hours.",
      "Supporting documents are verified urgently.",
      "Contact Ghana Embassy for after-hours emergency processing.",
    ],
  },
};

export function getVisaConfig(slug: string): VisaTypeConfig | null {
  return VISA_CONFIGS[slug] || null;
}

export function getMaxDuration(slug: string): number {
  return VISA_CONFIGS[slug]?.maxDurationDays || 90;
}

export function getDurationWarning(slug: string, days: number): string | null {
  const cfg = VISA_CONFIGS[slug];
  if (!cfg) return null;
  if (days > cfg.maxDurationDays) return `Maximum stay for this visa is ${cfg.maxDurationDays} days. Please reduce your duration.`;
  if (days > cfg.durationWarningDays) return `Extended stay of ${days} days may require additional documentation.`;
  return null;
}
