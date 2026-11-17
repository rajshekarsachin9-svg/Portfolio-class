import React, { useState } from 'react';
import {
  Activity,
  Bot,
  ChevronDown,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Workflow as WorkflowIcon,
  X,
} from 'lucide-react';
import { AGENTS, WORKSPACES } from '../data/mockOrchestraData';
import type { PageId, Workflow, WorkspaceId } from '../types/orchestra';

interface SidebarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  workspaceId: WorkspaceId;
  onSelectWorkspace: (id: WorkspaceId) => void;
  activeWorkflowCount: number;
  activeWorkflow: Workflow | null;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{
  id: PageId;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'Overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'Workflows', label: 'Workflows', Icon: WorkflowIcon },
  { id: 'Agents', label: 'Agents', Icon: Bot },
  { id: 'Activity', label: 'Activity', Icon: Activity },
  { id: 'Settings', label: 'Settings', Icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  workspaceId,
  onSelectWorkspace,
  activeWorkflowCount,
  activeWorkflow,
  mobileOpen,
  onCloseMobile,
}) => {
  const [wsOpen, setWsOpen] = useState(false);
  const currentWs = WORKSPACES[workspaceId];

  function getAgentRuntimeState(agentId: string): string {
    if (!activeWorkflow) return 'Standby';
    const matching = activeWorkflow.tasks.filter((t) => t.agentId === agentId);
    if (matching.some((t) => t.status === 'running' || t.status === 'retrying')) {
      return 'Running';
    }
    if (matching.some((t) => t.status === 'awaiting_approval')) {
      return 'Approval';
    }
    if (matching.some((t) => t.status === 'failed')) {
      return 'Error';
    }
    if (matching.length > 0 && matching.every((t) => t.status === 'completed')) {
      return 'Done';
    }
    return 'Standby';
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#1E2942] bg-[#0B1120] px-4 py-5 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-2 pb-5">
          <button
            type="button"
            onClick={() => {
              onSelectPage('Overview');
              onCloseMobile();
            }}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
              <WorkflowIcon className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="font-display text-base font-extrabold tracking-wide text-slate-100">
              ORCHESTRA
            </span>
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="rounded-md p-1.5 text-slate-400 hover:bg-[#162038] hover:text-slate-100 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className="relative mb-6">
          <button
            type="button"
            onClick={() => setWsOpen((o) => !o)}
            aria-expanded={wsOpen}
            className="flex w-full items-center gap-2.5 rounded-lg border border-[#1E2942] bg-[#10182C] px-3 py-2.5 text-left transition-colors hover:border-[#2E3E62]"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-500/20 font-mono text-xs font-semibold text-indigo-300">
              {currentWs.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-100">
                {currentWs.name}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                {currentWs.subtitle}
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                wsOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {wsOpen && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-lg border border-[#283655] bg-[#111A30] p-1 shadow-xl">
              {Object.values(WORKSPACES).map((ws) => (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => {
                    onSelectWorkspace(ws.id);
                    setWsOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs transition-colors ${
                    ws.id === workspaceId
                      ? 'bg-indigo-600/20 text-indigo-200'
                      : 'text-slate-300 hover:bg-[#19243E]'
                  }`}
                >
                  <span className="font-mono text-[11px] font-semibold">
                    {ws.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{ws.name}</p>
                    <p className="truncate text-[10px] text-slate-400">
                      {ws.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="space-y-1">
          <p className="px-2.5 pb-1.5 text-[11px] font-medium text-slate-500">
            Command Centre
          </p>
          <nav aria-label="Primary navigation" className="space-y-1">
            {NAV_ITEMS.map(({ id, label, Icon }) => {
              const isActive = activePage === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    onSelectPage(id);
                    onCloseMobile();
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#17233E] text-white'
                      : 'text-slate-400 hover:bg-[#121B31] hover:text-slate-200'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-indigo-400' : 'text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                  {id === 'Workflows' && (
                    <span className="ml-auto font-mono text-xs text-slate-400 tabular-nums">
                      {activeWorkflowCount}
                    </span>
                  )}
                  {id === 'Agents' && (
                    <span className="ml-auto font-mono text-xs text-slate-400 tabular-nums">
                      {AGENTS.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Specialised Workforce Summary */}
        <div className="mt-7 flex-1 overflow-y-auto">
          <p className="px-2.5 pb-2 text-[11px] font-medium text-slate-500">
            Agent Workforce
          </p>
          <div className="space-y-1">
            {AGENTS.map((agent) => {
              const state = getAgentRuntimeState(agent.id);
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => {
                    onSelectPage('Agents');
                    onCloseMobile();
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-slate-300 hover:bg-[#121B31]"
                >
                  <span className="truncate">{agent.name.replace(' Agent', '')}</span>
                  <span
                    className={`font-mono text-[10px] shrink-0 ${
                      state === 'Running'
                        ? 'text-sky-300'
                        : state === 'Approval'
                          ? 'text-amber-300'
                          : state === 'Error'
                            ? 'text-rose-300'
                            : state === 'Done'
                              ? 'text-emerald-300'
                              : 'text-slate-500'
                    }`}
                  >
                    {state}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Safe Mode Notice */}
        <div className="mt-4 rounded-lg border border-[#1E2942] bg-[#0F172A] p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Safe Mode Enforced</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
            Simulated execution environment. External emails and account writes are blocked.
          </p>
        </div>
      </aside>
    </>
  );
};
