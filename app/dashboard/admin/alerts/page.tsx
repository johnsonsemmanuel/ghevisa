'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  TestTube,
  Check,
  AlertTriangle,
  Mail,
  MessageSquare,
  Phone,
  Zap,
  Settings,
  Clock,
  TrendingUp
} from 'lucide-react';

interface AlertRule {
  id: number;
  name: string;
  description: string;
  metric: string;
  condition: string;
  threshold: number;
  duration_minutes: number;
  severity: 'info' | 'warning' | 'high' | 'critical';
  channels: string[];
  recipients: string[];
  cooldown_minutes: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface AlertLog {
  id: number;
  rule_name: string;
  metric: string;
  triggered_at: string;
  severity: string;
  metric_value: number;
  message: string;
  channels_sent: string[];
  acknowledged_by: number | null;
  acknowledged_at: string | null;
}

interface AlertConfig {
  metrics: Record<string, { name: string; unit: string; description: string }>;
  conditions: Record<string, string>;
  severity_levels: string[];
  channels: string[];
  enabled_channels: string[];
}

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState('rules');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const queryClient = useQueryClient();

  const { data: alertRules, isLoading: rulesLoading } = useQuery({
    queryKey: ['alert-rules'],
    queryFn: async () => {
      const response = await api.get<{ alert_rules: AlertRule[] }>('/admin/alerts');
      return response.data.alert_rules;
    },
  });

  const { data: alertLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['alert-logs'],
    queryFn: async () => {
      const response = await api.get<{ alert_logs: AlertLog[] }>('/admin/alerts/logs');
      return response.data.alert_logs;
    },
  });

  const { data: alertConfig } = useQuery({
    queryKey: ['alert-config'],
    queryFn: async () => {
      const response = await api.get<AlertConfig>('/admin/alerts/config');
      return response.data;
    },
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      await api.put(`/admin/alerts/${id}`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
    },
  });

  const testRuleMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/admin/alerts/${id}/test`);
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
    },
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertLogId: number) => {
      await api.post(`/admin/alerts/logs/${alertLogId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-logs'] });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      warning: 'bg-yellow-100 text-yellow-700',
      info: 'bg-blue-100 text-blue-700',
    };
    return colors[severity as keyof typeof colors] || colors.info;
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail size={14} />;
      case 'sms':
        return <Phone size={14} />;
      case 'slack':
        return <MessageSquare size={14} />;
      case 'teams':
        return <MessageSquare size={14} />;
      case 'pagerduty':
        return <Zap size={14} />;
      default:
        return <Bell size={14} />;
    }
  };

  return (
    <DashboardShell
      title="Alert Management"
      description="Configure alert rules, monitor notifications, and manage system alerts"
      actions={
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={16} />
            New Alert Rule
          </button>
        </div>
      }
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings size={16} />
              Alert Rules ({alertRules?.length || 0})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock size={16} />
              Alert History
            </div>
          </button>
        </nav>
      </div>

      {/* Alert Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {rulesLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading alert rules...</p>
              </div>
            </div>
          ) : (
            <>
              {alertRules?.map((rule) => (
                <div key={rule.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadge(rule.severity)}`}>
                          {rule.severity.toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          rule.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      
                      {rule.description && (
                        <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Condition:</span>
                          <div className="mt-1">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                              {alertConfig?.metrics[rule.metric]?.name || rule.metric} {rule.condition} {rule.threshold}
                              {alertConfig?.metrics[rule.metric]?.unit && ` ${alertConfig.metrics[rule.metric].unit}`}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Channels:</span>
                          <div className="flex items-center gap-1 mt-1">
                            {rule.channels.map((channel) => (
                              <span key={channel} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {getChannelIcon(channel)}
                                {channel}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Settings:</span>
                          <div className="mt-1 text-xs text-gray-600">
                            {rule.duration_minutes > 0 && <div>Duration: {rule.duration_minutes}m</div>}
                            <div>Cooldown: {rule.cooldown_minutes}m</div>
                            <div>Recipients: {rule.recipients.length}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleRuleMutation.mutate({ id: rule.id, enabled: !rule.enabled })}
                        className={`p-2 rounded-lg transition-colors ${
                          rule.enabled
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                      >
                        {rule.enabled ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      
                      <button
                        onClick={() => testRuleMutation.mutate(rule.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Test rule"
                        disabled={testRuleMutation.isPending}
                      >
                        <TestTube size={16} />
                      </button>
                      
                      <button
                        onClick={() => setEditingRule(rule)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Edit rule"
                      >
                        <Edit size={16} />
                      </button>
                      
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this alert rule?')) {
                            deleteRuleMutation.mutate(rule.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-12">
                  <Bell size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Alert Rules</h3>
                  <p className="text-sm text-gray-600 mb-4">Get started by creating your first alert rule</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Create Alert Rule
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Alert Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {logsLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading alert history...</p>
              </div>
            </div>
          ) : (
            <>
              {alertLogs?.map((log) => (
                <div key={log.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{log.rule_name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadge(log.severity)}`}>
                          {log.severity.toUpperCase()}
                        </span>
                        {log.acknowledged_at && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <Check size={12} className="mr-1" />
                            Acknowledged
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{log.message}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Metric Value:</span>
                          <div className="mt-1 font-mono text-gray-900">{log.metric_value}</div>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Channels Sent:</span>
                          <div className="flex items-center gap-1 mt-1">
                            {log.channels_sent.map((channel) => (
                              <span key={channel} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {getChannelIcon(channel)}
                                {channel}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Triggered:</span>
                          <div className="mt-1 text-gray-600">
                            {new Date(log.triggered_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {!log.acknowledged_at && (
                      <div className="ml-4">
                        <button
                          onClick={() => acknowledgeAlertMutation.mutate(log.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          disabled={acknowledgeAlertMutation.isPending}
                        >
                          Acknowledge
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-12">
                  <Clock size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Alert History</h3>
                  <p className="text-sm text-gray-600">Alert notifications will appear here when triggered</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </DashboardShell>
  );
}