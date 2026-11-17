import React, { useMemo, useState } from 'react';
import { ArrowRight, Play, ShieldAlert, Sparkles, X } from 'lucide-react';
import { PRESET_OBJECTIVES } from '../data/mockOrchestraData';
import {
  decomposeObjectiveToWorkflow,
  getAgentLabel,
} from '../services/orchestrationService';
import type { OrchestraSettings, Workflow, WorkspaceId } from '../types/orchestra';
import { StatusBadge } from './StatusBadge';

interface WorkflowComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: WorkspaceId;
  workflowCount: number;
  settings: OrchestraSettings;
  onCreateWorkflow: (workflow: Workflow, autoRun: boolean) => void;
}

export const WorkflowComposerModal: React.FC<WorkflowComposerModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  workflowCount,
  settings,
  onCreateWorkflow,
}) => {
  const [title, setTitle] = useState('Client Meeting Package — Northstar Logistics');
  const [objective, setObjective] = useState(
    'Prepare a complete client meeting package for tomorrow.'
  );

  const previewWorkflow = useMemo(() => {
    if (!objective.trim()) return null;
    return decomposeObjectiveToWorkflow({
      objective,
      customTitle: title,
      workspaceId,
      workflowCount,
      settings,
    });
  }, [objective, title, workspaceId, workflowCount, settings]);

  if (!isOpen) return null;

  function handleApplyPreset(preset: (typeof PRESET_OBJECTIVES)[number]) {
    setTitle(preset.title);
    setObjective(preset.objective);
  }

  function handleSubmit(autoRun: boolean) {
    if (!previewWorkflow) return;
    onCreateWorkflow(previewWorkflow, autoRun);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="composer-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-modal-enter flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#283655] bg-[#0E1528] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#1E2942] px-6 py-4">
          <div>
            <p className="text-xs font-medium text-indigo-300">
              Orchestrator Planning Engine
            </p>
            <h2 id="composer-title" className="mt-0.5 text-lg font-semibold text-slate-100">
              Compose Business Objective
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close workflow composer"
            className="rounded-md p-1.5 text-slate-400 hover:bg-[#19243E] hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Quick Scenario Presets */}
          <div>
            <span className="block text-xs font-medium text-slate-400">
              Quick Scenario Templates
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESET_OBJECTIVES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    objective.trim() === preset.objective
                      ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200'
                      : 'border-[#253352] bg-[#121B31] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="block text-xs font-medium text-slate-300">
                Workflow Title (Optional)
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Client Meeting Package — Tomorrow"
                className="mt-1.5 w-full rounded-lg border border-[#253352] bg-[#080D1A] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="block text-xs font-medium text-slate-300">
                Natural-Language Business Objective
              </span>
              <textarea
                rows={3}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Describe the business outcome you want ORCHESTRA to decompose and verify..."
                className="mt-1.5 w-full resize-y rounded-lg border border-[#253352] bg-[#080D1A] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              />
            </label>
          </div>

          {/* Live Orchestrator Plan Preview */}
          <div className="rounded-lg border border-[#1E2942] bg-[#090F1E]">
            <div className="flex items-center justify-between border-b border-[#1E2942] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" aria-hidden="true" />
                <span className="text-xs font-semibold text-slate-200">
                  Generated Execution Plan Preview
                </span>
              </div>
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                {previewWorkflow ? `${previewWorkflow.tasks.length} Tasks` : '0 Tasks'}
              </span>
            </div>

            {previewWorkflow ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1E2942] text-slate-400">
                      <th className="px-4 py-2 font-medium">ID</th>
                      <th className="px-4 py-2 font-medium">Task</th>
                      <th className="px-4 py-2 font-medium">Assigned Agent</th>
                      <th className="px-4 py-2 font-medium">Deps</th>
                      <th className="px-4 py-2 font-medium">Expected Output</th>
                      <th className="px-4 py-2 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#172036]">
                    {previewWorkflow.tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-[#10182C]">
                        <td className="px-4 py-2.5 font-mono font-medium text-indigo-300 tabular-nums whitespace-nowrap">
                          {task.id}
                        </td>
                        <td className="px-4 py-2.5 text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <span>{task.title}</span>
                            {task.requiresApproval && (
                              <ShieldAlert
                                className="h-3.5 w-3.5 shrink-0 text-amber-400"
                                aria-label="Human approval gate"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap">
                          {getAgentLabel(task.agentId)}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                          {task.dependencies.length > 0
                            ? task.dependencies.join(', ')
                            : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-slate-400">
                          {task.expectedOutput}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <StatusBadge status={task.status} compact />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-xs text-slate-400">
                Enter an objective above to preview task decomposition and agent assignments.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1E2942] bg-[#0B1120] px-6 py-4">
          <p className="text-xs text-slate-400">
            External email and account writes are disabled in Safe Mode.
          </p>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#253352] bg-[#131C33] px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#1A2642] whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!previewWorkflow}
              onClick={() => handleSubmit(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/60 px-4 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-900/60 disabled:opacity-40 whitespace-nowrap shrink-0"
            >
              <span>Create Plan</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={!previewWorkflow}
              onClick={() => handleSubmit(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 whitespace-nowrap shrink-0"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Create & Run</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
