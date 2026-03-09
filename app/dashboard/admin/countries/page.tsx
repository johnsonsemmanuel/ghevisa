"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import {
  Globe,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  MapPin,
} from "lucide-react";

interface CountryData {
  period: { start: string; end: string };
  summary: {
    total_applications: number;
    total_issued: number;
    total_denied: number;
    total_pending: number;
    unique_countries: number;
  };
  top_countries: Array<{
    country_code: string;
    total: number;
    issued: number;
    approved: number;
    denied: number;
    pending: number;
    approval_rate: number;
  }>;
  applications_by_country: Array<{ country_code: string; total: number }>;
  issued_by_country: Array<{ country_code: string; issued: number }>;
  denied_by_country: Array<{ country_code: string; denied: number }>;
}

const countryNames: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CN: "China",
  IN: "India",
  NG: "Nigeria",
  ZA: "South Africa",
  DE: "Germany",
  FR: "France",
  CA: "Canada",
  AU: "Australia",
  GH: "Ghana",
  KE: "Kenya",
  EG: "Egypt",
  BR: "Brazil",
  JP: "Japan",
  KR: "South Korea",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  BE: "Belgium",
  CH: "Switzerland",
  SE: "Sweden",
  NO: "Norway",
};

const getCountryName = (code: string): string => {
  return countryNames[code?.toUpperCase()] || code || "Unknown";
};

const getCountryFlag = (code: string): string => {
  if (!code || code.length !== 2) return "🏳️";
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function CountryAnalyticsPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["country-analytics", startDate, endDate],
    queryFn: () =>
      api.get<CountryData>("/admin/analytics/countries", {
        params: { start_date: startDate, end_date: endDate },
      }).then((r) => r.data),
  });

  const handleExport = async () => {
    try {
      const response = await api.get("/admin/analytics/countries/export", {
        params: { start_date: startDate, end_date: endDate },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `country_analytics_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <DashboardShell
      title="Country Analytics"
      description="Applicant demographics and visa decision breakdown by nationality"
    >
      {/* Date Filter */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-text-muted" />
            <span className="text-sm font-medium text-text-secondary">Period:</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          />
          <span className="text-text-muted">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          />
          <Button onClick={() => refetch()} size="sm">
            Apply
          </Button>
          <Button onClick={handleExport} variant="secondary" size="sm">
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          {[...Array(5)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-primary" />
                </div>
              </div>
              <p className="text-sm text-text-muted mb-1">Total Applications</p>
              <p className="text-2xl font-bold text-text-primary">
                {data.summary.total_applications.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-success" />
                </div>
              </div>
              <p className="text-sm text-text-muted mb-1">Visas Issued</p>
              <p className="text-2xl font-bold text-success">
                {data.summary.total_issued.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center">
                  <XCircle size={20} className="text-danger" />
                </div>
              </div>
              <p className="text-sm text-text-muted mb-1">Denied</p>
              <p className="text-2xl font-bold text-danger">
                {data.summary.total_denied.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Clock size={20} className="text-warning" />
                </div>
              </div>
              <p className="text-sm text-text-muted mb-1">Pending</p>
              <p className="text-2xl font-bold text-warning">
                {data.summary.total_pending.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Globe size={20} className="text-accent" />
                </div>
              </div>
              <p className="text-sm text-text-muted mb-1">Countries</p>
              <p className="text-2xl font-bold text-accent">
                {data.summary.unique_countries.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Top Countries Table */}
          <div className="bg-white rounded-xl border border-border p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-primary" />
              <h3 className="font-semibold text-text-primary">Top Countries by Applications</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-text-secondary">Country</th>
                    <th className="text-right py-3 px-4 font-semibold text-text-secondary">Total</th>
                    <th className="text-right py-3 px-4 font-semibold text-text-secondary">Issued</th>
                    <th className="text-right py-3 px-4 font-semibold text-text-secondary">Approved</th>
                    <th className="text-right py-3 px-4 font-semibold text-text-secondary">Denied</th>
                    <th className="text-right py-3 px-4 font-semibold text-text-secondary">Pending</th>
                    <th className="text-right py-3 px-4 font-semibold text-text-secondary">Approval Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_countries.map((country, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-surface/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getCountryFlag(country.country_code)}</span>
                          <div>
                            <p className="font-medium text-text-primary">
                              {getCountryName(country.country_code)}
                            </p>
                            <p className="text-xs text-text-muted">{country.country_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-text-primary">
                        {country.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-success font-medium">
                        {country.issued.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-primary font-medium">
                        {country.approved.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-danger font-medium">
                        {country.denied.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-warning font-medium">
                        {country.pending.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            country.approval_rate >= 80
                              ? "bg-success/10 text-success"
                              : country.approval_rate >= 50
                              ? "bg-warning/10 text-warning"
                              : "bg-danger/10 text-danger"
                          }`}
                        >
                          {country.approval_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {data.top_countries.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-text-muted">
                        No application data in this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* All Countries Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Applications by Country */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={20} className="text-primary" />
                <h3 className="font-semibold text-text-primary">All Applications by Country</h3>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {data.applications_by_country.map((country, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-surface rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getCountryFlag(country.country_code)}</span>
                      <span className="font-medium text-text-primary">
                        {getCountryName(country.country_code)}
                      </span>
                    </div>
                    <span className="font-semibold text-primary">
                      {country.total.toLocaleString()}
                    </span>
                  </div>
                ))}
                {data.applications_by_country.length === 0 && (
                  <p className="text-center text-text-muted py-4">No data available</p>
                )}
              </div>
            </div>

            {/* Issued vs Denied Comparison */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={20} className="text-primary" />
                <h3 className="font-semibold text-text-primary">Visa Decision by Country</h3>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {data.issued_by_country.map((country, i) => {
                  const denied = data.denied_by_country.find(
                    (d) => d.country_code === country.country_code
                  );
                  return (
                    <div key={i} className="p-3 bg-surface rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getCountryFlag(country.country_code)}</span>
                          <span className="font-medium text-text-primary">
                            {getCountryName(country.country_code)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-success">
                          ✓ {country.issued} issued
                        </span>
                        <span className="text-danger">
                          ✗ {denied?.denied || 0} denied
                        </span>
                      </div>
                    </div>
                  );
                })}
                {data.issued_by_country.length === 0 && (
                  <p className="text-center text-text-muted py-4">No decision data available</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-text-muted">Failed to load country analytics</div>
      )}
    </DashboardShell>
  );
}
