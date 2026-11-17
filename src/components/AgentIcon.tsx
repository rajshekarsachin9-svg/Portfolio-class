import React from 'react';
import {
  Workflow,
  Search,
  FileText,
  ListChecks,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import type { AgentId, AgentTone } from '../types/orchestra';

const ICON_MAP: Record<AgentId, React.ComponentType<{ className?: string }>> = {
  orchestrator: Workflow,
  research: Search,
  documentation: FileText,
  operations: ListChecks,
  communication: Mail,
  verification: ShieldCheck,
};

const TONE_MAP: Record<AgentTone, string> = {
  indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
  blue: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  rose: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
};

export const AGENT_TONE_BY_ID: Record<AgentId, AgentTone> = {
  orchestrator: 'indigo',
  research: 'blue',
  documentation: 'cyan',
  operations: 'amber',
  communication: 'emerald',
  verification: 'rose',
};

interface AgentIconProps {
  agentId: AgentId;
  size?: 'sm' | 'md' | 'lg';
}

export const AgentIcon: React.FC<AgentIconProps> = ({ agentId, size = 'md' }) => {
  const Icon = ICON_MAP[agentId];
  const tone = AGENT_TONE_BY_ID[agentId];

  const sizeClass =
    size === 'sm'
      ? 'h-7 w-7 rounded-md'
      : size === 'lg'
        ? 'h-10 w-10 rounded-lg'
        : 'h-8 w-8 rounded-lg';

  const iconSize =
    size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div
      className={`inline-flex items-center justify-center border shrink-0 ${sizeClass} ${TONE_MAP[tone]}`}
    >
      <Icon className={iconSize} aria-hidden="true" />
    </div>
  );
};
