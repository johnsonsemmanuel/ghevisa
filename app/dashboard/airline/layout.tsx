"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function AirlineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Airline staff and admin access only
  return (
    <RoleGuard allowedRoles={["airline_staff", "airline_admin"]} redirectTo="/login/airline">
      {children}
    </RoleGuard>
  );
}
