"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { 
  Activity, Users, CheckCircle2, XCircle, Clock, 
  TrendingUp, AlertTriangle, BarChart3
} from "lucide-react";

export interface OperationsConfig {
  role: 'border' | 'airline';
  title: string;
  description: string;
  apiEndpoint: string;
  themeColor: string;
  entityLabel: string; // 'Port' or 'Flight'
  entityIcon: React.ReactNode;
  staffLabel: string; // 'Officers' or 'Staff'
  actionLabel: string; // 'Entry' or 'Boarding'
  statsLabels: {
    total: string;
    authorized: string;
    denied: string;
    activeStaff: string;
    activeEntities: string;
  };
  mockData?: {
    stats: any;
    recentActivity: any[];
    entityActivity: any[];
  };
}

interface OperationsPageProps {
  config: OperationsConfig;
}

export default function OperationsPage({ config }: OperationsPageProps) {
  const [timeRange, setTimeRange] = useState("today");
  const [stats, setStats] = useState({
    total_verifications: 0,
    authorized: 0,
    denied: 0,
    avg_processing_time: "0s",
    active_officers: 0,
    ports_active: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [entityActivity, setEntityActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperationsData();
  }, [timeRange]);

  const fetchOperationsData = async () => {
    setLoading(true);
    try {
      if (config.apiEndpoint) {
        // Fetch from API
        const statsResponse = await api.get(`${config.apiEndpoint}/stats?time_range=${timeRange}`);
        setStats(statsResponse.data);

        const activityResponse = await api.get(`${config.apiEndpoint}/activity?limit=10`);
        setRecentActivity(activityResponse.data);

        const entitiesResponse = await api.get(`${config.apiEndpoint}/${config.role === 'border' ? 'ports' : 'flights'}?time_range=${timeRange}`);
        setEntityActivity(entitiesResponse.data);
      } else if (config.mockData) {
        // Use mock data
        setStats(config.mockData.stats);
        setRecentActivity(config.mockData.recentActivity);
        setEntityActivity(config.mockData.entityActivity);
      }
    } catch (error: any) {
      console.error('Failed to fetch operations data:', error);
      toast.error('Failed to load operations data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOperationsData();
    }, 30000);

    return () => clearInterval(interval);
  }, [timeRange]);

  return (
    <DashboardShell
      title="Operations Dashboard"
      description={config.description}
    >
      <div className="space-y-4">
        {/* Header Banner */}
        <div className={`rounded-xl bg-gradient-to-r from-${config.themeColor}/10 via-${config.themeColor}/5 to-accent/5 border border-${config.themeColor}/20 p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-${config.themeColor}/10 flex items-center justify-center shrink-0`}>
                <Activity size={20} className={`text-${config.themeColor}`} />
              </div>
              <div>
                <h2 className="text-base font-bold text-text-primary mb-0.5">
                  {config.title}
                </h2>
                <p className="text-xs text-text-secondary">
                  Live monitoring of {config.role === 'border' ? 'border control' : 'passenger verification'} activities across all {config.entityLabel.toLowerCase()}s
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
                +{config.role === 'border' ? '12' : '8'}%
              </span>
            </div>
            <p className="text-xs text-text-muted mb-0.5">{config.statsLabels.total}</p>
            <p className="text-2xl font-bold text-text-primary">{stats.total_verifications.toLocaleString()}</p>
          </div>

          <div className="card p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-success/6 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-success" />
              </div>
              <span className="text-[10px] font-medium text-text-muted">
                {stats.total_verifications > 0 ? ((stats.authorized / stats.total_verifications) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
            <p className="text-xs text-text-muted mb-0.5">{config.statsLabels.authorized}</p>
            <p className="text-2xl font-bold text-success">{stats.authorized.toLocaleString()}</p>
          </div>

          <div className="card p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-danger/6 flex items-center justify-center">
                <XCircle size={16} className="text-danger" />
              </div>
              <span className="text-[10px] font-medium text-text-muted">
                {stats.total_verifications > 0 ? ((stats.denied / stats.total_verifications) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
            <p className="text-xs text-text-muted mb-0.5">{config.statsLabels.denied}</p>
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
            <p className="text-xs text-text-muted mb-0.5">{config.statsLabels.activeStaff}</p>
            <p className="text-2xl font-bold text-text-primary">{stats.active_officers}</p>
          </div>

          <div className="card p-3">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg bg-${config.themeColor}/6 flex items-center justify-center`}>
                {config.entityIcon}
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
                {config.role === 'border' ? 'Online' : 'Today'}
              </span>
            </div>
            <p className="text-xs text-text-muted mb-0.5">{config.statsLabels.activeEntities}</p>
            <p className="text-2xl font-bold text-text-primary">{stats.ports_active}</p>
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
                        <p className="text-xs font-semibold text-text-primary">
                          {config.role === 'border' ? activity.officer : activity.staff}
                        </p>
                        <span className="text-[10px] text-text-muted">•</span>
                        <p className="text-[10px] text-text-muted">{activity.time}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {config.entityIcon}
                        <p className="text-[11px] text-text-secondary">
                          {config.role === 'border' ? activity.port : activity.flight}
                        </p>
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

            {/* Entity Activity */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-lg bg-${config.themeColor}/6 flex items-center justify-center`}>
                  {config.entityIcon}
                </div>
                <h3 className="text-sm font-bold text-text-primary">{config.entityLabel} Activity</h3>
              </div>

              <div className="space-y-2">
                {entityActivity.map((entity, index) => (
                  <div
                    key={index}
                    className="p-2.5 rounded-lg bg-surface"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-text-primary">
                          {config.role === 'border' ? entity.port : entity.flight}
                        </p>
                        {config.role === 'airline' && entity.airline && (
                          <>
                            <span className="text-[10px] text-text-muted">•</span>
                            <p className="text-[10px] text-text-muted">{entity.airline}</p>
                          </>
                        )}
                        {entity.active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        )}
                        {config.role === 'airline' && entity.status && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            entity.status === "Boarding" ? "bg-success/10 text-success" :
                            entity.status === "Completed" ? "bg-text-muted/10 text-text-muted" :
                            "bg-warning/10 text-warning"
                          }`}>
                            {entity.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-text-primary">{entity.verifications}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-surface-dark rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success rounded-full"
                          style={{ width: `${(entity.authorized / entity.verifications) * 100}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-success font-medium">{entity.authorized}</span>
                        <span className="text-text-muted">/</span>
                        <span className="text-danger font-medium">{entity.denied}</span>
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
                  <p className="text-[11px] font-medium text-text-primary mb-0.5">High {config.role === 'border' ? 'Traffic' : 'Volume'} Alert</p>
                  <p className="text-[10px] text-text-muted">
                    {config.role === 'border' ? 'KIA Terminal 3 experiencing high volume' : 'BA078 experiencing high passenger volume'}
                  </p>
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
                  <span className="font-semibold text-text-primary">
                    {config.role === 'border' ? '14:00 - 16:00' : '18:00 - 20:00'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Busiest {config.entityLabel}</span>
                  <span className="font-semibold text-text-primary">
                    {config.role === 'border' ? 'KIA Terminal 3' : 'BA078'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Success Rate</span>
                  <span className="font-semibold text-success">
                    {config.role === 'border' ? '95.3%' : '96.0%'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Avg Wait Time</span>
                  <span className="font-semibold text-text-primary">
                    {config.role === 'border' ? '2m 15s' : '1m 45s'}
                  </span>
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
                  <span>Track {config.entityLabel.toLowerCase()} performance metrics</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Respond to system alerts promptly</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Review {config.staffLabel.toLowerCase()} activity logs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
