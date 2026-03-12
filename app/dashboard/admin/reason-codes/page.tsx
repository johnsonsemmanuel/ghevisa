"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/forms/input";
import { Modal } from "@/components/ui/modals/modal";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import type { ReasonCode } from "@/lib/types";

const actionTypeLabels = {
  approve: { label: "Approval", color: "text-emerald-600", bg: "bg-emerald-50" },
  reject: { label: "Rejection", color: "text-red-600", bg: "bg-red-50" },
  request_info: { label: "Request Info", color: "text-blue-600", bg: "bg-blue-50" },
  escalate: { label: "Escalation", color: "text-amber-600", bg: "bg-amber-50" },
  border_admit: { label: "Border Admit", color: "text-green-600", bg: "bg-green-50" },
  border_deny: { label: "Border Deny", color: "text-red-600", bg: "bg-red-50" },
  border_secondary: { label: "Border Secondary", color: "text-orange-600", bg: "bg-orange-50" },
};

export default function ReasonCodesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState<ReasonCode | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    action_type: "approve" as keyof typeof actionTypeLabels,
    reason: "",
    description: "",
    is_active: true,
    sort_order: 1,
  });

  const { data: reasonCodes, isLoading } = useQuery({
    queryKey: ["admin-reason-codes"],
    queryFn: () => api.get<{ reason_codes: ReasonCode[] }>("/admin/reason-codes").then((r) => r.data.reason_codes),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post("/admin/reason-codes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reason-codes"] });
      toast.success("Reason code created successfully");
      setShowModal(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create reason code"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof formData }) =>
      api.put(`/admin/reason-codes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reason-codes"] });
      toast.success("Reason code updated successfully");
      setShowModal(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update reason code"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/reason-codes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reason-codes"] });
      toast.success("Reason code deleted successfully");
    },
    onError: () => toast.error("Failed to delete reason code"),
  });

  const resetForm = () => {
    setFormData({
      code: "",
      action_type: "approve",
      reason: "",
      description: "",
      is_active: true,
      sort_order: 1,
    });
    setEditingCode(null);
  };

  const handleEdit = (code: ReasonCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      action_type: code.action_type as keyof typeof actionTypeLabels,
      reason: code.reason,
      description: code.description || "",
      is_active: code.is_active,
      sort_order: code.sort_order,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCode) {
      updateMutation.mutate({ id: editingCode.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const groupedCodes = reasonCodes?.reduce((acc, code) => {
    if (!acc[code.action_type]) acc[code.action_type] = [];
    acc[code.action_type].push(code);
    return acc;
  }, {} as Record<string, ReasonCode[]>);

  if (isLoading) {
    return (
      <DashboardShell title="Reason Codes">
        <CardSkeleton />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Reason Codes Management"
      description="Manage reason codes for application decisions and actions"
      actions={
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add Reason Code
        </Button>
      }
    >
      <div className="space-y-6">
        {Object.entries(actionTypeLabels).map(([actionType, config]) => {
          const codes = groupedCodes?.[actionType] || [];
          if (codes.length === 0) return null;

          return (
            <div key={actionType} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className={`px-3 py-1 rounded-lg ${config.bg}`}>
                  <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
                </div>
                <span className="text-sm text-text-muted">({codes.length} codes)</span>
              </div>

              <div className="space-y-2">
                {codes.map((code) => (
                  <div
                    key={code.id}
                    className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-border-light hover:border-border transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`font-mono text-sm font-bold px-2 py-1 rounded ${config.bg} ${config.color}`}>
                          {code.code}
                        </span>
                        <span className="text-sm font-semibold text-text-primary">{code.reason}</span>
                        {code.is_active ? (
                          <CheckCircle size={16} className="text-success" />
                        ) : (
                          <XCircle size={16} className="text-text-muted" />
                        )}
                      </div>
                      {code.description && (
                        <p className="text-sm text-text-secondary">{code.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Edit size={14} />}
                        onClick={() => handleEdit(code)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<Trash2 size={14} />}
                        onClick={() => {
                          if (confirm(`Delete reason code ${code.code}?`)) {
                            deleteMutation.mutate(code.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingCode ? "Edit Reason Code" : "Add Reason Code"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Code *"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. RMI01"
              required
            />
            <Select
              label="Action Type *"
              value={formData.action_type}
              onChange={(e) => setFormData({ ...formData, action_type: e.target.value as any })}
              required
            >
              {Object.entries(actionTypeLabels).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Reason *"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="e.g. Passport bio page unclear"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description for officers..."
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sort Order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
              min={1}
            />
            <Select
              label="Status"
              value={formData.is_active ? "active" : "inactive"}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "active" })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingCode ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
