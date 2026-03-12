import { RoleConfig } from "@/components/auth/RoleBasedLoginForm";

export const roleConfigs: Record<string, RoleConfig> = {
  admin: {
    id: "admin",
    title: "System Administration",
    subtitle: "Administration",
    icon: "settings",
    allowedRoles: ["SYSTEM_ADMIN", "admin"],
    redirectPath: "/dashboard/admin",
    description: "Administrative access to manage users, configure tier rules, and generate system reports. Authorised personnel only.",
    features: [
      { icon: "lock", text: "Restricted Access" },
      { icon: "settings", text: "System Config" },
      { icon: "shield", text: "Full Control" },
    ],
    themeColors: {
      gradient: "bg-purple-900/90",
      primary: "purple-600",
      light: "purple-50",
      accent: "purple-300",
    },
    requiresMfa: true,
    devCredentials: [
      { label: "System Admin", email: "admin@ghevisa.gov.gh", password: "password" },
    ],
  },

  border: {
    id: "border",
    title: "Border Verification Portal",
    subtitle: "Border Control",
    icon: "scan",
    allowedRoles: ["BORDER_OFFICER", "BORDER_SUPERVISOR", "border_officer", "border_supervisor"],
    redirectPath: "/dashboard/border",
    description: "Immigration entry point verification system for border officers. Verify traveler authorization and manage border crossings.",
    features: [
      { icon: "lock", text: "Secure Access" },
      { icon: "scan", text: "QR Verification" },
      { icon: "shield", text: "Real-time Checks" },
    ],
    themeColors: {
      gradient: "bg-violet-900/90",
      primary: "violet-600",
      light: "violet-50",
      accent: "violet-300",
    },
    requiresMfa: true,
    devCredentials: [
      { label: "Border Officer", email: "border@ghevisa.gov.gh", password: "password" },
    ],
  },

  airline: {
    id: "airline",
    title: "Airline Verification Portal",
    subtitle: "Airline Portal",
    icon: "plane",
    allowedRoles: ["AIRLINE_STAFF", "AIRLINE_ADMIN", "airline_staff", "airline_admin"],
    redirectPath: "/dashboard/airline",
    description: "Ghana Travel Authorization Verification System (GTAVS). Verify passenger boarding eligibility for flights to Ghana.",
    features: [
      { icon: "lock", text: "Secure Access" },
      { icon: "plane", text: "Real-time Verification" },
      { icon: "shield", text: "Compliance Checks" },
    ],
    themeColors: {
      gradient: "bg-blue-900/90",
      primary: "blue-600",
      light: "blue-50",
      accent: "cyan-300",
    },
    requiresMfa: false,
    devCredentials: [
      { label: "Airline Staff", email: "airline@example.com", password: "password" },
    ],
  },

  staff: {
    id: "staff",
    title: "Staff Operations Portal",
    subtitle: "Staff Portal",
    icon: "users",
    allowedRoles: [
      "GIS_REVIEWING_OFFICER", "GIS_APPROVAL_OFFICER", "GIS_ADMIN",
      "MFA_REVIEWING_OFFICER", "MFA_APPROVAL_OFFICER", "MFA_ADMIN",
      "SYSTEM_ADMIN", "BORDER_OFFICER", "BORDER_SUPERVISOR",
      "gis_officer", "gis_approver", "gis_admin",
      "mfa_reviewer", "mfa_approver", "mfa_admin",
      "admin", "border_officer", "border_supervisor"
    ],
    redirectPath: "/dashboard/gis",
    description: "Access the case management system to review and process visa applications. GIS Officers and MFA Reviewers only.",
    features: [
      { icon: "shield", text: "Secure Access" },
      { icon: "users", text: "GIS & MFA Staff" },
      { icon: "filecheck", text: "Case Management" },
    ],
    themeColors: {
      gradient: "bg-teal-800/90",
      primary: "teal-600",
      light: "teal-50",
      accent: "cyan-300",
    },
    requiresMfa: true,
    devCredentials: [
      { label: "GIS Reviewer", email: "kmensah@gis.gov.gh", password: "password" },
      { label: "GIS Approver", email: "gis.approver@gis.gov.gh", password: "password" },
      { label: "GIS Admin", email: "gis.admin@gis.gov.gh", password: "password" },
      { label: "MFA Reviewer", email: "aadjei@mfa.gov.gh", password: "password" },
      { label: "MFA Approver", email: "mfa.approver@mfa.gov.gh", password: "password" },
      { label: "MFA Admin", email: "mfa.admin@mfa.gov.gh", password: "password" },
    ],
  },
};

export const otherPortalsConfig = {
  admin: [
    { href: "/login", label: "Applicant", icon: "user", color: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
    { href: "/login/staff", label: "Staff", icon: "briefcase", color: "bg-teal-50 text-teal-700 border border-teal-100" },
    { href: "/login/airline", label: "Airline", icon: "briefcase", color: "bg-blue-50 text-blue-700 border border-blue-100" },
    { href: "/login/border", label: "Border", icon: "shield", color: "bg-violet-50 text-violet-700 border border-violet-100" },
  ],
  border: [
    { href: "/login", label: "Applicant", icon: "user", color: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
    { href: "/login/staff", label: "Staff", icon: "briefcase", color: "bg-teal-50 text-teal-700 border border-teal-100" },
    { href: "/login/admin", label: "Admin", icon: "shield", color: "bg-purple-50 text-purple-700 border border-purple-100" },
    { href: "/login/airline", label: "Airline", icon: "briefcase", color: "bg-blue-50 text-blue-700 border border-blue-100" },
  ],
  airline: [
    { href: "/login", label: "Applicant", icon: "user", color: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
    { href: "/login/staff", label: "Staff", icon: "briefcase", color: "bg-teal-50 text-teal-700 border border-teal-100" },
    { href: "/login/admin", label: "Admin", icon: "shield", color: "bg-purple-50 text-purple-700 border border-purple-100" },
    { href: "/login/border", label: "Border", icon: "shield", color: "bg-violet-50 text-violet-700 border border-violet-100" },
  ],
  staff: [
    { href: "/login", label: "Applicant", icon: "user", color: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
    { href: "/login/admin", label: "Admin", icon: "shield", color: "bg-purple-50 text-purple-700 border border-purple-100" },
    { href: "/login/airline", label: "Airline", icon: "briefcase", color: "bg-blue-50 text-blue-700 border border-blue-100" },
    { href: "/login/border", label: "Border", icon: "shield", color: "bg-violet-50 text-violet-700 border border-violet-100" },
  ],
};
