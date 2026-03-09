"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { Plus, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import type { Application, PaginatedResponse } from "@/lib/types";
import { Modal } from "@/components/ui/modal";

export default function ApplicationsListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["applicant-applications", page],
    queryFn: () =>
      api
        .get<PaginatedResponse<Application>>("/applicant/applications", {
          params: { page },
        })
        .then((r) => r.data),
  });

  // Visa Issued Popup Logic
  const [issuedVisaToShow, setIssuedVisaToShow] = useState<Application | null>(null);

  useEffect(() => {
    if (!data?.data) return;

    // Find the first issued visa
    const issuedVisas = data.data.filter((app) => app.status === "issued");

    // Check localStorage for seen visas
    const seenVisas = JSON.parse(localStorage.getItem("seen_issued_visas") || "[]");

    // Show popup for the first unseen issued visa
    for (const app of issuedVisas) {
      if (!seenVisas.includes(app.id)) {
        setIssuedVisaToShow(app);
        break; // Show one at a time
      }
    }
  }, [data?.data]);

  const handleClosePopup = () => {
    if (issuedVisaToShow) {
      const seenVisas = JSON.parse(localStorage.getItem("seen_issued_visas") || "[]");
      localStorage.setItem("seen_issued_visas", JSON.stringify([...seenVisas, issuedVisaToShow.id]));
      setIssuedVisaToShow(null);
    }
  };

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
      key: "status",
      header: "Status",
      render: (row: Application) => <StatusBadge status={row.status} />,
    },
    {
      key: "payment",
      header: "Payment",
      render: (row: Application) => {
        if (!row.payment) return <span className="text-text-muted">—</span>;
        const color =
          row.payment.status === "completed"
            ? "text-success"
            : row.payment.status === "failed"
              ? "text-danger"
              : "text-warning";
        return (
          <span className={`text-sm font-medium ${color} capitalize`}>
            {row.payment.status}
          </span>
        );
      },
    },
    {
      key: "created_at",
      header: "Created",
      render: (row: Application) =>
        new Date(row.created_at).toLocaleDateString(),
    },
  ];

  return (
    <DashboardShell
      title="My Applications"
      description="View and manage all your visa applications"
      actions={
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => router.push("/dashboard/applicant/applications/new")}
        >
          New Application
        </Button>
      }
    >
      {/* ── Denied Applications Support Banner ── */}
      {!isLoading && data?.data.some(a => a.status === "denied") && (
        <div className="rounded-2xl bg-gradient-to-r from-danger/10 via-danger/5 to-rose-50/5 border border-danger/20 p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-danger" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-sm">Application(s) Denied?</h3>
              <p className="text-xs text-text-secondary">If any of your applications have been denied, our support team is available to help you understand the reason.</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/dashboard/applicant/support")}
            leftIcon={<HelpCircle size={14} />}
          >
            Talk to Support
          </Button>
        </div>
      )}

      <DataTable<Application>
        columns={columns}
        data={data?.data || []}
        currentPage={data?.current_page}
        lastPage={data?.last_page}
        onPageChange={setPage}
        onRowClick={(row) =>
          router.push(`/dashboard/applicant/applications/${row.id}`)
        }
        loading={isLoading}
        emptyMessage="No applications found. Start by creating a new application."
      />

      {/* Visa Issued Congratulatory Popup */}
      {issuedVisaToShow && (
        <Modal
          isOpen={true}
          onClose={handleClosePopup}
          title="Congratulations!"
        >
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-success" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Your Visa is Ready!
            </h2>
            <p className="text-text-secondary mb-6 text-sm">
              Your application ({issuedVisaToShow.reference_number}) for a {issuedVisaToShow.visa_type?.name} has been approved and issued. You can now download your eVisa document from the application details page.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={handleClosePopup}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  handleClosePopup();
                  router.push(`/dashboard/applicant/applications/${issuedVisaToShow.id}`);
                }}
              >
                View eVisa
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
}
