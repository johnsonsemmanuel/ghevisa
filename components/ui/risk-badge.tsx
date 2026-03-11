"use client";

import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface RiskBadgeProps {
  level: "low" | "medium" | "high" | "critical" | null;
}

const riskConfig = {
  low: {
    color: "bg-success/10 text-success border-success/20",
    icon: CheckCircle2,
    label: "Low",
  },
  medium: {
    color: "bg-warning/10 text-warning border-warning/20",
    icon: AlertTriangle,
    label: "Medium",
  },
  high: {
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    icon: AlertTriangle,
    label: "High",
  },
  critical: {
    color: "bg-danger/10 text-danger border-danger/20",
    icon: XCircle,
    label: "Critical",
  },
};

export function RiskBadge({ level }: RiskBadgeProps) {
  if (!level) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
        —
      </span>
    );
  }

  const config = riskConfig[level];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}
