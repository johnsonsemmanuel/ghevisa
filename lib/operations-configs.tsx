import { MapPin, Plane } from "lucide-react";
import { OperationsConfig } from "@/components/dashboard/OperationsPage";

export const operationsConfigs: Record<string, OperationsConfig> = {
  border: {
    role: 'border',
    title: 'Border Operations Center',
    description: 'Real-time border operations monitoring and management',
    apiEndpoint: '/border/operations',
    themeColor: 'primary',
    entityLabel: 'Port',
    entityIcon: <MapPin size={10} className="text-text-muted" />,
    staffLabel: 'Officers',
    actionLabel: 'Entry',
    statsLabels: {
      total: 'Total Verifications',
      authorized: 'Authorized Entries',
      denied: 'Denied Entries',
      activeStaff: 'Active Officers',
      activeEntities: 'Active Ports',
    },
  },

  airline: {
    role: 'airline',
    title: 'Airline Operations Center',
    description: 'Real-time airline verification monitoring and management',
    apiEndpoint: '', // No backend yet for airline
    themeColor: 'blue-600',
    entityLabel: 'Flight',
    entityIcon: <Plane size={10} className="text-text-muted" />,
    staffLabel: 'Staff',
    actionLabel: 'Boarding',
    statsLabels: {
      total: 'Total Verifications',
      authorized: 'Authorized Boarding',
      denied: 'Denied Boarding',
      activeStaff: 'Active Staff',
      activeEntities: 'Flights Processed',
    },
    mockData: {
      stats: {
        total_verifications: 892,
        authorized: 856,
        denied: 36,
        avg_processing_time: "38s",
        active_officers: 8,
        ports_active: 24,
      },
      recentActivity: [
        { id: 1, time: "1 min ago", staff: "Staff Johnson", flight: "BA078", action: "Boarding Authorized", status: "success" },
        { id: 2, time: "4 min ago", staff: "Staff Williams", flight: "KL592", action: "Boarding Authorized", status: "success" },
        { id: 3, time: "6 min ago", staff: "Staff Brown", flight: "AF520", action: "Boarding Denied", status: "danger" },
        { id: 4, time: "8 min ago", staff: "Staff Davis", flight: "LH568", action: "Boarding Authorized", status: "success" },
        { id: 5, time: "11 min ago", staff: "Staff Miller", flight: "EK788", action: "Boarding Authorized", status: "success" },
      ],
      entityActivity: [
        { flight: "BA078", airline: "British Airways", verifications: 156, authorized: 152, denied: 4, status: "Boarding" },
        { flight: "KL592", airline: "KLM", verifications: 134, authorized: 131, denied: 3, status: "Boarding" },
        { flight: "AF520", airline: "Air France", verifications: 128, authorized: 122, denied: 6, status: "Boarding" },
        { flight: "LH568", airline: "Lufthansa", verifications: 112, authorized: 109, denied: 3, status: "Completed" },
        { flight: "EK788", airline: "Emirates", verifications: 98, authorized: 95, denied: 3, status: "Boarding" },
        { flight: "QR542", airline: "Qatar Airways", verifications: 87, authorized: 84, denied: 3, status: "Scheduled" },
      ],
    },
  },
};
