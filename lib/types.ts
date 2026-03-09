/* ── User & Auth ─────────────────────────────── */

export type UserRole =
  | "applicant"
  | "APPLICANT"
  | "GIS_REVIEWING_OFFICER"
  | "GIS_APPROVAL_OFFICER"
  | "GIS_ADMIN"
  | "MFA_REVIEWING_OFFICER"
  | "MFA_APPROVAL_OFFICER"
  | "MFA_ADMIN"
  | "SYSTEM_ADMIN"
  // Legacy role names for backward compatibility
  | "gis_officer"
  | "mfa_reviewer"
  | "admin";
export type Agency = "GIS" | "MFA" | "ADMIN";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  agency: Agency | null;
  locale: "en" | "fr";
  permissions?: string[];
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

/* ── Visa Types ──────────────────────────────── */

export interface VisaType {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_fee: string;
  multiple_entry_fee?: string;
  government_fee?: string;
  platform_fee?: string;
  entry_type?: "single" | "multiple";
  validity_period?: string;
  category?: "visa" | "eta";
  max_duration_days: number;
  required_documents: string[];
  required_fields?: string[];
  optional_fields?: string[];
  default_processing_days?: number;
  default_route_to?: "gis" | "mfa";
  sort_order?: number;
}

/* ── Service Tiers ──────────────────────────────── */

export interface ServiceTier {
  id: number;
  code: string;
  name: string;
  description: string | null;
  processing_hours: number;
  processing_time_display: string;
  fee_multiplier: string;
  additional_fee: string;
  is_active: boolean;
  sort_order: number;
}

/* ── Reason Codes ──────────────────────────────── */

export type ReasonCodeAction = "approve" | "reject" | "request_info" | "escalate" | "border_admit" | "border_deny" | "border_secondary";

