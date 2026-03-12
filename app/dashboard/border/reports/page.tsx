import ReportsPage from "@/components/dashboard/ReportsPage";
import { reportsConfigs } from "@/lib/reports-configs";

export default function BorderReportsPage() {
  return <ReportsPage config={reportsConfigs.border} />;
}
