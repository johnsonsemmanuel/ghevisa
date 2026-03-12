"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["applicant"]} redirectTo="/login">
      {children}
    </RoleGuard>
  );
}
