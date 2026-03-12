"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Button } from "../button";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  currentPage?: number;
  lastPage?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  currentPage = 1,
  lastPage = 1,
  onPageChange,
  onRowClick,
  emptyMessage = "No data found",
  loading = false,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div 
        className="bg-white rounded-2xl border border-black/6 overflow-hidden shadow-sm"
        role="status"
        aria-live="polite"
        aria-label="Loading table data"
      >
        <div className="animate-pulse">
          <div className="h-12 bg-surface/80" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-t border-border-light">
              <div className="h-3.5 w-24 bg-surface rounded-md" />
              <div className="h-3.5 flex-1 bg-surface rounded-md" />
              <div className="h-3.5 w-16 bg-surface rounded-md" />
              <div className="h-3.5 w-20 bg-surface rounded-md" />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading table data, please wait...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-black/6 overflow-hidden shadow-sm">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Data table">
          <thead>
            <tr className="bg-surface/60" role="row">
              {columns.map((col) => (
                <th
                  key={col.key}
                  role="columnheader"
                  className={`text-left px-5 py-3.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">
            {data.length === 0 ? (
              <tr role="row">
                <td colSpan={columns.length} className="text-center py-16" role="cell">
                  <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Inbox size={24} className="text-text-muted" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-text-muted">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  role="row"
                  onClick={() => onRowClick?.(row)}
                  className={`border-t border-border-light/80 transition-all duration-150 ${
                    onRowClick
                      ? "hover:bg-surface/50 cursor-pointer"
                      : ""
                  }`}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={onRowClick ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onRowClick(row);
                    }
                  } : undefined}
                  aria-label={onRowClick ? `View details for ${row.reference_number || 'item'}` : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      role="cell"
                      className={`px-5 py-4 text-text-primary ${col.className || ""}`}
                    >
                      {col.render
                        ? col.render(row)
                        : (row[col.key] as React.ReactNode) ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden" role="list" aria-label="Data list">
        {data.length === 0 ? (
          <div className="text-center py-16" role="status">
            <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Inbox size={24} className="text-text-muted" aria-hidden="true" />
            </div>
            <p className="text-sm text-text-muted">{emptyMessage}</p>
          </div>
        ) : (
          <div className="divide-y divide-border-light/80">
            {data.map((row, i) => (
              <div
                key={i}
                role="listitem"
                onClick={() => onRowClick?.(row)}
                className={`p-4 transition-all duration-150 ${
                  onRowClick
                    ? "hover:bg-surface/50 cursor-pointer"
                    : ""
                }`}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={onRowClick ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRowClick(row);
                  }
                } : undefined}
                aria-label={onRowClick ? `View details for ${row.reference_number || 'item'}` : undefined}
              >
                {/* Primary Info (Reference + Status) */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-text-primary text-sm">
                      {row.reference_number}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {row.visa_type?.name || "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    {columns.find(col => col.key === "status")?.render?.(row)}
                  </div>
                </div>

                {/* Secondary Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {columns
                    .filter(col => col.key !== "reference_number" && col.key !== "visa_type" && col.key !== "status")
                    .map((col) => (
                      <div key={col.key} className="space-y-1">
                        <p className="text-text-muted font-medium uppercase tracking-wider">
                          {col.header}
                        </p>
                        <p className="text-text-primary">
                          {col.render
                            ? col.render(row)
                            : (row[col.key] as React.ReactNode) ?? "—"}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {lastPage > 1 && onPageChange && (
        <nav 
          className="flex items-center justify-between px-5 py-3.5 border-t border-border-light bg-surface/40"
          role="navigation"
          aria-label="Table pagination"
        >
          <span className="text-xs text-text-muted font-medium" aria-live="polite">
            Page {currentPage} of {lastPage}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              leftIcon={<ChevronLeft size={14} />}
              aria-label={`Go to previous page (page ${currentPage - 1})`}
            >
              Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage >= lastPage}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label={`Go to next page (page ${currentPage + 1})`}
            >
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
