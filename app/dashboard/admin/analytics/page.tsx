'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle,
  BarChart3,
  Brain,
  Zap,
  Target,
  RefreshCw,
  Clock,
  Users,
  Server
} from 'lucide-react';

interface PredictiveData {
  next_hour_prediction: {
    predicted_volume: number;
    confidence: string;
    historical_average: number;
    trend: string;
    data_points: number;
  };
  next_24_hours_prediction: {
    total_predicted_volume: number;
    peak_hour: {
      hour: string;
      predicted_volume: number;
    };
    low_hour: {
      hour: string;
      predicted_volume: number;
    };
  };
  capacity_requirements: {
    peak_predicted_volume: number;
    utilization_percentage: number;
    recommendation: string;
    current_capacity: number;
  };
  performance_trends: {
    response_time_trend: {
      direction: string;
      strength: string;
    };
    success_rate_trend: {
      direction: string;
      strength: string;
    };
    sla_breach_risk: {
      risk_level: string;
      probability: number;
    };
    recommendations: Array<{
      type: string;
      priority: string;
      message: string;
      action: string;
    }>;
  };
}

interface AnomalyData {
  current_anomalies: {
    anomalies_detected: number;
    anomalies: Array<{
      type: string;
      severity: string;
      message: string;
      z_score: number;
      detected_at: string;
    }>;
  };
  anomaly_history: Array<{
    type: string;
    severity: string;
    message: string;
    detected_at: string;
  }>;
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('predictive');

