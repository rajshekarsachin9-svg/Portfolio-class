import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { WorkflowComposerModal } from './components/WorkflowComposerModal';
import {
  DEFAULT_SETTINGS,
  DEMO_WORKFLOW,
  SECONDARY_WORKFLOW,
  WORKSPACES,
} from './data/mockOrchestraData';
import { ActivityPage } from './pages/ActivityPage';
import { AgentsPage } from './pages/AgentsPage';
import { OverviewPage } from './pages/OverviewPage';
import { SettingsPage } from './pages/SettingsPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import {
  buildVerificationChecks,
  createEventId,
  formatTimeNow,
  getAgentLabel,
} from './services/orchestrationService';
import type {
  ExecutionEvent,
  OrchestraSettings,
  PageId,
  TaskStatus,
  Workflow,
  WorkspaceId,
} from './types/orchestra';

function cloneInitialWorkflows(): Workflow[] {
  return [
    JSON.parse(JSON.stringify(DEMO_WORKFLOW)),
    JSON.parse(JSON.stringify(SECONDARY_WORKFLOW)),
  ];
}

export function App() {
  const [activePage, setActivePage] = useState<PageId>('Overview');
  const [workspaceId, setWorkspaceId] = useState<WorkspaceId>('ops-desk');
  const [workflows, setWorkflows] = useState<Workflow[]>(cloneInitialWorkflows);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>(DEMO_WORKFLOW.id);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('T-01');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [settings, setSettings] = useState<OrchestraSettings>(DEFAULT_SETTINGS);
  const [composerOpen, setComposerOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; tone: 'info' | 'warn' } | null>(
    null
  );

  const timersRef = useRef<Record<string, number[]>>({});
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current)
        .flat()
        .forEach((id) => window.clearTimeout(id));
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  function clearWorkflowTimers(workflowId: string) {
    const ids = timersRef.current[workflowId] ?? [];
    ids.forEach((id) => window.clearTimeout(id));
    timersRef.current[workflowId] = [];
  }

  function scheduleForWorkflow(workflowId: string, fn: () => void, delayMs: number) {
    const id = window.setTimeout(fn, delayMs);
    if (!timersRef.current[workflowId]) {
      timersRef.current[workflowId] = [];
    }
    timersRef.current[workflowId].push(id);
  }

  function showToast(message: string, tone: 'info' | 'warn' = 'info') {
    setToast({ message, tone });
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3500);
  }

  const activeWorkflow =
    workflows.find((w) => w.id === activeWorkflowId) ?? workflows[0];

  function updateWorkflow(
    workflowId: string,
    updater: (wf: Workflow) => Workflow
  ) {
    setWorkflows((prev) =>
      prev.map((wf) => (wf.id === workflowId ? updater(wf) : wf))
    );
  }

  function appendEvent(
    workflowId: string,
    event: Omit<ExecutionEvent, 'id' | 'timestamp' | 'workflowId'>
  ) {
    const fullEvent: ExecutionEvent = {
      ...event,
      id: createEventId(),
      timestamp: formatTimeNow(),
      workflowId,
    };
    updateWorkflow(workflowId, (wf) => ({
      ...wf,
      events: [fullEvent, ...wf.events],
    }));
  }

  function runVerificationStage(workflowId: string) {
    updateWorkflow(workflowId, (wf) => ({
      ...wf,
      status: 'running',
      tasks: wf.tasks.map((t) =>
        t.agentId === 'verification' ? { ...t, status: 'running' } : t
      ),
    }));
    appendEvent(workflowId, {
      taskId: 'T-06',
      agentId: 'verification',
      level: 'running',
      message: 'Verification Agent running traceability & safety checks…',
    });

    scheduleForWorkflow(
      workflowId,
      () => {
        updateWorkflow(workflowId, (wf) => {
          const checks = buildVerificationChecks(
            wf.tasks,
            settings.strictVerification
          );
          const hasFailure = checks.some((c) => c.status === 'failed');
          return {
            ...wf,
            status: hasFailure ? 'failed' : 'completed',
            tasks: wf.tasks.map((t) =>
              t.agentId === 'verification'
                ? {
                    ...t,
                    status: hasFailure ? 'failed' : 'completed',
                    verificationChecks: checks,
                  }
                : t
            ),
          };
        });
        appendEvent(workflowId, {
          taskId: 'T-06',
          agentId: 'verification',
          level: 'success',
          message: 'Verification completed: all deliverables & safety gates passed.',
          detail: 'External dispatch remains blocked in Safe Mode.',
        });
        showToast('Workflow verified and completed safely.');
      },
      1100
    );
  }

  function runPostResearchStages(workflowId: string, fromTaskId: 'T-04' | 'T-05') {
    if (fromTaskId === 'T-04') {
      updateWorkflow(workflowId, (wf) => ({
        ...wf,
        status: 'running',
        tasks: wf.tasks.map((t) =>
          t.id === 'T-04' ? { ...t, status: 'running' } : t
        ),
      }));
      appendEvent(workflowId, {
        taskId: 'T-04',
        agentId: 'documentation',
        level: 'running',
        message: 'Documentation Agent synthesizing meeting brief & agenda…',
      });

      scheduleForWorkflow(
        workflowId,
        () => {
          updateWorkflow(workflowId, (wf) => ({
            ...wf,
            tasks: wf.tasks.map((t) =>
              t.id === 'T-04' ? { ...t, status: 'completed' } : t
            ),
          }));
          appendEvent(workflowId, {
            taskId: 'T-04',
            agentId: 'documentation',
            level: 'success',
            message: 'Client Meeting Brief generated and linked to T-02 sources.',
          });
          runPostResearchStages(workflowId, 'T-05');
        },
        1300
      );
      return;
    }

    // Stage T-05: Communication Agent
    updateWorkflow(workflowId, (wf) => ({
      ...wf,
      status: 'running',
      tasks: wf.tasks.map((t) =>
        t.id === 'T-05' ? { ...t, status: 'running' } : t
      ),
    }));
    appendEvent(workflowId, {
      taskId: 'T-05',
      agentId: 'communication',
      level: 'running',
      message: 'Communication Agent drafting follow-up email (unsent)…',
    });

    scheduleForWorkflow(
      workflowId,
      () => {
        let needsApproval = false;
        updateWorkflow(workflowId, (wf) => {
          const t5 = wf.tasks.find((t) => t.id === 'T-05');
          needsApproval = Boolean(
            t5?.requiresApproval || settings.requireApprovalForComms
          );
          const nextStatus: TaskStatus = needsApproval
            ? 'awaiting_approval'
            : 'completed';
          return {
            ...wf,
            status: needsApproval ? 'awaiting_approval' : 'running',
            tasks: wf.tasks.map((t) =>
              t.id === 'T-05'
                ? {
                    ...t,
                    status: nextStatus,
                    requiresApproval: needsApproval,
                    approvalDecision: needsApproval ? 'pending' : undefined,
                  }
                : t
            ),
          };
        });

        if (needsApproval) {
          appendEvent(workflowId, {
            taskId: 'T-05',
            agentId: 'communication',
            level: 'warning',
            message: 'Paused at Human Approval Gate for T-05 email draft.',
            detail:
              'External email sending is disabled. Review draft to continue verification.',
          });
          setSelectedTaskId('T-05');
          showToast('Human review required for T-05 email draft.', 'warn');
        } else {
          appendEvent(workflowId, {
            taskId: 'T-05',
            agentId: 'communication',
            level: 'success',
            message: 'Email draft saved (sending disabled).',
          });
          runVerificationStage(workflowId);
        }
      },
      1200
    );
  }

  function handleRunWorkflow(workflowId: string) {
    clearWorkflowTimers(workflowId);
    setActiveWorkflowId(workflowId);

    updateWorkflow(workflowId, (wf) => ({
      ...wf,
      status: 'running',
      tasks: wf.tasks.map((t, idx) => ({
        ...t,
        status: idx === 0 ? 'completed' : 'queued',
        retryCount: 0,
        maxRetries: settings.maxRetries,
        failureReason: undefined,
        approvalDecision: t.requiresApproval ? 'pending' : undefined,
        verificationChecks: t.verificationChecks?.map((vc) => ({
          ...vc,
          status: 'pending',
        })),
      })),
    }));

    appendEvent(workflowId, {
      taskId: 'T-01',
      agentId: 'orchestrator',
      level: 'info',
      message: 'Execution started in Safe Sandbox mode.',
    });
    showToast('Workflow execution started.');

    // Wave 1: T-02 (Research) + T-03 (Operations) run concurrently
    scheduleForWorkflow(
      workflowId,
      () => {
        updateWorkflow(workflowId, (wf) => ({
          ...wf,
          tasks: wf.tasks.map((t) =>
            t.id === 'T-02' || t.id === 'T-03' ? { ...t, status: 'running' } : t
          ),
        }));
        appendEvent(workflowId, {
          taskId: 'T-02',
          agentId: 'research',
          level: 'running',
          message: 'Research Agent gathering client intelligence & sources…',
        });
        appendEvent(workflowId, {
          taskId: 'T-03',
          agentId: 'operations',
          level: 'running',
          message: 'Operations Agent auditing deliverables & blockers…',
        });
      },
      350
    );

    // T-03 completes
    scheduleForWorkflow(
      workflowId,
      () => {
        updateWorkflow(workflowId, (wf) => ({
          ...wf,
          tasks: wf.tasks.map((t) =>
            t.id === 'T-03' ? { ...t, status: 'completed' } : t
          ),
        }));
        appendEvent(workflowId, {
          taskId: 'T-03',
          agentId: 'operations',
          level: 'success',
          message: 'Operational readiness checklist completed.',
        });
      },
      1300
    );

    if (settings.simulateTransientFailure) {
      // T-02 transient failure -> retry -> recovery
      scheduleForWorkflow(
        workflowId,
        () => {
          updateWorkflow(workflowId, (wf) => ({
            ...wf,
            tasks: wf.tasks.map((t) =>
              t.id === 'T-02'
                ? {
                    ...t,
                    status: 'retrying',
                    retryCount: 1,
                    failureReason:
                      'Transient timeout from CRM context endpoint (HTTP 504). Auto-retrying (1/' +
                      settings.maxRetries +
                      ')…',
                  }
                : t
            ),
          }));
          appendEvent(workflowId, {
            taskId: 'T-02',
            agentId: 'research',
            level: 'warning',
            message: 'T-02 hit transient timeout (HTTP 504). Retrying attempt 1…',
          });
        },
        1500
      );

      scheduleForWorkflow(
        workflowId,
        () => {
          updateWorkflow(workflowId, (wf) => ({
            ...wf,
            tasks: wf.tasks.map((t) =>
              t.id === 'T-02'
                ? {
                    ...t,
                    status: 'completed',
                    failureReason:
                      'Recovered cleanly on retry 1 after transient endpoint timeout.',
                  }
                : t
            ),
          }));
          appendEvent(workflowId, {
            taskId: 'T-02',
            agentId: 'research',
            level: 'success',
            message: 'T-02 retry succeeded. 4 verified references attached.',
          });
          runPostResearchStages(workflowId, 'T-04');
        },
        2700
      );
    } else {
      scheduleForWorkflow(
        workflowId,
        () => {
          updateWorkflow(workflowId, (wf) => ({
            ...wf,
            tasks: wf.tasks.map((t) =>
              t.id === 'T-02' ? { ...t, status: 'completed' } : t
            ),
          }));
          appendEvent(workflowId, {
            taskId: 'T-02',
            agentId: 'research',
            level: 'success',
            message: 'Research dossier compiled with 4 source references.',
          });
          runPostResearchStages(workflowId, 'T-04');
        },
        1600
      );
    }
  }

  function handleSimulateHardFailure(workflowId: string) {
    clearWorkflowTimers(workflowId);
    setActiveWorkflowId(workflowId);
    setSelectedTaskId('T-02');

    updateWorkflow(workflowId, (wf) => ({
      ...wf,
      status: 'failed',
      tasks: wf.tasks.map((t) => {
        if (t.id === 'T-01') return { ...t, status: 'completed' };
        if (t.id === 'T-02') {
          return {
            ...t,
            status: 'failed',
            retryCount: Math.min(t.maxRetries, t.retryCount + 1),
            failureReason:
              'Upstream knowledge connector returned HTTP 503 Service Unavailable. Manual retry required.',
          };
        }
        if (t.id === 'T-03') return { ...t, status: 'completed' };
        return { ...t, status: 'blocked' };
      }),
    }));

    appendEvent(workflowId, {
      taskId: 'T-02',
      agentId: 'research',
      level: 'error',
      message: 'T-02 failed: upstream knowledge connector returned HTTP 503.',
      detail: 'Downstream tasks T-04, T-05, T-06 marked Blocked.',
    });
    showToast('Simulated failure on T-02. Downstream tasks blocked.', 'warn');
  }

  function handleRetryTask(workflowId: string, taskId: string) {
    clearWorkflowTimers(workflowId);
    updateWorkflow(workflowId, (wf) => ({
      ...wf,
      status: 'running',
      tasks: wf.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'retrying',
            retryCount: t.retryCount + 1,
            failureReason: 'Retrying task execution after failure…',
          };
        }
        if (t.status === 'blocked') {
          return { ...t, status: 'queued' };
        }
        return t;
      }),
    }));

    const task = workflows
      .find((w) => w.id === workflowId)
      ?.tasks.find((t) => t.id === taskId);

    appendEvent(workflowId, {
      taskId,
      agentId: task?.agentId ?? 'orchestrator',
      level: 'running',
      message: `Manual retry triggered for ${taskId}.`,
    });

    scheduleForWorkflow(
      workflowId,
      () => {
        updateWorkflow(workflowId, (wf) => ({
          ...wf,
          tasks: wf.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'completed',
                  failureReason: `Recovered after manual retry (attempt ${t.retryCount}).`,
                }
              : t
          ),
        }));
        appendEvent(workflowId, {
          taskId,
          agentId: task?.agentId ?? 'orchestrator',
          level: 'success',
          message: `${taskId} recovered and completed. Resuming downstream graph.`,
        });

        if (taskId === 'T-02' || taskId === 'T-03') {
          runPostResearchStages(workflowId, 'T-04');
        } else if (taskId === 'T-04') {
          runPostResearchStages(workflowId, 'T-05');
        } else if (taskId === 'T-05') {
          runVerificationStage(workflowId);
        }
      },
      1100
    );
  }

  function handleResetWorkflow(workflowId: string) {
    clearWorkflowTimers(workflowId);
    updateWorkflow(workflowId, (wf) => ({
      ...wf,
      status: 'planned',
      tasks: wf.tasks.map((t, idx) => ({
        ...t,
        status: idx === 0 ? 'completed' : 'queued',
        retryCount: 0,
        failureReason: undefined,
        approvalDecision: t.requiresApproval ? 'pending' : undefined,
        verificationChecks: t.verificationChecks?.map((vc) => ({
          ...vc,
          status: 'pending',
        })),
      })),
    }));
    appendEvent(workflowId, {
      agentId: 'orchestrator',
      level: 'info',
      message: 'Workflow state reset to planned baseline.',
    });
    showToast('Workflow reset to planned state.');
  }

  function handleApproveTask(workflowId: string, taskId: string) {
    updateWorkflow(workflowId, (wf) => ({
      ...wf,
      tasks: wf.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: 'completed', approvalDecision: 'approved' }
          : t
      ),
    }));
    appendEvent(workflowId, {
      taskId,
      agentId: 'communication',
      level: 'success',
      message: `Human reviewer approved ${taskId} draft. External sending remains disabled.`,
    });
    showToast('Draft approved (Safe Mode: no email sent).');

    if (settings.autoAdvanceVerification) {
      runVerificationStage(workflowId);
    }
  }

  function handleRejectTask(workflowId: string, taskId: string) {
    updateWorkflow(workflowId, (wf) => ({
      ...wf,
      status: 'failed',
      tasks: wf.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'failed',
            approvalDecision: 'rejected',
            failureReason:
              'Revision requested at Human Approval Gate. Click Retry Task to regenerate draft.',
          };
        }
        if (t.agentId === 'verification') {
          return { ...t, status: 'blocked' };
        }
        return t;
      }),
    }));
    appendEvent(workflowId, {
      taskId,
      agentId: 'communication',
      level: 'warning',
      message: `Revision requested on ${taskId}. Verification blocked until redrafted.`,
    });
    showToast('Revision requested for communication draft.', 'warn');
  }

  function handleCreateWorkflow(newWf: Workflow, autoRun: boolean) {
    setWorkflows((prev) => [newWf, ...prev]);
    setActiveWorkflowId(newWf.id);
    setSelectedTaskId('T-01');
    setActivePage('Workflows');
    if (autoRun) {
      window.setTimeout(() => handleRunWorkflow(newWf.id), 60);
    } else {
      showToast(`Created ${newWf.code} execution plan.`);
    }
  }

  function handleInspectTask(workflowId: string, taskId: string) {
    setActiveWorkflowId(workflowId);
    setSelectedTaskId(taskId);
    setActivePage('Workflows');
  }

  function handleResetAllData() {
    Object.keys(timersRef.current).forEach(clearWorkflowTimers);
    setSettings(DEFAULT_SETTINGS);
    const fresh = cloneInitialWorkflows();
    setWorkflows(fresh);
    setActiveWorkflowId(fresh[0].id);
    setSelectedTaskId('T-01');
    showToast('Workspace settings and demo workflows restored.');
  }

  const currentWorkspace = WORKSPACES[workspaceId];

  return (
    <div className="flex min-h-screen bg-[#080D1A] text-slate-100">
      <Sidebar
        activePage={activePage}
        onSelectPage={setActivePage}
        workspaceId={workspaceId}
        onSelectWorkspace={setWorkspaceId}
        activeWorkflowCount={workflows.length}
        activeWorkflow={activeWorkflow}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          activePage={activePage}
          workspaceName={currentWorkspace.name}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenComposer={() => setComposerOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div key={activePage} className="animate-page-enter">
          {activePage === 'Overview' && (
            <OverviewPage
              workflows={workflows}
              activeWorkflow={activeWorkflow}
              searchQuery={searchQuery}
              onSelectWorkflow={setActiveWorkflowId}
              onNavigate={setActivePage}
              onInspectTask={handleInspectTask}
              onRunWorkflow={handleRunWorkflow}
              onResetWorkflow={handleResetWorkflow}
              onOpenComposer={() => setComposerOpen(true)}
            />
          )}

          {activePage === 'Workflows' && (
            <WorkflowsPage
              workflows={workflows}
              activeWorkflow={activeWorkflow}
              selectedTaskId={selectedTaskId}
              searchQuery={searchQuery}
              onSelectWorkflow={(id) => {
                setActiveWorkflowId(id);
                setSelectedTaskId('T-01');
              }}
              onSelectTask={setSelectedTaskId}
              onRunWorkflow={handleRunWorkflow}
              onSimulateHardFailure={handleSimulateHardFailure}
              onRetryTask={handleRetryTask}
              onResetWorkflow={handleResetWorkflow}
              onApproveTask={handleApproveTask}
              onRejectTask={handleRejectTask}
            />
          )}

          {activePage === 'Agents' && (
            <AgentsPage
              activeWorkflow={activeWorkflow}
              searchQuery={searchQuery}
              onInspectTask={handleInspectTask}
            />
          )}

          {activePage === 'Activity' && (
            <ActivityPage
              workflows={workflows}
              searchQuery={searchQuery}
              onInspectTask={handleInspectTask}
            />
          )}

          {activePage === 'Settings' && (
            <SettingsPage
              settings={settings}
              onUpdateSettings={(patch) => {
                setSettings((prev) => ({ ...prev, ...patch }));
                showToast('Orchestration policy updated.');
              }}
              onResetAllData={handleResetAllData}
            />
          )}
          </div>
        </main>

        <footer className="border-t border-[#1E2942] px-4 py-4 text-xs text-slate-400 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <span>ORCHESTRA — Autonomous Multi-Agent Workflow Platform</span>
            <span>Safe Sandbox Environment · No external emails or account changes are executed</span>
          </div>
        </footer>
      </div>

      <WorkflowComposerModal
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        workspaceId={workspaceId}
        workflowCount={workflows.length}
        settings={settings}
        onCreateWorkflow={handleCreateWorkflow}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`animate-toast-enter fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-xs font-medium shadow-xl ${
            toast.tone === 'warn'
              ? 'border-amber-700/70 bg-[#231B12] text-amber-200'
              : 'border-emerald-700/70 bg-[#102620] text-emerald-200'
          }`}
        >
          {toast.tone === 'warn' ? (
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="ml-1 rounded p-0.5 text-slate-400 hover:text-slate-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
