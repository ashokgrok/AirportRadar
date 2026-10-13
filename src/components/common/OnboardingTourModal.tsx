import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Compass, 
  Layers, 
  Database,
  Radar
} from 'lucide-react';

interface OnboardingTourModalProps {
  onClose: () => void;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      title: 'Welcome to AIONOS ZZA Airport Intelligence',
      subtitle: `Your Active Role: ${currentUser.name} · ${currentUser.department}`,
      icon: ShieldCheck,
      content: (
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p>
            AIONOS Demo International (ZZA) handles <strong>32 million passengers annually</strong> across 2 parallel runways, 2 passenger terminals, and 118 stands.
          </p>
          <p>
            You are logged in under the <strong>{currentUser.department}</strong> template with row-level scope <strong>{currentUser.scopeType} {currentUser.scopeValue ? `(${currentUser.scopeValue})` : ''}</strong>. All numbers on screen automatically enforce role-based access control and PII data masking.
          </p>
          <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl border border-cyan-200 dark:border-cyan-800 text-[11px] font-mono text-cyan-800 dark:text-cyan-300">
            Home Dashboard: <strong>{currentUser.homeDashboardId}</strong>
          </div>
        </div>
      )
    },
    {
      title: 'Governed Semantic Layer & Polarity Logic',
      subtitle: '624 Airport KPIs · 94 Tier 1 Metrics · Zero Conflicting Formulas',
      icon: Layers,
      content: (
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p>
            Every metric on screen traces back to a governed mathematical formula in the AIONOS Airport KPI Library. Status chips are color-blind safe and evaluated against effective-dated targets:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <strong>Green (On Target):</strong> Within approved tolerance band
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <strong>Amber (Warning):</strong> Approaching tolerance limit
            </div>
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
              <strong>Red (Breach):</strong> Exceeding tolerance threshold
            </div>
            <div className="p-2.5 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-600 dark:text-slate-400">
              <strong>Monitor Only:</strong> Contextual tracking (no RAG)
            </div>
          </div>
        </div>
      )
    },
    {
      title: '3-Level Deep Drilldowns & Lineage',
      subtitle: 'From High-Level Aggregates to Atomic Records',
      icon: Compass,
      content: (
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p>
            Clicking <strong>"Explain Number"</strong> on any KPI card opens the 3-level audit trail:
          </p>
          <ol className="list-decimal list-inside space-y-1 font-mono text-[11px]">
            <li><strong>Level 1 (Formula & Lineage):</strong> Governing equation, data quality score, and standard reference.</li>
            <li><strong>Level 2 (Dimensional Slices):</strong> Cross-tabulation by terminal, airline carrier, and operational wave.</li>
            <li><strong>Level 3 (Raw Source Facts):</strong> Individual flight turnarounds, bag delivery events, and security queue intervals with RLS applied.</li>
          </ol>
        </div>
      )
    },
    {
      title: 'Simulation Clock & In-Browser PostgreSQL WASM',
      subtitle: '8 Scripted Scenarios & Embedded PGlite Database',
      icon: Database,
      content: (
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p>
            The application runs a genuine <strong>PostgreSQL 16 WebAssembly engine</strong> with IndexedDB persistence inside your browser. No mock data:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            <li>Use the <strong>Scenario Selector</strong> to test Winter Fog, Diwali Peak, BHS Sorter Jam, Monsoon Storm, and Ransomware Containment.</li>
            <li>Run the <strong>Simulation Replay Clock</strong> from $1\times$ to $60\times$ speed to observe Live Ops streaming updates.</li>
            <li>Open the <strong>PG-WASM Console</strong> in the header to execute direct SQL queries against the relational schema!</li>
          </ul>
        </div>
      )
    }
  ];

  const current = steps[currentStep - 1];
  const StepIcon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('aionos_tour_completed', 'true');
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span>AIONOS Tour · Step {currentStep} of {steps.length}</span>
          </div>

          <button
            onClick={() => {
              localStorage.setItem('aionos_tour_completed', 'true');
              onClose();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500 shrink-0">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {current.title}
              </h3>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {current.subtitle}
              </div>
            </div>
          </div>

          <div className="pt-2">
            {current.content}
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-3">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentStep === idx + 1
                    ? 'w-6 bg-cyan-500'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                localStorage.setItem('aionos_tour_completed', 'true');
                onClose();
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-xs"
            >
              <span>{currentStep === steps.length ? 'Get Started' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
