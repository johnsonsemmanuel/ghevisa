'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users,
  FileCheck
} from 'lucide-react';

export default function EtaManagementPage() {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    expired: 0,
    denied: 0,
  });
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
    loadPerformanceStats();
  }, []);

  const loadStats = async () => {
    // Mock data - replace with actual API call
    setStats({
      total: 15234,
      approved: 14102,
      pending: 432,
      expired: 589,
      denied: 111,
    });
  };

  const loadPerformanceStats = async () => {
    try {
      const response = await fetch('/api/admin/verification-stats/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPerformanceStats(data);
      }
    } catch (error) {
      console.error('Failed to load performance stats:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    // Implement search logic
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ETA Management Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage Electronic Travel Authorizations</p>
        </div>
        <Button onClick={loadStats} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total ETAs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <div className="text-2xl font-bold text-green-600">{stats.approved.toLocaleString()}</div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.approved / stats.total) * 100).toFixed(1)}% approval rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-yellow-500 mr-2" />
              <div className="text-2xl font-bold text-yellow-600">{stats.pending.toLocaleString()}</div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              <div className="text-2xl font-bold text-orange-600">{stats.expired.toLocaleString()}</div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Past validity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <div className="text-2xl font-bold text-red-600">{stats.denied.toLocaleString()}</div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.denied / stats.total) * 100).toFixed(1)}% denial rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Monitoring */}
      {performanceStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Verification Performance
            </CardTitle>
            <CardDescription>Real-time verification system performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Hour Requests</p>
                <p className="text-2xl font-bold">{performanceStats.current_hour?.total_requests || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">
                  {performanceStats.current_hour?.average_response_time || 0}s
                </p>
                <Badge variant={
                  (performanceStats.current_hour?.average_response_time || 0) < 1 ? 'default' : 
                  (performanceStats.current_hour?.average_response_time || 0) < 2 ? 'secondary' : 
                  'destructive'
                }>
                  {performanceStats.performance_status?.status || 'unknown'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {performanceStats.current_hour?.success_rate || 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Slow Requests</p>
                <p className="text-2xl font-bold text-orange-600">
                  {performanceStats.current_hour?.slow_requests || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {performanceStats.current_hour?.slow_request_percentage || 0}% of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Management */}
      <Card>
        <CardHeader>
          <CardTitle>Search ETAs</CardTitle>
          <CardDescription>Search by ETA number, passport number, or applicant name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter ETA number, passport, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList>
          <TabsTrigger value="recent">Recent ETAs</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent ETA Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Recent ETA list will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending ETAs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Pending ETA list will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>ETAs Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Expiring ETA list will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>ETA Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Analytics charts will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
