import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  XCircle,
} from 'lucide-react';
import { AGENTS } from '../data/mockOrchestraData';
import { getAgentLabel } from '../services/orchestrationService';
import type { AgentId, EventLevel, Workflow } from '../types/orchestra';

interface ActivityPageProps {
  workflows: Workflow[];
  searchQuery: string;
  onInspectTask: (workflowId: string, taskId: string) => void;
}

const LEVELS: Array<{ id: 'all' | EventLevel; label: string }> = [
  { id: 'all', label: 'All Events' },
  { id: 'success', label: 'Success' },
  { id: 'running', label: 'Running' },
  { id: 'warning', label: 'Warnings' },
  { id: 'error', label: 'Failures' },
  { id: 'info', label: 'Info' },
];

export const ActivityPage: React.FC<ActivityPageProps> = ({
  workflows,
  searchQuery,
  onInspectTask,
}) => {
  const [levelFilter, setLevelFilter] = useState<'all' | EventLevel>('all');
  const [agentFilter, setAgentFilter] = useState<'all' | AgentId>('all');
  const [workflowFilter, setWorkflowFilter] = useState<string>('all');

  const combinedEvents = useMemo(() => {
    const list = workflows.flatMap((wf) =>
      wf.events.map((ev) => ({
        ...ev,
        workflowCode: wf.code,
        workflowTitle: wf.title,
      }))
    );
    return list;
  }, [workflows]);

  const query = searchQuery.trim().toLowerCase();

  const filtered = combinedEvents.filter((ev) => {
    if (levelFilter !== 'all' && ev.level !== levelFilter) return false;
    if (agentFilter !== 'all' && ev.agentId !== agentFilter) return false;
    if (workflowFilter !== 'all' && ev.workflowId !== workflowFilter) return false;
    if (query) {
      const hay = `${ev.message} ${ev.detail ?? ''} ${getAgentLabel(ev.agentId)} ${
        ev.taskId ?? ''
      } ${ev.workflowCode}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  function renderEventIcon(level: EventLevel) {
    if (level === 'success') {
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />;
    }
    if (level === 'running') {
      return <Loader2 className="h-4 w-4 animate-spin text-sky-400" aria-hidden="true" />;
    }
    if (level === 'warning') {
      return <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden="true" />;
    }
    if (level === 'error') {
      return <XCircle className="h-4 w-4 text-rose-400" aria-hidden="true" />;
    }
    return <Activity className="h-4 w-4 text-indigo-300" aria-hidden="true" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-indigo-300">Audit & Observability</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-100">
          Execution Activity Log
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Chronological trace of agent planning, retries, failures, verification checks, and human approvals.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#1E2942] bg-[#0E1528] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#1E2942] bg-[#0A101F] p-1">
          {LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setLevelFilter(lvl.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                levelFilter === lvl.id
                  ? 'bg-[#192542] text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Filter by workflow"
            value={workflowFilter}
            onChange={(e) => setWorkflowFilter(e.target.value)}
            className="rounded-lg border border-[#253352] bg-[#0A101F] px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-400 focus:outline-none"
          >
            <option value="all">All Workflows</option>
            {workflows.map((wf) => (
              <option key={wf.id} value={wf.id}>
                {wf.code} — {wf.title}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by agent"
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value as 'all' | AgentId)}
            className="rounded-lg border border-[#253352] bg-[#0A101F] px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-400 focus:outline-none"
          >
            <option value="all">All Agents</option>
            {AGENTS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Log Stream */}
      <section className="rounded-xl border border-[#1E2942] bg-[#0E1528]">
        <div className="flex items-center justify-between border-b border-[#1E2942] px-5 py-3.5">
          <span className="text-xs font-semibold text-slate-200">
            Recorded Execution Events
          </span>
          <span className="font-mono text-xs text-slate-400 tabular-nums">
            {filtered.length} entries
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-300">
              No execution logs match current filters
            </p>
            <button
              type="button"
              onClick={() => {
                setLevelFilter('all');
                setAgentFilter('all');
                setWorkflowFilter('all');
              }}
              className="mt-3 rounded-lg border border-[#253352] bg-[#121B31] px-3 py-1.5 text-xs font-medium text-indigo-200 hover:bg-[#192542]"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#1A243C]">
            {filtered.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-[#121B31] sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{renderEventIcon(ev.level)}</div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-100">
                        {getAgentLabel(ev.agentId)}
                      </span>
                      <span className="text-slate-500" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-mono text-indigo-300">
                        {ev.workflowCode}
                      </span>
                      {ev.taskId && (
                        <>
                          <span className="text-slate-500" aria-hidden="true">
                            ·
                          </span>
                          <button
                            type="button"
                            onClick={() => onInspectTask(ev.workflowId, ev.taskId!)}
                            className="font-mono text-sky-300 hover:underline"
                          >
                            {ev.taskId}
                          </button>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-200">{ev.message}</p>
                    {ev.detail && (
                      <p className="mt-0.5 text-xs text-slate-400">{ev.detail}</p>
                    )}
                  </div>
                </div>

                <time className="font-mono text-xs text-slate-400 tabular-nums shrink-0 sm:pl-4">
                  {ev.timestamp}
                </time>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
