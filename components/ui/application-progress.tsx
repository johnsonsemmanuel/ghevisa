"use client";

import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, AlertCircle, Info } from "lucide-react";

interface ProgressStep {
  id: number;
  title: string;
  description: string;
  estimatedTime: string;
  status: "pending" | "active" | "completed" | "error";
}

interface ApplicationProgressProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function ApplicationProgress({ 
  currentStep, 
  totalSteps, 
  onStepClick, 
  className = "" 
}: ApplicationProgressProps) {
  const [steps] = useState<ProgressStep[]>([
    {
      id: 1,
      title: "Quick Start",
      description: "Select visa type and basic information",
      estimatedTime: "2 minutes",
      status: "pending"
    },
    {
      id: 2,
      title: "Personal Details",
      description: "Your information and travel plans",
      estimatedTime: "5 minutes",
      status: "pending"
    },
    {
      id: 3,
      title: "Documents",
      description: "Upload required documents",
      estimatedTime: "3 minutes",
      status: "pending"
    },
    {
      id: 4,
      title: "Review & Pay",
      description: "Review application and complete payment",
      estimatedTime: "2 minutes",
      status: "pending"
    }
  ]);

  // Update step statuses based on current step
  useEffect(() => {
    const updatedSteps = steps.map((step, index) => {
      if (index + 1 < currentStep) {
        return { ...step, status: "completed" };
      } else if (index + 1 === currentStep) {
        return { ...step, status: "active" };
      }
      return step;
    });
    // Note: In a real implementation, you'd update state properly
  }, [currentStep]);

  const getStatusIcon = (status: ProgressStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="text-green-500" />;
      case "active":
        return <Clock size={16} className="text-blue-500 animate-pulse" />;
      case "error":
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: ProgressStep["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200 text-green-700";
      case "active":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "error":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-500";
    }
  };

  const totalEstimatedTime = "12 minutes";
  const completedSteps = steps.filter(s => s.status === "completed").length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Application Progress</h3>
          <p className="text-sm text-gray-600">
            {completedSteps} of {totalSteps} steps completed
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Estimated time</p>
          <p className="text-lg font-semibold text-gray-900">{totalEstimatedTime}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps - horizontal layout */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            className={`text-left p-3 rounded-lg border-2 transition-all cursor-pointer flex flex-col gap-2
              ${getStatusColor(step.status)}
              ${onStepClick ? "hover:shadow-md" : ""}`}
            onClick={() => onStepClick?.(step.id)}
          >
            <div className="flex items-center gap-2">
              {getStatusIcon(step.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-medium truncate">{step.title}</h4>
                  <span className="text-[10px] sm:text-xs text-gray-500 shrink-0">
                    {step.estimatedTime}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-600 line-clamp-2">{step.description}</p>
          </button>
        ))}
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>Auto-save enabled:</strong> Your application is automatically saved every 30 seconds. 
              You can close this window and resume later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
