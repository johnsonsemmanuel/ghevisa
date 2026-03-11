"use client";

import { Shield, AlertTriangle, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

interface RiskScoreCardProps {
  riskScore: number | null;
  riskLevel: "low" | "medium" | "high" | "critical" | null;
  riskReasons?: string[];
  overrideFlag?: boolean;
  overrideBy?: {
    first_name: string;
    last_name: string;
  };
  overrideTimestamp?: string;
}

const riskLevelConfig = {
  low: {
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: CheckCircle2,
    label: "Low Risk",
  },
  medium: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: AlertTriangle,
    label: "Medium Risk",
  },
  high: {
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    icon: AlertTriangle,
    label: "High Risk",
  },
  critical: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: XCircle,
    label: "Critical Risk",
  },
};

export function RiskScoreCard({ riskScore, riskLevel, riskReasons = [], overrideFlag, overrideBy, overrideTimestamp }: RiskScoreCardProps) {
  const config = riskLevel ? riskLevelConfig[riskLevel] : null;
  const Icon = config?.icon || Shield;

  return (
    <div className={`rounded-lg border-2 p-4 ${config?.bgColor || "bg-gray-50"} ${config?.borderColor || "border-gray-200"} ${overrideFlag ? "ring-2 ring-orange-300" : ""}`}>
      {/* Header with Score and Level */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config?.bgColor || "bg-gray-100"}`}>
            <Icon size={20} className={config?.color || "text-gray-500"} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Risk Score</p>
            <p className={`text-lg font-bold ${config?.color || "text-gray-700"}`}>
              {config?.label || "Not Assessed"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${config?.color || "text-gray-700"}`}>
            {riskScore ?? "—"}
          </p>
          <p className="text-xs text-gray-500">/ 100</p>
        </div>
      </div>

      {/* Risk Score Bar */}
      {riskScore !== null && (
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                riskLevel === "low"
                  ? "bg-green-500"
                  : riskLevel === "medium"
                  ? "bg-yellow-500"
                  : riskLevel === "high"
                  ? "bg-orange-500"
                  : riskLevel === "critical"
                  ? "bg-red-500"
                  : "bg-gray-300"
              }`}
              style={{ width: `${riskScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Override Indicator */}
      {overrideFlag && (
        <div className="mt-3 pt-3 border-t border-orange-200">
          <div className="flex items-center gap-2 text-xs text-orange-700">
            <CheckCircle2 size={14} />
            <span className="font-medium">Reviewed/Overridden</span>
            {overrideBy && (
              <>
                <span>•</span>
                <span>By {overrideBy.first_name} {overrideBy.last_name}</span>
              </>
            )}
            {overrideTimestamp && (
              <>
                <span>•</span>
                <span>{new Date(overrideTimestamp).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Top Contributing Factors */}
      {riskReasons && riskReasons.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-gray-500" />
            <p className="text-sm font-semibold text-gray-700">Top Contributing Factors</p>
          </div>
          <ul className="space-y-1">
            {riskReasons.slice(0, 5).map((reason, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>{reason}</span>
              </li>
            ))}
            {riskReasons.length > 5 && (
              <li className="text-xs text-gray-500 italic">
                ... and {riskReasons.length - 5} more factors
              </li>
            )}
          </ul>
        </div>
      )}

      {/* No Risk Data */}
      {!riskScore && !riskLevel && (
        <div className="text-center py-2">
          <p className="text-sm text-gray-500">Risk assessment not available</p>
        </div>
      )}
    </div>
  );
}
