"use client";

import React from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  children: React.ReactNode;
}

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 touch-manipulation active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-accent hover:bg-accent-dark text-white shadow-sm disabled:shadow-none",
  secondary:
    "border border-border text-text-secondary hover:bg-surface bg-white",
  ghost: "text-text-secondary hover:bg-surface hover:text-text-primary",
  danger:
    "bg-danger/10 text-danger hover:bg-danger hover:text-white border border-danger/20",
  outline:
    "border border-border text-text-primary hover:bg-surface bg-white hover:border-accent",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading && (
        <Loader2 size={16} className="animate-spin shrink-0" aria-hidden />
      )}
      {!loading && leftIcon}
      {children}
    </button>
  );
}
