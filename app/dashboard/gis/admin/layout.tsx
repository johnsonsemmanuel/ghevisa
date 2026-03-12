"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function GisAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["gis_admin", "admin"]} redirectTo="/login/staff">
      {children}
    </RoleGuard>
  );
}
