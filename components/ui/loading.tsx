"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className = "", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
      aria-label={text || "Loading"}
    >
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} aria-hidden="true" />
      {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
      {!text && <span className="sr-only">Loading...</span>}
    </div>
  );
}

interface LoadingCardProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function LoadingCard({ title = "Loading...", subtitle = "Please wait", className = "" }: LoadingCardProps) {
  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`${title}. ${subtitle}`}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" aria-hidden="true" />
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

interface SkeletonProps {
  lines?: number;
  className?: string;
}

export function Skeleton({ lines = 3, className = "" }: SkeletonProps) {
  return (
    <div 
      className={`space-y-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={`h-4 bg-gray-200 rounded animate-pulse ${
            i === lines - 1 ? "w-3/4" : "w-full"
          }`}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
}
