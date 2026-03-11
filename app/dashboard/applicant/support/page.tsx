"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import {
  HelpCircle,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Send,
  Mail,
  Phone,
  ArrowLeft,
  Plus,
  Inbox,
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
  updated_at: string;
  messages: SupportMessage[];
  application?: { id: number; reference_number: string; status: string };
}

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  { question: "How long does it take to process my visa application?", answer: "Standard processing takes 3-5 business days. Express processing (additional fee) takes 24-48 hours." },
  { question: "What documents do I need?", answer: "Required: valid passport (6+ months validity), passport-sized photograph, proof of accommodation, return flight itinerary, and proof of funds." },
  { question: "Can I edit my application after submission?", answer: "Once submitted and paid, core details cannot be changed. If more info is needed, the officer will request it through your dashboard." },
  { question: "What happens if my application is denied?", answer: "You'll receive the denial reason by email. You can appeal through the Contact Support form below." },
];

const reasonLabels: Record<string, string> = {
  general: "General Inquiry",
  appeal: "Appeal Decision",
  tech: "Technical Support",
  payment: "Payment / Refund",
  status: "Status Query",
  docs: "Document Issue",
  other: "Other",
};

const statusColors: Record<string, string> = {
  open: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-gray-50 text-gray-500 border-gray-200",
};

type View = "main" | "new_ticket" | "thread";

