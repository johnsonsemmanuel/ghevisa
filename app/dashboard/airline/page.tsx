"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms/input";
import { Select } from "@/components/ui/forms/select";
import { QRScanner } from "@/components/ui/forms/qr-scanner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { 
  Plane, Search, CheckCircle2, XCircle, AlertTriangle, 
  User, FileText, Calendar, Globe, MapPin, Clock, QrCode, AlertCircle as AlertCircleIcon
} from "lucide-react";
import { PORTS_OF_ENTRY } from "@/lib/visa-matrix";
import { countries } from "@/lib/countries";

interface VerificationResult {
  status: string;
  authorization_type?: string;
  traveler_name?: string;
  passport_number?: string;
  nationality?: string;
  valid_until?: string;
  entry_type?: string;
  eta_number?: string;
  visa_reference?: string;
  taid?: string;
  message?: string;
  reason?: string;
}

interface PassportValidation {
  valid: boolean;
  code: string;
  message: string;
  months_remaining?: number;
}

export default function AirlinePortalPage() {
  const [passportNumber, setPassportNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [etaNumber, setEtaNumber] = useState("");
  const [visaId, setVisaId] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [boardingAuthorized, setBoardingAuthorized] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [passportValidation, setPassportValidation] = useState<PassportValidation | null>(null);
  const [validatingPassport, setValidatingPassport] = useState(false);

  // Validate passport when passport number changes
  useEffect(() => {
    const validatePassport = async () => {
      if (!passportNumber || passportNumber.length < 6) {
        setPassportValidation(null);
        return;
      }

      setValidatingPassport(true);
      try {
        // Simulate passport expiry date (in real system, this would come from passport scan/database)
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 8); // 8 months from now

        const response = await api.post("/passport/verify-test", {
          passport_number: passportNumber,
          nationality: nationality || "XX",
          passport_expiry: futureDate.toISOString().split('T')[0],
        });

        setPassportValidation(response.data.expiry_check);
      } catch (error) {
        console.error("Passport validation error:", error);
        setPassportValidation(null);
      } finally {
        setValidatingPassport(false);
      }
    };

    const debounce = setTimeout(validatePassport, 500);
    return () => clearTimeout(debounce);
  }, [passportNumber, nationality]);

  const handleVerify = async () => {
    if (!passportNumber || !nationality) {
      toast.error("Passport number and nationality are required");
      return;
    }

    if (passportValidation && !passportValidation.valid) {
      toast.error("Cannot verify passenger with expired passport");
      return;
    }

    setLoading(true);
    setResult(null);
    setBoardingAuthorized(false);

    try {
      const params = new URLSearchParams({
        passport_number: passportNumber,
        nationality: nationality.toUpperCase(),
      });

      if (etaNumber) params.append("eta_number", etaNumber);
      if (visaId) params.append("visa_id", visaId);

      const response = await api.get(`/verify-travel?${params.toString()}`);
      setResult(response.data);
      
      if (response.data.status === "AUTHORIZED") {
        toast.success("Passenger is authorized to board");
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      setResult(errorData || {
        status: "ERROR",
        message: "Verification failed. Please try again.",
      });
      toast.error(errorData?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBoarding = async () => {
    if (!flightNumber) {
      toast.error("Please enter flight number");
      return;
    }

    if (!result || result.status !== "AUTHORIZED") {
      toast.error("Cannot authorize boarding for unauthorized passenger");
      return;
    }

    setConfirming(true);

    try {
      await api.post("/verify-travel/authorize-boarding", {
        passport_number: passportNumber,
        eta_number: etaNumber || undefined,
        visa_id: visaId || undefined,
        flight_number: flightNumber,
      });

      setBoardingAuthorized(true);
      toast.success("Boarding authorized successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to authorize boarding");
    } finally {
      setConfirming(false);
    }
  };

  const handleReset = () => {
    setPassportNumber("");
    setNationality("");
    setEtaNumber("");
    setVisaId("");
    setFlightNumber("");
    setResult(null);
    setBoardingAuthorized(false);
    setPassportValidation(null);
  };

  const handleScanQR = () => {
    setShowScanner(true);
  };

  const handleQRScan = (data: string) => {
    setShowScanner(false);
    
    try {
      if (data.startsWith("{")) {
        const parsed = JSON.parse(data);
        if (parsed.passport_number) setPassportNumber(parsed.passport_number.toUpperCase());
        if (parsed.nationality) setNationality(parsed.nationality.toUpperCase());
        if (parsed.eta_number) setEtaNumber(parsed.eta_number.toUpperCase());
        if (parsed.reference_number) setVisaId(parsed.reference_number.toUpperCase());
        toast.success("QR code scanned successfully");
      } else if (data.includes(":")) {
        const parts = data.split(":");
        if (parts.length >= 4) {
          setPassportNumber(parts[2].toUpperCase());
          setNationality(parts[3].toUpperCase());
          if (parts[0] === "GHEVISA" || parts[0] === "GH-ETA") {
            setEtaNumber(parts[1].toUpperCase());
          }
          toast.success("QR code scanned successfully");
        } else {
          toast.error("Invalid QR code format");
        }
      } else {
        setEtaNumber(data.toUpperCase());
        toast.success("QR code scanned - please enter passport and nationality");
      }
    } catch (error) {
      console.error("QR parse error:", error);
      toast.error("Failed to parse QR code data");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AUTHORIZED":
        return "text-success";
      case "DENIED":
      case "EXPIRED":
      case "ETA_ALREADY_USED":
        return "text-danger";
      case "ETA_REQUIRED":
      case "VISA_REQUIRED":
        return "text-warning";
      default:
        return "text-text-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "AUTHORIZED":
        return <CheckCircle2 size={48} className="text-success" />;
      case "DENIED":
      case "EXPIRED":
      case "ETA_ALREADY_USED":
        return <XCircle size={48} className="text-danger" />;
      case "ETA_REQUIRED":
      case "VISA_REQUIRED":
        return <AlertTriangle size={48} className="text-warning" />;
      default:
        return <AlertTriangle size={48} className="text-text-muted" />;
    }
  };

  return (
    <DashboardShell
      title="Airline Verification Portal"
      description="Verify passenger travel authorization before boarding flights to Ghana"
    >
      <div className="space-y-4">
        {/* Compact Header Banner */}
        <div className="rounded-xl bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-sky-500/5 border border-blue-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Plane size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-text-primary mb-0.5">
                Airline Boarding Verification
              </h2>
              <p className="text-xs text-text-secondary">
                Verify passenger travel authorization before boarding flights to Ghana
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Verification Form */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-accent/6 flex items-center justify-center">
                    <Search size={14} className="text-accent" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">Passenger Verification</h3>
                </div>

                <Button variant="secondary" size="sm" onClick={handleScanQR}>
                  <QrCode size={14} className="mr-1.5" />
                  Scan QR
                </Button>
              </div>

              <div className="space-y-3">
                {/* Required Fields */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">Passport Number *</label>
                    <Input
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                      placeholder="e.g., P1234567"
                      disabled={loading}
                      className="font-mono text-sm h-9"
                    />
                    {validatingPassport && (
                      <p className="text-[11px] text-text-muted mt-1">Validating...</p>
                    )}
                    {passportValidation && (
                      <div className={`flex items-center gap-1 mt-1 text-[11px] ${
                        passportValidation.valid 
                          ? passportValidation.code === 'near_expiry' ? 'text-warning' : 'text-success'
                          : 'text-danger'
                      }`}>
                        {passportValidation.valid ? (
                          passportValidation.code === 'near_expiry' ? (
                            <><AlertCircleIcon size={12} /> {passportValidation.message}</>
                          ) : (
                            <><CheckCircle2 size={12} /> Valid passport</>
                          )
                        ) : (
                          <><XCircle size={12} /> {passportValidation.message}</>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">Nationality *</label>
                    <Select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      disabled={loading}
                      className="text-sm h-9"
                    >
                      <option value="">Select nationality</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Optional Fields */}
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <p className="text-[11px] font-medium text-text-secondary mb-2">Optional (if available)</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text-primary mb-1">ETA Number</label>
                      <Input
                        value={etaNumber}
                        onChange={(e) => setEtaNumber(e.target.value.toUpperCase())}
                        placeholder="GH-ETA-20260310-XXXX"
                        disabled={loading}
                        className="font-mono text-xs h-8"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-primary mb-1">Visa Reference</label>
                      <Input
                        value={visaId}
                        onChange={(e) => setVisaId(e.target.value.toUpperCase())}
                        placeholder="GH-EV-20260310-XXXXXXXX"
                        disabled={loading}
                        className="font-mono text-xs h-8"
                      />
                    </div>
                  </div>
                </div>

                {/* Flight Number */}
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">Flight Number *</label>
                  <Input
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                    placeholder="e.g., BA078"
                    disabled={loading}
                    className="font-mono text-sm h-9"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={handleVerify}
                    disabled={loading || !passportNumber || !nationality || (passportValidation ? !passportValidation.valid : false)}
                    size="sm"
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Clock size={14} className="mr-1.5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Search size={14} className="mr-1.5" />
                        Verify Passenger
                      </>
                    )}
                  </Button>

                  {result && (
                    <Button variant="secondary" size="sm" onClick={handleReset}>
                      New
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Result */}
            {result && (
              <div className="card p-4">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface mb-3">
                    {getStatusIcon(result.status)}
                  </div>
                  <h3 className={`text-xl font-bold mb-1 ${getStatusColor(result.status)}`}>
                    {result.status.replace(/_/g, " ")}
                  </h3>
                  <p className="text-xs text-text-secondary">{result.message}</p>
                </div>

                {result.status === "AUTHORIZED" && !boardingAuthorized && (
                  <div className="space-y-3">
                    {/* Passenger Details */}
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2">
                          <User size={16} className="text-success mt-0.5" />
                          <div>
                            <p className="text-[11px] text-text-muted">Passenger Name</p>
                            <p className="text-xs font-semibold text-text-primary">{result.traveler_name}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <FileText size={16} className="text-success mt-0.5" />
                          <div>
                            <p className="text-[11px] text-text-muted">Passport Number</p>
                            <p className="text-xs font-mono font-semibold text-text-primary">{result.passport_number}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Globe size={16} className="text-success mt-0.5" />
                          <div>
                            <p className="text-[11px] text-text-muted">Nationality</p>
                            <p className="text-xs font-semibold text-text-primary">{result.nationality}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Calendar size={16} className="text-success mt-0.5" />
                          <div>
                            <p className="text-[11px] text-text-muted">Valid Until</p>
                            <p className="text-xs font-semibold text-text-primary">{result.valid_until}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Authorization Details */}
                    <div className="p-3 rounded-lg bg-surface border border-border">
                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[11px] text-text-muted mb-0.5">Authorization Type</p>
                          <p className="font-semibold text-text-primary">{result.authorization_type}</p>
                        </div>

                        <div>
                          <p className="text-[11px] text-text-muted mb-0.5">Entry Type</p>
                          <p className="font-semibold text-text-primary capitalize">{result.entry_type}</p>
                        </div>

                        {result.eta_number && (
                          <div>
                            <p className="text-[11px] text-text-muted mb-0.5">ETA Number</p>
                            <p className="font-mono font-semibold text-text-primary">{result.eta_number}</p>
                          </div>
                        )}

                        {result.visa_reference && (
                          <div>
                            <p className="text-[11px] text-text-muted mb-0.5">Visa Reference</p>
                            <p className="font-mono font-semibold text-text-primary">{result.visa_reference}</p>
                          </div>
                        )}

                        {result.taid && (
                          <div>
                            <p className="text-[11px] text-text-muted mb-0.5">TAID</p>
                            <p className="font-mono font-semibold text-text-primary">{result.taid}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Boarding Authorization */}
                    <div className="p-3 rounded-lg bg-blue-500/5 border-2 border-blue-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Plane size={18} className="text-blue-600" />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-text-primary">Authorize Boarding</p>
                          <p className="text-[11px] text-text-muted">Confirm passenger can board flight {flightNumber || "to Ghana"}</p>
                        </div>
                      </div>

                      <Button
                        onClick={handleConfirmBoarding}
                        disabled={confirming || !flightNumber}
                        size="sm"
                        className="w-full !bg-success hover:!bg-success/90"
                      >
                        {confirming ? (
                          <>
                            <Clock size={14} className="mr-1.5 animate-spin" />
                            Authorizing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} className="mr-1.5" />
                            Authorize Boarding
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {boardingAuthorized && (
                  <div className="p-4 rounded-lg bg-success/10 border border-success/30 text-center">
                    <CheckCircle2 size={28} className="text-success mx-auto mb-2" />
                    <p className="text-base font-bold text-success mb-1">BOARDING AUTHORIZED</p>
                    <p className="text-xs text-text-secondary mb-3">
                      Passenger authorized to board flight {flightNumber}
                    </p>
                    <div className="p-2 rounded-lg bg-white border border-border text-left">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <p className="text-text-muted">Authorization Date</p>
                          <p className="font-semibold text-text-primary">{new Date().toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-text-muted">Authorization Time</p>
                          <p className="font-semibold text-text-primary">{new Date().toLocaleTimeString()}</p>
                        </div>
                        <div>
                          <p className="text-text-muted">Flight Number</p>
                          <p className="font-semibold text-text-primary">{flightNumber}</p>
                        </div>
                        <div>
                          <p className="text-text-muted">Authorization</p>
                          <p className="font-semibold text-text-primary">{result.authorization_type}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {result.status !== "AUTHORIZED" && (
                  <div className="p-3 rounded-lg bg-danger/5 border border-danger/20 text-center">
                    <XCircle size={20} className="text-danger mx-auto mb-1" />
                    <p className="text-xs font-bold text-danger">BOARDING DENIED</p>
                    <p className="text-[11px] text-text-muted mt-1">
                      {result.reason === "ETA_REQUIRED" && "Passenger must obtain an ETA before boarding"}
                      {result.reason === "VISA_REQUIRED" && "Passenger must obtain a visa before boarding"}
                      {result.reason === "AUTHORIZATION_EXPIRED" && "Travel authorization has expired"}
                      {result.reason === "ETA_ALREADY_USED" && "ETA has already been used for entry"}
                      {!result.reason && "Travel authorization not found or invalid"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <div className="card p-4 bg-surface">
              <h4 className="text-xs font-bold text-text-primary mb-2">Airline Verification Guidelines</h4>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Verify all passengers before boarding flights to Ghana</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Scan QR codes from ETA PDFs for faster verification</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Passport validation checks expiry automatically</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Do not board passengers without valid authorization</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span>All verifications are logged for compliance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </DashboardShell>
  );
}
