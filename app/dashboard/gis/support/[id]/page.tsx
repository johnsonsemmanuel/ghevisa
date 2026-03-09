"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Textarea, Select } from "@/components/ui/input";
import {
    ArrowLeft,
    Send,
    CheckCircle2,
    AlertTriangle,
    User,
    Shield,
    FileText,
    Clock,
    Gavel,
} from "lucide-react";
import toast from "react-hot-toast";

interface SupportMessage {
    id: number;
    message: string;
    is_officer_reply: boolean;
    is_read: boolean;
    created_at: string;
    user: { id: number; first_name: string; last_name: string; role: string };
}

interface SupportTicket {
    id: number;
    reference_number: string;
    subject: string;
    reason: string;
    status: string;
    priority: string;
    created_at: string;
    messages: SupportMessage[];
    user: { id: number; first_name: string; last_name: string; email: string; phone?: string };
    application?: { id: number; reference_number: string; status: string; visa_type?: { id: number; name: string } };
    assigned_officer?: { id: number; first_name: string; last_name: string };
}

const statusColors: Record<string, string> = {
    open: "bg-amber-50 text-amber-700 border-amber-200",
    in_progress: "bg-blue-50 text-blue-700 border-blue-200",
    resolved: "bg-green-50 text-green-700 border-green-200",
    closed: "bg-gray-50 text-gray-500 border-gray-200",
};

const reasonLabels: Record<string, string> = {
    general: "General Inquiry",
    appeal: "Appeal Decision",
    tech: "Technical Support",
    payment: "Payment / Refund",
    status: "Status Query",
    docs: "Document Issue",
    other: "Other",
};

