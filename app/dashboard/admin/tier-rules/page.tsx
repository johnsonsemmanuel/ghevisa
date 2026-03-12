"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/forms/input";
import { Badge } from "@/components/ui/display/badge";
import { Modal } from "@/components/ui/modals/modal";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
import toast from "react-hot-toast";
import type { TierRule, VisaType } from "@/lib/types";

export default function AdminTierRulesPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editRule, setEditRule] = useState<TierRule | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    visa_type_id: "",
    tier: "tier_1",
    name: "",
    description: "",
    route_to: "gis",
    sla_hours: "72",
    priority: "0",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: rulesData, isLoading } = useQuery({
    queryKey: ["admin-tier-rules"],
    queryFn: () =>
      api
        .get<{ tier_rules: TierRule[] }>("/admin/tier-rules")
        .then((r) => r.data),
  });

  const { data: visaTypesData } = useQuery({
    queryKey: ["visa-types"],
    queryFn: () =>
      api.get<{ visa_types: VisaType[] }>("/visa-types").then((r) => r.data),
  });

  const rules = rulesData?.tier_rules || [];
  const visaTypes = visaTypesData?.visa_types || [];

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm({
      visa_type_id: "",
      tier: "tier_1",
      name: "",
      description: "",
      route_to: "gis",
      sla_hours: "72",
      priority: "0",
      is_active: true,
    });
    setErrors({});
  };

  const openEdit = (rule: TierRule) => {
    setEditRule(rule);
    setForm({
      visa_type_id: rule.visa_type_id.toString(),
      tier: rule.tier,
      name: rule.name,
      description: rule.description || "",
      route_to: rule.route_to,
      sla_hours: rule.sla_hours.toString(),
      priority: rule.priority.toString(),
      is_active: rule.is_active,
    });
    setErrors({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    const payload = {
      visa_type_id: parseInt(form.visa_type_id),
      tier: form.tier,
      name: form.name,
      description: form.description || null,
      conditions: {},
      route_to: form.route_to,
      sla_hours: parseInt(form.sla_hours),
      priority: parseInt(form.priority),
      is_active: form.is_active,
    };
    try {
      if (editRule) {
        await api.put(`/admin/tier-rules/${editRule.id}`, payload);
        toast.success("Tier rule updated");
      } else {
        await api.post("/admin/tier-rules", payload);
        toast.success("Tier rule created");
      }
      setCreateOpen(false);
      setEditRule(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-tier-rules"] });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (error.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(error.response.data.errors)) {
          fieldErrors[key] = msgs[0];
        }
        setErrors(fieldErrors);
      } else {
        toast.error("Failed to save tier rule");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ruleId: number) => {
    if (!confirm("Are you sure you want to delete this tier rule?")) return;
    try {
      await api.delete(`/admin/tier-rules/${ruleId}`);
      toast.success("Tier rule deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-tier-rules"] });
    } catch {
      toast.error("Failed to delete tier rule");
    }
  };

  const formModal = (
    <Modal
      isOpen={createOpen || !!editRule}
      onClose={() => { setCreateOpen(false); setEditRule(null); resetForm(); }}
      title={editRule ? "Edit Tier Rule" : "Create Tier Rule"}
      size="lg"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <Input label="Rule Name" value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} required />
        <Textarea label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            label="Visa Type"
            value={form.visa_type_id}
            onChange={(e) => set("visa_type_id", e.target.value)}
            error={errors.visa_type_id}
            placeholder="Select visa type"
            options={visaTypes.map((vt) => ({ value: vt.id.toString(), label: vt.name }))}
          />
          <Select
            label="Tier"
            value={form.tier}
            onChange={(e) => set("tier", e.target.value)}
            error={errors.tier}
            options={[
              { value: "tier_1", label: "Tier 1 (Routine)" },
              { value: "tier_2", label: "Tier 2 (Complex)" },
            ]}
          />
          <Select
            label="Route To"
            value={form.route_to}
            onChange={(e) => set("route_to", e.target.value)}
            error={errors.route_to}
            options={[
              { value: "gis", label: "GIS" },
              { value: "mfa", label: "MFA" },
            ]}
          />
          <Input
            label="SLA Hours"
            type="number"
            min="1"
            max="720"
            value={form.sla_hours}
            onChange={(e) => set("sla_hours", e.target.value)}
            error={errors.sla_hours}
            required
          />
          <Input
            label="Priority"
            type="number"
            min="0"
            value={form.priority}
            onChange={(e) => set("priority", e.target.value)}
            hint="Higher = checked first"
          />
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="w-4 h-4 accent-accent"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-text-primary">Active</label>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" type="button" onClick={() => { setCreateOpen(false); setEditRule(null); resetForm(); }}>Cancel</Button>
          <Button type="submit" loading={loading}>{editRule ? "Update Rule" : "Create Rule"}</Button>
        </div>
      </form>
    </Modal>
  );

  return (
    <DashboardShell
      title="Tier Configuration"
      description="Manage processing tier rules for visa types"
      actions={
        <Button leftIcon={<Plus size={16} />} onClick={() => { resetForm(); setCreateOpen(true); }}>
          Add Rule
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 w-48 bg-gray-200 rounded mb-3" />
              <div className="h-4 w-full bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="card text-center py-12">
          <Settings size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-secondary font-medium mb-1">No tier rules configured</p>
          <p className="text-sm text-text-muted mb-4">Create rules to define how applications are routed and processed</p>
          <Button leftIcon={<Plus size={16} />} onClick={() => { resetForm(); setCreateOpen(true); }}>Add First Rule</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-text-primary">{rule.name}</h3>
                    <Badge variant={rule.is_active ? "success" : "neutral"}>
                      {rule.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {rule.description && (
                    <p className="text-sm text-text-secondary mb-3">{rule.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                    <span>Visa: <strong className="text-text-primary">{rule.visa_type?.name || "—"}</strong></span>
                    <span>Tier: <strong className="text-text-primary capitalize">{rule.tier.replace("_", " ")}</strong></span>
                    <span>Route: <strong className="text-text-primary uppercase">{rule.route_to}</strong></span>
                    <span>SLA: <strong className="text-text-primary">{rule.sla_hours}h</strong></span>
                    <span>Priority: <strong className="text-text-primary">{rule.priority}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button variant="ghost" size="sm" leftIcon={<Edit size={14} />} onClick={() => openEdit(rule)}>Edit</Button>
                  <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} className="!text-danger" onClick={() => handleDelete(rule.id)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formModal}
    </DashboardShell>
  );
}
