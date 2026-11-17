import React from 'react';
import { ArrowUpRight, Shield } from 'lucide-react';
import { AGENTS } from '../data/mockOrchestraData';
import type { AgentId, Workflow } from '../types/orchestra';
import { AgentIcon } from '../components/AgentIcon';
import { StatusBadge } from '../components/StatusBadge';

interface AgentsPageProps {
  activeWorkflow: Workflow;
  searchQuery: string;
  onInspectTask: (workflowId: string, taskId: string) => void;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({
  activeWorkflow,
  searchQuery,
  onInspectTask,
}) => {
  const query = searchQuery.trim().toLowerCase();

  const filteredAgents = AGENTS.filter(
    (a) =>
      !query ||
      a.name.toLowerCase().includes(query) ||
      a.role.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query)
  );

  function getAgentCurrentTask(agentId: AgentId) {
    return (
      activeWorkflow.tasks.find(
        (t) =>
          t.agentId === agentId &&
          (t.status === 'running' ||
            t.status === 'retrying' ||
            t.status === 'awaiting_approval' ||
            t.status === 'failed')
      ) ?? activeWorkflow.tasks.find((t) => t.agentId === agentId)
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-indigo-300">Workforce Directory</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-100">
          Specialised Agents
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Each agent operates with bounded capabilities, explicit safety constraints, and independent output verification.
        </p>
      </div>

      {filteredAgents.length === 0 ? (
        <div className="rounded-xl border border-[#1E2942] bg-[#0E1528] p-10 text-center">
          <p className="text-sm font-medium text-slate-200">
            No agents match "{searchQuery}"
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Clear the header filter to view all 6 specialised agents.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredAgents.map((agent) => {
            const assignedTask = getAgentCurrentTask(agent.id);

            return (
              <article
                key={agent.id}
                className="flex flex-col justify-between rounded-xl border border-[#1E2942] bg-[#0E1528] p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-[#1E2942] pb-4">
                    <div className="flex items-center gap-3">
                      <AgentIcon agentId={agent.id} size="lg" />
                      <div>
                        <h2 className="text-base font-semibold text-slate-100">
                          {agent.name}
                        </h2>
                        <p className="text-xs text-slate-400">{agent.role}</p>
                      </div>
                    </div>

                    {assignedTask ? (
                      <StatusBadge status={assignedTask.status} compact />
                    ) : (
                      <StatusBadge status="queued" compact />
                    )}
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-slate-300">
                    {agent.description}
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">
                        Core Responsibilities
                      </p>
                      <ul className="mt-2 space-y-1.5 text-xs text-slate-400">
                        {agent.capabilities.map((cap) => (
                          <li key={cap} className="leading-snug">
                            · {cap}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        <Shield className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                        <span>Safety Boundaries</span>
                      </p>
                      <ul className="mt-2 space-y-1.5 text-xs text-slate-400">
                        {agent.guardrails.map((rule) => (
                          <li key={rule} className="leading-snug">
                            · {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {assignedTask && (
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#1E2942] pt-3.5">
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">
                        Active Workflow Assignment ({activeWorkflow.code})
                      </p>
                      <p className="truncate text-xs font-medium text-slate-200">
                        <span className="font-mono text-indigo-300 mr-1.5">
                          {assignedTask.id}
                        </span>
                        {assignedTask.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onInspectTask(activeWorkflow.id, assignedTask.id)
                      }
                      className="inline-flex items-center gap-1 rounded-md border border-[#253352] bg-[#121B31] px-2.5 py-1.5 text-xs font-medium text-indigo-200 hover:bg-[#192542] whitespace-nowrap shrink-0"
                    >
                      <span>Inspect Task</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
