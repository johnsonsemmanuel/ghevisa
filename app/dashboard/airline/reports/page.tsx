import ReportsPage from "@/components/dashboard/ReportsPage";
import { reportsConfigs } from "@/lib/reports-configs";

export default function AirlineReportsPage() {
  return <ReportsPage config={reportsConfigs.airline} />;
}
