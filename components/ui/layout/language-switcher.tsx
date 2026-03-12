"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { getCurrentLocale, setCurrentLocale, locales, localeNames, localeFlags, type Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocaleState] = useState<Locale>('en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentLocaleState(getCurrentLocale());

    const handleLocaleChange = () => {
      setCurrentLocaleState(getCurrentLocale());
    };

    window.addEventListener('localechange', handleLocaleChange);
    return () => window.removeEventListener('localechange', handleLocaleChange);
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    setCurrentLocale(locale);
    setCurrentLocaleState(locale);
    setIsOpen(false);
    window.location.reload(); // Reload to apply translations
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Change language"
      >
        <Globe size={18} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {localeFlags[currentLocale]} {localeNames[currentLocale]}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                  currentLocale === locale ? 'bg-gray-50 font-semibold' : ''
                }`}
              >
                <span className="text-lg">{localeFlags[locale]}</span>
                <span>{localeNames[locale]}</span>
                {currentLocale === locale && (
                  <span className="ml-auto text-green-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
