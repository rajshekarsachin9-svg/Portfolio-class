import React, { useMemo } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';
import { computeTaskLayers, getAgentLabel } from '../services/orchestrationService';
import type { WorkflowTask } from '../types/orchestra';
import { AgentIcon } from './AgentIcon';
import { StatusBadge } from './StatusBadge';

interface DependencyGraphProps {
  tasks: WorkflowTask[];
  selectedTaskId: string;
  onSelectTask: (taskId: string) => void;
}

const NODE_W = 216;
const NODE_H = 104;
const COL_GAP = 64;
const ROW_GAP = 24;
const PAD_X = 20;
const PAD_Y = 20;

export const DependencyGraph: React.FC<DependencyGraphProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
}) => {
  const layers = useMemo(() => computeTaskLayers(tasks), [tasks]);

  const layout = useMemo(() => {
    const maxRows = Math.max(1, ...layers.map((l) => l.length));
    const totalHeight = Math.max(260, PAD_Y * 2 + maxRows * NODE_H + (maxRows - 1) * ROW_GAP);
    const totalWidth = Math.max(640, PAD_X * 2 + layers.length * NODE_W + (layers.length - 1) * COL_GAP);

    const positions = new Map<string, { x: number; y: number }>();

    layers.forEach((layer, colIdx) => {
      const layerHeight = layer.length * NODE_H + (layer.length - 1) * ROW_GAP;
      const startY = (totalHeight - layerHeight) / 2;
      const x = PAD_X + colIdx * (NODE_W + COL_GAP);

      layer.forEach((task, rowIdx) => {
        const y = startY + rowIdx * (NODE_H + ROW_GAP);
        positions.set(task.id, { x, y });
      });
    });

    const edges: Array<{
      id: string;
      fromId: string;
      toId: string;
      path: string;
      state: 'completed' | 'active' | 'failed' | 'idle';
    }> = [];

    const taskMap = new Map(tasks.map((t) => [t.id, t]));

    tasks.forEach((task) => {
      const toPos = positions.get(task.id);
      if (!toPos) return;

      task.dependencies.forEach((depId) => {
        const fromPos = positions.get(depId);
        const fromTask = taskMap.get(depId);
        if (!fromPos || !fromTask) return;

        const x1 = fromPos.x + NODE_W;
        const y1 = fromPos.y + NODE_H / 2;
        const x2 = toPos.x;
        const y2 = toPos.y + NODE_H / 2;
        const dx = (x2 - x1) * 0.52;

        const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

        let state: 'completed' | 'active' | 'failed' | 'idle' = 'idle';
        if (fromTask.status === 'failed' || task.status === 'blocked' || task.status === 'failed') {
          state = 'failed';
        } else if (
          task.status === 'running' ||
          task.status === 'retrying' ||
          task.status === 'awaiting_approval'
        ) {
          state = 'active';
        } else if (fromTask.status === 'completed' && task.status === 'completed') {
          state = 'completed';
        }

        edges.push({
          id: `${depId}->${task.id}`,
          fromId: depId,
          toId: task.id,
          path,
          state,
        });
      });
    });

    return { totalWidth, totalHeight, positions, edges };
  }, [layers, tasks]);

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[#1E2942] bg-[#0A101F]">
      <div
        className="relative"
        style={{
          width: `${layout.totalWidth}px`,
          height: `${layout.totalHeight}px`,
          backgroundImage:
            'radial-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          width={layout.totalWidth}
          height={layout.totalHeight}
          aria-hidden="true"
        >
          <defs>
            <marker
              id="arrow-idle"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 z" fill="#334155" />
            </marker>
            <marker
              id="arrow-completed"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 z" fill="#34d399" />
            </marker>
            <marker
              id="arrow-active"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 z" fill="#60a5fa" />
            </marker>
            <marker
              id="arrow-failed"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 z" fill="#f87171" />
            </marker>
          </defs>

          {layout.edges.map((edge) => {
            const isHighlighted =
              edge.fromId === selectedTaskId || edge.toId === selectedTaskId;
            const stroke =
              edge.state === 'failed'
                ? '#f87171'
                : edge.state === 'active'
                  ? '#60a5fa'
                  : edge.state === 'completed'
                    ? '#34d399'
                    : isHighlighted
                      ? '#818cf8'
                      : '#334155';

            const markerEnd =
              edge.state === 'failed'
                ? 'url(#arrow-failed)'
                : edge.state === 'active'
                  ? 'url(#arrow-active)'
                  : edge.state === 'completed'
                    ? 'url(#arrow-completed)'
                    : 'url(#arrow-idle)';

            return (
              <path
                key={edge.id}
                d={edge.path}
                fill="none"
                stroke={stroke}
                strokeWidth={isHighlighted ? 2.2 : 1.6}
                strokeDasharray={edge.state === 'active' ? '5 4' : undefined}
                opacity={isHighlighted || edge.state !== 'idle' ? 0.95 : 0.65}
                markerEnd={markerEnd}
              />
            );
          })}
        </svg>

        {tasks.map((task) => {
          const pos = layout.positions.get(task.id);
          if (!pos) return null;
          const isSelected = task.id === selectedTaskId;

          const borderClass = isSelected
            ? 'border-indigo-400 ring-1 ring-indigo-400/50 bg-[#15203B]'
            : task.status === 'failed' || task.status === 'blocked'
              ? 'border-rose-700/70 bg-[#14182B] hover:border-rose-500/80'
              : task.status === 'awaiting_approval'
                ? 'border-amber-600/70 bg-[#161E33] hover:border-amber-500'
                : task.status === 'running' || task.status === 'retrying'
                  ? 'border-sky-500/70 bg-[#131F38] hover:border-sky-400'
                  : 'border-[#253352] bg-[#10182C] hover:border-slate-500';

          return (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelectTask(task.id)}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${NODE_W}px`,
                height: `${NODE_H}px`,
              }}
              className={`absolute flex flex-col justify-between rounded-lg border p-3 text-left transition-colors duration-150 ${borderClass}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] font-semibold text-indigo-300 tabular-nums">
                    {task.id}
                  </span>
                  {task.requiresApproval && (
                    <ShieldAlert
                      className="h-3.5 w-3.5 text-amber-400"
                      aria-label="Human approval gate"
                    />
                  )}
                  {task.retryCount > 0 && (
                    <span className="inline-flex items-center gap-0.5 font-mono text-[10px] text-indigo-300 tabular-nums">
                      <RotateCcw className="h-2.5 w-2.5" aria-hidden="true" />
                      {task.retryCount}
                    </span>
                  )}
                </div>
                <StatusBadge status={task.status} compact />
              </div>

              <p className="line-clamp-2 text-xs font-medium leading-snug text-slate-100">
                {task.title}
              </p>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <AgentIcon agentId={task.agentId} size="sm" />
                <span className="truncate">{getAgentLabel(task.agentId)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
