"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/forms/input";
import { CardSkeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, AlertTriangle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { Application, VisaType } from "@/lib/types";
import { countries } from "@/lib/countries";
import { getMaxDuration, PORTS_OF_ENTRY } from "@/lib/visa-matrix";

export default function EditApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);

  const { data: application, isLoading } = useQuery({
    queryKey: ["applicant-application", id],
    queryFn: () => api.get<{ application: Application }>(`/applicant/applications/${id}`).then((r) => r.data.application),
  });

  const { data: visaTypes } = useQuery({
    queryKey: ["visa-types"],
    queryFn: () => api.get<VisaType[]>("/visa-types").then((r) => r.data),
  });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    other_names: "",
    gender: "",
    date_of_birth: "",
    country_of_birth: "",
    nationality: "",
    passport_number: "",
    passport_issue_date: "",
    passport_expiry: "",
    marital_status: "",
    profession: "",
    email: "",
    phone: "",
    intended_arrival: "",
    duration_days: "",
    port_of_entry: "",
    address_in_ghana: "",
    purpose_of_visit: "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const maxDuration = application?.visa_type ? getMaxDuration(application.visa_type.slug) : 90;

  useEffect(() => {
    if (application) {
      const app = application as unknown as Record<string, string>;
      setFormData({
        first_name: application.first_name || "",
        last_name: application.last_name || "",
        other_names: app.other_names || "",
        gender: app.gender || "",
        date_of_birth: application.date_of_birth || "",
        country_of_birth: app.country_of_birth || "",
        nationality: application.nationality || "",
        passport_number: application.passport_number || "",
        passport_issue_date: app.passport_issue_date || "",
        passport_expiry: app.passport_expiry || "",
        marital_status: app.marital_status || "",
        profession: app.profession || "",
        email: application.email || "",
        phone: application.phone || "",
        intended_arrival: application.intended_arrival || "",
        duration_days: application.duration_days?.toString() || "",
        port_of_entry: app.port_of_entry || "",
        address_in_ghana: application.address_in_ghana || "",
        purpose_of_visit: application.purpose_of_visit || "",
      });
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/applicant/applications/${id}`, {
        ...formData,
        duration_days: formData.duration_days ? parseInt(formData.duration_days) : null,
      });
      toast.success("Application updated successfully");
      router.push(`/dashboard/applicant/applications/${id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to update application");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/applicant/applications/${id}`);
      toast.success("Application deleted successfully");
      router.push("/dashboard/applicant/applications");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to delete application");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell title="Edit Application">
        <CardSkeleton />
      </DashboardShell>
    );
  }

  if (!application) {
    return (
      <DashboardShell title="Application Not Found">
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">This application could not be found.</p>
          <Button variant="secondary" onClick={() => router.push("/dashboard/applicant/applications")}>
            Back to Applications
          </Button>
        </div>
      </DashboardShell>
    );
  }

  // Allow editing draft applications and applications requiring additional information
  if (!["draft", "additional_info_requested"].includes(application.status)) {
    return (
      <DashboardShell title="Cannot Edit Application">
        <div className="card text-center py-12">
          <AlertTriangle size={48} className="mx-auto text-warning mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Application Cannot Be Edited</h2>
          <p className="text-text-secondary mb-6">
            Only draft applications and applications requiring additional information can be edited. This application has already been submitted and is currently under review.
          </p>
          <Button onClick={() => router.push(`/dashboard/applicant/applications/${id}`)}>
            View Application
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Edit Application"
      description={`Reference: ${application.reference_number}`}
      actions={
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<ArrowLeft size={14} />}
          onClick={() => router.push(`/dashboard/applicant/applications/${id}`)}
        >
          Back
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Surname *"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="e.g. Mensah"
              required
            />
            <Input
              label="First Name *"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="e.g. Kwame"
              required
            />
            <Input
              label="Other Names"
              value={formData.other_names}
              onChange={(e) => setFormData({ ...formData, other_names: e.target.value })}
              placeholder="Middle name(s)"
            />
            <Select
              label="Gender *"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
            <Input
              label="Date of Birth *"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              required
            />
            <Select
              label="Country of Birth *"
              value={formData.country_of_birth}
              onChange={(e) => setFormData({ ...formData, country_of_birth: e.target.value })}
              required
            >
              <option value="">Select country</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </Select>
            <Select
              label="Nationality *"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              required
            >
              <option value="">Select nationality</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.nationality}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Passport Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Passport Information</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Passport Number *"
              value={formData.passport_number}
              onChange={(e) => setFormData({ ...formData, passport_number: e.target.value.toUpperCase() })}
              placeholder="e.g. AB1234567"
              required
            />
            <Input
              label="Issue Date *"
              type="date"
              value={formData.passport_issue_date}
              onChange={(e) => setFormData({ ...formData, passport_issue_date: e.target.value })}
              required
            />
            <Input
              label="Expiry Date *"
              type="date"
              value={formData.passport_expiry}
              onChange={(e) => setFormData({ ...formData, passport_expiry: e.target.value })}
              hint="Must be valid 6+ months"
              required
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Additional Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Marital Status *"
              value={formData.marital_status}
              onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
              required
            >
              <option value="">Select status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
              <option value="separated">Separated</option>
            </Select>
            <Input
              label="Profession / Occupation *"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              placeholder="e.g. Software Engineer"
              required
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Contact Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+233 XX XXX XXXX"
            />
          </div>
        </div>

        {/* Travel Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Travel Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Intended Arrival Date *"
              type="date"
              value={formData.intended_arrival}
              onChange={(e) => setFormData({ ...formData, intended_arrival: e.target.value })}
              hint="At least 3 business days from today"
              required
            />
            <Input
              label={`Duration of Stay (days) — Max ${maxDuration}`}
              type="number"
              value={formData.duration_days}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val > maxDuration) {
                  setFormData({ ...formData, duration_days: maxDuration.toString() });
                  toast.error(`Maximum stay for this visa type is ${maxDuration} days`);
                } else {
                  setFormData({ ...formData, duration_days: e.target.value });
                }
              }}
              min={1}
              max={maxDuration}
              hint={`Maximum ${maxDuration} days for ${application?.visa_type?.name || "this visa"}`}
              required
            />
            <Select
              label="Port of Entry *"
              value={formData.port_of_entry}
              onChange={(e) => setFormData({ ...formData, port_of_entry: e.target.value })}
              hint="Where you will enter Ghana"
              required
            >
              <option value="">-- Select Port --</option>
              {PORTS_OF_ENTRY.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
            <div className="sm:col-span-2">
              <Textarea
                label="Address in Ghana"
                value={formData.address_in_ghana}
                onChange={(e) => setFormData({ ...formData, address_in_ghana: e.target.value })}
                rows={2}
                placeholder="Hotel name or residential address"
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                label="Purpose of Visit"
                value={formData.purpose_of_visit}
                onChange={(e) => setFormData({ ...formData, purpose_of_visit: e.target.value })}
                rows={3}
                placeholder="Describe the purpose of your visit"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-between">
          <Button
            type="button"
            variant="danger"
            leftIcon={<Trash2 size={16} />}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Application
          </Button>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(`/dashboard/applicant/applications/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} leftIcon={<Save size={16} />}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                <Trash2 size={24} className="text-danger" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Delete Application</h3>
                <p className="text-sm text-text-secondary">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete this application? All associated data will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={deleting}
                leftIcon={<Trash2 size={16} />}
              >
                Delete Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
