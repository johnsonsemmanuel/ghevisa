"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DataTable } from "@/components/ui/display/data-table";
import { StatusBadge } from "@/components/ui/display/badge";
import type { AgencyApplicantSummary, PaginatedResponse } from "@/lib/types";
import { Search, Users } from "lucide-react";

export default function MfaAdminApplicantsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["mfa-admin-applicants", page, search],
    queryFn: () =>
      api
        .get<PaginatedResponse<AgencyApplicantSummary>>("/mfa/admin/applicants", {
          params: {
            page,
            per_page: 15,
            ...(search && { search }),
          },
        })
        .then((r) => r.data),
  });

  const columns = [
    {
      key: "name",
      header: "Applicant",
      render: (row: AgencyApplicantSummary) => (
        <div>
          <p className="font-semibold text-text-primary">
            {row.first_name} {row.last_name}
          </p>
          <p className="text-xs text-text-muted">{row.email}</p>
        </div>
      ),
    },
    {
      key: "mfa_applications_count",
      header: "MFA Applications",
      className: "w-40",
      render: (row: AgencyApplicantSummary) => (
        <span className="text-sm font-semibold">{row.mfa_applications_count ?? 0}</span>
      ),
    },
    {
      key: "status",
      header: "Latest Status",
      render: (row: AgencyApplicantSummary) => {
        const latest = row.applications?.[0];
        if (!latest) return <span className="text-xs text-text-muted">—</span>;
        return <StatusBadge status={latest.status} />;
      },
    },
    {
      key: "mission",
      header: "Mission",
      render: (row: AgencyApplicantSummary) => {
        const mission = row.applications?.[0]?.owner_mission_id;
        return mission ? <span className="text-xs text-text-muted">Mission #{mission}</span> : <span className="text-xs text-text-muted">—</span>;
      },
    },
  ];

  return (
    <DashboardShell
      title="Applicant Management"
      description="Applicants with escalated cases"
      actions={
        <button className="button button-secondary" onClick={() => router.push("/dashboard/mfa/admin")}>Back to Overview</button>
      }
    >
      <div className="card mb-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              className="input !pl-9"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value.trimStart());
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Users size={16} />
            <span>{data?.total ?? 0} applicant(s)</span>
          </div>
        </div>
      </div>

      <DataTable<AgencyApplicantSummary>
        columns={columns}
        data={data?.data || []}
        currentPage={data?.current_page}
        lastPage={data?.last_page}
        onPageChange={setPage}
        onRowClick={(row) => {
          const latest = row.applications?.[0];
          if (latest) {
            router.push(`/dashboard/mfa/escalations/${latest.id}`);
          }
        }}
        loading={isLoading}
        emptyMessage="No applicants match your filters."
      />
    </DashboardShell>
  );
}
