"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, Lock, Save, Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profile, setProfile] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
  });

  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/auth/profile", profile);
      toast.success("Profile updated successfully");
      // Update local storage
      const updatedUser = { ...user, ...profile };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.new_password_confirmation) {
      toast.error("New passwords don't match");
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put("/auth/password", {
        current_password: passwords.current_password,
        password: passwords.new_password,
        password_confirmation: passwords.new_password_confirmation,
      });
      toast.success("Password changed successfully");
      setPasswords({ current_password: "", new_password: "", new_password_confirmation: "" });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <DashboardShell
      title="Profile Settings"
      description="Manage your account information and security"
    >
      {/* Avatar Header */}
      <div className="card !p-4 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-lg font-bold shadow-sm">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">{user?.first_name} {user?.last_name}</h2>
            <p className="text-xs text-text-muted">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/8 text-accent capitalize">
                <Shield size={10} /> {user?.role?.replace("_", " ")}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface text-text-muted">
                {user?.locale === "fr" ? "Français" : "English"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Profile Information */}
        <div className="card !p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary/6 flex items-center justify-center">
              <User size={14} className="text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">Personal Information</h2>
              <p className="text-[10px] text-text-muted">Update your personal details</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                placeholder="John"
                required
              />
              <Input
                label="Last Name"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                placeholder="Doe"
                required
              />
            </div>
            <Input
              label="Email Address"
              type="email"
              value={user?.email || ""}
              disabled
              hint="Email cannot be changed"
            />
            <Input
              label="Phone Number"
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+233 XX XXX XXXX"
            />
            <Button type="submit" loading={loading} leftIcon={<Save size={14} />} size="sm">
              Save Changes
            </Button>
          </form>
        </div>

        {/* Password Change */}
        <div className="card !p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gold/8 flex items-center justify-center">
              <Lock size={14} className="text-gold" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">Change Password</h2>
              <p className="text-[10px] text-text-muted">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-3">
            <Input
              label="Current Password"
              type="password"
              value={passwords.current_password}
              onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
              placeholder="••••••••"
              required
            />
            <Input
              label="New Password"
              type="password"
              value={passwords.new_password}
              onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
              placeholder="••••••••"
              hint="Minimum 8 characters with uppercase, lowercase, and numbers"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwords.new_password_confirmation}
              onChange={(e) => setPasswords({ ...passwords, new_password_confirmation: e.target.value })}
              placeholder="••••••••"
              required
            />
            <Button type="submit" loading={passwordLoading} leftIcon={<Lock size={14} />} size="sm">
              Change Password
            </Button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
