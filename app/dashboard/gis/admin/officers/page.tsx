"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DataTable } from "@/components/ui/data-table";
import type { AgencyOfficerSummary, PaginatedResponse } from "@/lib/types";
import { Search, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";

export default function GisAdminOfficersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("active");

  const { data, isLoading } = useQuery({
    queryKey: ["gis-admin-officers", page, search, role, status],
    queryFn: () =>
      api
        .get<PaginatedResponse<AgencyOfficerSummary>>("/gis/admin/officers", {
          params: {
            page,
            per_page: 15,
            ...(search && { search }),
            ...(role && { role }),
          },
        })
        .then((r) => r.data),
  });

  const filteredData = data?.data?.filter((officer) =>
    status === "all" ? true : status === "active" ? officer.is_active : !officer.is_active
  ) || [];

  const columns = [
    {
      key: "officer",
      header: "Officer",
      render: (row: AgencyOfficerSummary) => (
        <div>
          <p className="font-semibold text-text-primary">
            {row.first_name} {row.last_name}
          </p>
          <p className="text-xs text-text-muted">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row: AgencyOfficerSummary) => (
        <span className="text-xs uppercase tracking-wide text-text-muted">
          {row.role.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "assigned_cases_count",
      header: "Assigned Cases",
      render: (row: AgencyOfficerSummary) => (
        <span className="font-semibold">{row.assigned_cases_count}</span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (row: AgencyOfficerSummary) => (
        <Badge variant={row.is_active ? "success" : "danger"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <DashboardShell
      title="Officer Management"
      description="Monitor workload and availability of GIS officers"
    >
      <div className="card mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name or email"
              className="input !pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "", label: "All Roles" },
              { value: "gis_reviewer", label: "Reviewer" },
              { value: "gis_approver", label: "Approver" },
              { value: "gis_admin", label: "Admin" },
            ]}
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "all", label: "All Statuses" },
            ]}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <Shield size={16} />
        <span>
          {filteredData.length} of {data?.total ?? 0} officer(s)
        </span>
      </div>

      <DataTable<AgencyOfficerSummary>
        columns={columns}
        data={filteredData}
        currentPage={data?.current_page}
        lastPage={data?.last_page}
        onPageChange={setPage}
        loading={isLoading}
        emptyMessage="No officers match your filters."
      />
    </DashboardShell>
  );
}