  const { data: predictiveData, isLoading: predictiveLoading, refetch: refetchPredictive } = useQuery({
    queryKey: ['analytics-predictive'],
    queryFn: async () => {
      const response = await api.get<PredictiveData>('/admin/analytics/predictive');
      return response.data;
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const { data: anomalyData, isLoading: anomalyLoading, refetch: refetchAnomalies } = useQuery({
    queryKey: ['analytics-anomalies'],
    queryFn: async () => {
      const response = await api.get<AnomalyData>('/admin/analytics/anomalies');
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <TrendingUp size={20} className="text-green-600" />;
      case 'decreasing':
        return <TrendingDown size={20} className="text-red-600" />;
      default:
        return <Activity size={20} className="text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-red-600 bg-red-50';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <Server size={16} className="text-blue-600" />;
      case 'reliability':
        return <AlertTriangle size={16} className="text-orange-600" />;
      case 'sla':
        return <Clock size={16} className="text-red-600" />;
      default:
        return <Target size={16} className="text-gray-600" />;
    }
  };

  return (
    <DashboardShell
      title="Advanced Analytics"
      description="Predictive insights, anomaly detection, and performance intelligence"
      actions={
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              refetchPredictive();
              refetchAnomalies();
            }}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      }
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('predictive')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'predictive'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Brain size={16} />
              Predictive Analytics
            </div>
          </button>
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'anomalies'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap size={16} />
              Anomaly Detection
            </div>
          </button>
        </nav>
      </div>

      {/* Predictive Analytics Tab */}
      {activeTab === 'predictive' && (
        <div className="space-y-6">
          {predictiveLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading predictive analytics...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Next Hour Prediction */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-blue-600" />
                  Next Hour Prediction
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {predictiveData?.next_hour_prediction.predicted_volume || 0}
                    </div>
                    <div className="text-sm text-gray-600">Predicted Volume</div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      getConfidenceColor(predictiveData?.next_hour_prediction.confidence || 'low')
                    }`}>
                      {predictiveData?.next_hour_prediction.confidence || 'low'} confidence
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">
                      {predictiveData?.next_hour_prediction.historical_average || 0}
                    </div>
                    <div className="text-sm text-gray-600">Historical Average</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getTrendIcon(predictiveData?.next_hour_prediction.trend || 'stable')}
                      <span className="text-lg font-semibold capitalize">
                        {predictiveData?.next_hour_prediction.trend || 'stable'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">Trend Direction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">
                      {predictiveData?.next_hour_prediction.data_points || 0}
                    </div>
                    <div className="text-sm text-gray-600">Data Points</div>
                  </div>
                </div>
              </div>

              {/* 24-Hour Forecast */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 size={20} className="text-green-600" />
                  24-Hour Forecast
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {predictiveData?.next_24_hours_prediction.total_predicted_volume?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Predicted Volume</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {predictiveData?.next_24_hours_prediction.peak_hour?.predicted_volume || 0}
                    </div>
                    <div className="text-sm text-gray-600">Peak Hour Volume</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {predictiveData?.next_24_hours_prediction.peak_hour?.hour?.split('-').slice(-1)[0]}:00
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {predictiveData?.next_24_hours_prediction.low_hour?.predicted_volume || 0}
                    </div>
                    <div className="text-sm text-gray-600">Low Hour Volume</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {predictiveData?.next_24_hours_prediction.low_hour?.hour?.split('-').slice(-1)[0]}:00
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacity Requirements */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Server size={20} className="text-purple-600" />
                  Capacity Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {predictiveData?.capacity_requirements.peak_predicted_volume || 0}
                    </div>
                    <div className="text-sm text-gray-600">Peak Volume</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">
                      {predictiveData?.capacity_requirements.current_capacity?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-gray-600">Current Capacity</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      (predictiveData?.capacity_requirements.utilization_percentage || 0) > 80 
                        ? 'text-red-600' 
                        : (predictiveData?.capacity_requirements.utilization_percentage || 0) > 60 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                    }`}>
                      {predictiveData?.capacity_requirements.utilization_percentage?.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Utilization</div>
                  </div>
                  <div className="text-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      predictiveData?.capacity_requirements.recommendation === 'scale_up'
                        ? 'text-red-700 bg-red-100'
                        : predictiveData?.capacity_requirements.recommendation === 'scale_down'
                        ? 'text-blue-700 bg-blue-100'
                        : 'text-green-700 bg-green-100'
                    }`}>
                      {predictiveData?.capacity_requirements.recommendation?.replace('_', ' ') || 'maintain'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Recommendation</div>
                  </div>
                </div>
              </div>

              {/* Performance Trends & Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trends */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-indigo-600" />
                    Performance Trends
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(predictiveData?.performance_trends.response_time_trend.direction || 'stable')}
                        <span className="text-sm font-medium capitalize">
                          {predictiveData?.performance_trends.response_time_trend.direction || 'stable'}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({predictiveData?.performance_trends.response_time_trend.strength || 'weak'})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(predictiveData?.performance_trends.success_rate_trend.direction || 'stable')}
                        <span className="text-sm font-medium capitalize">
                          {predictiveData?.performance_trends.success_rate_trend.direction || 'stable'}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({predictiveData?.performance_trends.success_rate_trend.strength || 'weak'})
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">SLA Breach Risk</span>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            predictiveData?.performance_trends.sla_breach_risk.risk_level === 'high'
                              ? 'text-red-700 bg-red-100'
                              : predictiveData?.performance_trends.sla_breach_risk.risk_level === 'medium'
                              ? 'text-yellow-700 bg-yellow-100'
                              : 'text-green-700 bg-green-100'
                          }`}>
                            {predictiveData?.performance_trends.sla_breach_risk.risk_level || 'minimal'}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({Math.round((predictiveData?.performance_trends.sla_breach_risk.probability || 0) * 100)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target size={20} className="text-green-600" />
                    Recommendations
                  </h3>
                  <div className="space-y-3">
                    {predictiveData?.performance_trends.recommendations?.map((rec, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${
                        rec.priority === 'critical'
                          ? 'border-red-200 bg-red-50'
                          : rec.priority === 'high'
                          ? 'border-orange-200 bg-orange-50'
                          : 'border-blue-200 bg-blue-50'
                      }`}>
                        <div className="flex items-start gap-3">
                          {getRecommendationIcon(rec.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium px-2 py-1 rounded ${
                                rec.priority === 'critical'
                                  ? 'bg-red-100 text-red-700'
                                  : rec.priority === 'high'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {rec.priority.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500 capitalize">{rec.type}</span>
                            </div>
                            <p className="text-sm text-gray-700">{rec.message}</p>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center text-gray-500 py-4">
                        <Target size={24} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No recommendations at this time</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Anomaly Detection Tab */}
      {activeTab === 'anomalies' && (
        <div className="space-y-6">
          {anomalyLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading anomaly detection...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Current Anomalies */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-red-600" />
                  Current Anomalies
                  {(anomalyData?.current_anomalies.anomalies_detected || 0) > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {anomalyData?.current_anomalies.anomalies_detected} detected
                    </span>
                  )}
                </h3>
                
                {(anomalyData?.current_anomalies.anomalies?.length || 0) > 0 ? (
                  <div className="space-y-3">
                    {anomalyData?.current_anomalies.anomalies?.map((anomaly, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded ${
                                anomaly.severity === 'critical'
                                  ? 'bg-red-100 text-red-700'
                                  : anomaly.severity === 'high'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {anomaly.severity.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500 capitalize">
                                {anomaly.type.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{anomaly.message}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Z-Score: {anomaly.z_score}</span>
                              <span>Detected: {new Date(anomaly.detected_at).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Zap size={24} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No anomalies detected in the current hour</p>
                    <p className="text-xs text-gray-400 mt-1">System is operating normally</p>
                  </div>
                )}
              </div>

              {/* Anomaly History */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-blue-600" />
                  Recent Anomaly History (24 hours)
                </h3>
                
                {(anomalyData?.anomaly_history?.length || 0) > 0 ? (
                  <div className="space-y-2">
                    {anomalyData?.anomaly_history?.slice(0, 10).map((anomaly, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            anomaly.severity === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : anomaly.severity === 'high'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {anomaly.severity}
                          </span>
                          <span className="text-sm text-gray-700">{anomaly.message}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(anomaly.detected_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Activity size={24} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No anomalies detected in the last 24 hours</p>
                    <p className="text-xs text-gray-400 mt-1">System has been stable</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </DashboardShell>
  );
}