"use client";

import { AlertTriangle, Info, Shield, ArrowUp } from "lucide-react";

interface RiskGuidanceProps {
  riskLevel: "low" | "medium" | "high" | "critical" | null;
}

const guidanceConfig = {
  low: {
    icon: Info,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    title: "Standard Review",
    message: "No additional steps required",
  },
  medium: {
    icon: Shield,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    title: "Enhanced Review",
    message: "Review supporting documents carefully before proceeding",
  },
  high: {
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    title: "Manual Verification Required",
    message: "Check all documents and declarations",
  },
  critical: {
    icon: ArrowUp,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    title: "Supervisor Escalation Required",
    message: "Escalate to supervisor before taking action",
  },
};

export function RiskGuidance({ riskLevel }: RiskGuidanceProps) {
  if (!riskLevel) {
    return null;
  }

  const config = guidanceConfig[riskLevel];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
          <Icon size={18} className={config.color} />
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold text-sm ${config.color}`}>
            {config.title}
          </h4>
          <p className="text-sm text-gray-600 mt-0.5">
            {config.message}
          </p>
        </div>
      </div>
    </div>
  );
}
