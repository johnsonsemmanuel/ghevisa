"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/forms/input";
import { CardSkeleton } from "@/components/ui/skeleton";

import { ArrowLeft, Save, User, Shield, Mail, Phone, Calendar, Activity } from "lucide-react";
import toast from "react-hot-toast";

interface UserDetail {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  applications_count?: number;
  assigned_cases_count?: number;
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    is_active: true,
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => api.get<UserDetail>(`/admin/users/${id}`).then((r) => r.data),
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        is_active: user.is_active,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/admin/users/${id}`, formData);
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      if (user?.is_active) {
        await api.post(`/admin/users/${id}/deactivate`);
        toast.success("User deactivated");
      } else {
        await api.post(`/admin/users/${id}/activate`);
        toast.success("User activated");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch {
      toast.error("Failed to update user status");
    }
  };

  if (isLoading) {
    return (
      <DashboardShell title="User Details">
        <CardSkeleton />
      </DashboardShell>
    );
  }

  if (!user) {
    return (
      <DashboardShell title="User Not Found">
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">This user could not be found.</p>
          <Button variant="secondary" onClick={() => router.push("/dashboard/admin/users")}>
            Back to Users
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={`${user.first_name} ${user.last_name}`}
      description={`User ID: ${user.id}`}
      actions={
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<ArrowLeft size={14} />}
          onClick={() => router.push("/dashboard/admin/users")}
        >
          Back
        </Button>
      }
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card">
            <h2 className="text-lg font-semibold text-text-primary mb-6">Edit User</h2>
            
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
              
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              
              <Select
                label="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                options={[
                  { value: "applicant", label: "Applicant" },
                  { value: "gis_officer", label: "GIS Officer" },
                  { value: "mfa_reviewer", label: "MFA Reviewer" },
                  { value: "admin", label: "Administrator" },
                ]}
                required
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
                  Account is active
                </label>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-border">
              <Button type="submit" loading={loading} leftIcon={<Save size={16} />}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* User Info Card */}
          <div className="card">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User size={28} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  {user.first_name} {user.last_name}
                </h3>
                <span className={`badge ${user.is_active ? "badge-success" : "badge-danger"}`}>
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <InfoRow icon={<Mail size={14} />} label="Email" value={user.email} />
              <InfoRow icon={<Phone size={14} />} label="Phone" value={user.phone || "—"} />
              <InfoRow 
                icon={<Shield size={14} />} 
                label="Role" 
                value={user.role.replace("_", " ")} 
                capitalize 
              />
              <InfoRow 
                icon={<Calendar size={14} />} 
                label="Joined" 
                value={new Date(user.created_at).toLocaleDateString()} 
              />
              <InfoRow 
                icon={<Activity size={14} />} 
                label="Email Verified" 
                value={user.email_verified_at ? "Yes" : "No"} 
              />
            </div>
          </div>

          {/* Stats Card */}
          {(user.applications_count !== undefined || user.assigned_cases_count !== undefined) && (
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                {user.applications_count !== undefined && (
                  <div className="text-center p-3 bg-surface rounded-lg">
                    <p className="text-2xl font-bold text-primary">{user.applications_count}</p>
                    <p className="text-xs text-text-muted">Applications</p>
                  </div>
                )}
                {user.assigned_cases_count !== undefined && (
                  <div className="text-center p-3 bg-surface rounded-lg">
                    <p className="text-2xl font-bold text-info">{user.assigned_cases_count}</p>
                    <p className="text-xs text-text-muted">Assigned Cases</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions Card */}
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-4">Actions</h3>
            <div className="space-y-3">
              <Button
                variant={user.is_active ? "danger" : "secondary"}
                className="w-full"
                onClick={handleToggleActive}
              >
                {user.is_active ? "Deactivate Account" : "Activate Account"}
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  toast.success("Password reset email sent");
                }}
              >
                Send Password Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function InfoRow({ 
  icon, 
  label, 
  value, 
  capitalize 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="flex items-center gap-2 text-sm text-text-muted">
        {icon}
        {label}
      </span>
      <span className={`text-sm font-medium text-text-primary ${capitalize ? "capitalize" : ""}`}>
        {value}
      </span>
    </div>
  );
}
