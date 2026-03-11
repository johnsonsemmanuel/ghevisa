"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function GisAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["GIS_ADMIN", "admin", "SYSTEM_ADMIN"]} redirectTo="/login/staff">
      {children}
    </RoleGuard>
  );
}
