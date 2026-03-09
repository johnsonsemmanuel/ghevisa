import React from "react";
import type { ApplicationStatus } from "@/lib/types";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant, className = "" }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>{children}</span>
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
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function SlaIndicator({ hoursLeft, isWithinSla }: { hoursLeft: number | null; isWithinSla?: boolean }) {
  if (hoursLeft === null) return null;
  const hours = Math.round(hoursLeft);
  if (!isWithinSla || hours <= 0) {
    return <Badge variant="danger">SLA Breached</Badge>;
  }
  if (hours <= 12) {
    return <Badge variant="warning">{hours}h left</Badge>;
  }
  return <Badge variant="success">{hours}h left</Badge>;
}
