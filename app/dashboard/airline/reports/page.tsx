"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { 
  FileText, Download, Calendar, Filter, TrendingUp, 
  Users, Plane, Clock, BarChart3, PieChart, Activity
} from "lucide-react";

export default function AirlineReportsPage() {
  const [reportType, setReportType] = useState("daily");
  const [dateRange, setDateRange] = useState("today");
  const [generating, setGenerating] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Mock data
  const reportTemplates = [
    {
      id: 1,
      name: "Daily Verification Report",
      description: "Comprehensive daily passenger verification activities",
      icon: <Calendar size={16} className="text-primary" />,
      frequency: "Daily",
      lastGenerated: "Today, 08:00",
    },
    {
      id: 2,
      name: "Weekly Performance Report",
      description: "Weekly verification statistics and trends",
      icon: <TrendingUp size={16} className="text-success" />,
      frequency: "Weekly",
      lastGenerated: "Monday, 08:00",
    },
    {
      id: 3,
      name: "Staff Activity Report",
      description: "Individual staff performance metrics",
      icon: <Users size={16} className="text-accent" />,
      frequency: "On-demand",
      lastGenerated: "2 days ago",
    },
    {
      id: 4,
      name: "Flight Statistics Report",
      description: "Flight-by-flight verification analytics",
      icon: <Plane size={16} className="text-blue-600" />,
      frequency: "Weekly",
      lastGenerated: "Monday, 08:00",
    },
    {
      id: 5,
      name: "Denial Analysis Report",
      description: "Analysis of denied boarding and reasons",
      icon: <BarChart3 size={16} className="text-danger" />,
      frequency: "Monthly",
      lastGenerated: "1st of month",
    },
    {
      id: 6,
      name: "Processing Time Report",
      description: "Average processing times and efficiency",
      icon: <Clock size={16} className="text-warning" />,
      frequency: "Weekly",
      lastGenerated: "Monday, 08:00",
    },
  ];

  const recentReports = [
    { name: "Daily Verification - March 11, 2026", date: "Today", size: "1.8 MB", format: "PDF" },
    { name: "Weekly Performance - Week 10", date: "Yesterday", size: "4.2 MB", format: "PDF" },
    { name: "Staff Activity - February 2026", date: "2 days ago", size: "2.9 MB", format: "Excel" },
    { name: "Flight Statistics - Week 9", date: "1 week ago", size: "3.5 MB", format: "PDF" },
  ];

  const quickStats = {
    reports_generated: 124,
    avg_generation_time: "9s",
    total_downloads: 687,
    scheduled_reports: 6,
  };

  const handleGenerateReport = async (templateId: number, reportTypeName: string) => {
    setGenerating(templateId.toString());
    
    try {
      toast.success(`Generating ${reportTypeName}...`);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`${reportTypeName} generated successfully!`);
      toast.success('Report ready for download', { duration: 5000 });
    } catch (error: any) {
      toast.error('Failed to generate report');
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
      toast.success('Exporting data...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Export ready for download');
    } catch (error: any) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardShell
      title="Reports & Analytics"
      description="Generate and download comprehensive airline verification reports"
    >
      <div className="space-y-4">
        {/* Header Banner */}
        <div className="rounded-xl bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-sky-500/5 border border-blue-500/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-text-primary mb-0.5">
                  Airline Verification Reports
                </h2>
                <p className="text-xs text-text-secondary">
                  Generate, schedule, and download comprehensive analytics reports
                </p>
              </div>
            </div>

            <Button 
              size="sm" 
              className="!bg-blue-600"
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
            <p className="text-2xl font-bold text-text-primary">{quickStats.reports_generated}</p>
          </div>

          <div className="card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/6 flex items-center justify-center">
                <Clock size={16} className="text-primary" />
              </div>
            </div>
            <p className="text-xs text-text-muted mb-0.5">Avg Generation Time</p>
            <p className="text-2xl font-bold text-text-primary">{quickStats.avg_generation_time}</p>
          </div>

          <div className="card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-success/6 flex items-center justify-center">
                <Download size={16} className="text-success" />
              </div>
            </div>
            <p className="text-xs text-text-muted mb-0.5">Total Downloads</p>
            <p className="text-2xl font-bold text-text-primary">{quickStats.total_downloads}</p>
          </div>

          <div className="card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-warning/6 flex items-center justify-center">
                <Calendar size={16} className="text-warning" />
              </div>
            </div>
            <p className="text-xs text-text-muted mb-0.5">Scheduled Reports</p>
            <p className="text-2xl font-bold text-text-primary">{quickStats.scheduled_reports}</p>
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
                {reportTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 rounded-lg bg-surface border border-border hover:border-blue-500/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center shrink-0 group-hover:border-blue-500/30 transition-colors">
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
                <div className="w-7 h-7 rounded-lg bg-blue-500/6 flex items-center justify-center">
                  <FileText size={14} className="text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-text-primary">Recent Reports</h3>
              </div>

              <div className="space-y-2">
                {recentReports.map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-surface hover:bg-surface/80 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-blue-600" />
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
            <div className="card p-4 bg-blue-500/5 border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-blue-600" />
                <h4 className="text-xs font-bold text-text-primary">Report Insights</h4>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-white border border-border">
                  <p className="text-[11px] font-medium text-text-primary mb-0.5">Most Downloaded</p>
                  <p className="text-[10px] text-text-muted">Daily Verification Report</p>
                </div>
                <div className="p-2 rounded-lg bg-white border border-border">
                  <p className="text-[11px] font-medium text-text-primary mb-0.5">Trending Up</p>
                  <p className="text-[10px] text-text-muted">Staff Activity Reports +18%</p>
                </div>
                <div className="p-2 rounded-lg bg-white border border-border">
                  <p className="text-[11px] font-medium text-text-primary mb-0.5">Next Scheduled</p>
                  <p className="text-[10px] text-text-muted">Weekly Performance - Tomorrow 08:00</p>
                </div>
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
