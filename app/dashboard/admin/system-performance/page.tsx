'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Zap,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface PerformanceStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  success_rate: number;
  average_response_time: number;
  max_response_time: number;
  min_response_time: number;
  slow_requests: number;
  slow_request_percentage: number;
  by_type: Record<string, { count: number; average_time: number }>;
  failure_reasons: Record<string, number>;
}

interface PerformanceStatus {
  status: 'excellent' | 'good' | 'acceptable' | 'degraded';
  message: string;
  average_response_time: number;
  slow_request_percentage: number;
  meets_sla: boolean;
}

interface DashboardData {
  current_hour: PerformanceStats;
  last_24_hours_summary: {
    total_requests: number;
    hourly_breakdown: Array<{ hour: string } & PerformanceStats>;
  };
  performance_status: PerformanceStatus;
}

export default function SystemPerformancePage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['verification-performance'],
    queryFn: async () => {
      const response = await api.get<DashboardData>('/admin/verification-stats/dashboard');
      return response.data;
    },
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds if enabled
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'acceptable':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'degraded':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle2 size={24} className="text-green-600" />;
      case 'good':
        return <TrendingUp size={24} className="text-blue-600" />;
      case 'acceptable':
        return <Activity size={24} className="text-yellow-600" />;
      case 'degraded':
        return <AlertTriangle size={24} className="text-red-600" />;
      default:
        return <Activity size={24} className="text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <DashboardShell
        title="System Performance"
        description="Real-time verification system monitoring"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading performance data...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const currentHour = data?.current_hour;
  const status = data?.performance_status;
  const last24Hours = data?.last_24_hours_summary;

  return (
    <DashboardShell
      title="System Performance"
      description="Real-time verification system monitoring and SLA compliance"
      actions={
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            Auto-refresh
          </label>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      }
    >
      {/* Performance Status Banner */}
      {status && (
        <div className={`rounded-lg border p-6 mb-6 ${getStatusColor(status.status)}`}>
          <div className="flex items-start gap-4">
            {getStatusIcon(status.status)}
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1 capitalize">{status.status} Performance</h3>
              <p className="text-sm mb-3">{status.message}</p>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="font-semibold">Avg Response:</span> {status.average_response_time.toFixed(3)}s
                </div>
                <div>
                  <span className="font-semibold">Slow Requests:</span> {status.slow_request_percentage.toFixed(2)}%
                </div>
                <div>
                  <span className="font-semibold">SLA Compliance:</span>{' '}
                  {status.meets_sla ? (
                    <span className="text-green-600 font-semibold">✓ Met</span>
                  ) : (
                    <span className="text-red-600 font-semibold">✗ Breached</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Hour Metrics */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Current Hour Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Requests */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Activity size={20} className="text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{currentHour?.total_requests || 0}</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Total Requests</p>
          <p className="text-xs text-gray-500 mt-1">This hour</p>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{currentHour?.success_rate.toFixed(1) || 0}%</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Success Rate</p>
          <p className="text-xs text-gray-500 mt-1">
            {currentHour?.successful_requests || 0} / {currentHour?.total_requests || 0} successful
          </p>
        </div>

        {/* Average Response Time */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Clock size={20} className="text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {currentHour?.average_response_time.toFixed(3) || 0}s
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
          <p className="text-xs text-gray-500 mt-1">
            Target: &lt; 2.0s
          </p>
        </div>

        {/* Slow Requests */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <AlertTriangle size={20} className="text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{currentHour?.slow_requests || 0}</span>
          </div>
          <p className="text-sm font-medium text-gray-600">Slow Requests</p>
          <p className="text-xs text-gray-500 mt-1">
            {currentHour?.slow_request_percentage.toFixed(2) || 0}% (&gt; 2s)
          </p>
        </div>
      </div>

      {/* Verification Types Breakdown */}
      {currentHour?.by_type && Object.keys(currentHour.by_type).length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Verification Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(currentHour.by_type).map(([type, stats]) => (
              <div key={type} className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{type}</h3>
                  <Zap size={18} className="text-gray-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Count:</span>
                    <span className="font-semibold text-gray-900">{stats.count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Time:</span>
                    <span className="font-semibold text-gray-900">{stats.average_time.toFixed(3)}s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">% of Total:</span>
                    <span className="font-semibold text-gray-900">
                      {((stats.count / (currentHour?.total_requests || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 24-Hour Summary */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Last 24 Hours</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Verifications</p>
              <p className="text-3xl font-bold text-gray-900">{last24Hours?.total_requests.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Hourly Average</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round((last24Hours?.total_requests || 0) / 24).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Peak Hour</p>
              <p className="text-3xl font-bold text-gray-900">
                {last24Hours?.hourly_breakdown
                  ? Math.max(...last24Hours.hourly_breakdown.map(h => h.total_requests)).toLocaleString()
                  : 0}
              </p>
            </div>
          </div>

          {/* Hourly Chart */}
          {last24Hours?.hourly_breakdown && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Hourly Request Volume</h3>
              <div className="flex items-end gap-1 h-32">
                {last24Hours.hourly_breakdown.slice(-24).map((hour, index) => {
                  const maxRequests = Math.max(...last24Hours.hourly_breakdown.map(h => h.total_requests));
                  const height = maxRequests > 0 ? (hour.total_requests / maxRequests) * 100 : 0;
                  
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-green-500 rounded-t hover:bg-green-600 transition-colors relative group"
                      style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                      title={`${hour.hour}: ${hour.total_requests} requests`}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {hour.hour.split('-').slice(-1)[0]}:00
                        <br />
                        {hour.total_requests} requests
                        <br />
                        {hour.average_response_time.toFixed(3)}s avg
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>24h ago</span>
                <span>Now</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Response Time Distribution */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Response Time Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingDown size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Minimum</p>
                <p className="text-2xl font-bold text-gray-900">{currentHour?.min_response_time.toFixed(3) || 0}s</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Fastest verification</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Activity size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average</p>
                <p className="text-2xl font-bold text-gray-900">{currentHour?.average_response_time.toFixed(3) || 0}s</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Mean response time</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <TrendingUp size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Maximum</p>
                <p className="text-2xl font-bold text-gray-900">{currentHour?.max_response_time.toFixed(3) || 0}s</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Slowest verification</p>
          </div>
        </div>
      </div>

      {/* Failure Reasons */}
      {currentHour?.failure_reasons && Object.keys(currentHour.failure_reasons).length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Failure Analysis</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-3">
              {Object.entries(currentHour.failure_reasons)
                .sort(([, a], [, b]) => b - a)
                .map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <XCircle size={18} className="text-red-500" />
                      <span className="text-sm text-gray-700">{reason}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">{count}</span>
                      <span className="text-xs text-gray-500">
                        ({((count / (currentHour?.failed_requests || 1)) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* SLA Compliance Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BarChart3 size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 text-sm mb-1">SLA Requirements</h3>
            <p className="text-blue-700 text-sm">
              All verification requests must complete within 2 seconds. Current performance is{' '}
              {status?.meets_sla ? (
                <span className="font-semibold text-green-600">meeting</span>
              ) : (
                <span className="font-semibold text-red-600">not meeting</span>
              )}{' '}
              this requirement with an average response time of {status?.average_response_time.toFixed(3)}s.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
