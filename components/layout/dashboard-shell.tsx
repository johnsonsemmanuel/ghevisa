"use client";

import React, { useState, useEffect } from "react";
import { Bell, X, Menu, LogOut, LayoutDashboard, FileText, HelpCircle, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardShellProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Mock notifications - in production these would come from an API
const mockNotifications: Notification[] = [
  { id: "1", title: "Application Submitted", message: "Application #GH-2026-001 has been submitted successfully.", time: "2 hours ago", read: false },
  { id: "2", title: "Document Verified", message: "Passport document has been verified.", time: "1 day ago", read: true },
];

export function DashboardShell({
  title,
  description,
  actions,
  children,
}: DashboardShellProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mobile navigation items for applicant
  const mobileNavItems = [
    { label: "Dashboard", href: "/dashboard/applicant", icon: <LayoutDashboard size={18} /> },
    { label: "My Applications", href: "/dashboard/applicant/applications", icon: <FileText size={18} /> },
    { label: "Notifications", href: "/dashboard/applicant/notifications", icon: <Bell size={18} /> },
    { label: "Help & Support", href: "/dashboard/applicant/support", icon: <HelpCircle size={18} /> },
    { label: "Profile", href: "/dashboard/applicant/profile", icon: <User size={18} /> },
  ];

  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (href.endsWith("/applicant") && pathname.startsWith("/dashboard/applicant")) return pathname === href;
    return false;
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Listen for mobile menu open event
  useEffect(() => {
    const handleOpenMobileMenu = () => {
      setMobileMenuOpen(true);
    };

    window.addEventListener('openMobileMenu', handleOpenMobileMenu);
    return () => {
      window.removeEventListener('openMobileMenu', handleOpenMobileMenu);
    };
  }, []);

  return (
    <div className="flex-1 min-h-screen">
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
        <div className="px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo - Mobile Only */}
            <div className="lg:hidden flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/gis-logo.png" alt="Ghana Immigration Service" width={36} height={30} className="drop-shadow-lg" />
              <div>
                <h1 className="text-sm font-bold tracking-tight text-text-primary">GH-eVISA</h1>
                <p className="text-[10px] text-gold/60 hidden sm:block">Electronic Visa Platform</p>
              </div>
            </div>
            
            {/* Page Title - Desktop Only or Mobile with Logo */}
            <div className={title ? "block" : "hidden"}>
              <h1 className="text-xl font-bold text-text-primary lg:block hidden">{title}</h1>
              <h1 className="text-sm font-bold text-text-primary lg:hidden">{title}</h1>
              {description && (
                <p className="text-sm text-text-secondary mt-0.5 lg:block hidden">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg hover:bg-surface transition-colors cursor-pointer"
                aria-label="View notifications"
                aria-expanded={notificationsOpen}
                aria-haspopup="true"
              >
                <Bell size={20} className="text-text-secondary" />
                {unreadCount > 0 && (
                  <span 
                    className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                    aria-label={`${unreadCount} unread notifications`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-border z-50 overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <h3 className="font-semibold text-text-primary">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-accent hover:underline cursor-pointer">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-text-muted text-sm">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-border last:border-0 hover:bg-surface transition-colors ${!notification.read ? "bg-accent/5" : ""}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notification.read ? "bg-accent" : "bg-transparent"}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary">{notification.title}</p>
                                <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{notification.message}</p>
                                <p className="text-[10px] text-text-muted mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Page Actions */}
            {actions}
          </div>
        </div>
      </header>
      <main className="p-6 lg:p-8 pb-20 lg:pb-8">{children}</main>

      {/* Mobile Bottom Sheet Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          
          {/* Bottom Sheet */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[60]" 
               style={{
                 animation: 'slideUp 0.3s ease-out'
               }}>
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Menu Content */}
            <div className="max-h-[70vh] overflow-y-auto">
              {/* User Profile */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center">
                    <User size={20} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{user?.first_name} {user?.last_name}</p>
                    <p className="text-sm text-text-muted">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Navigation Items */}
              <div className="p-4 space-y-2">
                {mobileNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                      isActive(item.href)
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-text-primary hover:bg-surface"
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Sign Out */}
              <div className="p-4 border-t border-border">
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-danger hover:bg-danger/5 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
