"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
}

const loginRoutes: Record<UserRole, string> = {
  applicant: "/login",
  gis_reviewer: "/login/staff",
  gis_approver: "/login/staff",
  gis_admin: "/login/staff",
  mfa_reviewer: "/login/staff",
  mfa_approver: "/login/staff",
  mfa_admin: "/login/staff",
  admin: "/login/admin",
  border_officer: "/login/border",
  border_supervisor: "/login/border",
  airline_staff: "/login/airline",
  airline_admin: "/login/airline",
};

export function RoleGuard({ allowedRoles, children, redirectTo }: RoleGuardProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      // Not logged in - redirect to appropriate login
      router.push(redirectTo || "/login");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      // User doesn't have permission - redirect to their correct dashboard or login
      const correctLogin = loginRoutes[user.role];
      router.push(correctLogin);
    }
  }, [user, isAuthenticated, loading, allowedRoles, router, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or wrong role
  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
