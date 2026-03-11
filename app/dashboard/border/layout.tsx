"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function BorderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["BORDER_OFFICER", "BORDER_SUPERVISOR"]} redirectTo="/login/border">
      {children}
    </RoleGuard>
  );
}
