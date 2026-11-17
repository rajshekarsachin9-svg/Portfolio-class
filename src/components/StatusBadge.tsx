import React from 'react';
import {
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Ban,
  XCircle,
} from 'lucide-react';
import type { TaskStatus, WorkflowStatus } from '../types/orchestra';

interface StatusBadgeProps {
  status: TaskStatus | WorkflowStatus | 'planned';
  compact?: boolean;
}

const STATUS_CONFIG: Record<
  TaskStatus | WorkflowStatus,
  {
    label: string;
    classes: string;
    Icon: React.ComponentType<{ className?: string }>;
    spin?: boolean;
  }
> = {
  completed: {
    label: 'Completed',
    classes: 'text-emerald-300 bg-emerald-950/70 border-emerald-800/70',
    Icon: CheckCircle2,
  },
  running: {
    label: 'Running',
    classes: 'text-sky-300 bg-sky-950/70 border-sky-800/70',
    Icon: Loader2,
    spin: true,
  },
  retrying: {
    label: 'Retrying',
    classes: 'text-indigo-300 bg-indigo-950/70 border-indigo-800/70',
    Icon: RefreshCw,
    spin: true,
  },
  awaiting_approval: {
    label: 'Approval Gate',
    classes: 'text-amber-300 bg-amber-950/70 border-amber-800/70',
    Icon: ShieldAlert,
  },
  failed: {
    label: 'Failed',
    classes: 'text-rose-300 bg-rose-950/70 border-rose-800/70',
    Icon: XCircle,
  },
  blocked: {
    label: 'Blocked',
    classes: 'text-rose-200/80 bg-rose-950/40 border-rose-900/60',
    Icon: Ban,
  },
  queued: {
    label: 'Queued',
    classes: 'text-slate-300 bg-slate-800/70 border-slate-700/80',
    Icon: Clock,
  },
  planned: {
    label: 'Planned',
    classes: 'text-indigo-200 bg-indigo-950/60 border-indigo-800/70',
    Icon: Clock,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, compact = false }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.queued;
  const { Icon } = cfg;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium whitespace-nowrap shrink-0 ${
        compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } ${cfg.classes}`}
    >
      <Icon
        className={`h-3.5 w-3.5 shrink-0 ${cfg.spin ? 'animate-spin' : ''}`}
        aria-hidden="true"
      />
      <span>{cfg.label}</span>
    </span>
  );
};
