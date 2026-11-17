import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  GitBranch,
  ListTodo,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { getAgentLabel } from '../services/orchestrationService';
import type { Workflow } from '../types/orchestra';
import { AgentIcon } from '../components/AgentIcon';
import { ArtifactViewer } from '../components/ArtifactViewer';
import { DependencyGraph } from '../components/DependencyGraph';
import { StatusBadge } from '../components/StatusBadge';

interface WorkflowsPageProps {
  workflows: Workflow[];
  activeWorkflow: Workflow;
  selectedTaskId: string;
  searchQuery: string;
  onSelectWorkflow: (id: string) => void;
  onSelectTask: (taskId: string) => void;
  onRunWorkflow: (workflowId: string) => void;
  onSimulateHardFailure: (workflowId: string) => void;
  onRetryTask: (workflowId: string, taskId: string) => void;
  onResetWorkflow: (workflowId: string) => void;
  onApproveTask: (workflowId: string, taskId: string) => void;
  onRejectTask: (workflowId: string, taskId: string) => void;
}

export const WorkflowsPage: React.FC<WorkflowsPageProps> = ({
  workflows,
  activeWorkflow,
  selectedTaskId,
  searchQuery,
  onSelectWorkflow,
  onSelectTask,
  onRunWorkflow,
  onSimulateHardFailure,
  onRetryTask,
  onResetWorkflow,
  onApproveTask,
  onRejectTask,
}) => {
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(
    activeWorkflow.artifacts[0]?.id ?? ''
  );
  const [planViewMode, setPlanViewMode] = useState<'both' | 'dag' | 'table'>('both');

  const selectedTask =
    activeWorkflow.tasks.find((t) => t.id === selectedTaskId) ??
    activeWorkflow.tasks[0];

  const verificationTask = activeWorkflow.tasks.find(
    (t) => t.agentId === 'verification'
  );
  const approvalTask = activeWorkflow.tasks.find((t) => t.requiresApproval);

  const completedCount = activeWorkflow.tasks.filter(
    (t) => t.status === 'completed'
  ).length;
  const progress = Math.round(
    (completedCount / Math.max(1, activeWorkflow.tasks.length)) * 100
  );

  const query = searchQuery.trim().toLowerCase();
  const filteredTasks = activeWorkflow.tasks.filter(
    (t) =>
      !query ||
      t.id.toLowerCase().includes(query) ||
      t.title.toLowerCase().includes(query) ||
      getAgentLabel(t.agentId).toLowerCase().includes(query) ||
      t.expectedOutput.toLowerCase().includes(query)
  );

  const activeArtifactId = activeWorkflow.artifacts.some(
    (a) => a.id === selectedArtifactId
  )
    ? selectedArtifactId
    : activeWorkflow.artifacts[0]?.id ?? '';

  return (
    <div className="space-y-6">
      {/* Page Header & Workflow Switcher */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-medium text-indigo-300">
            Execution & Dependency Control
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-100">
            Workflow Orchestration
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Inspect decomposed tasks, dependency graphs, failure recovery, verification checks, and approval gates.
          </p>
        </div>

        {/* Workflow Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {workflows.map((wf) => (
            <button
              key={wf.id}
              type="button"
              onClick={() => onSelectWorkflow(wf.id)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:-translate-y-0.5 whitespace-nowrap shrink-0 ${
                wf.id === activeWorkflow.id
                  ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200 shadow-[0_4px_14px_-6px_rgba(99,102,241,0.5)]'
                  : 'border-[#1E2942] bg-[#0E1528] text-slate-400 hover:border-indigo-400/50 hover:text-slate-200'
              }`}
            >
              <span className="font-mono mr-1.5">{wf.code}</span>
              <span>{wf.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Workflow Control Bar */}
      <section className="rounded-xl border border-[#1E2942] bg-[#0E1528] p-5">
        <div className="flex flex-col justify-between gap-4 border-b border-[#1E2942] pb-4 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-indigo-300 tabular-nums">
                {activeWorkflow.code}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {completedCount}/{activeWorkflow.tasks.length} tasks completed ({progress}%)
              </span>
              <span aria-hidden="true">·</span>
              <span>Safe Mode Active</span>
            </div>
            <h2 className="mt-1 text-lg font-semibold text-slate-100">
              {activeWorkflow.title}
            </h2>
            <p className="mt-1 text-xs text-slate-300">{activeWorkflow.objective}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <StatusBadge status={activeWorkflow.status} />
            <button
              type="button"
              onClick={() => onResetWorkflow(activeWorkflow.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#253352] bg-[#121B31] px-3 py-2 text-xs font-medium text-slate-300 transition-all duration-150 hover:-translate-y-0.5 hover:border-indigo-400/50 hover:bg-[#192542] whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              disabled={activeWorkflow.status === 'running'}
              onClick={() => onSimulateHardFailure(activeWorkflow.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-800/60 bg-rose-950/40 px-3 py-2 text-xs font-medium text-rose-200 transition-all duration-150 hover:-translate-y-0.5 hover:border-rose-500/70 hover:bg-rose-950/70 disabled:opacity-40 disabled:hover:translate-y-0 whitespace-nowrap"
            >
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Simulate Failure</span>
            </button>
            <button
              type="button"
              disabled={activeWorkflow.status === 'running'}
              onClick={() => onRunWorkflow(activeWorkflow.id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-[0_6px_18px_-4px_rgba(99,102,241,0.55)] disabled:opacity-50 disabled:hover:translate-y-0 whitespace-nowrap"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {activeWorkflow.status === 'running' ? 'Executing…' : 'Run Execution'}
              </span>
            </button>
          </div>
        </div>

        {/* Pending Approval Banner if active */}
        {approvalTask && approvalTask.status === 'awaiting_approval' && (
          <div className="mt-4 flex flex-col justify-between gap-3 rounded-lg border border-amber-700/60 bg-amber-950/30 p-3.5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-2.5">
              <ShieldAlert
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold text-amber-200">
                  Human Approval Gate Paused at {approvalTask.id}
                </p>
                <p className="mt-0.5 text-xs text-amber-100/80">
                  {approvalTask.approvalActionLabel ??
                    'Review communication draft before verification completes. External sending remains disabled.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onRejectTask(activeWorkflow.id, approvalTask.id)}
                className="rounded-md border border-slate-700 bg-[#121B31] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 whitespace-nowrap"
              >
                Request Revision
              </button>
              <button
                type="button"
                onClick={() => onApproveTask(activeWorkflow.id, approvalTask.id)}
                className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 whitespace-nowrap"
              >
                Approve (No Email Sent)
              </button>
            </div>
          </div>
        )}

        {/* View Mode Switcher */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 rounded-lg border border-[#1E2942] bg-[#0A101F] p-1">
            <button
              type="button"
              onClick={() => setPlanViewMode('both')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                planViewMode === 'both'
                  ? 'bg-[#192542] text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Graph + Plan
            </button>
            <button
              type="button"
              onClick={() => setPlanViewMode('dag')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                planViewMode === 'dag'
                  ? 'bg-[#192542] text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Dependency Graph</span>
            </button>
            <button
              type="button"
              onClick={() => setPlanViewMode('table')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                planViewMode === 'table'
                  ? 'bg-[#192542] text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListTodo className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Task Plan</span>
            </button>
          </div>

          <span className="text-xs text-slate-400">
            Click any node or row to inspect task details, retries, and verification checks.
          </span>
        </div>

        {/* Dependency Graph Visualization */}
        {(planViewMode === 'both' || planViewMode === 'dag') && (
          <div className="mt-4">
            <DependencyGraph
              tasks={activeWorkflow.tasks}
              selectedTaskId={selectedTask.id}
              onSelectTask={onSelectTask}
            />
          </div>
        )}
      </section>

      {/* Split Layout: Execution Plan Table & Selected Task Inspector */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {(planViewMode === 'both' || planViewMode === 'table') && (
          <section className="rounded-xl border border-[#1E2942] bg-[#0E1528] xl:col-span-7">
            <div className="flex items-center justify-between border-b border-[#1E2942] px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  Structured Execution Plan
                </h3>
                <p className="text-xs text-slate-400">
                  Task IDs, agent assignments, dependencies, and expected outputs
                </p>
              </div>
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                {filteredTasks.length} tasks
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E2942] text-slate-400">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Task & Expected Output</th>
                    <th className="px-4 py-3 font-medium">Agent</th>
                    <th className="px-4 py-3 font-medium">Deps</th>
                    <th className="px-4 py-3 font-medium text-right">Retries</th>
                    <th className="px-4 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A243C]">
                  {filteredTasks.map((task) => {
                    const isSelected = task.id === selectedTask.id;
                    return (
                      <tr
                        key={task.id}
                        onClick={() => onSelectTask(task.id)}
                        className={`interactive-row cursor-pointer ${
                          isSelected
                            ? 'bg-[#17233E] shadow-[inset_2px_0_0_#818cf8]'
                            : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-mono font-semibold text-indigo-300 tabular-nums whitespace-nowrap align-top">
                          {task.id}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="font-medium text-slate-100">{task.title}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            Output: {task.expectedOutput}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap align-top">
                          {getAgentLabel(task.agentId).replace(' Agent', '')}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-400 tabular-nums whitespace-nowrap align-top">
                          {task.dependencies.length > 0
                            ? task.dependencies.join(', ')
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-300 tabular-nums whitespace-nowrap align-top">
                          {task.retryCount}/{task.maxRetries}
                        </td>
                        <td className="px-4 py-3 text-right align-top">
                          <StatusBadge status={task.status} compact />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Task Detail Inspector */}
        <section
          className={`rounded-xl border border-[#1E2942] bg-[#0E1528] p-5 ${
            planViewMode === 'dag' ? 'xl:col-span-12' : 'xl:col-span-5'
          }`}
        >
          <div className="flex items-start justify-between gap-3 border-b border-[#1E2942] pb-4">
            <div className="flex items-center gap-3">
              <AgentIcon agentId={selectedTask.agentId} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-indigo-300 tabular-nums">
                    {selectedTask.id}
                  </span>
                  <span className="text-xs text-slate-400">
                    {getAgentLabel(selectedTask.agentId)}
                  </span>
                </div>
                <h3 className="mt-0.5 text-base font-semibold text-slate-100">
                  {selectedTask.title}
                </h3>
              </div>
            </div>
            <StatusBadge status={selectedTask.status} />
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-400">Execution Scope</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                {selectedTask.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#1E2942] bg-[#0A101F] p-3.5 sm:grid-cols-3">
              <div>
                <p className="text-[11px] text-slate-400">Dependencies</p>
                <p className="mt-1 font-mono text-xs font-medium text-slate-200 tabular-nums">
                  {selectedTask.dependencies.length > 0
                    ? selectedTask.dependencies.join(', ')
                    : 'None (Root)'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Retry Budget</p>
                <p className="mt-1 font-mono text-xs font-medium text-slate-200 tabular-nums">
                  {selectedTask.retryCount} / {selectedTask.maxRetries} attempts
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Est. Duration</p>
                <p className="mt-1 font-mono text-xs font-medium text-slate-200 tabular-nums">
                  {selectedTask.durationLabel}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-400">Expected Output</p>
              <p className="mt-1 text-xs font-medium text-slate-200">
                {selectedTask.expectedOutput}
              </p>
            </div>

            {/* Failure Diagnostic & Retry Action */}
            {selectedTask.failureReason && (
              <div
                className={`rounded-lg border p-3.5 ${
                  selectedTask.status === 'failed'
                    ? 'border-rose-800/70 bg-rose-950/35'
                    : 'border-indigo-800/60 bg-indigo-950/25'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <XCircle
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        selectedTask.status === 'failed'
                          ? 'text-rose-400'
                          : 'text-indigo-300'
                      }`}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-100">
                        {selectedTask.status === 'failed'
                          ? 'Task Execution Failed'
                          : 'Recovered Failure Telemetry'}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-300">
                        {selectedTask.failureReason}
                      </p>
                    </div>
                  </div>
                  {selectedTask.status === 'failed' && (
                    <button
                      type="button"
                      onClick={() => onRetryTask(activeWorkflow.id, selectedTask.id)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 whitespace-nowrap shrink-0"
                    >
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Retry Task</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Human Approval Gate inside Inspector */}
            {selectedTask.requiresApproval && (
              <div className="rounded-lg border border-amber-700/50 bg-amber-950/25 p-3.5">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-amber-200">
                      Human Approval Gate
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">
                      {selectedTask.approvalActionLabel ??
                        'This task produces an external-facing draft. No emails or external changes are executed automatically.'}
                    </p>
                    {selectedTask.status === 'awaiting_approval' && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onApproveTask(activeWorkflow.id, selectedTask.id)
                          }
                          className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400"
                        >
                          Approve Draft (No Email Sent)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onRejectTask(activeWorkflow.id, selectedTask.id)
                          }
                          className="rounded-md border border-slate-700 bg-[#121B31] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
                        >
                          Request Revision
                        </button>
                      </div>
                    )}
                    {selectedTask.approvalDecision === 'approved' && (
                      <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Approved for review only · External sending disabled
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Verification Checks if selected task is Verification Agent */}
            {selectedTask.verificationChecks && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400">
                  Verification Results
                </p>
                <div className="divide-y divide-[#1E2942] rounded-lg border border-[#1E2942] bg-[#0A101F]">
                  {selectedTask.verificationChecks.map((check) => (
                    <div
                      key={check.id}
                      className="flex items-start justify-between gap-3 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-xs font-medium text-slate-200">
                          {check.label}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {check.detail}
                        </p>
                      </div>
                      <span
                        className={`font-mono text-[11px] font-semibold uppercase shrink-0 ${
                          check.status === 'passed'
                            ? 'text-emerald-300'
                            : check.status === 'failed'
                              ? 'text-rose-300'
                              : check.status === 'warning'
                                ? 'text-amber-300'
                                : 'text-slate-400'
                        }`}
                      >
                        {check.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Jump to Artifact Button */}
            {selectedTask.outputArtifactId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedArtifactId(selectedTask.outputArtifactId!);
                  document
                    .getElementById('artifacts-section')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#253352] bg-[#121B31] px-3 py-2 text-xs font-medium text-indigo-200 hover:bg-[#1A2644]"
              >
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Inspect Generated Artifact</span>
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Generated Artifacts & Verification Summary */}
      <section
        id="artifacts-section"
        className="rounded-xl border border-[#1E2942] bg-[#0E1528] p-5"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Generated Artifacts & Verification Report
            </h3>
            <p className="text-xs text-slate-400">
              Review agent deliverables, draft communications, and audit validations
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <span>{activeWorkflow.artifacts.length} artifacts available</span>
          </span>
        </div>

        <ArtifactViewer
          artifacts={activeWorkflow.artifacts}
          selectedArtifactId={activeArtifactId}
          onSelectArtifact={setSelectedArtifactId}
          verificationChecks={verificationTask?.verificationChecks}
          approvalDecision={approvalTask?.approvalDecision}
          onApproveDraft={
            approvalTask && approvalTask.status === 'awaiting_approval'
              ? () => onApproveTask(activeWorkflow.id, approvalTask.id)
              : undefined
          }
          onRejectDraft={
            approvalTask && approvalTask.status === 'awaiting_approval'
              ? () => onRejectTask(activeWorkflow.id, approvalTask.id)
              : undefined
          }
        />
      </section>
    </div>
  );
};
