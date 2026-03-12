import RoleBasedLoginForm from "@/components/auth/RoleBasedLoginForm";
import { roleConfigs, otherPortalsConfig } from "@/lib/role-configs";

export default function BorderLoginPage() {
  return (
    <RoleBasedLoginForm 
      config={roleConfigs.border} 
      otherPortals={otherPortalsConfig.border}
    />
  );
}
