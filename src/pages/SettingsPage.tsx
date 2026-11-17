import React from 'react';
import { Lock, RotateCcw, ShieldCheck } from 'lucide-react';
import type { OrchestraSettings } from '../types/orchestra';

interface SettingsPageProps {
  settings: OrchestraSettings;
  onUpdateSettings: (patch: Partial<OrchestraSettings>) => void;
  onResetAllData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-indigo-300">
            Platform Policy & Execution Guardrails
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-100">
            Workspace Settings
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Configure retry budgets, human approval gates, verification strictness, and sandbox boundaries.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetAllData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#253352] bg-[#10182C] px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-[#17233E] whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Restore Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Governance & Execution Policies */}
        <section className="space-y-4 rounded-xl border border-[#1E2942] bg-[#0E1528] p-5 lg:col-span-7">
          <div className="border-b border-[#1E2942] pb-3">
            <h2 className="text-base font-semibold text-slate-100">
              Orchestration & Reliability Policies
            </h2>
            <p className="text-xs text-slate-400">
              Controls applied to newly decomposed and running workflows
            </p>
          </div>

          {/* Toggle rows */}
          <div className="divide-y divide-[#1A243C]">
            <label className="flex cursor-pointer items-start justify-between gap-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-slate-100">
                  Require Human Approval for Communication Drafts
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Pauses workflow execution at Communication Agent tasks until a human reviews the unsent draft.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireApprovalForComms}
                onChange={(e) =>
                  onUpdateSettings({ requireApprovalForComms: e.target.checked })
                }
                className="mt-1 h-4 w-4 accent-indigo-500"
              />
            </label>

            <label className="flex cursor-pointer items-start justify-between gap-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-slate-100">
                  Require Human Approval for Operational Checklists
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Adds an explicit sign-off gate before Operations Agent checklists advance to Documentation.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireApprovalForOps}
                onChange={(e) =>
                  onUpdateSettings({ requireApprovalForOps: e.target.checked })
                }
                className="mt-1 h-4 w-4 accent-indigo-500"
              />
            </label>

            <label className="flex cursor-pointer items-start justify-between gap-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-slate-100">
                  Simulate Transient API Failure & Auto-Retry in Demo
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Demonstrates fault detection and automatic retry recovery during Research Agent execution.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.simulateTransientFailure}
                onChange={(e) =>
                  onUpdateSettings({ simulateTransientFailure: e.target.checked })
                }
                className="mt-1 h-4 w-4 accent-indigo-500"
              />
            </label>

            <label className="flex cursor-pointer items-start justify-between gap-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-slate-100">
                  Strict Verification Audit
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Requires source traceability and safety gate checks before marking any workflow complete.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.strictVerification}
                onChange={(e) =>
                  onUpdateSettings({ strictVerification: e.target.checked })
                }
                className="mt-1 h-4 w-4 accent-indigo-500"
              />
            </label>

            <div className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-slate-100">
                  Maximum Automatic Retry Attempts
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Retry ceiling per task before marking the node Failed and blocking dependents.
                </p>
              </div>
              <select
                aria-label="Maximum automatic retry attempts"
                value={settings.maxRetries}
                onChange={(e) =>
                  onUpdateSettings({ maxRetries: Number(e.target.value) })
                }
                className="rounded-lg border border-[#253352] bg-[#0A101F] px-3 py-1.5 font-mono text-xs text-slate-100 focus:border-indigo-400 focus:outline-none"
              >
                <option value={1}>1 retry</option>
                <option value={2}>2 retries</option>
                <option value={3}>3 retries</option>
              </select>
            </div>
          </div>
        </section>

        {/* Locked Safe Mode & External Account Guardrails */}
        <section className="space-y-4 rounded-xl border border-[#1E2942] bg-[#0E1528] p-5 lg:col-span-5">
          <div className="border-b border-[#1E2942] pb-3">
            <h2 className="text-base font-semibold text-slate-100">
              External Integrations & Safety Locks
            </h2>
            <p className="text-xs text-slate-400">
              Hardcoded frontend sandbox constraints
            </p>
          </div>

          <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/30 p-3.5">
            <div className="flex items-start gap-2.5">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold text-emerald-200">
                  Safe Sandbox Mode Locked On
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  ORCHESTRA never sends emails, modifies calendars, or writes to external CRMs in this environment. Backend service connectors remain decoupled.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#1A243C] rounded-lg border border-[#1E2942] bg-[#0A101F]">
            {[
              {
                name: 'Outbound Email Dispatch (SMTP / Gmail)',
                status: 'Disabled · Draft Only',
              },
              {
                name: 'Calendar & Meeting Invites',
                status: 'Disabled · Read-Only',
              },
              {
                name: 'CRM / Account Record Writes',
                status: 'Disabled · Read-Only',
              },
              {
                name: 'Backend Orchestration API',
                status: 'Mock Service Adapter',
              },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 px-3.5 py-3"
              >
                <span className="text-xs font-medium text-slate-200">
                  {item.name}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                  <Lock className="h-3 w-3 text-slate-500" aria-hidden="true" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
