"use client";

import { useState, useEffect } from "react";
import { Shield, X, Cookie, Lock, Globe, FileText } from "lucide-react";

interface CookieSettings {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cookies, setCookies] = useState<CookieSettings>({
    necessary: true, // Always required
    analytics: false,
    functional: false,
    marketing: false,
  });

  useEffect(() => {
    setMounted(true);
    // Check if user has already made a choice
    const consent = localStorage.getItem("ghana-evisa-cookie-consent");
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  // Don't render on server side to avoid hydration issues
  if (!mounted) return null;

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true,
    };
    setCookies(allAccepted);
    localStorage.setItem("ghana-evisa-cookie-consent", JSON.stringify(allAccepted));
    localStorage.setItem("ghana-evisa-cookie-settings", JSON.stringify(allAccepted));
    setShowConsent(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false,
    };
    setCookies(onlyNecessary);
    localStorage.setItem("ghana-evisa-cookie-consent", JSON.stringify(onlyNecessary));
    localStorage.setItem("ghana-evisa-cookie-settings", JSON.stringify(onlyNecessary));
    setShowConsent(false);
  };

  const handleSaveSettings = () => {
    localStorage.setItem("ghana-evisa-cookie-consent", JSON.stringify(cookies));
    localStorage.setItem("ghana-evisa-cookie-settings", JSON.stringify(cookies));
    setShowConsent(false);
    setShowSettings(false);
  };

  const handleCookieChange = (type: keyof CookieSettings, value: boolean) => {
    if (type === "necessary") return; // Necessary cookies cannot be disabled
    setCookies(prev => ({ ...prev, [type]: value }));
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Government Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 bg-[#006B3F] rounded-full flex items-center justify-center">
              <Cookie size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield size={16} className="text-[#006B3F]" />
                <span className="text-sm font-bold text-[#006B3F]">Official Government Portal</span>
              </div>
              <p className="text-xs text-gray-500">Ghana Immigration Service</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cookie Consent Notice</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              This is the official electronic visa portal of the Ghana Immigration Service. We use cookies to enhance security, 
              process visa applications, and improve service delivery. Your privacy is protected under Ghana's Data Protection Act, 2012 (Act 843).
            </p>
            
            {!showSettings ? (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="inline-flex items-center gap-2 bg-[#006B3F] hover:bg-[#005A34] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all"
                >
                  Accept All Cookies
                </button>
                <button
                  onClick={handleRejectAll}
                  className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold px-5 py-2.5 rounded-lg transition-all"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center gap-2 text-[#006B3F] hover:text-[#005A34] text-sm font-medium px-5 py-2.5 transition-all"
                >
                  Cookie Settings
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cookie Categories */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Lock size={18} className="text-[#006B3F]" />
                      <h4 className="font-semibold text-gray-900 text-sm">Essential Cookies</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Required for security, authentication, and core functionality. Cannot be disabled.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={cookies.necessary}
                        disabled
                        className="w-4 h-4 text-[#006B3F] rounded"
                      />
                      <span className="text-xs font-medium text-gray-700">Always Active</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Globe size={18} className="text-blue-600" />
                      <h4 className="font-semibold text-gray-900 text-sm">Analytics Cookies</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Help us understand how visitors interact with our services to improve performance.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={cookies.analytics}
                        onChange={(e) => handleCookieChange("analytics", e.target.checked)}
                        className="w-4 h-4 text-[#006B3F] rounded focus:ring-[#006B3F]/20"
                      />
                      <span className="text-xs font-medium text-gray-700">Enable Analytics</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText size={18} className="text-amber-600" />
                      <h4 className="font-semibold text-gray-900 text-sm">Functional Cookies</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Enable enhanced features like language preferences and form auto-completion.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={cookies.functional}
                        onChange={(e) => handleCookieChange("functional", e.target.checked)}
                        className="w-4 h-4 text-[#006B3F] rounded focus:ring-[#006B3F]/20"
                      />
                      <span className="text-xs font-medium text-gray-700">Enable Functional</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Cookie size={18} className="text-red-600" />
                      <h4 className="font-semibold text-gray-900 text-sm">Marketing Cookies</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Used to deliver relevant information about Ghana immigration services.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={cookies.marketing}
                        onChange={(e) => handleCookieChange("marketing", e.target.checked)}
                        className="w-4 h-4 text-[#006B3F] rounded focus:ring-[#006B3F]/20"
                      />
                      <span className="text-xs font-medium text-gray-700">Enable Marketing</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={handleSaveSettings}
                    className="inline-flex items-center gap-2 bg-[#006B3F] hover:bg-[#005A34] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold px-5 py-2.5 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowConsent(false)}
            className="shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Government Notice Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            <strong>Data Protection Notice:</strong> Information collected through cookies is processed in accordance with 
            Ghana's Data Protection Act, 2012 (Act 843) and international privacy standards. 
            For more information, visit our <a href="/privacy-policy" className="text-[#006B3F] hover:text-[#005A34] underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
