"use client";

import React from "react";

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  showValues?: boolean;
}

export function BarChart({ data, maxValue, showValues = true }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{item.label}</span>
            {showValues && <span className="font-medium text-text-primary">{item.value}</span>}
          </div>
          <div className="h-2.5 bg-surface rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${item.color || "bg-primary"}`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}

export function DonutChart({ data, size = 160, strokeWidth = 24 }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((item, i) => {
            const percentage = total > 0 ? item.value / total : 0;
            const strokeDasharray = `${percentage * circumference} ${circumference}`;
            const strokeDashoffset = -offset;
            offset += percentage * circumference;

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-text-primary">{total}</span>
          <span className="text-xs text-text-muted">Total</span>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-text-secondary">{item.label}</span>
            <span className="text-sm font-medium text-text-primary ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  color: string;
}

export function StatCard({ label, value, change, changeType, icon, color }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-medium ${
            changeType === "up" ? "text-success" : changeType === "down" ? "text-danger" : "text-text-muted"
          }`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  );
}

interface TimelineChartProps {
  data: { label: string; value: number }[];
  color?: string;
}

export function TimelineChart({ data, color = "#22c55e" }: TimelineChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const height = 80;
  const width = 100;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.value / max) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          fill={`${color}20`}
          stroke="none"
          points={`0,${height} ${points} ${width},${height}`}
        />
      </svg>
      <div className="flex justify-between mt-2">
        {data.map((d, i) => (
          <span key={i} className="text-xs text-text-muted">{d.label}</span>
        ))}
      </div>
    </div>
  );
}
