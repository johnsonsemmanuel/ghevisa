"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function GisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["gis_reviewer", "gis_approver", "gis_admin"]} redirectTo="/login/staff">
      {children}
    </RoleGuard>
  );
}
