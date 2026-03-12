"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className = "",
  id,
  type,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          className={`input ${error ? "!border-danger focus:!ring-danger/20" : ""} ${isPassword ? "pr-10" : ""} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {hint && !error && (
        <p className="text-text-muted text-xs mt-1">{hint}</p>
      )}
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`input ${error ? "!border-danger focus:!ring-danger/20" : ""} ${className}`}
        {...props}
      />
      {hint && !error && (
        <p className="text-text-muted text-xs mt-1">{hint}</p>
      )}
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
  children?: React.ReactNode;
}

export function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  children,
  className = "",
  id,
  ...props
}: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`input ${error ? "!border-danger focus:!ring-danger/20" : ""} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && (
        <p className="text-text-muted text-xs mt-1">{hint}</p>
      )}
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}
