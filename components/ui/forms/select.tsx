import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = "", options, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-lg border border-border bg-white
            text-text-primary text-sm
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
            disabled:bg-surface disabled:text-text-muted disabled:cursor-not-allowed
            ${error ? "border-danger focus:ring-danger focus:border-danger" : ""}
            ${className}
          `}
          {...props}
        >
          {options
            ? options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            : children}
        </select>
        {error && (
          <p className="mt-1 text-xs text-danger">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
