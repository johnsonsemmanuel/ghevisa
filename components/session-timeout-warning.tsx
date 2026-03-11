"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Clock, LogOut, RefreshCw } from "lucide-react";
import api from "@/lib/api";

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // SECURITY FIX HIGH-01: 15 minutes (matches backend)
const WARNING_BEFORE_MS = 5 * 60 * 1000; // Show warning 5 minutes before timeout

export function SessionTimeoutWarning() {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  const extendSession = async () => {
    try {
      // SECURITY FIX HIGH-01: Call refresh endpoint to get new token
      await api.post("/auth/refresh");
      resetTimer();
    } catch {
      // If refresh fails, logout
      logout();
    }
  };

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    
    const handleActivity = () => {
      setLastActivity(Date.now());
      if (showWarning) {
        setShowWarning(false);
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, showWarning]);

  // Check for timeout
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      const remaining = SESSION_TIMEOUT_MS - elapsed;

      if (remaining <= 0) {
        // Session expired
        logout();
      } else if (remaining <= WARNING_BEFORE_MS) {
        // Show warning
        setShowWarning(true);
        setTimeLeft(Math.ceil(remaining / 1000));
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, lastActivity, logout]);

  if (!user || !showWarning) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-warning" />
          </div>
          
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Session Expiring Soon
          </h2>
          
          <p className="text-text-secondary mb-4">
            Your session will expire due to inactivity. You will be logged out in:
          </p>

          <div className="text-4xl font-bold text-warning mb-6 font-mono">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              leftIcon={<LogOut size={16} />}
              onClick={logout}
            >
              Log Out Now
            </Button>
            <Button
              leftIcon={<RefreshCw size={16} />}
              onClick={extendSession}
            >
              Stay Logged In
            </Button>
          </div>

          <p className="text-xs text-text-muted mt-4">
            Move your mouse or press any key to stay active
          </p>
        </div>
      </div>
    </div>
  );
}
