import React from 'react';
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Play,
  RotateCcw,
  ShieldAlert,
  Workflow as WorkflowIcon,
} from 'lucide-react';
import { AGENTS } from '../data/mockOrchestraData';
import { getAgentLabel } from '../services/orchestrationService';
import type { PageId, Workflow } from '../types/orchestra';
import { AgentIcon } from '../components/AgentIcon';
import { StatusBadge } from '../components/StatusBadge';

interface OverviewPageProps {
  workflows: Workflow[];
  activeWorkflow: Workflow;
  searchQuery: string;
  onSelectWorkflow: (id: string) => void;
  onNavigate: (page: PageId) => void;
  onInspectTask: (workflowId: string, taskId: string) => void;
  onRunWorkflow: (workflowId: string) => void;
  onResetWorkflow: (workflowId: string) => void;
  onOpenComposer: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  workflows,
  activeWorkflow,
  searchQuery,
  onSelectWorkflow,
  onNavigate,
  onInspectTask,
  onRunWorkflow,
  onResetWorkflow,
  onOpenComposer,
}) => {
  const allTasks = workflows.flatMap((w) => w.tasks);
  const completedTasks = allTasks.filter((t) => t.status === 'completed').length;
  const pendingApprovals = allTasks.filter(
    (t) => t.status === 'awaiting_approval'
  ).length;
  const failedOrRetrying = allTasks.filter(
    (t) => t.status === 'failed' || t.status === 'retrying'
  ).length;

  const wfCompleted = activeWorkflow.tasks.filter(
    (t) => t.status === 'completed'
  ).length;
  const wfProgress = Math.round(
    (wfCompleted / Math.max(1, activeWorkflow.tasks.length)) * 100
  );

  const query = searchQuery.trim().toLowerCase();
  const visibleTasks = activeWorkflow.tasks.filter(
    (t) =>
      !query ||
      t.id.toLowerCase().includes(query) ||
      t.title.toLowerCase().includes(query) ||
      getAgentLabel(t.agentId).toLowerCase().includes(query)
  );

  const recentEvents = activeWorkflow.events
    .filter(
      (ev) =>
        !query ||
        ev.message.toLowerCase().includes(query) ||
        getAgentLabel(ev.agentId).toLowerCase().includes(query)
    )
    .slice(0, 5);

  function getAgentSummaryStatus(agentId: string): {
    label: string;
    tone: string;
  } {
    const assigned = activeWorkflow.tasks.filter((t) => t.agentId === agentId);
    if (assigned.some((t) => t.status === 'running' || t.status === 'retrying')) {
      return { label: 'Executing', tone: 'text-sky-300' };
    }
    if (assigned.some((t) => t.status === 'awaiting_approval')) {
      return { label: 'Awaiting Gate', tone: 'text-amber-300' };
    }
    if (assigned.some((t) => t.status === 'failed')) {
      return { label: 'Needs Retry', tone: 'text-rose-300' };
    }
    if (assigned.length > 0 && assigned.every((t) => t.status === 'completed')) {
      return { label: 'Verified', tone: 'text-emerald-300' };
    }
    return { label: 'Ready', tone: 'text-slate-400' };
  }

  function handleCardPointerMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }

  return (
    <div className="space-y-7">
      {/* Command Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-indigo-300">
            Operations Command Centre
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
            Orchestration Overview
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
            Monitor objective decomposition, multi-agent task delegation, verification checks, and human approval gates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenComposer}
            className="rounded-lg border border-[#253352] bg-[#10182C] px-3.5 py-2 text-xs font-medium text-slate-200 transition-all duration-150 hover:-translate-y-0.5 hover:border-indigo-400/60 hover:bg-[#17233E] whitespace-nowrap shrink-0"
          >
            Compose Objective
          </button>
          <button
            type="button"
            disabled={activeWorkflow.status === 'running'}
            onClick={() => onRunWorkflow(activeWorkflow.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-[0_6px_18px_-4px_rgba(99,102,241,0.55)] disabled:opacity-50 disabled:hover:translate-y-0 whitespace-nowrap shrink-0"
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {activeWorkflow.status === 'running'
                ? 'Execution Running…'
                : 'Run Demo Scenario'}
            </span>
          </button>
        </div>
      </div>

      {/* 4-Column KPI Metrics */}
      <section aria-label="Key orchestration metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          onMouseMove={handleCardPointerMove}
          className="spotlight-card rounded-xl border border-[#1E2942] bg-[#0E1528] p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Workflows</span>
            <WorkflowIcon className="h-4 w-4 text-indigo-400" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-slate-100 tabular-nums">
            {workflows.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {workflows.filter((w) => w.status === 'completed').length} completed ·{' '}
            {workflows.filter((w) => w.status !== 'completed').length} active
          </p>
        </div>

        <div
          onMouseMove={handleCardPointerMove}
          className="spotlight-card rounded-xl border border-[#1E2942] bg-[#0E1528] p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tasks Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-slate-100 tabular-nums">
            {completedTasks} / {allTasks.length}
          </p>
          <p className="mt-1 text-xs text-slate-400 tabular-nums">
            {failedOrRetrying > 0
              ? `${failedOrRetrying} requiring recovery`
              : 'All dependencies tracked'}
          </p>
        </div>

        <div
          onMouseMove={handleCardPointerMove}
          className="spotlight-card rounded-xl border border-[#1E2942] bg-[#0E1528] p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Agent Workforce</span>
            <Bot className="h-4 w-4 text-sky-400" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-slate-100 tabular-nums">
            {AGENTS.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Orchestrator + 5 specialised agents
          </p>
        </div>

        <div
          onMouseMove={handleCardPointerMove}
          className="spotlight-card rounded-xl border border-[#1E2942] bg-[#0E1528] p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Approval Gates</span>
            <ShieldAlert className="h-4 w-4 text-amber-400" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-slate-100 tabular-nums">
            {pendingApprovals}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {pendingApprovals > 0
              ? 'Human review required'
              : 'External writes locked'}
          </p>
        </div>
      </section>

      {/* Active Workflow Spotlight */}
      <section className="rounded-xl border border-[#1E2942] bg-[#0E1528]">
        <div className="flex flex-col justify-between gap-4 border-b border-[#1E2942] p-5 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-indigo-300 tabular-nums">
                {activeWorkflow.code}
              </span>
              <span aria-hidden="true">·</span>
              <span>{activeWorkflow.tasks.length} tasks</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">Created {activeWorkflow.createdAt}</span>
            </div>
            <h2 className="mt-1 truncate text-lg font-semibold text-slate-100">
              {activeWorkflow.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <StatusBadge status={activeWorkflow.status} />
            {workflows.length > 1 && (
              <select
                aria-label="Switch active workflow"
                value={activeWorkflow.id}
                onChange={(e) => onSelectWorkflow(e.target.value)}
                className="rounded-lg border border-[#253352] bg-[#10182C] px-2.5 py-1.5 text-xs text-slate-200 transition-colors hover:border-indigo-400/50 focus:border-indigo-400 focus:outline-none"
              >
                {workflows.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} — {w.title}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => onResetWorkflow(activeWorkflow.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#253352] bg-[#10182C] px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-indigo-400/50 hover:bg-[#17233E] whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('Workflows')}
              className="group inline-flex items-center gap-1 rounded-lg border border-indigo-500/40 bg-indigo-950/50 px-3 py-1.5 text-xs font-semibold text-indigo-200 transition-all duration-150 hover:border-indigo-400 hover:bg-indigo-900/60 whitespace-nowrap"
            >
              <span>Inspect Plan &amp; DAG</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Objective & Progress */}
        <div className="space-y-4 p-5">
          <div className="rounded-lg border border-[#1E2942] bg-[#0A101F] px-4 py-3">
            <p className="text-[11px] font-medium text-slate-400">Business Objective</p>
            <p className="mt-1 text-sm text-slate-200">{activeWorkflow.objective}</p>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Execution Progress</span>
              <span className="font-mono font-semibold text-slate-200 tabular-nums">
                {wfCompleted}/{activeWorkflow.tasks.length} ({wfProgress}%)
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#19243E]">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-300 ${
                  activeWorkflow.status === 'running' ? 'progress-sheen' : ''
                }`}
                style={{ width: `${wfProgress}%` }}
              />
            </div>
          </div>

          {/* Task Rows Preview */}
          <div className="divide-y divide-[#1A243C] border-t border-[#1E2942]">
            {visibleTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onInspectTask(activeWorkflow.id, task.id)}
                className="group flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-3 text-left transition-all duration-150 hover:bg-[#131D36]"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-indigo-300 tabular-nums transition-colors group-hover:text-indigo-200 shrink-0">
                    {task.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200 transition-colors group-hover:text-white">
                      {task.title}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {getAgentLabel(task.agentId)} · Expects: {task.expectedOutput}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={task.status} compact />
                  <ChevronRight className="h-4 w-4 text-slate-500 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-indigo-300" aria-hidden="true" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lower Split: Agent Workforce & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Agent Workforce */}
        <section className="rounded-xl border border-[#1E2942] bg-[#0E1528] p-5 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[#1E2942] pb-3.5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Agent Workforce
              </h2>
              <p className="text-xs text-slate-400">
                Bounded responsibilities across six specialised agents
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('Agents')}
              className="group inline-flex items-center gap-1 text-xs font-medium text-indigo-300 hover:text-indigo-200 whitespace-nowrap"
            >
              <span>Directory</span>
              <ChevronRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AGENTS.map((agent) => {
              const runtime = getAgentSummaryStatus(agent.id);
              return (
                <button
                  key={agent.id}
                  type="button"
                  onMouseMove={handleCardPointerMove}
                  onClick={() => onNavigate('Agents')}
                  className="spotlight-card group flex items-start gap-3 rounded-lg border border-[#1E2942] bg-[#0B1120] p-3 text-left"
                >
                  <AgentIcon agentId={agent.id} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-slate-100 group-hover:text-white">
                        {agent.name}
                      </p>
                      <span className={`font-mono text-[11px] shrink-0 ${runtime.tone}`}>
                        {runtime.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">{agent.role}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="rounded-xl border border-[#1E2942] bg-[#0E1528] p-5 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#1E2942] pb-3.5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Recent Activity
              </h2>
              <p className="text-xs text-slate-400">
                Latest execution and verification events
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('Activity')}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-300 hover:text-indigo-200 whitespace-nowrap"
            >
              <span>Full Log</span>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-[#1A243C]">
            {recentEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No matching activity events.
              </div>
            ) : (
              recentEvents.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 py-3">
                  <Clock
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold text-slate-200">
                        {getAgentLabel(ev.agentId)}
                        {ev.taskId ? ` · ${ev.taskId}` : ''}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 tabular-nums shrink-0">
                        {ev.timestamp}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                      {ev.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
