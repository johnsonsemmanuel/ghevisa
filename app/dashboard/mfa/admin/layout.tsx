"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function MfaAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["MFA_ADMIN", "admin", "SYSTEM_ADMIN"]} redirectTo="/login/staff">
      {children}
    </RoleGuard>
  );
}
