"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function BorderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Border officer and supervisor access only
  return (
    <RoleGuard allowedRoles={["border_officer", "border_supervisor"]} redirectTo="/login/border">
      {children}
    </RoleGuard>
  );
}
