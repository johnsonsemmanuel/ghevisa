"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function MfaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["mfa_reviewer", "mfa_approver", "mfa_admin"]} redirectTo="/login/staff">
      {children}
    </RoleGuard>
  );
}
