"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/forms/input";
import { DataTable } from "@/components/ui/display/data-table";
import { Badge } from "@/components/ui/display/badge";
import { Modal } from "@/components/ui/modals/modal";
import { Plus, Search, UserCheck, UserX } from "lucide-react";
import toast from "react-hot-toast";
import type { User, PaginatedResponse } from "@/lib/types";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "gis_officer",
    agency: "GIS",
    phone: "",
    locale: "en",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, role, search],
    queryFn: () =>
      api
        .get<PaginatedResponse<User>>("/admin/users", {
          params: {
            page,
            ...(role && { role }),
            ...(search && { search }),
          },
        })
        .then((r) => r.data),
  });

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await api.post("/admin/users", form);
      toast.success("User created successfully");
      setCreateOpen(false);
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "gis_officer",
        agency: "GIS",
        phone: "",
        locale: "en",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (error.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(error.response.data.errors)) {
          fieldErrors[key] = msgs[0];
        }
        setErrors(fieldErrors);
      } else {
        toast.error("Failed to create user");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user: User, activate: boolean) => {
    try {
      await api.post(`/admin/users/${user.id}/${activate ? "activate" : "deactivate"}`);
      toast.success(`User ${activate ? "activated" : "deactivated"}`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch {
      toast.error("Action failed");
    }
  };

  const columns = [
    {
      key: "full_name",
      header: "Name",
      render: (row: User) => (
        <div>
          <p className="font-medium text-text-primary">{row.full_name}</p>
          <p className="text-xs text-text-muted">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row: User) => (
        <span className="text-sm capitalize">
          {row.role.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "agency",
      header: "Agency",
      render: (row: User) => row.agency || "—",
    },
    {
      key: "is_active",
      header: "Status",
      render: (row: User) => {
        const active = (row as unknown as Record<string, unknown>).is_active !== false;
        return (
          <Badge variant={active ? "success" : "danger"}>
            {active ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (row: User) => {
        const active = (row as unknown as Record<string, unknown>).is_active !== false;
        return (
          <Button
            variant={active ? "danger" : "primary"}
            size="sm"
            leftIcon={active ? <UserX size={12} /> : <UserCheck size={12} />}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(row, !active);
            }}
          >
            {active ? "Deactivate" : "Activate"}
          </Button>
        );
      },
    },
  ];

  return (
    <DashboardShell
      title="User Management"
      description="Manage system users across all agencies"
      actions={
        <Button leftIcon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
          Create User
        </Button>
      }
    >
      {/* Filters */}
      <div className="card mb-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input !pl-9"
            />
          </div>
          <Select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            options={[
              { value: "", label: "All Roles" },
              { value: "applicant", label: "Applicant" },
              { value: "gis_officer", label: "GIS Officer" },
              { value: "mfa_reviewer", label: "MFA Reviewer" },
              { value: "admin", label: "Admin" },
            ]}
          />
        </div>
      </div>

      <DataTable<User>
        columns={columns}
        data={data?.data || []}
        currentPage={data?.current_page}
        lastPage={data?.last_page}
        onPageChange={setPage}
        loading={isLoading}
        emptyMessage="No users found."
      />

      {/* Create User Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create System User" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="First Name" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} error={errors.first_name} required />
            <Input label="Last Name" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} error={errors.last_name} required />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} error={errors.email} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} error={errors.password} hint="Min 8 chars, mixed case + number" required />
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => {
                set("role", e.target.value);
                const agencyMap: Record<string, string> = { gis_officer: "GIS", mfa_reviewer: "MFA", admin: "ADMIN" };
                set("agency", agencyMap[e.target.value] || "ADMIN");
              }}
              error={errors.role}
              options={[
                { value: "gis_officer", label: "GIS Officer" },
                { value: "mfa_reviewer", label: "MFA Reviewer" },
                { value: "admin", label: "Admin" },
              ]}
            />
            <Select
              label="Agency"
              value={form.agency}
              onChange={(e) => set("agency", e.target.value)}
              error={errors.agency}
              options={[
                { value: "GIS", label: "GIS" },
                { value: "MFA", label: "MFA" },
                { value: "ADMIN", label: "ADMIN" },
              ]}
            />
          </div>
          <Input label="Phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} hint="Optional" />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)} type="button">Cancel</Button>
            <Button type="submit" loading={loading}>Create User</Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
