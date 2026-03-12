"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { 
  FileText, Download, Calendar, TrendingUp, 
  Users, MapPin, Plane, Clock, BarChart3, Activity
} from "lucide-react";

export interface ReportTemplate {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  frequency: string;
  lastGenerated: string;
}

export interface ReportsConfig {
  role: 'border' | 'airline';
  title: string;
  description: string;
  apiEndpoint: string;
  themeColor: string;
  templates: ReportTemplate[];
  recentReports: Array<{ name: string; date: string; size: string; format: string }>;
  quickStats: {
    reports_generated: number;
    avg_generation_time: string;
    total_downloads: number;
    scheduled_reports: number;
  };
  insights: Array<{ title: string; value: string }>;
}

interface ReportsPageProps {
  config: ReportsConfig;
}

export default function ReportsPage({ config }: ReportsPageProps) {
  const [dateRange, setDateRange] = useState("today");
  const [generating, setGenerating] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleGenerateReport = async (templateId: number, reportTypeName: string) => {
    setGenerating(templateId.toString());
    
    try {
      if (config.apiEndpoint) {
        const reportTypeMap: Record<number, string> = {
          1: 'daily',
          2: 'weekly',
          3: config.role === 'border' ? 'officer_activity' : 'staff_activity',
          4: config.role === 'border' ? 'port_statistics' : 'flight_statistics',
          5: 'denial_analysis',
          6: 'processing_time',
        };

        const response = await api.post(`${config.apiEndpoint}/generate`, {
          report_type: reportTypeMap[templateId],
          date_range: dateRange,
          format: 'pdf',
        });

        toast.success(`${reportTypeName} generated successfully!`);
        
        const report = response.data.report;
        toast.success(`Report ready: ${report.name} (${report.size})`, { duration: 5000 });
      } else {
        // Mock for airline (no backend yet)
        toast.success(`Generating ${reportTypeName}...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success(`${reportTypeName} generated successfully!`);
        toast.success('Report ready for download', { duration: 5000 });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setGenerating(null);
    }
  };

  const handleDownloadReport = async (reportName: string) => {
    toast.success(`Downloading ${reportName}...`);
    setTimeout(() => {
      toast.success('Download complete!');
    }, 1500);
  };

  const handleExportData = async () => {
    setExporting(true);
    
    try {
      if (config.apiEndpoint) {
        const response = await api.post(`${config.apiEndpoint}/export`, {
          date_range: dateRange,
          format: 'csv',
        });

        toast.success(`Exported ${response.data.records} records successfully!`);
        setTimeout(() => {
          toast.success('Export ready for download');
        }, 1000);
      } else {
        // Mock for airline
        toast.success('Exporting data...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success('Export ready for download');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardShell
      title="Reports & Analytics"
      description={config.description}
    >
      <div className="space-y-4">
        {/* Header Banner */}
        <div className={`rounded-xl bg-gradient-to-r from-${config.themeColor}/10 via-${config.themeColor}/5 to-${config.themeColor}/5 border border-${config.themeColor}/20 p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-${config.themeColor}/10 flex items-center justify-center shrink-0`}>
                <FileText size={20} className={`text-${config.themeColor}`} />
              </div>
              <div>
                <h2 className="text-base font-bold text-text-primary mb-0.5">
                  {config.title}
                </h2>
                <p className="text-xs text-text-secondary">
                  Generate, schedule, and download comprehensive analytics reports
                </p>
              </div>
            </div>

            <Button 
              size="sm" 
              className={`!bg-${config.themeColor}`}
              onClick={handleExportData}
              disabled={exporting}
            >
              <Download size={14} className="mr-1.5" />
              {exporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent/6 flex items-center justify-center">
                <FileText size={16} className="text-accent" />
              </div>
            </div>
            <p className="text-xs text-text-muted mb-0.5">Reports Generated</p>
            <p className="text-2xl font-bold text-text-primary">{config.quickStats.reports_generated}</p>
          </div>

          <div className="card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/6 flex items-center justify-center">
                <Clock size={16} className="text-primary" />
              </div>
            </div>
            <p className="text-xs text-text-muted mb-0.5">Avg Generation Time</p>
            <p className="text-2xl font-bold text-text-primary">{config.quickStats.avg_generation_time}</p>
          </div>

          <div className="card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-success/6 flex items-center justify-center">
                <Download size={16} className="text-success" />
              </div>
            </div>
            <p className="text-xs text-text-muted mb-0.5">Total Downloads</p>
            <p className="text-2xl font-bold text-text-primary">{config.quickStats.total_downloads}</p>
          </div>

          <div className="card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-warning/6 flex items-center justify-center">
                <Calendar size={16} className="text-warning" />
              </div>
            </div>
            <p className="text-xs text-text-muted mb-0.5">Scheduled Reports</p>
            <p className="text-2xl font-bold text-text-primary">{config.quickStats.scheduled_reports}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Report Templates */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-accent/6 flex items-center justify-center">
                    <BarChart3 size={14} className="text-accent" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">Report Templates</h3>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg border border-border bg-white text-text-primary"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {config.templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg bg-surface border border-border hover:border-${config.themeColor}/30 transition-colors cursor-pointer group`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center shrink-0 group-hover:border-${config.themeColor}/30 transition-colors`}>
                        {template.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-primary mb-0.5 truncate">
                          {template.name}
                        </p>
                        <p className="text-[10px] text-text-muted line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                          {template.frequency}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {template.lastGenerated}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="!h-6 !text-[10px] !px-2"
                        onClick={() => handleGenerateReport(template.id, template.name)}
                        disabled={generating === template.id.toString()}
                      >
                        {generating === template.id.toString() ? 'Generating...' : 'Generate'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reports */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-lg bg-${config.themeColor}/6 flex items-center justify-center`}>
                  <FileText size={14} className={`text-${config.themeColor}`} />
                </div>
                <h3 className="text-sm font-bold text-text-primary">Recent Reports</h3>
              </div>

              <div className="space-y-2">
                {config.recentReports.map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-surface hover:bg-surface/80 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                      <FileText size={14} className={`text-${config.themeColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate mb-0.5">
                        {report.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted">
                        <span>{report.date}</span>
                        <span>•</span>
                        <span>{report.size}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
                          {report.format}
                        </span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="!h-7 !text-[10px] !px-2 shrink-0"
                      onClick={() => handleDownloadReport(report.name)}
                    >
                      <Download size={12} className="mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <div className={`card p-4 bg-${config.themeColor}/5 border-${config.themeColor}/20`}>
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className={`text-${config.themeColor}`} />
                <h4 className="text-xs font-bold text-text-primary">Report Insights</h4>
              </div>
              <div className="space-y-2">
                {config.insights.map((insight, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white border border-border">
                    <p className="text-[11px] font-medium text-text-primary mb-0.5">{insight.title}</p>
                    <p className="text-[10px] text-text-muted">{insight.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4 bg-surface">
              <h4 className="text-xs font-bold text-text-primary mb-2">Available Formats</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-danger/10 flex items-center justify-center">
                      <FileText size={12} className="text-danger" />
                    </div>
                    <span className="text-text-primary">PDF</span>
                  </div>
                  <span className="text-text-muted">Standard</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-success/10 flex items-center justify-center">
                      <FileText size={12} className="text-success" />
                    </div>
                    <span className="text-text-primary">Excel</span>
                  </div>
                  <span className="text-text-muted">Data Analysis</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                      <FileText size={12} className="text-primary" />
                    </div>
                    <span className="text-text-primary">CSV</span>
                  </div>
                  <span className="text-text-muted">Raw Data</span>
                </div>
              </div>
            </div>

            <div className="card p-4 bg-surface">
              <h4 className="text-xs font-bold text-text-primary mb-2">Report Guidelines</h4>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Generate reports for compliance and auditing</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Schedule automated report generation</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Export data in multiple formats</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>All reports are securely stored</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
