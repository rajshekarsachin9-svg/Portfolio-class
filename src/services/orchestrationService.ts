import { DEMO_OBJECTIVE, DEMO_WORKFLOW } from '../data/mockOrchestraData';
import type {
  AgentId,
  Artifact,
  OrchestraSettings,
  VerificationCheck,
  Workflow,
  WorkflowTask,
  WorkspaceId,
} from '../types/orchestra';

/**
 * ORCHESTRATION SERVICE LAYER
 * ---------------------------------------------------------------------------
 * Intentionally decoupled from React UI state so a real backend API
 * (e.g., REST + SSE / WebSocket execution stream) can replace these pure
 * planning and simulation helpers without rewriting presentation components.
 */

export function formatTimeNow(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

export function createEventId(prefix = 'ev'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Computes topological depth (column index) for DAG visualization.
 */
export function computeTaskLayers(tasks: WorkflowTask[]): WorkflowTask[][] {
  const depthMap = new Map<string, number>();
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  function getDepth(id: string, visited = new Set<string>()): number {
    if (depthMap.has(id)) return depthMap.get(id)!;
    if (visited.has(id)) return 0;
    visited.add(id);

    const task = taskMap.get(id);
    if (!task || task.dependencies.length === 0) {
      depthMap.set(id, 0);
      return 0;
    }

    const parentDepths = task.dependencies.map((depId) =>
      getDepth(depId, new Set(visited))
    );
    const depth = Math.max(...parentDepths) + 1;
    depthMap.set(id, depth);
    return depth;
  }

  tasks.forEach((t) => getDepth(t.id));

  const maxDepth = Math.max(0, ...Array.from(depthMap.values()));
  const layers: WorkflowTask[][] = Array.from({ length: maxDepth + 1 }, () => []);
  tasks.forEach((t) => {
    const d = depthMap.get(t.id) ?? 0;
    layers[d].push(t);
  });

  return layers;
}

/**
 * Evaluates verification checks for a workflow once upstream deliverables
 * and approval gates have settled.
 */
export function buildVerificationChecks(
  tasks: WorkflowTask[],
  strictVerification: boolean
): VerificationCheck[] {
  const hasFailedUpstream = tasks.some(
    (t) => t.agentId !== 'verification' && t.status === 'failed'
  );
  const approvalTask = tasks.find((t) => t.requiresApproval);
  const approvalPassed =
    !approvalTask || approvalTask.approvalDecision === 'approved';
  const hadRetry = tasks.some((t) => t.retryCount > 0);

  return [
    {
      id: 'vc-trace',
      label: 'Source & artifact traceability',
      status: hasFailedUpstream ? 'failed' : 'passed',
      detail: hasFailedUpstream
        ? 'Blocked: one or more upstream research/documentation tasks failed.'
        : 'All deliverable sections trace to verified upstream task outputs.',
    },
    {
      id: 'vc-completeness',
      label: 'Objective coverage & completeness',
      status: hasFailedUpstream ? 'failed' : 'passed',
      detail: hasFailedUpstream
        ? 'Incomplete due to unresolved upstream task failure.'
        : 'Confirmed agenda, risks, action owners, and expected artifacts are present.',
    },
    {
      id: 'vc-safety',
      label: 'External action safety gate',
      status: approvalPassed ? 'passed' : 'warning',
      detail: approvalPassed
        ? 'Human approval recorded; outbound email & external account writes remain disabled.'
        : 'Pending explicit human sign-off on sensitive communication draft.',
    },
    {
      id: 'vc-reliability',
      label: 'Execution resilience & retry audit',
      status: hadRetry && strictVerification ? 'passed' : 'passed',
      detail: hadRetry
        ? 'Transient failure detected and cleanly recovered within max retry policy.'
        : 'Zero execution anomalies encountered across dependency graph.',
    },
  ];
}

/**
 * Future backend integration point: POST /api/workflows/decompose
 * Decomposes any natural-language objective into a structured execution plan
 * containing task IDs, assigned agents, dependencies, expected outputs, and statuses.
 */
export function decomposeObjectiveToWorkflow(params: {
  objective: string;
  customTitle?: string;
  workspaceId: WorkspaceId;
  workflowCount: number;
  settings: OrchestraSettings;
}): Workflow {
  const trimmed = params.objective.trim();
  const now = formatTimeNow();
  const code = `WF-2026-${String(params.workflowCount + 1).padStart(3, '0')}`;
  const id = `wf-${Date.now()}`;

  // If user selects or types the canonical demo scenario, build the rich demo structure
  if (trimmed.toLowerCase() === DEMO_OBJECTIVE.toLowerCase()) {
    const cloned: Workflow = JSON.parse(JSON.stringify(DEMO_WORKFLOW));
    cloned.id = id;
    cloned.code = code;
    cloned.workspaceId = params.workspaceId;
    cloned.createdAt = now;
    if (params.customTitle?.trim()) {
      cloned.title = params.customTitle.trim();
    }
    cloned.tasks = cloned.tasks.map((t) => ({
      ...t,
      maxRetries: params.settings.maxRetries,
      requiresApproval:
        t.agentId === 'communication'
          ? params.settings.requireApprovalForComms
          : t.agentId === 'operations'
            ? params.settings.requireApprovalForOps
            : t.requiresApproval,
    }));
    cloned.events = [
      {
        id: createEventId(),
        timestamp: now,
        workflowId: id,
        taskId: 'T-01',
        agentId: 'orchestrator',
        level: 'success',
        message: 'Objective decomposed into 6 dependency-linked tasks.',
        detail: `Objective: "${trimmed}"`,
      },
    ];
    return cloned;
  }

  // Domain-adaptive decomposition for any custom business objective
  const lower = trimmed.toLowerCase();
  const isSecurityOrVendor =
    lower.includes('vendor') ||
    lower.includes('security') ||
    lower.includes('audit') ||
    lower.includes('compliance');
  const isBoardOrReport =
    lower.includes('board') ||
    lower.includes('quarter') ||
    lower.includes('q4') ||
    lower.includes('report') ||
    lower.includes('review');

  const inferredTitle =
    params.customTitle?.trim() ||
    (isSecurityOrVendor
      ? 'Vendor Readiness & Compliance Plan'
      : isBoardOrReport
        ? 'Executive Performance & Risk Brief'
        : trimmed.length > 48
          ? `${trimmed.slice(0, 48).trim()}…`
          : trimmed);

  const researchTaskTitle = isSecurityOrVendor
    ? 'Gather vendor posture, certifications & public disclosures'
    : isBoardOrReport
      ? 'Collect quarterly metrics, KPI variances & department updates'
      : 'Research domain context, stakeholders & reference inputs';

  const opsTaskTitle = isSecurityOrVendor
    ? 'Prepare security onboarding & access control checklist'
    : isBoardOrReport
      ? 'Audit operational blockers, delivery risks & milestone owners'
      : 'Coordinate operational dependencies & readiness checklist';

  const docTaskTitle = isSecurityOrVendor
    ? 'Author vendor risk assessment & onboarding brief'
    : isBoardOrReport
      ? 'Draft structured executive performance report'
      : 'Synthesize structured briefing document & action plan';

  const commTaskTitle = isSecurityOrVendor
    ? 'Draft vendor compliance questionnaire email'
    : isBoardOrReport
      ? 'Prepare leadership summary & pre-read email draft'
      : 'Draft stakeholder update & follow-up message';

  const tasks: WorkflowTask[] = [
    {
      id: 'T-01',
      title: 'Decompose objective & establish dependency graph',
      description: `Orchestrator analyzed "${trimmed}" and assigned specialised agents with explicit verification gates.`,
      agentId: 'orchestrator',
      dependencies: [],
      expectedOutput: '6-node structured execution plan',
      status: 'completed',
      retryCount: 0,
      maxRetries: params.settings.maxRetries,
      durationLabel: '1.2s',
    },
    {
      id: 'T-02',
      title: researchTaskTitle,
      description:
        'Gather verifiable background context, key facts, and source citations relevant to the objective.',
      agentId: 'research',
      dependencies: ['T-01'],
      expectedOutput: 'Source-Referenced Research Dossier',
      status: 'queued',
      retryCount: 0,
      maxRetries: params.settings.maxRetries,
      durationLabel: '3.0s',
      outputArtifactId: `${id}-research`,
    },
    {
      id: 'T-03',
      title: opsTaskTitle,
      description:
        'Map operational constraints, internal owners, timelines, and pre-execution dependencies.',
      agentId: 'operations',
      dependencies: ['T-01'],
      expectedOutput: 'Operational Readiness Checklist',
      status: 'queued',
      retryCount: 0,
      maxRetries: params.settings.maxRetries,
      durationLabel: '2.2s',
      requiresApproval: params.settings.requireApprovalForOps,
      approvalActionLabel: params.settings.requireApprovalForOps
        ? 'Approve operational checklist changes (read-only sandbox)'
        : undefined,
      approvalDecision: params.settings.requireApprovalForOps ? 'pending' : undefined,
      outputArtifactId: `${id}-checklist`,
    },
    {
      id: 'T-04',
      title: docTaskTitle,
      description:
        'Consolidate research findings and operational priorities into an executive-ready brief.',
      agentId: 'documentation',
      dependencies: ['T-02', 'T-03'],
      expectedOutput: 'Structured Executive Brief',
      status: 'queued',
      retryCount: 0,
      maxRetries: params.settings.maxRetries,
      durationLabel: '3.5s',
      outputArtifactId: `${id}-brief`,
    },
    {
      id: 'T-05',
      title: commTaskTitle,
      description:
        'Prepare a clear stakeholder communication draft. Held at human approval gate; outbound dispatch disabled.',
      agentId: 'communication',
      dependencies: ['T-04'],
      expectedOutput: 'Stakeholder Message Draft (Unsent)',
      status: 'queued',
      retryCount: 0,
      maxRetries: params.settings.maxRetries,
      durationLabel: '1.8s',
      requiresApproval: params.settings.requireApprovalForComms,
      approvalActionLabel: 'Approve communication draft (sending disabled in Safe Mode)',
      approvalDecision: params.settings.requireApprovalForComms ? 'pending' : undefined,
      outputArtifactId: `${id}-email`,
    },
    {
      id: 'T-06',
      title: 'Validate output accuracy, consistency & safety gates',
      description:
        'Cross-check generated artifacts against objective requirements, citation links, and approval logs.',
      agentId: 'verification',
      dependencies: ['T-04', 'T-05'],
      expectedOutput: 'Verification & Reliability Report',
      status: 'queued',
      retryCount: 0,
      maxRetries: params.settings.maxRetries,
      durationLabel: '2.1s',
      outputArtifactId: `${id}-verify`,
      verificationChecks: [
        {
          id: 'vc-1',
          label: 'Source traceability',
          status: 'pending',
          detail: 'Pending T-02 dossier and T-04 brief.',
        },
        {
          id: 'vc-2',
          label: 'Objective alignment',
          status: 'pending',
          detail: 'Validates deliverables address the original objective.',
        },
        {
          id: 'vc-3',
          label: 'External action safety gate',
          status: 'pending',
          detail: 'Ensures external writes and emails remain blocked.',
        },
      ],
    },
  ];

  const artifacts: Artifact[] = [
    {
      id: `${id}-brief`,
      title: 'Executive Summary Brief',
      type: 'brief',
      authorAgentId: 'documentation',
      createdAt: now,
      kicker: 'DOCUMENTATION AGENT · DELIVERABLE BRIEF',
      subtitle: `${inferredTitle} · Synthesized from T-02 & T-03`,
      summary: `Structured execution brief generated for "${trimmed}".`,
      safetyNotice: 'Generated in Safe Mode from structured task outputs.',
      sections: [
        {
          heading: 'Objective scope',
          body: trimmed,
        },
        {
          heading: 'Key findings & recommended actions',
          bullets: [
            'Research inputs consolidated with explicit reference tracking.',
            'Operational readiness items assigned clear internal owners and timelines.',
            'Critical dependencies and approval gates surfaced before external communication.',
          ],
        },
      ],
    },
    {
      id: `${id}-research`,
      title: 'Research Context Dossier',
      type: 'research_dossier',
      authorAgentId: 'research',
      createdAt: now,
      kicker: 'RESEARCH AGENT · CONTEXT DOSSIER',
      subtitle: 'Structured background references',
      summary: 'Source-tagged findings gathered for downstream synthesis.',
      safetyNotice: 'Read-only research output.',
      sections: [
        {
          heading: 'Synthesized findings',
          body: `Compiled contextual background, stakeholder requirements, and reference benchmarks aligned to: "${trimmed}".`,
        },
      ],
    },
    {
      id: `${id}-checklist`,
      title: 'Operational Readiness Checklist',
      type: 'checklist',
      authorAgentId: 'operations',
      createdAt: now,
      kicker: 'OPERATIONS AGENT · ACTION CHECKLIST',
      subtitle: 'Dependency & owner readiness',
      summary: 'Pre-flight checklist for operational execution.',
      safetyNotice: 'No external task systems or calendars were modified.',
      sections: [
        {
          heading: 'Verification items',
          bullets: [
            '[READY] Confirm stakeholder scope and delivery deadline.',
            '[READY] Validate internal resource and owner availability.',
            '[GATED] External stakeholder outreach requires human approval.',
          ],
        },
      ],
    },
    {
      id: `${id}-email`,
      title: 'Stakeholder Communication Draft',
      type: 'email_draft',
      authorAgentId: 'communication',
      createdAt: now,
      kicker: 'COMMUNICATION AGENT · DRAFT ONLY (UNSENT)',
      subtitle: `Subject: Summary & Next Steps — ${inferredTitle}`,
      summary: 'Draft stakeholder email awaiting human review.',
      externalActionBlocked: true,
      safetyNotice:
        'HUMAN APPROVAL GATE: Email delivery is disabled. Approving records human review only.',
      sections: [
        {
          heading: 'Draft email body',
          body: `Hello Team,\n\nPlease find the prepared brief and operational readiness checklist for "${inferredTitle}".\n\nKey next steps and owners have been documented for review. No external actions have been triggered automatically.\n\nBest regards,\nOperations Desk`,
        },
      ],
    },
    {
      id: `${id}-verify`,
      title: 'Verification Audit Report',
      type: 'verification_report',
      authorAgentId: 'verification',
      createdAt: now,
      kicker: 'VERIFICATION AGENT · QUALITY & SAFETY AUDIT',
      subtitle: 'Automated deliverable validation',
      summary: 'Final verification checks across deliverables and safety policies.',
      safetyNotice: 'Independent verification step.',
      sections: [
        {
          heading: 'Verification scope',
          body: 'Checks completeness against the user objective, consistency across agent artifacts, and compliance with Safe Mode external-action locks.',
        },
      ],
    },
  ];

  return {
    id,
    code,
    workspaceId: params.workspaceId,
    title: inferredTitle,
    objective: trimmed,
    createdAt: now,
    status: 'planned',
    tasks,
    artifacts,
    events: [
      {
        id: createEventId(),
        timestamp: now,
        workflowId: id,
        taskId: 'T-01',
        agentId: 'orchestrator',
        level: 'success',
        message: 'New workflow plan generated (6 tasks across 6 agents).',
        detail: `Objective: "${trimmed}"`,
      },
    ],
  };
}

export function getAgentLabel(agentId: AgentId): string {
  const map: Record<AgentId, string> = {
    orchestrator: 'Orchestrator Agent',
    research: 'Research Agent',
    documentation: 'Documentation Agent',
    operations: 'Operations Agent',
    communication: 'Communication Agent',
    verification: 'Verification Agent',
  };
  return map[agentId];
}
