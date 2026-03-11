"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Select } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge, SlaIndicator } from "@/components/ui/badge";
import { RiskBadge } from "@/components/ui/risk-badge";
import type { Application, PaginatedResponse } from "@/lib/types";

export default function MfaEscalationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [queue, setQueue] = useState("");
  const [mission, setMission] = useState("");

  const { data: missionsData } = useQuery({
    queryKey: ["mfa-missions"],
    queryFn: () =>
      api.get<{ missions: { id: number; name: string; city: string; country_name: string }[] }>("/mfa/missions").then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["mfa-escalations", page, status, queue, mission],
    queryFn: () =>
      api
        .get<PaginatedResponse<Application>>("/mfa/escalations", {
          params: { page, ...(status && { status }), ...(queue && { queue }), ...(mission && { mission }) },
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
      key: "visa_type",
      header: "Visa Type",
      render: (row: Application) => row.visa_type?.name || "—",
    },
    {
      key: "processing_tier",
      header: "Processing Tier",
      render: (row: Application) => {
        const tierColors: Record<string, string> = {
          express: "bg-success/10 text-success",
          fast_track: "bg-info/10 text-info",
          regular: "bg-warning/10 text-warning",
        };
        const tier = row.processing_tier || "regular";
        const color = tierColors[tier] || "bg-surface text-text-muted";
        return (
          <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${color}`}>
            {tier.replace("_", " ")}
          </span>
        );
      },
    },
    {
      key: "risk_level",
      header: "Risk Level",
      render: (row: Application) => (
        <RiskBadge level={row.riskAssessment?.risk_level ?? null} />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: Application) => <StatusBadge status={row.status} />,
    },
    {
      key: "assigned_officer",
      header: "Assigned To",
      render: (row: Application) =>
        row.assigned_officer
          ? `${row.assigned_officer.first_name} ${row.assigned_officer.last_name}`
          : "Unassigned",
    },
    {
      key: "sla_deadline",
      header: "SLA",
      render: (row: Application) => {
        if (!row.sla_deadline) return <span className="text-text-muted">—</span>;
        const hoursLeft = Math.max(
          0,
          (new Date(row.sla_deadline).getTime() - Date.now()) / 3600000
        );
        return <SlaIndicator hoursLeft={hoursLeft} isWithinSla={hoursLeft > 0} />;
      },
    },
  ];

  return (
    <DashboardShell
      title="Escalation Inbox"
      description="Cases escalated to Ministry of Foreign Affairs for review"
    >
      {/* Filters */}
      <div className="card mb-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <Select
            label="Filter by Queue"
            value={queue}
            onChange={(e) => {
              setQueue(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "", label: "All Queues" },
              { value: "review_queue", label: "Review Queue" },
              { value: "approval_queue", label: "Approval Queue" },
            ]}
          />
          <Select
            label="Filter by Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
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
            label="Filter by Mission"
            value={mission}
            onChange={(e) => {
              setMission(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "", label: "All Missions" },
              ...(missionsData?.missions?.map((m) => ({
                value: String(m.id),
                label: `${m.name} — ${m.city}, ${m.country_name}`,
              })) || []),
            ]}
          />
        </div>
      </div>

      <DataTable<Application>
        columns={columns}
        data={data?.data || []}
        currentPage={data?.current_page}
        lastPage={data?.last_page}
        onPageChange={setPage}
        onRowClick={(row) =>
          router.push(`/dashboard/mfa/escalations/${row.id}`)
        }
        loading={isLoading}
        emptyMessage="No escalated cases found."
      />
    </DashboardShell>
  );
}
