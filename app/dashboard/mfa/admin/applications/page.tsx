"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge, SlaIndicator } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import type { Application, PaginatedResponse } from "@/lib/types";
import { Search } from "lucide-react";

export default function MfaAdminApplicationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [queue, setQueue] = useState("");
  const [missionId, setMissionId] = useState("");
  const [search, setSearch] = useState("");

  const { data: missionsData } = useQuery({
    queryKey: ["mfa-missions"],
    queryFn: () =>
      api
        .get<{ missions: { id: number; name: string; city: string; country_name: string }[] }>("/mfa/missions")
        .then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["mfa-admin-applications", page, status, queue, missionId, search],
    queryFn: () =>
      api
        .get<PaginatedResponse<Application>>("/mfa/admin/applications", {
          params: {
            page,
            per_page: 20,
            ...(status && { status }),
            ...(queue && { queue }),
            ...(missionId && { mission_id: missionId }),
            ...(search && { search }),
          },
        })
        .then((r) => r.data),
  });

  const columns = [
    {
      key: "reference_number",
      header: "Reference",
      render: (row: Application) => (
        <span className="font-medium text-text-primary">
          {row.reference_number}
        </span>
      ),
    },
    {
      key: "applicant",
      header: "Applicant",
      render: (row: Application) => (
        <div>
          <p className="text-sm font-semibold text-text-primary">
            {row.user?.first_name} {row.user?.last_name}
          </p>
          <p className="text-xs text-text-muted">{row.user?.email}</p>
        </div>
      ),
    },
    {
      key: "visa_type",
      header: "Visa Type",
      render: (row: Application) => row.visa_type?.name || "—",
    },
    {
      key: "status",
      header: "Status",
      render: (row: Application) => <StatusBadge status={row.status} />,
    },
    {
      key: "current_queue",
      header: "Queue",
      render: (row: Application) => (
        <span className="text-xs uppercase tracking-wide text-text-muted">
          {row.current_queue?.replace("_", " ") || "—"}
        </span>
      ),
    },
    {
      key: "owner_mission_id",
      header: "Mission",
      render: (row: Application) => (
        <span className="text-xs text-text-muted">
          {row.owner_mission_id ? `Mission #${row.owner_mission_id}` : "—"}
        </span>
      ),
    },
    {
      key: "sla",
      header: "SLA",
      render: (row: Application) => {
        if (!row.sla_deadline) return <span className="text-text-muted text-sm">—</span>;
        const hoursLeft = Math.max(0, (new Date(row.sla_deadline).getTime() - Date.now()) / 3600000);
        return <SlaIndicator hoursLeft={hoursLeft} isWithinSla={hoursLeft > 0} />;
      },
    },
    {
      key: "created_at",
      header: "Created",
      render: (row: Application) => (
        <span className="text-xs text-text-muted">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <DashboardShell
      title="MFA Applications"
      description="All escalated applications across missions"
    >
      <div className="card mb-6">
        <div className="grid md:grid-cols-5 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by reference or applicant"
              className="input !pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value.trimStart());
                setPage(1);
              }}
            />
          </div>
          <Select
            value={queue}
            onChange={(e) => {
              setQueue(e.target.value);
              setPage(1);
            }}
            placeholder="All Queues"
            options={[
              { value: "", label: "All Queues" },
              { value: "review_queue", label: "Review Queue" },
              { value: "approval_queue", label: "Approval Queue" },
            ]}
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            placeholder="All Statuses"
            options={[
              { value: "", label: "All Statuses" },
              { value: "escalated", label: "Escalated" },
              { value: "under_review", label: "Under Review" },
              { value: "pending_approval", label: "Pending Approval" },
              { value: "approved", label: "Approved" },
              { value: "denied", label: "Denied" },
              { value: "issued", label: "Issued" },
            ]}
          />
          <Select
            value={missionId}
            onChange={(e) => {
              setMissionId(e.target.value);
              setPage(1);
            }}
            placeholder="All Missions"
            options={[
              { value: "", label: "All Missions" },
              ...(missionsData?.missions.map((m) => ({
                value: m.id.toString(),
                label: `${m.name} (${m.city})`,
              })) ?? []),
            ]}
          />
          <Input readOnly value={`${data?.total ?? 0} total`} label="Total" />
        </div>
      </div>

      <DataTable<Application>
        columns={columns}
        data={data?.data || []}
        currentPage={data?.current_page}
        lastPage={data?.last_page}
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/dashboard/mfa/escalations/${row.id}`)}
        loading={isLoading}
        emptyMessage="No applications found."
      />
    </DashboardShell>
  );
}
