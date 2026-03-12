"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function BorderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["border_officer", "border_supervisor"]} redirectTo="/login/border">
      {children}
    </RoleGuard>
  );
}