export default function GisSupportTicketPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [replyText, setReplyText] = useState("");
    const [overrideNotes, setOverrideNotes] = useState("");
    const [showOverrideForm, setShowOverrideForm] = useState(false);
    const [ticketStatus, setTicketStatus] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data, refetch } = useQuery({
        queryKey: ["gis-support-ticket", id],
        queryFn: () => api.get(`/gis/support/tickets/${id}`).then((r) => r.data),
        enabled: !!id,
    });

    const ticket: SupportTicket | null = data?.ticket || null;

    useEffect(() => {
        if (ticket) setTicketStatus(ticket.status);
    }, [ticket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [ticket?.messages]);

    // Reply mutation
    const replyMutation = useMutation({
        mutationFn: (message: string) =>
            api.post(`/gis/support/tickets/${id}/reply`, { message }),
        onSuccess: () => {
            setReplyText("");
            refetch();
            queryClient.invalidateQueries({ queryKey: ["gis-support-tickets"] });
            queryClient.invalidateQueries({ queryKey: ["gis-support-unread"] });
        },
        onError: () => toast.error("Failed to send reply."),
    });

    // Status update mutation
    const statusMutation = useMutation({
        mutationFn: (status: string) =>
            api.put(`/gis/support/tickets/${id}/status`, { status }),
        onSuccess: () => {
            toast.success("Ticket status updated.");
            refetch();
            queryClient.invalidateQueries({ queryKey: ["gis-support-tickets"] });
        },
        onError: () => toast.error("Failed to update status."),
    });

    // Override to approved mutation
    const overrideMutation = useMutation({
        mutationFn: (notes: string) =>
            api.post(`/gis/support/tickets/${id}/override-approve`, { notes }),
        onSuccess: () => {
            toast.success("Application has been approved via appeal!");
            setShowOverrideForm(false);
            setOverrideNotes("");
            refetch();
            queryClient.invalidateQueries({ queryKey: ["gis-support-tickets"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to override."),
    });

    if (!ticket) {
        return (
            <DashboardShell title="Support Ticket">
                <div className="card text-center py-12">
                    <Clock size={24} className="text-text-muted mx-auto mb-3 animate-spin" />
                    <p className="text-sm text-text-muted">Loading ticket...</p>
                </div>
            </DashboardShell>
        );
    }

    const canOverride = ticket.reason === "appeal" && ticket.application?.status === "denied";

    return (
        <DashboardShell title="Support Ticket">
            <button
                onClick={() => router.push("/dashboard/gis/support")}
                className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-4 cursor-pointer"
            >
                <ArrowLeft size={16} /> Back to Support Inbox
            </button>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Messages Column */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Ticket Header */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="font-bold text-text-primary text-lg">{ticket.subject}</h2>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusColors[ticket.status]}`}>
                                {ticket.status.replace("_", " ")}
                            </span>
                        </div>
                        <p className="text-xs text-text-muted">{ticket.reference_number} · {reasonLabels[ticket.reason]} · Created {new Date(ticket.created_at).toLocaleDateString()}</p>
                    </div>

                    {/* Message Thread */}
                    <div className="card p-0 overflow-hidden">
                        <div className="max-h-[55vh] overflow-y-auto p-5 space-y-4">
                            {ticket.messages?.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.is_officer_reply ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.is_officer_reply ? "bg-accent/10 border border-accent/20" : "bg-surface border border-border"}`}>
                                        <p className="text-xs font-semibold mb-1">
                                            {msg.is_officer_reply
                                                ? `${msg.user?.first_name || "Officer"} ${msg.user?.last_name || ""}`
                                                : `${ticket.user.first_name} ${ticket.user.last_name}`}
                                            {msg.is_officer_reply && <span className="ml-1 text-accent text-[10px]">(Officer)</span>}
                                            {!msg.is_officer_reply && <span className="ml-1 text-text-muted text-[10px]">(Applicant)</span>}
                                        </p>
                                        <p className="text-sm text-text-primary whitespace-pre-wrap">{msg.message}</p>
                                        <p className="text-[10px] text-text-muted mt-1.5">{new Date(msg.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Input */}
                        {ticket.status !== "closed" && (
                            <div className="border-t border-border p-4 flex gap-3">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && replyText.trim() && replyMutation.mutate(replyText.trim())}
                                    placeholder="Type your reply to the applicant..."
                                    className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                                />
                                <Button
                                    onClick={() => replyText.trim() && replyMutation.mutate(replyText.trim())}
                                    loading={replyMutation.isPending}
                                    leftIcon={<Send size={16} />}
                                >
                                    Send
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Applicant Info */}
                    <div className="card">
                        <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                            <User size={15} /> Applicant
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-text-muted">Name</span>
                                <span className="font-medium text-text-primary">{ticket.user.first_name} {ticket.user.last_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Email</span>
                                <span className="font-medium text-text-primary text-xs">{ticket.user.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Application Info */}
                    {ticket.application && (
                        <div className="card">
                            <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                                <FileText size={15} /> Linked Application
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Reference</span>
                                    <span className="font-mono font-medium text-text-primary text-xs">{ticket.application.reference_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Status</span>
                                    <span className="font-semibold capitalize text-text-primary">{ticket.application.status?.replace("_", " ")}</span>
                                </div>
                                {ticket.application.visa_type && (
                                    <div className="flex justify-between">
                                        <span className="text-text-muted">Visa Type</span>
                                        <span className="font-medium text-text-primary">{ticket.application.visa_type.name}</span>
                                    </div>
                                )}
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full mt-3"
                                onClick={() => router.push(`/dashboard/gis/cases/${ticket.application!.id}`)}
                            >
                                View Application
                            </Button>
                        </div>
                    )}

                    {/* Status Management */}
                    <div className="card">
                        <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                            <Shield size={15} /> Manage Ticket
                        </h3>
                        <Select
                            label="Update Status"
                            value={ticketStatus}
                            onChange={(e) => setTicketStatus(e.target.value)}
                            options={[
                                { value: "open", label: "Open" },
                                { value: "in_progress", label: "In Progress" },
                                { value: "resolved", label: "Resolved" },
                                { value: "closed", label: "Closed" },
                            ]}
                        />
                        {ticketStatus !== ticket.status && (
                            <Button
                                className="w-full mt-3"
                                loading={statusMutation.isPending}
                                onClick={() => statusMutation.mutate(ticketStatus)}
                                leftIcon={<CheckCircle2 size={16} />}
                            >
                                Update Status
                            </Button>
                        )}
                    </div>

                    {/* Override to Approved (Appeal only) */}
                    {canOverride && (
                        <div className="card border-2 border-success/30 bg-success/3">
                            <h3 className="text-sm font-bold text-success mb-2 flex items-center gap-2">
                                <Gavel size={15} /> Appeal Action
                            </h3>
                            <p className="text-xs text-text-muted mb-3">
                                This is an appeal for a <strong className="text-danger">denied</strong> application. You can override the decision and approve it.
                            </p>

                            {!showOverrideForm ? (
                                <Button
                                    variant="primary"
                                    className="w-full bg-success hover:bg-success/90"
                                    onClick={() => setShowOverrideForm(true)}
                                    leftIcon={<CheckCircle2 size={16} />}
                                >
                                    Override: Approve Application
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    <Textarea
                                        label="Approval Notes (Required)"
                                        placeholder="Explain why the appeal is being accepted..."
                                        value={overrideNotes}
                                        onChange={(e) => setOverrideNotes(e.target.value)}
                                        rows={3}
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => { setShowOverrideForm(false); setOverrideNotes(""); }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-success hover:bg-success/90"
                                            loading={overrideMutation.isPending}
                                            disabled={!overrideNotes.trim()}
                                            onClick={() => overrideMutation.mutate(overrideNotes.trim())}
                                            leftIcon={<CheckCircle2 size={14} />}
                                        >
                                            Confirm Approval
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardShell>
    );
}
