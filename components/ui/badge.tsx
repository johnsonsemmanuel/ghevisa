import React from "react";
import type { ApplicationStatus } from "@/lib/types";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant: BadgeVariant;
  className?: string;
  'aria-label'?: string;
}

export function Badge({ children, variant, className = '', 'aria-label': ariaLabel }: BadgeProps) {
  return (
    <span 
      className={`badge badge-${variant} ${className}`}
      aria-label={ariaLabel}
      role="status"
    >
      {children}
    </span>
  );
}

const statusMap: Record<ApplicationStatus, { label: string; variant: BadgeVariant }> = {
  draft: { label: "Draft", variant: "neutral" },
  submitted_awaiting_payment: { label: "Awaiting Payment", variant: "warning" },
  pending_payment: { label: "Pending Payment", variant: "warning" },
  paid_submitted: { label: "Paid - Submitted", variant: "info" },
  submitted: { label: "Submitted", variant: "info" },
  under_review: { label: "Under Review", variant: "info" },
  pending_approval: { label: "Pending Approval", variant: "warning" },
  additional_info_requested: { label: "Info Requested", variant: "warning" },
  escalated: { label: "Escalated", variant: "danger" },
  approved: { label: "Approved", variant: "success" },
  denied: { label: "Denied", variant: "danger" },
  issued: { label: "Visa Issued", variant: "success" },
  revoked: { label: "Revoked", variant: "danger" },
  expired: { label: "Expired", variant: "neutral" },
  appealed: { label: "Appealed", variant: "warning" },
  cancelled: { label: "Cancelled", variant: "neutral" },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusMap[status] || { label: status, variant: "neutral" as BadgeVariant };
  
  // Generate descriptive ARIA label
  const ariaLabel = `Application status: ${config.label}`;
  
  return (
    <Badge variant={config.variant} aria-label={ariaLabel}>
      {config.label}
    </Badge>
  );
}

export function SlaIndicator({ hoursLeft, isWithinSla }: { hoursLeft: number | null; isWithinSla?: boolean }) {
  if (hoursLeft === null) return null;
  
  const hours = Math.round(hoursLeft);
  let variant: BadgeVariant;
  let label: string;
  let ariaLabel: string;
  
  if (!isWithinSla || hours <= 0) {
    variant = "danger";
    label = "SLA Breached";
    ariaLabel = "Service Level Agreement breached - urgent action required";
  } else if (hours <= 12) {
    variant = "warning";
    label = `${hours}h left`;
    ariaLabel = `${hours} hours remaining until SLA deadline - action needed soon`;
  } else {
    variant = "success";
    label = `${hours}h left`;
    ariaLabel = `${hours} hours remaining until SLA deadline - within acceptable timeframe`;
  }
  
  return <Badge variant={variant} aria-label={ariaLabel}>{label}</Badge>;
}
