"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function AirlineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["AIRLINE_STAFF", "AIRLINE_ADMIN"]} redirectTo="/login/airline">
      {children}
    </RoleGuard>
  );
}