export interface ReasonCode {
  id: number;
  code: string;
  action_type: ReasonCodeAction;
  reason: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

/* ── Application ─────────────────────────────── */

export type ApplicationStatus =
  | "draft"
  | "submitted_awaiting_payment"
  | "pending_payment"
  | "paid_submitted"
  | "submitted"
  | "under_review"
  | "pending_approval"
  | "additional_info_requested"
  | "escalated"
  | "approved"
  | "denied"
  | "issued"
  | "cancelled";

export type Tier = "tier_1" | "tier_2";
export type ProcessingTier = "express" | "fast_track" | "regular";

export interface Application {
  id: number;
  reference_number: string;
  user_id: number;
  visa_type_id: number;
  service_tier_id?: number | null;
  entry_type?: "single" | "multiple" | null;
  // Decrypted PII fields (returned by API)
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string | null;
  marital_status: string | null;
  profession: string | null;
  country_of_birth: string | null;
  passport_number: string;
  passport_issue_date: string | null;
  passport_expiry: string | null;
  nationality: string;
  email: string;
  phone: string | null;
  intended_arrival: string | null;
  duration_days: number | null;
  visa_duration: number | null;
  port_of_entry: string | null;
  address_in_ghana: string | null;
  purpose_of_visit: string | null;
  visited_country_1: string | null;
  visited_country_2: string | null;
  visited_country_3: string | null;
  // Health & Security Declarations
  health_declaration_fever: boolean | null;
  health_declaration_cough: boolean | null;
  health_declaration_breathing: boolean | null;
  health_declaration_ebola: boolean | null;
  health_declaration_yellow_fever: boolean | null;
  security_declaration_convicted: boolean | null;
  security_declaration_deported: boolean | null;
  security_declaration_terrorist: boolean | null;
  status: ApplicationStatus;
  tier: Tier | null;
  processing_tier: ProcessingTier | null;
  assigned_agency: "gis" | "mfa" | null;
  risk_screening_status: "pending" | "in_progress" | "cleared" | "flagged" | null;
  risk_score: number | null;
  risk_level: "low" | "medium" | "high" | "critical" | null;
  riskAssessment?: {
    risk_score: number;
    risk_level: "low" | "medium" | "high" | "critical";
    factors: Array<{
      name: string;
      triggered: boolean;
      score: number;
      details?: string;
    }>;
    watchlist_match: boolean;
  };
  watchlist_flagged: boolean;
  assigned_officer_id: number | null;
  current_queue: "review_queue" | "approval_queue" | null;
  current_step: number;
  submitted_at: string | null;
  sla_deadline: string | null;
  decided_at: string | null;
  decision_notes: string | null;
  evisa_file_path: string | null;
  evisa_qr_code: string | null;
  created_at: string;
  updated_at: string;
  visa_type?: VisaType;
  service_tier?: ServiceTier;
  documents?: ApplicationDocument[];
  payment?: Payment;
  status_history?: StatusHistoryEntry[];
  internal_notes?: InternalNote[];
  user?: Pick<User, "id" | "first_name" | "last_name" | "email">;
  assigned_officer?: Pick<User, "id" | "first_name" | "last_name"> | null;
}

/* ── Documents ───────────────────────────────── */

export interface ApplicationDocument {
  id: number;
  application_id: number;
  document_type: string;
  original_filename: string;
  stored_path: string;
  mime_type: string;
  file_size: number;
  ocr_status: string | null;
  ocr_result: string | null;
  verification_status: string | null;
  rejection_reason: string | null;
  created_at: string;
}

/* ── Payment ─────────────────────────────────── */

export interface Payment {
  id: number;
  application_id: number;
  user_id: number;
  transaction_reference: string;
  payment_provider: string;
  provider_reference: string | null;
  amount: string;
  currency: string;
  status: "pending" | "completed" | "failed";
  paid_at: string | null;
  created_at: string;
}

/* ── Status History ──────────────────────────── */

export interface StatusHistoryEntry {
  id: number;
  to_status: ApplicationStatus;
  notes: string | null;
  created_at: string;
  changed_by_user?: Pick<User, "id" | "first_name" | "last_name">;
}

/* ── Internal Notes ──────────────────────────── */

export interface InternalNote {
  id: number;
  application_id: number;
  user_id: number;
  content: string;
  is_private: boolean;
  created_at: string;
  user?: Pick<User, "id" | "first_name" | "last_name">;
}

/* ── Tier Rules ──────────────────────────────── */

export interface TierRule {
  id: number;
  visa_type_id: number;
  tier: Tier;
  name: string;
  description: string | null;
  conditions: Record<string, unknown>;
  route_to: "gis" | "mfa";
  sla_hours: number;
  priority: number;
  is_active: boolean;
  visa_type?: Pick<VisaType, "id" | "name" | "slug">;
}

/* ── Audit Log ───────────────────────────────── */

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  created_at: string;
  user?: Pick<User, "id" | "first_name" | "last_name" | "role">;
}

/* ── Metrics ─────────────────────────────────── */

export interface GisMetrics {
  pending_review: number;
  in_review: number;
  pending_approval: number;
  approved_today: number;
  issued_today: number;
  total_approved: number;
  total_denied: number;
  sla_breaches: number;
  review_queue: number;
  approval_queue: number;
}

export interface MfaMetrics {
  total_escalated: number;
  pending_decision: number;
  pending_approval: number;
  approved_today: number;
  denied_today: number;
  issued_today: number;
  total_approved: number;
  total_denied: number;
  sla_breaches: number;
  review_queue: number;
  approval_queue: number;
}

export interface AdminOverview {
  applications: {
    total: number;
    draft: number;
    submitted: number;
    under_review: number;
    approved: number;
    denied: number;
    escalated: number;
  };
  payments: {
    total_collected: string;
    completed: number;
    failed: number;
    pending: number;
  };
  sla: Record<string, unknown>;
  users: {
    total_applicants: number;
    total_officers: number;
    active_officers: number;
  };
}

/* ── Paginated Response ──────────────────────── */

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/* ── Status Timeline (applicant view) ────────── */

export interface ApplicationTimeline {
  status: ApplicationStatus;
  reference_number: string;
  tier: Tier | null;
  sla_hours_left: number | null;
  timeline: {
    status: ApplicationStatus;
    notes: string | null;
    changed_at: string;
  }[];
}
