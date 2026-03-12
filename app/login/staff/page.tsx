import RoleBasedLoginForm from "@/components/auth/RoleBasedLoginForm";
import { roleConfigs, otherPortalsConfig } from "@/lib/role-configs";

export default function StaffLoginPage() {
  return (
    <RoleBasedLoginForm 
      config={roleConfigs.staff} 
      otherPortals={otherPortalsConfig.staff}
    />
  );
}