export default function ApplicantSupportPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("main");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [contactForm, setContactForm] = useState({
    subject: "",
    reason: "general",
    message: "",
    application_reference: "",
  });

  // ─── Queries ──────────────────────────────────────────
  const { data: ticketsData } = useQuery({
    queryKey: ["my-support-tickets"],
    queryFn: () => api.get("/applicant/support/tickets").then((r) => r.data),
  });

  const tickets: SupportTicket[] = ticketsData?.data || [];

  const { data: threadData, refetch: refetchThread } = useQuery({
    queryKey: ["support-ticket", selectedTicketId],
    queryFn: () => api.get(`/applicant/support/tickets/${selectedTicketId}`).then((r) => r.data),
    enabled: !!selectedTicketId,
  });

  const selectedTicket: SupportTicket | null = threadData?.ticket || null;

  // ─── Mutations ────────────────────────────────────────
  const createTicketMutation = useMutation({
    mutationFn: (data: typeof contactForm) => api.post("/applicant/support/tickets", data),
    onSuccess: (res) => {
      toast.success("Support ticket created! We'll respond within 24-48 hours.");
      queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
      setSelectedTicketId(res.data.ticket.id);
      setView("thread");
      setContactForm({ subject: "", reason: "general", message: "", application_reference: "" });
    },
    onError: () => toast.error("Failed to create ticket. Please try again."),
  });

  const replyMutation = useMutation({
    mutationFn: (message: string) =>
      api.post(`/applicant/support/tickets/${selectedTicketId}/reply`, { message }),
    onSuccess: () => {
      setReplyText("");
      refetchThread();
      queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
    },
    onError: () => toast.error("Failed to send message."),
  });

  useEffect(() => {
    if (selectedTicket?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket?.messages]);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    createTicketMutation.mutate(contactForm);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    replyMutation.mutate(replyText.trim());
  };

  const unreadCount = tickets.filter((t) =>
    t.messages?.some((m) => m.is_officer_reply && !m.is_read)
  ).length;

  // ─── Render ───────────────────────────────────────────

  // Thread View
  if (view === "thread" && selectedTicket) {
    return (
      <DashboardShell title="Support Conversation">
        <button onClick={() => { setView("main"); setSelectedTicketId(null); }} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-4 cursor-pointer">
          <ArrowLeft size={16} /> Back to Support
        </button>

        <div className="card !p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-bold text-text-primary text-sm">{selectedTicket.subject}</h2>
              <p className="text-[10px] text-text-muted mt-0.5">{selectedTicket.reference_number} · {reasonLabels[selectedTicket.reason] || selectedTicket.reason}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusColors[selectedTicket.status] || "bg-gray-50 text-gray-600"}`}>
              {selectedTicket.status.replace("_", " ")}
            </span>
          </div>
          {selectedTicket.application && (
            <div className="text-[10px] bg-surface rounded-lg px-2.5 py-1.5 inline-block">
              Linked Application: <strong>{selectedTicket.application.reference_number}</strong> — <span className="capitalize">{selectedTicket.application.status?.replace("_", " ")}</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="card p-0 overflow-hidden">
          <div className="max-h-[50vh] overflow-y-auto p-4 space-y-3">
            {selectedTicket.messages?.map((msg) => (
              <div key={msg.id} className={`flex ${msg.is_officer_reply ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[75%] rounded-xl px-3 py-2.5 ${msg.is_officer_reply ? "bg-surface border border-border" : "bg-accent/10 border border-accent/20"}`}>
                  <p className="text-[10px] font-semibold mb-1">
                    {msg.is_officer_reply ? `${msg.user?.first_name || "Officer"} ${msg.user?.last_name || ""}` : "You"}
                    {msg.is_officer_reply && <span className="ml-1 text-accent text-[9px] font-medium">(Officer)</span>}
                  </p>
                  <p className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  <p className="text-[9px] text-text-muted mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Input */}
          {selectedTicket.status !== "closed" && (
            <div className="border-t border-border p-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendReply()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <Button onClick={handleSendReply} loading={replyMutation.isPending} leftIcon={<Send size={14} />} size="sm">
                Send
              </Button>
            </div>
          )}
        </div>
      </DashboardShell>
    );
  }

  // New Ticket Form
  if (view === "new_ticket") {
    return (
      <DashboardShell title="Create Support Ticket">
        <button onClick={() => setView("main")} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-4 cursor-pointer">
          <ArrowLeft size={16} /> Back to Support
        </button>
        <div className="max-w-xl">
          <div className="card !p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-accent/8 flex items-center justify-center">
                <MessageSquare size={14} className="text-accent" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">New Support Request</h3>
            </div>
            <form onSubmit={handleSubmitContact} className="space-y-3">
              <Input
                label="Application Reference (Optional)"
                placeholder="e.g. GH-EV-20260305-BF71435D"
                value={contactForm.application_reference}
                onChange={(e) => setContactForm({ ...contactForm, application_reference: e.target.value })}
              />
              <Select
                label="Reason for Contact"
                value={contactForm.reason}
                onChange={(e) => setContactForm({ ...contactForm, reason: e.target.value })}
                options={[
                  { value: "general", label: "General Inquiry" },
                  { value: "appeal", label: "Appeal Decision (Denied Application)" },
                  { value: "tech", label: "Technical Support" },
                  { value: "payment", label: "Payment / Refund Issue" },
                  { value: "status", label: "Application Status Query" },
                  { value: "docs", label: "Document Upload Issues" },
                  { value: "other", label: "Other" },
                ]}
                required
              />
              <Input
                label="Subject"
                placeholder="Brief description of your issue"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                required
              />
              <Textarea
                label="Message"
                placeholder={contactForm.reason === "appeal" ? "Please explain why you believe your application should be reconsidered." : "Describe your issue in detail..."}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                rows={5}
                required
              />
              <Button type="submit" className="w-full" loading={createTicketMutation.isPending} leftIcon={<Send size={14} />} size="sm">
                Submit Ticket
              </Button>
            </form>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // ─── Main View ──────────────────────────────────────
  return (
    <DashboardShell
      title="Help & Support"
      description="Find answers or contact our support team"
      actions={
        <Button onClick={() => setView("new_ticket")} leftIcon={<Plus size={16} />}>
          New Ticket
        </Button>
      }
    >
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* My Tickets */}
          <div className="card !p-4">
            <div className="flex items-center gap-2 mb-3">
              <Inbox size={16} className="text-accent" />
              <h2 className="text-sm font-bold text-text-primary">
                My Tickets {unreadCount > 0 && <span className="ml-2 text-[10px] bg-danger text-white rounded-full px-1.5 py-0.5">{unreadCount} new</span>}
              </h2>
            </div>
            {tickets.length === 0 ? (
              <div className="text-center py-8">
                <Inbox size={28} className="text-text-muted mx-auto mb-2" />
                <p className="text-xs text-text-muted">No tickets yet. Create one to get help.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map((ticket) => {
                  const hasUnread = ticket.messages?.some((m) => m.is_officer_reply && !m.is_read);
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => { setSelectedTicketId(ticket.id); setView("thread"); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer hover:bg-surface ${hasUnread ? "border-accent/30 bg-accent/3" : "border-border"}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-text-primary truncate">{ticket.subject}</p>
                          {hasUnread && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
                        </div>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          {ticket.reference_number} · {reasonLabels[ticket.reason] || ticket.reason} · {new Date(ticket.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0 ${statusColors[ticket.status] || ""}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* FAQ */}
          <div className="card !p-4">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle size={14} className="text-gold" />
              <h2 className="text-sm font-bold text-text-primary">FAQ</h2>
            </div>
            <div className="space-y-1.5">
              {faqs.map((faq, index) => (
                <div key={index} className={`rounded-lg border transition-all ${expandedFaq === index ? "border-accent/20 bg-accent/3" : "border-border-light hover:bg-surface"}`}>
                  <button onClick={() => setExpandedFaq(expandedFaq === index ? null : index)} className="w-full flex items-center justify-between p-3 text-left cursor-pointer">
                    <span className="text-xs font-medium text-text-primary pr-3">{faq.question}</span>
                    {expandedFaq === index ? <ChevronUp size={13} className="text-accent shrink-0" /> : <ChevronDown size={13} className="text-text-muted shrink-0" />}
                  </button>
                  {expandedFaq === index && <div className="px-3 pb-3"><p className="text-xs text-text-secondary leading-relaxed">{faq.answer}</p></div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card !p-4">
            <h3 className="font-semibold text-text-primary text-sm mb-3">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 bg-info/10 rounded-lg flex items-center justify-center shrink-0"><Mail size={14} className="text-info" /></div>
                <div>
                  <p className="text-xs font-medium text-text-primary">Email</p>
                  <a href="mailto:support@ghevisa.gov.gh" className="text-xs text-primary hover:underline">support@ghevisa.gov.gh</a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 bg-success/10 rounded-lg flex items-center justify-center shrink-0"><Phone size={14} className="text-success" /></div>
                <div>
                  <p className="text-xs font-medium text-text-primary">Phone</p>
                  <p className="text-xs text-text-secondary">+233 302 123 456</p>
                  <p className="text-[10px] text-text-muted">Mon-Fri, 8am-5pm GMT</p>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Clock size={13} className="text-primary" />
              <h4 className="text-xs font-bold text-text-primary">Response Time</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              We typically respond within <strong className="text-text-primary">24-48 hours</strong> during business days.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
