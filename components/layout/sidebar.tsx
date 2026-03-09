"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  AlertTriangle,
  Users,
  Settings,
  BarChart3,
  LogOut,
  Shield,
  Bell,
  ChevronUp,
  User,
  HelpCircle,
  DollarSign,
  Globe,
  Bot,
} from "lucide-react";
import type { UserRole } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navByRole: Record<UserRole, NavItem[]> = {
  applicant: [
    { label: "Dashboard", href: "/dashboard/applicant", icon: <LayoutDashboard size={20} /> },
    { label: "My Applications", href: "/dashboard/applicant/applications", icon: <FileText size={20} /> },
    { label: "Notifications", href: "/dashboard/applicant/notifications", icon: <Bell size={20} /> },
    { label: "Help & Support", href: "/dashboard/applicant/support", icon: <HelpCircle size={20} /> },
    { label: "Profile", href: "/dashboard/applicant/profile", icon: <User size={20} /> },
  ],
  APPLICANT: [
    { label: "Dashboard", href: "/dashboard/applicant", icon: <LayoutDashboard size={20} /> },
    { label: "My Applications", href: "/dashboard/applicant/applications", icon: <FileText size={20} /> },
    { label: "Notifications", href: "/dashboard/applicant/notifications", icon: <Bell size={20} /> },
    { label: "Help & Support", href: "/dashboard/applicant/support", icon: <HelpCircle size={20} /> },
    { label: "Profile", href: "/dashboard/applicant/profile", icon: <User size={20} /> },
  ],
  // GIS roles - all use same navigation
  GIS_REVIEWING_OFFICER: [
    { label: "Dashboard", href: "/dashboard/gis", icon: <LayoutDashboard size={20} /> },
    { label: "Case Queue", href: "/dashboard/gis/cases", icon: <FolderOpen size={20} /> },
    { label: "Support", href: "/dashboard/gis/support", icon: <HelpCircle size={20} /> },
    { label: "SLA Alerts", href: "/dashboard/gis/sla-alerts", icon: <AlertTriangle size={20} /> },
    { label: "Payments", href: "/dashboard/gis/payments", icon: <BarChart3 size={20} /> },
  ],
  GIS_APPROVAL_OFFICER: [
    { label: "Dashboard", href: "/dashboard/gis", icon: <LayoutDashboard size={20} /> },
    { label: "Case Queue", href: "/dashboard/gis/cases", icon: <FolderOpen size={20} /> },
    { label: "Support", href: "/dashboard/gis/support", icon: <HelpCircle size={20} /> },
    { label: "SLA Alerts", href: "/dashboard/gis/sla-alerts", icon: <AlertTriangle size={20} /> },
    { label: "Payments", href: "/dashboard/gis/payments", icon: <BarChart3 size={20} /> },
  ],
  GIS_ADMIN: [
    { label: "Dashboard", href: "/dashboard/gis", icon: <LayoutDashboard size={20} /> },
    { label: "Case Queue", href: "/dashboard/gis/cases", icon: <FolderOpen size={20} /> },
    { label: "Support", href: "/dashboard/gis/support", icon: <HelpCircle size={20} /> },
    { label: "SLA Alerts", href: "/dashboard/gis/sla-alerts", icon: <AlertTriangle size={20} /> },
    { label: "Payments", href: "/dashboard/gis/payments", icon: <BarChart3 size={20} /> },
  ],
  // MFA roles - all use same navigation
  MFA_REVIEWING_OFFICER: [
    { label: "Dashboard", href: "/dashboard/mfa", icon: <LayoutDashboard size={20} /> },
    { label: "Escalations", href: "/dashboard/mfa/escalations", icon: <AlertTriangle size={20} /> },
    { label: "Payments", href: "/dashboard/mfa/payments", icon: <BarChart3 size={20} /> },
  ],
  MFA_APPROVAL_OFFICER: [
    { label: "Dashboard", href: "/dashboard/mfa", icon: <LayoutDashboard size={20} /> },
    { label: "Escalations", href: "/dashboard/mfa/escalations", icon: <AlertTriangle size={20} /> },
    { label: "Payments", href: "/dashboard/mfa/payments", icon: <BarChart3 size={20} /> },
  ],
  MFA_ADMIN: [
    { label: "Dashboard", href: "/dashboard/mfa", icon: <LayoutDashboard size={20} /> },
    { label: "Escalations", href: "/dashboard/mfa/escalations", icon: <AlertTriangle size={20} /> },
    { label: "Payments", href: "/dashboard/mfa/payments", icon: <BarChart3 size={20} /> },
  ],
  // Admin
  SYSTEM_ADMIN: [
    { label: "Overview", href: "/dashboard/admin", icon: <LayoutDashboard size={20} /> },
    { label: "Users", href: "/dashboard/admin/users", icon: <Users size={20} /> },
    { label: "Applications", href: "/dashboard/admin/applications", icon: <FileText size={20} /> },
    { label: "Payments", href: "/dashboard/admin/payments", icon: <BarChart3 size={20} /> },
    { label: "Financial Reports", href: "/dashboard/admin/financial", icon: <DollarSign size={20} /> },
    { label: "Country Analytics", href: "/dashboard/admin/countries", icon: <Globe size={20} /> },
    { label: "AI Assistant", href: "/dashboard/admin/ai-assistant", icon: <Bot size={20} /> },
    { label: "Visa Types", href: "/dashboard/admin/visa-types", icon: <FileText size={20} /> },
    { label: "Tier Rules", href: "/dashboard/admin/tier-rules", icon: <Settings size={20} /> },
    { label: "Audit Logs", href: "/dashboard/admin/reports/audit-logs", icon: <FileText size={20} /> },
  ],
  // Legacy role names for backward compatibility
  gis_officer: [
    { label: "Dashboard", href: "/dashboard/gis", icon: <LayoutDashboard size={20} /> },
    { label: "Case Queue", href: "/dashboard/gis/cases", icon: <FolderOpen size={20} /> },
    { label: "Support", href: "/dashboard/gis/support", icon: <HelpCircle size={20} /> },
    { label: "SLA Alerts", href: "/dashboard/gis/sla-alerts", icon: <AlertTriangle size={20} /> },
    { label: "Payments", href: "/dashboard/gis/payments", icon: <BarChart3 size={20} /> },
  ],
  mfa_reviewer: [
    { label: "Dashboard", href: "/dashboard/mfa", icon: <LayoutDashboard size={20} /> },
    { label: "Escalations", href: "/dashboard/mfa/escalations", icon: <AlertTriangle size={20} /> },
    { label: "Payments", href: "/dashboard/mfa/payments", icon: <BarChart3 size={20} /> },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: <LayoutDashboard size={20} /> },
    { label: "Users", href: "/dashboard/admin/users", icon: <Users size={20} /> },
    { label: "Applications", href: "/dashboard/admin/applications", icon: <FileText size={20} /> },
    { label: "Payments", href: "/dashboard/admin/payments", icon: <BarChart3 size={20} /> },
    { label: "Financial Reports", href: "/dashboard/admin/financial", icon: <DollarSign size={20} /> },
    { label: "Country Analytics", href: "/dashboard/admin/countries", icon: <Globe size={20} /> },
    { label: "AI Assistant", href: "/dashboard/admin/ai-assistant", icon: <Bot size={20} /> },
    { label: "Visa Types", href: "/dashboard/admin/visa-types", icon: <FileText size={20} /> },
    { label: "Tier Rules", href: "/dashboard/admin/tier-rules", icon: <Settings size={20} /> },
    { label: "Audit Logs", href: "/dashboard/admin/reports/audit-logs", icon: <FileText size={20} /> },
  ],
};

