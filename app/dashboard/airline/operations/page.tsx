"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import toast from "react-hot-toast";
import { 
  Activity, Users, CheckCircle2, XCircle, Clock, 
  TrendingUp, Plane, AlertTriangle, BarChart3, Calendar
} from "lucide-react";

export default function AirlineOperationsPage() {
  const [timeRange, setTimeRange] = useState("today");
  const [loading, setLoading] = useState(false);

  // Mock data - airline doesn't have backend yet, so we'll use static data
  const stats = {
    total_verifications: 892,
    authorized: 856,
    denied: 36,
    avg_processing_time: "38s",
    active_staff: 8,
    flights_processed: 24,
  };

  const recentActivity = [
    { id: 1, time: "1 min ago", staff: "Staff Johnson", flight: "BA078", action: "Boarding Authorized", status: "success" },
    { id: 2, time: "4 min ago", staff: "Staff Williams", flight: "KL592", action: "Boarding Authorized", status: "success" },
    { id: 3, time: "6 min ago", staff: "Staff Brown", flight: "AF520", action: "Boarding Denied", status: "danger" },
    { id: 4, time: "8 min ago", staff: "Staff Davis", flight: "LH568", action: "Boarding Authorized", status: "success" },
    { id: 5, time: "11 min ago", staff: "Staff Miller", flight: "EK788", action: "Boarding Authorized", status: "success" },
  ];

  const flightActivity = [
    { flight: "BA078", airline: "British Airways", verifications: 156, authorized: 152, denied: 4, status: "Boarding" },
    { flight: "KL592", airline: "KLM", verifications: 134, authorized: 131, denied: 3, status: "Boarding" },
    { flight: "AF520", airline: "Air France", verifications: 128, authorized: 122, denied: 6, status: "Boarding" },
    { flight: "LH568", airline: "Lufthansa", verifications: 112, authorized: 109, denied: 3, status: "Completed" },
    { flight: "EK788", airline: "Emirates", verifications: 98, authorized: 95, denied: 3, status: "Boarding" },
    { flight: "QR542", airline: "Qatar Airways", verifications: 87, authorized: 84, denied: 3, status: "Scheduled" },
  ];

  // Simulate data refresh
  useEffect(() => {
    if (timeRange) {
      setLoading(true);
      setTimeout(() => setLoading(false), 500);
    }
  }, [timeRange]);

  return (
    <DashboardShell
      title="Operations Dashboard"
      description="Real-time airline verification monitoring and management"
    >
      <div className="space-y-4">
        {/* Header Banner */}
        <div className="rounded-xl bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-sky-500/5 border border-blue-500/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Activity size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-text-primary mb-0.5">
                  Airline Operations Center
                </h2>
                <p className="text-xs text-text-secondary">
                  Live monitoring of passenger verification activities across all flights
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-border bg-white text-text-primary"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="card p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent/6 flex items-center justify-center">
                <BarChart3 size={16} className="text-accent" />
              </div>
              <span className="text-[10px] font-medium text-success flex items-center gap-1">
                <TrendingUp size={10} />
                +8%
              </span>
            </div>
            <p className="text-xs text-text-muted mb-0.5">Total Verifications</p>
            <p className="text-2xl font-bold text-text-primary">{stats.total_verifications.toLocaleString()}</p>
          </div>

          <div className="card p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-success/6 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-success" />
              </div>
              <span className="text-[10px] font-medium text-text-muted">
                {((stats.authorized / stats.total_verifications) * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-text-muted mb-0.5">Authorized Boarding</p>
            <p className="text-2xl font-bold text-success">{stats.authorized.toLocaleString()}</p>
          </div>

          <div className="card p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-danger/6 flex items-center justify-center">
                <XCircle size={16} className="text-danger" />
              </div>
              <span className="text-[10px] font-medium text-text-muted">
                {((stats.denied / stats.total_verifications) * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-text-muted mb-0.5">Denied Boarding</p>
            <p className="text-2xl font-bold text-danger">{stats.denied.toLocaleString()}</p>
          </div>

          <div className="card p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/6 flex items-center justify-center">
                <Clock size={16} className="text-primary" />
              </div>
            </div>
            <p className="text-xs text-text-muted mb-0.5">Avg Processing Time</p>
            <p className="text-2xl font-bold text-text-primary">{stats.avg_processing_time}</p>
          </div>

          <div className="card p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent/6 flex items-center justify-center">
                <Users size={16} className="text-accent" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
                Active
              </span>
            </div>
            <p className="text-xs text-text-muted mb-0.5">Active Staff</p>
            <p className="text-2xl font-bold text-text-primary">{stats.active_staff}</p>
          </div>

          <div className="card p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/6 flex items-center justify-center">
                <Plane size={16} className="text-blue-600" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
                Today
              </span>
            </div>
            <p className="text-xs text-text-muted mb-0.5">Flights Processed</p>
            <p className="text-2xl font-bold text-text-primary">{stats.flights_processed}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-accent/6 flex items-center justify-center">
                  <Activity size={14} className="text-accent" />
                </div>
                <h3 className="text-sm font-bold text-text-primary">Recent Activity</h3>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium animate-pulse">
                  Live
                </span>
              </div>

              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-surface hover:bg-surface/80 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      activity.status === "success" ? "bg-success" : "bg-danger"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-semibold text-text-primary">{activity.staff}</p>
                        <span className="text-[10px] text-text-muted">•</span>
                        <p className="text-[10px] text-text-muted">{activity.time}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Plane size={10} className="text-text-muted" />
                        <p className="text-[11px] text-text-secondary">{activity.flight}</p>
                      </div>
                    </div>
                    <div className={`text-[11px] font-medium px-2 py-1 rounded-md ${
                      activity.status === "success" 
                        ? "bg-success/10 text-success" 
                        : "bg-danger/10 text-danger"
                    }`}>
                      {activity.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flight Activity */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500/6 flex items-center justify-center">
                  <Plane size={14} className="text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-text-primary">Flight Activity</h3>
              </div>

              <div className="space-y-2">
                {flightActivity.map((flight, index) => (
                  <div
                    key={index}
                    className="p-2.5 rounded-lg bg-surface"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-text-primary">{flight.flight}</p>
                        <span className="text-[10px] text-text-muted">•</span>
                        <p className="text-[10px] text-text-muted">{flight.airline}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          flight.status === "Boarding" ? "bg-success/10 text-success" :
                          flight.status === "Completed" ? "bg-text-muted/10 text-text-muted" :
                          "bg-warning/10 text-warning"
                        }`}>
                          {flight.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-text-primary">{flight.verifications}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-surface-dark rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success rounded-full"
                          style={{ width: `${(flight.authorized / flight.verifications) * 100}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-success font-medium">{flight.authorized}</span>
                        <span className="text-text-muted">/</span>
                        <span className="text-danger font-medium">{flight.denied}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <div className="card p-4 bg-warning/5 border-warning/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-warning" />
                <h4 className="text-xs font-bold text-text-primary">System Alerts</h4>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-white border border-warning/20">
                  <p className="text-[11px] font-medium text-text-primary mb-0.5">High Volume Alert</p>
                  <p className="text-[10px] text-text-muted">BA078 experiencing high passenger volume</p>
                </div>
                <div className="p-2 rounded-lg bg-white border border-border">
                  <p className="text-[11px] font-medium text-text-primary mb-0.5">System Update</p>
                  <p className="text-[10px] text-text-muted">Scheduled maintenance at 02:00 GMT</p>
                </div>
              </div>
            </div>

            <div className="card p-4 bg-surface">
              <h4 className="text-xs font-bold text-text-primary mb-2">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Peak Hour</span>
                  <span className="font-semibold text-text-primary">18:00 - 20:00</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Busiest Flight</span>
                  <span className="font-semibold text-text-primary">BA078</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Success Rate</span>
                  <span className="font-semibold text-success">96.0%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Avg Wait Time</span>
                  <span className="font-semibold text-text-primary">1m 45s</span>
                </div>
              </div>
            </div>

            <div className="card p-4 bg-surface">
              <h4 className="text-xs font-bold text-text-primary mb-2">Operations Guidelines</h4>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Monitor real-time verification activity</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Track flight performance metrics</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Respond to system alerts promptly</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Review staff activity logs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
