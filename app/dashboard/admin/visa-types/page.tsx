"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/forms/input";
import { DataTable } from "@/components/ui/display/data-table";
import { Modal } from "@/components/ui/modals/modal";
import { Plus, Edit, Trash2, Eye, EyeOff, DollarSign, Clock, FileText } from "lucide-react";
import toast from "react-hot-toast";

interface VisaType {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_fee: number;
  max_duration_days: number;
  required_documents: string[];
  blacklisted_nationalities: string[];
  is_active: boolean;
  created_at: string;
}

export default function AdminVisaTypesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<VisaType | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    base_fee: "",
    max_duration_days: "",
    required_documents: "",
    blacklisted_nationalities: "",
    is_active: true,
  });

  const { data: visaTypes, isLoading } = useQuery({
    queryKey: ["admin-visa-types"],
    queryFn: () => api.get<VisaType[]>("/admin/visa-types").then((r) => r.data),
  });

  const openCreateModal = () => {
    setEditingType(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      base_fee: "",
      max_duration_days: "",
      required_documents: "",
      blacklisted_nationalities: "",
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (visaType: VisaType) => {
    setEditingType(visaType);
    setFormData({
      name: visaType.name,
      slug: visaType.slug,
      description: visaType.description || "",
      base_fee: visaType.base_fee.toString(),
      max_duration_days: visaType.max_duration_days.toString(),
      required_documents: visaType.required_documents?.join(", ") || "",
      blacklisted_nationalities: visaType.blacklisted_nationalities?.join(", ") || "",
      is_active: visaType.is_active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      description: formData.description,
      base_fee: parseFloat(formData.base_fee),
      max_duration_days: parseInt(formData.max_duration_days),
      required_documents: formData.required_documents
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
      blacklisted_nationalities: formData.blacklisted_nationalities
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean),
      is_active: formData.is_active,
    };

    try {
      if (editingType) {
        await api.put(`/admin/visa-types/${editingType.id}`, payload);
        toast.success("Visa type updated successfully");
      } else {
        await api.post("/admin/visa-types", payload);
        toast.success("Visa type created successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-visa-types"] });
      setModalOpen(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (visaType: VisaType) => {
    try {
      await api.put(`/admin/visa-types/${visaType.id}`, {
        ...visaType,
        is_active: !visaType.is_active,
      });
      toast.success(`Visa type ${visaType.is_active ? "deactivated" : "activated"}`);
      queryClient.invalidateQueries({ queryKey: ["admin-visa-types"] });
    } catch {
      toast.error("Failed to update visa type");
    }
  };

  const handleDelete = async (visaType: VisaType) => {
    if (!confirm(`Are you sure you want to delete "${visaType.name}"?`)) return;

    try {
      await api.delete(`/admin/visa-types/${visaType.id}`);
      toast.success("Visa type deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-visa-types"] });
    } catch {
      toast.error("Failed to delete visa type");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (row: VisaType) => (
        <div>
          <p className="font-medium text-text-primary">{row.name}</p>
          <p className="text-xs text-text-muted">{row.slug}</p>
        </div>
      ),
    },
    {
      key: "base_fee",
      header: "Fee",
      render: (row: VisaType) => (
        <div className="flex items-center gap-1">
          <DollarSign size={14} className="text-success" />
          <span className="font-medium text-text-primary">${row.base_fee}</span>
        </div>
      ),
    },
    {
      key: "max_duration_days",
      header: "Max Duration",
      render: (row: VisaType) => (
        <div className="flex items-center gap-1">
          <Clock size={14} className="text-info" />
          <span className="text-text-secondary">{row.max_duration_days} days</span>
        </div>
      ),
    },
    {
      key: "required_documents",
      header: "Documents",
      render: (row: VisaType) => (
        <div className="flex items-center gap-1">
          <FileText size={14} className="text-warning" />
          <span className="text-text-secondary">{row.required_documents?.length || 0} required</span>
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (row: VisaType) => (
        <span
          className={`badge ${row.is_active ? "badge-success" : "badge-danger"}`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: VisaType) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded hover:bg-surface transition-colors"
            title="Edit"
          >
            <Edit size={14} className="text-info" />
          </button>
          <button
            onClick={() => handleToggleActive(row)}
            className="p-1.5 rounded hover:bg-surface transition-colors"
            title={row.is_active ? "Deactivate" : "Activate"}
          >
            {row.is_active ? (
              <EyeOff size={14} className="text-warning" />
            ) : (
              <Eye size={14} className="text-success" />
            )}
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded hover:bg-surface transition-colors"
            title="Delete"
          >
            <Trash2 size={14} className="text-danger" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardShell
      title="Visa Types"
      description="Manage visa types and their requirements"
      actions={
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={openCreateModal}>
          Add Visa Type
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-text-primary">{visaTypes?.length || 0}</p>
          <p className="text-xs text-text-muted">Total Types</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-success">
            {visaTypes?.filter((v) => v.is_active).length || 0}
          </p>
          <p className="text-xs text-text-muted">Active</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-danger">
            {visaTypes?.filter((v) => !v.is_active).length || 0}
          </p>
          <p className="text-xs text-text-muted">Inactive</p>
        </div>
      </div>

      <DataTable<VisaType>
        columns={columns}
        data={visaTypes || []}
        loading={isLoading}
        emptyMessage="No visa types configured yet."
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingType ? "Edit Visa Type" : "Create Visa Type"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g., Tourist Visa"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Slug"
            placeholder="e.g., tourist-visa (auto-generated if empty)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
          <Textarea
            label="Description"
            placeholder="Brief description of this visa type"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Fee (USD)"
              type="number"
              placeholder="e.g., 60"
              value={formData.base_fee}
              onChange={(e) => setFormData({ ...formData, base_fee: e.target.value })}
              required
              min={0}
              step={0.01}
            />
            <Input
              label="Max Duration (days)"
              type="number"
              placeholder="e.g., 30"
              value={formData.max_duration_days}
              onChange={(e) => setFormData({ ...formData, max_duration_days: e.target.value })}
              required
              min={1}
            />
          </div>
          <Textarea
            label="Required Documents"
            placeholder="passport_photo, passport_bio_page, proof_of_accommodation (comma-separated)"
            value={formData.required_documents}
            onChange={(e) => setFormData({ ...formData, required_documents: e.target.value })}
            rows={2}
          />
          <Textarea
            label="Blacklisted Nationalities"
            placeholder="Country codes, comma-separated (leave empty for none)"
            value={formData.blacklisted_nationalities}
            onChange={(e) => setFormData({ ...formData, blacklisted_nationalities: e.target.value })}
            rows={2}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-border"
            />
            <label htmlFor="is_active" className="text-sm text-text-secondary">
              Active (visible to applicants)
            </label>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingType ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
