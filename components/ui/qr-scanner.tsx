"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, AlertCircle, Upload } from "lucide-react";
import { Button } from "./button";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasStartedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            // Ignore scanning errors (they happen continuously while scanning)
          }
        );

        setIsScanning(true);
        setError(null);
      } catch (err: any) {
        console.error("QR Scanner error:", err);
        setError(err.message || "Failed to start camera");
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = () => {
    if (scannerRef.current && isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current = null;
          setIsScanning(false);
        })
        .catch((err) => {
          console.error("Error stopping scanner:", err);
        });
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const scanner = new Html5Qrcode("qr-reader-file");
      const result = await scanner.scanFile(file, true);
      onScan(result);
      handleClose();
    } catch (err: any) {
      console.error("File scan error:", err);
      setError("Failed to scan QR code from image");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-xl">
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Camera size={16} className="text-primary" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">Scan QR Code</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-white transition-colors"
            aria-label="Close"
          >
            <X size={18} className="text-text-muted" />
          </button>
        </div>

        {/* Compact Scanner Area */}
        <div className="p-4">
          {error ? (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-danger/5 border border-danger/20 text-center">
                <AlertCircle size={24} className="text-danger mx-auto mb-2" />
                <p className="text-xs font-semibold text-danger mb-1">Camera Access Error</p>
                <p className="text-[11px] text-text-muted">{error}</p>
              </div>

              {/* Compact File Upload Alternative */}
              <div className="p-3 rounded-lg bg-surface border border-border">
                <p className="text-xs font-medium text-text-primary mb-2 text-center">
                  Upload QR Code Image
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload size={14} className="mr-1.5" />
                  Choose Image
                </Button>
                <div id="qr-reader-file" className="hidden" />
              </div>

              <Button variant="secondary" size="sm" onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          ) : (
            <>
              <div
                id="qr-reader"
                className="rounded-lg overflow-hidden border border-border"
              />
              <div className="mt-3 text-center">
                <p className="text-xs text-text-secondary mb-1">
                  Position QR code within frame
                </p>
                <p className="text-[11px] text-text-muted">
                  Auto-detects and reads instantly
                </p>
              </div>
            </>
          )}
        </div>

        {/* Compact Footer */}
        {!error && (
          <div className="px-4 py-3 border-t border-border bg-surface">
            <Button variant="secondary" size="sm" onClick={handleClose} className="w-full">
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
