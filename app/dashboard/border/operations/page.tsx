import OperationsPage from "@/components/dashboard/OperationsPage";
import { operationsConfigs } from "@/lib/operations-configs";

export default function BorderOperationsPage() {
  return <OperationsPage config={operationsConfigs.border} />;
}
