import RoleBasedLoginForm from "@/components/auth/RoleBasedLoginForm";
import { roleConfigs, otherPortalsConfig } from "@/lib/role-configs";

export default function AirlineLoginPage() {
  return (
    <RoleBasedLoginForm 
      config={roleConfigs.airline} 
      otherPortals={otherPortalsConfig.airline}
    />
  );
}
