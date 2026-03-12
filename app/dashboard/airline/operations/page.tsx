import OperationsPage from "@/components/dashboard/OperationsPage";
import { operationsConfigs } from "@/lib/operations-configs";

export default function AirlineOperationsPage() {
  return <OperationsPage config={operationsConfigs.airline} />;
}
