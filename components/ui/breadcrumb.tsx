"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      <ol className="flex items-center gap-2">
        {/* Home icon */}
        <li>
          <Link 
            href="/" 
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Home"
          >
            <Home size={16} />
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <React.Fragment key={index}>
              <li>
                <ChevronRight size={16} className="text-text-muted" aria-hidden="true" />
              </li>
              <li>
                {isLast || !item.href ? (
                  <span 
                    className="font-medium text-text-primary"
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

// Helper function to generate breadcrumbs from pathname
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Format label (capitalize and replace hyphens)
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Don't link the last item
    breadcrumbs.push({
      label,
      href: index === segments.length - 1 ? undefined : currentPath,
    });
  });

  return breadcrumbs;
}

// Role-specific breadcrumb labels
const roleLabels: Record<string, string> = {
  'applicant': 'My Dashboard',
  'gis': 'GIS Dashboard',
  'mfa': 'MFA Dashboard',
  'admin': 'Admin Dashboard',
  'airline': 'Airline Portal',
  'border': 'Border Control',
};

// Custom breadcrumb labels for common routes
const customLabels: Record<string, string> = {
  'applications': 'Applications',
  'cases': 'Cases',
  'escalations': 'Escalations',
  'users': 'User Management',
  'payments': 'Payments',
  'reports': 'Reports',
  'analytics': 'Analytics',
  'alerts': 'Alerts',
  'system-performance': 'System Performance',
  'eta-management': 'ETA Management',
  'missions': 'Mission Management',
  'visa-types': 'Visa Types',
  'tier-rules': 'Tier Rules',
  'audit-logs': 'Audit Logs',
  'new': 'New Application',
};

export function generateSmartBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Use custom label if available
    let label = customLabels[segment] || roleLabels[segment];
    
    // If no custom label, format the segment
    if (!label) {
      label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // Don't link the last item or 'dashboard' segment
    const shouldLink = index < segments.length - 1 && segment !== 'dashboard';

    breadcrumbs.push({
      label,
      href: shouldLink ? currentPath : undefined,
    });
  });

  return breadcrumbs;
}