const roleLabels: Record<UserRole, string> = {
  applicant: "Applicant",
  APPLICANT: "Applicant",
  // GIS roles
  GIS_REVIEWING_OFFICER: "GIS Reviewing Officer",
  GIS_APPROVAL_OFFICER: "GIS Approval Officer",
  GIS_ADMIN: "GIS Administrator",
  // MFA roles
  MFA_REVIEWING_OFFICER: "MFA Reviewing Officer",
  MFA_APPROVAL_OFFICER: "MFA Approval Officer",
  MFA_ADMIN: "MFA Administrator",
  // Admin
  SYSTEM_ADMIN: "System Administrator",
  // Legacy role names for backward compatibility
  gis_officer: "GIS Officer",
  mfa_reviewer: "MFA Reviewer",
  admin: "Administrator",
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const navItems = navByRole[user.role] || [];

  // Check if current path exactly matches or is a subpage (but not sibling routes)
  const isActive = (href: string) => {
    if (pathname === href) return true;
    // For dashboard root pages, only match exact
    if (href.endsWith("/applicant") || href.endsWith("/gis") || href.endsWith("/mfa") || href.endsWith("/admin")) {
      return pathname === href;
    }
    // For other pages, match if it's a subpage
    return pathname.startsWith(href + "/");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar text-white">
      {/* Header */}
      <div className="p-5 border-b border-black/20">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {user.role.startsWith("GIS") || user.role === "gis_officer" ? (
            <img src="/gis-logo-new.png" alt="Ghana Immigration Service" width={64} height={64} className="drop-shadow-lg" />
          ) : (
            <img src="/gis-logo.png" alt="Ghana Immigration Service" width={44} height={36} className="drop-shadow-lg" />
          )}
          <div>
            <h1 className="text-base font-bold tracking-tight">GH-eVISA</h1>
            <p className="text-[11px] text-gold/60">Electronic Visa Platform</p>
          </div>
        </div>
        <div className="mt-3 h-[2px] rounded-full bg-white/10" />
      </div>

      {/* Role Badge */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
          <Shield size={14} className="text-gold" />
          <span className="text-xs font-medium text-white/70">
            {roleLabels[user.role]}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${active
                  ? "bg-sidebar-active text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-sidebar-hover"
                }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile with Upward Dropdown */}
      <div className="relative p-4" ref={dropdownRef}>
        {/* Dropdown Menu (opens upward) */}
        {userDropdownOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-xl border border-border overflow-hidden z-50 animate-fade-in">
            <div className="p-4 border-b border-border bg-surface">
              <p className="text-sm font-semibold text-text-primary">{user.full_name}</p>
              <p className="text-xs text-text-muted">{user.email}</p>
              <p className="text-[10px] text-accent font-medium mt-1 uppercase tracking-wider">{roleLabels[user.role]}</p>
            </div>
            <div className="p-2">
              <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-surface hover:text-text-primary transition-colors text-left">
                <User size={16} />
                Profile Settings
              </button>
              <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-surface hover:text-text-primary transition-colors text-left">
                <HelpCircle size={16} />
                Help & Support
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-danger hover:bg-danger/5 transition-colors text-left"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* User Profile Button */}
        <button
          onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
            {user.first_name[0]}
            {user.last_name[0]}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-gray-100 truncate">
              {user.full_name}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <ChevronUp size={16} className={`text-white/40 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
