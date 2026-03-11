"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { AlertTriangle, CheckCircle2, User, Calendar } from "lucide-react";
import toast from "react-hot-toast";

interface RiskOverridePanelProps {
  applicationId: string;
  riskAssessment: {
    id: number;
    notes?: string;
    override_flag?: boolean;
    override_note?: string;
    override_by?: {
      first_name: string;
      last_name: string;
    };
    override_timestamp?: string;
  } | null;
}

export function RiskOverridePanel({ applicationId, riskAssessment }: RiskOverridePanelProps) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(riskAssessment?.notes || "");
  const [overrideFlag, setOverrideFlag] = useState(riskAssessment?.override_flag || false);
  const [overrideNote, setOverrideNote] = useState(riskAssessment?.override_note || "");

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: (notesData: { notes: string }) =>
      api.post(`/risk-scoring/applications/${applicationId}/notes`, notesData),
    onSuccess: () => {
      toast.success("Notes updated successfully");
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update notes");
    },
  });

  // Override mutation
  const overrideMutation = useMutation({
    mutationFn: (overrideData: { override_flag: boolean; override_note?: string }) =>
      api.post(`/risk-scoring/applications/${applicationId}/override`, overrideData),
    onSuccess: () => {
      toast.success("Override status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update override status");
    },
  });

  const handleSaveNotes = () => {
    updateNotesMutation.mutate({ notes });
  };

  const handleOverrideToggle = () => {
    if (!overrideFlag && !overrideNote.trim()) {
      toast.error("Override note is required when marking as overridden");
      return;
    }
    overrideMutation.mutate({ 
      override_flag: !overrideFlag, 
      override_note: !overrideFlag ? overrideNote : undefined 
    });
  };

  return (
    <div className="space-y-4">
      {/* Officer Notes */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <User size={16} className="text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">Officer Notes</h3>
        </div>
        <Textarea
          placeholder="Record observations about the risk score (e.g., Financial concern clarified by additional documents submitted)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <Button
            onClick={handleSaveNotes}
            disabled={updateNotesMutation.isPending}
            loading={updateNotesMutation.isPending}
            size="sm"
          >
            Save Notes
          </Button>
        </div>
      </div>

      {/* Override Risk Flag */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">Override Risk Assessment</h3>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={overrideFlag}
              onChange={(e) => setOverrideFlag(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span className="text-sm text-text-primary">
              Mark risk assessment as reviewed/overridden
            </span>
          </label>

          {overrideFlag && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Override Note <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Explain why the risk assessment is being overridden..."
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
                rows={2}
                required
              />
            </div>
          )}

          <Button
            onClick={handleOverrideToggle}
            disabled={overrideMutation.isPending}
            loading={overrideMutation.isPending}
            size="sm"
          >
            {overrideFlag ? "Remove Override" : "Apply Override"}
          </Button>
        </div>
      </div>

      {/* Override Status Display */}
      {riskAssessment?.override_flag && (
        <div className="card border-orange-200 bg-orange-50">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-800">Risk Assessment Overridden</p>
              {riskAssessment.override_note && (
                <p className="text-sm text-orange-700 mt-1">{riskAssessment.override_note}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-orange-600">
                {riskAssessment.override_by && (
                  <span>
                    By: {riskAssessment.override_by.first_name} {riskAssessment.override_by.last_name}
                  </span>
                )}
                {riskAssessment.override_timestamp && (
                  <span>
                    <Calendar size={12} className="inline mr-1" />
                    {new Date(riskAssessment.override_timestamp).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
