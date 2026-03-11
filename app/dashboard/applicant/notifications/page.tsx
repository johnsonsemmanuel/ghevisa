"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CardSkeleton } from "@/components/ui/skeleton";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Mail,
  Check,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface Notification {
  id: string;
  type: string;
  data: string | {
    application_id: number;
    reference_number: string;
    type: string;
    message: string;
    status: string;
  };
  read_at: string | null;
  created_at: string;
  notifiable_type: string;
  notifiable_id: number;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/applicant/notifications").then((r) => r.data),
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: () => api.get("/applicant/notifications/unread-count").then((r) => r.data.count),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      api.post(`/applicant/notifications/${notificationId}/mark-read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
      toast.success("Notification marked as read");
    },
    onError: () => {
      toast.error("Failed to mark notification as read");
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.post("/applicant/notifications/mark-all-read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
      toast.success("All notifications marked as read");
    },
    onError: () => {
      toast.error("Failed to mark all notifications as read");
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => 
      api.delete(`/applicant/notifications/${notificationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
      toast.success("Notification deleted");
    },
    onError: () => {
      toast.error("Failed to delete notification");
    },
  });

  // Helper function to parse notification data
  const parseNotificationData = (notif: Notification) => {
    if (typeof notif.data === 'string') {
      return JSON.parse(notif.data);
    }
    return notif.data;
  };

  const getNotificationIcon = (type: string, data: any) => {
    const notificationType = data?.type || 'status_changed';
    switch (notificationType) {
      case "application_submitted":
        return <FileText size={18} className="text-info" />;
      case "application_approved":
        return <CheckCircle2 size={18} className="text-success" />;
      case "application_denied":
        return <XCircle size={18} className="text-danger" />;
      case "status_changed":
        return <Clock size={18} className="text-warning" />;
      case "document_reupload_required":
        return <AlertTriangle size={18} className="text-danger" />;
      case "payment_received":
        return <CheckCircle2 size={18} className="text-success" />;
      case "evisa_ready":
        return <CheckCircle2 size={18} className="text-success" />;
      default:
        return <Bell size={18} className="text-text-muted" />;
    }
  };

  const getNotificationBg = (type: string, data: any) => {
    const notificationType = data?.type || 'status_changed';
    switch (notificationType) {
      case "application_submitted":
        return "bg-info/10";
      case "application_approved":
        return "bg-success/10";
      case "application_denied":
        return "bg-danger/10";
      case "status_changed":
        return "bg-warning/10";
      case "document_reupload_required":
        return "bg-danger/10";
      case "payment_received":
        return "bg-success/10";
      case "evisa_ready":
        return "bg-success/10";
      default:
        return "bg-surface";
    }
  };

  return (
    <DashboardShell
      title="Notifications"
      description="Stay updated on your visa application status"
    >
      {/* Header with unread count and mark all as read */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Bell size={16} className="text-accent" />
            <span className="text-xs font-medium text-text-primary">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            className="text-[10px] text-accent hover:text-accent-dark font-medium"
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* Notifications list */}
      <div className="space-y-2">
        {isLoading ? (
          <CardSkeleton />
        ) : notifications?.data?.length > 0 ? (
          notifications.data.map((notif: Notification) => {
            const parsedData = parseNotificationData(notif);
            return (
            <div
              key={notif.id}
              className={`bg-white rounded-lg border p-3 flex items-start gap-3 transition-all hover:shadow-sm ${
                !notif.read_at ? "border-l-[3px] border-l-accent border-t-black/6 border-r-black/6 border-b-black/6" : "border-black/6"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getNotificationBg(notif.type, parsedData)}`}>
                {getNotificationIcon(notif.type, parsedData)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text-primary leading-snug">
                      {parsedData.message}
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {parsedData.reference_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-text-muted whitespace-nowrap bg-surface px-1.5 py-0.5 rounded">
                      {new Date(notif.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {!notif.read_at && (
                        <button
                          onClick={() => markAsReadMutation.mutate(notif.id)}
                          className="p-1 rounded hover:bg-surface/50 transition-colors"
                          title="Mark as read"
                        >
                          <Check size={13} className="text-success" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotificationMutation.mutate(notif.id)}
                        className="p-1 rounded hover:bg-surface/50 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 size={13} className="text-danger" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            );
          })
        ) : (
          <div className="card text-center py-12">
            <div className="w-14 h-14 bg-surface rounded-xl flex items-center justify-center mx-auto mb-3">
              <Bell size={24} className="text-text-muted" />
            </div>
            <p className="text-text-primary font-semibold text-sm mb-1">No Notifications</p>
            <p className="text-xs text-text-muted max-w-xs mx-auto">
              You will receive notifications here when there are updates to your applications.
            </p>
          </div>
        )}
      </div>

      {/* Email Preferences */}
      <div className="card !p-4 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-info/8 flex items-center justify-center">
            <Mail size={14} className="text-info" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">Email Notifications</h3>
            <p className="text-[10px] text-text-muted">Sent to <strong>{user?.email}</strong></p>
          </div>
        </div>
        <div className="space-y-1.5">
          {[
            { label: "Application Status Updates", desc: "When your application status changes", enabled: true },
            { label: "Document Verification", desc: "When documents are verified or need re-upload", enabled: true },
            { label: "Payment Confirmations", desc: "Receipts and payment status", enabled: true },
            { label: "eVisa Ready", desc: "When your approved eVisa is ready for download", enabled: true },
          ].map((pref, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface/80 border border-border-light">
              <div>
                <p className="text-xs font-medium text-text-primary">{pref.label}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{pref.desc}</p>
              </div>
              <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${pref.enabled ? "bg-accent" : "bg-border"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${pref.enabled ? "right-0.5" : "left-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
