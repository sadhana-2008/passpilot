import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "../ui/Card";

export interface StepCardProps {
  stepNumber: number;
  title: string;
  duration: string;
  summary: string;
  details: string[];
}

export function StepCard({ stepNumber, title, duration, summary, details }: StepCardProps) {
  const [isOpen, setIsOpen] = useState(stepNumber === 1);

  return (
    <Card className="hover:border-accent/40 transition-colors">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center">
            {stepNumber}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-text">{title}</h4>
            <p className="text-[11px] text-text-secondary mt-0.5">{summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-text-muted hidden sm:inline">{duration}</span>
          <button type="button" className="text-text-muted hover:text-text p-1">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-border/60 text-xs text-text-secondary space-y-1.5 pl-10">
          {details.map((d, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>{d}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
