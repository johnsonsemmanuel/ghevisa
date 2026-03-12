"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function MfaAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["mfa_admin", "admin"]} redirectTo="/login/staff">
      {children}
    </RoleGuard>
  );
}
