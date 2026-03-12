import RoleBasedLoginForm from "@/components/auth/RoleBasedLoginForm";
import { roleConfigs, otherPortalsConfig } from "@/lib/role-configs";

export default function AdminLoginPage() {
  return (
    <RoleBasedLoginForm 
      config={roleConfigs.admin} 
      otherPortals={otherPortalsConfig.admin}
    />
  );
}

