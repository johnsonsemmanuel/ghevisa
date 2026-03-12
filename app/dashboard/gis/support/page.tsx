"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/display/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/forms/input";
import {
    MessageSquare,
    ArrowRight,
    Inbox,
    Clock,
    CheckCircle2,
    AlertTriangle,
    User,
} from "lucide-react";

interface SupportTicketRow {
    id: number;
    reference_number: string;
    subject: string;
    reason: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    messages_count: number;
    user: { id: number; first_name: string; last_name: string; email: string };
    application?: { id: number; reference_number: string; status: string };
    assigned_officer?: { id: number; first_name: string; last_name: string };
}

const priorityColors: Record<string, string> = {
    low: "bg-gray-50 text-gray-600 border-gray-200",
    medium: "bg-blue-50 text-blue-700 border-blue-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    urgent: "bg-red-50 text-red-700 border-red-200",
};

const statusColors: Record<string, string> = {
    open: "bg-amber-50 text-amber-700 border-amber-200",
    in_progress: "bg-blue-50 text-blue-700 border-blue-200",
    resolved: "bg-green-50 text-green-700 border-green-200",
    closed: "bg-gray-50 text-gray-500 border-gray-200",
};

const reasonLabels: Record<string, string> = {
    general: "General",
    appeal: "Appeal",
    tech: "Technical",
    payment: "Payment",
    status: "Status",
    docs: "Documents",
    other: "Other",
};

export default function GisSupportPage() {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState("");
    const [reasonFilter, setReasonFilter] = useState("");
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ["gis-support-tickets", page, statusFilter, reasonFilter],
        queryFn: () =>
            api.get("/gis/support/tickets", {
                params: { page, ...(statusFilter && { status: statusFilter }), ...(reasonFilter && { reason: reasonFilter }) },
            }).then((r) => r.data),
    });

    const { data: unreadData } = useQuery({
        queryKey: ["gis-support-unread"],
        queryFn: () => api.get("/gis/support/tickets/unread-count").then((r) => r.data),
        refetchInterval: 30000,
    });

    const tickets: SupportTicketRow[] = data?.data || [];
    const totalPages = data?.last_page || 1;
    const unreadCount = unreadData?.unread_count || 0;

    return (
        <DashboardShell
            title="Support Inbox"
            description={`${unreadCount > 0 ? `${unreadCount} ticket${unreadCount > 1 ? "s" : ""} with new messages · ` : ""}Manage applicant support requests`}
        >
            {/* Filters - Matching main dashboard card style */}
            <Card variant="default" className="mb-6">
                <div className="grid sm:grid-cols-2 gap-4">
                    <Select
                        label="Filter by Status"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        options={[
                            { value: "", label: "All Statuses" },
                            { value: "open", label: "Open" },
                            { value: "in_progress", label: "In Progress" },
                            { value: "resolved", label: "Resolved" },
                            { value: "closed", label: "Closed" },
                        ]}
                    />
                    <Select
                        label="Filter by Reason"
                        value={reasonFilter}
                        onChange={(e) => { setReasonFilter(e.target.value); setPage(1); }}
                        options={[
                            { value: "", label: "All Reasons" },
                            { value: "appeal", label: "Appeal Decision" },
                            { value: "general", label: "General" },
                            { value: "tech", label: "Technical" },
                            { value: "payment", label: "Payment" },
                            { value: "status", label: "Status Query" },
                            { value: "docs", label: "Documents" },
                            { value: "other", label: "Other" },
                        ]}
                    />
                </div>
            </Card>

            {/* Ticket List */}
            {isLoading ? (
                <Card variant="default" className="text-center py-12">
                    <Clock size={24} className="text-text-muted mx-auto mb-3 animate-spin" />
                    <p className="text-sm text-text-muted">Loading tickets...</p>
                </Card>
            ) : tickets.length === 0 ? (
                <Card variant="default" className="text-center py-16">
                    <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Inbox size={24} className="text-text-muted" />
                    </div>
                    <p className="font-semibold text-text-primary mb-1">No tickets found</p>
                    <p className="text-sm text-text-muted">Support tickets from applicants will appear here.</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {tickets.map((ticket) => (
                        <Card
                            key={ticket.id}
                            variant="interactive"
                            onClick={() => router.push(`/dashboard/gis/support/${ticket.id}`)}
                            className={`${ticket.messages_count > 0 ? "border-accent/30 bg-accent/5" : ""}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${ticket.reason === "appeal" ? "bg-orange-100" : "bg-surface"}`}>
                                    {ticket.reason === "appeal" ? (
                                        <AlertTriangle size={18} className="text-orange-600" />
                                    ) : (
                                        <MessageSquare size={18} className="text-text-muted" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-sm font-semibold text-text-primary truncate">{ticket.subject}</h3>
                                        {ticket.messages_count > 0 && (
                                            <span className="text-[10px] bg-danger text-white rounded-full px-1.5 py-0.5 font-bold">{ticket.messages_count} new</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-text-muted mt-0.5">
                                        {ticket.reference_number} · From <strong>{ticket.user.first_name} {ticket.user.last_name}</strong> · {new Date(ticket.updated_at).toLocaleDateString()}
                                    </p>
                                    {ticket.application && (
                                        <p className="text-xs text-text-muted mt-0.5">
                                            App: <strong>{ticket.application.reference_number}</strong> — <span className="capitalize">{ticket.application.status?.replace("_", " ")}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusColors[ticket.status] || ""}`}>
                                        {ticket.status.replace("_", " ")}
                                    </span>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${priorityColors[ticket.priority] || ""}`}>
                                        {ticket.priority}
                                    </span>
                                    <span className="text-[10px] bg-surface text-text-muted px-2 py-0.5 rounded-full border border-border">
                                        {reasonLabels[ticket.reason] || ticket.reason}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                    <span className="text-sm text-text-muted">Page {page} of {totalPages}</span>
                    <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
            )}
        </DashboardShell>
    );
}
