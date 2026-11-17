import type {
  AgentDefinition,
  OrchestraSettings,
  Workflow,
  WorkspaceId,
} from '../types/orchestra';

export const WORKSPACES: Record<
  WorkspaceId,
  { id: WorkspaceId; name: string; subtitle: string; initials: string }
> = {
  'ops-desk': {
    id: 'ops-desk',
    name: 'Operations Command',
    subtitle: 'Safe Sandbox · No External Writes',
    initials: 'OC',
  },
  'exec-briefing': {
    id: 'exec-briefing',
    name: 'Client Delivery Desk',
    subtitle: 'Safe Sandbox · Approval Gated',
    initials: 'CD',
  },
};

export const AGENTS: AgentDefinition[] = [
  {
    id: 'orchestrator',
    name: 'Orchestrator Agent',
    role: 'Planning & delegation',
    description:
      'Parses high-level business objectives into dependency-aware execution graphs, assigns specialised agents, monitors progress, and triggers recovery policies.',
    capabilities: [
      'Natural-language objective decomposition',
      'Topological dependency scheduling',
      'Failure detection & retry escalation',
    ],
    guardrails: [
      'Cannot bypass human approval gates',
      'Enforces max retry ceiling per task',
    ],
    tone: 'indigo',
  },
  {
    id: 'research',
    name: 'Research Agent',
    role: 'Information gathering',
    description:
      'Collects structured background context, stakeholder profiles, and source-referenced findings required by downstream documentation tasks.',
    capabilities: [
      'Account & stakeholder intelligence synthesis',
      'Source citation & provenance tagging',
      'Structured dossier compilation',
    ],
    guardrails: [
      'Read-only retrieval within approved scope',
      'Every claim requires a traceable source ref',
    ],
    tone: 'blue',
  },
  {
    id: 'operations',
    name: 'Operations Agent',
    role: 'Workflow coordination',
    description:
      'Audits deliverable milestones, maps internal owners, prepares operational readiness checklists, and flags timeline blockers.',
    capabilities: [
      'Deliverable & milestone alignment',
      'Dependency & blocker auditing',
      'Action owner checklist generation',
    ],
    guardrails: [
      'Cannot modify live project boards or CRMs',
      'External schedule changes require approval',
    ],
    tone: 'amber',
  },
  {
    id: 'documentation',
    name: 'Documentation Agent',
    role: 'Report generation',
    description:
      'Transforms verified research and operational inputs into structured executive briefs, agendas, and decision-ready business documents.',
    capabilities: [
      'Executive meeting brief drafting',
      'Structured agenda & talking-point synthesis',
      'Risk & decision register formatting',
    ],
    guardrails: [
      'Must cite verified upstream task outputs',
      'Flags unverified assumptions explicitly',
    ],
    tone: 'cyan',
  },
  {
    id: 'communication',
    name: 'Communication Agent',
    role: 'Message drafting',
    description:
      'Prepares stakeholder messages and follow-up email drafts calibrated to meeting objectives while enforcing mandatory human sign-off.',
    capabilities: [
      'Context-aware email & memo drafting',
      'Action-item recap structuring',
      'Tone & recipient policy checks',
    ],
    guardrails: [
      'Outbound email sending permanently disabled in Safe Mode',
      'Requires explicit human approval before release',
    ],
    tone: 'emerald',
  },
  {
    id: 'verification',
    name: 'Verification Agent',
    role: 'Output validation & failure detection',
    description:
      'Audits all generated artifacts against objective criteria, checks cross-agent consistency, validates citations, and verifies safety gate compliance.',
    capabilities: [
      'Cross-artifact consistency validation',
      'Source traceability & schema checks',
      'Policy & approval-gate audit verification',
    ],
    guardrails: [
      'Blocks workflow completion if critical checks fail',
      'Independent from authoring agents',
    ],
    tone: 'rose',
  },
];

export const DEFAULT_SETTINGS: OrchestraSettings = {
  safeModeEnforced: true,
  requireApprovalForComms: true,
  requireApprovalForOps: false,
  maxRetries: 2,
  simulateTransientFailure: true,
  strictVerification: true,
  autoAdvanceVerification: true,
};

export const DEMO_OBJECTIVE =
  'Prepare a complete client meeting package for tomorrow.';

export const DEMO_WORKFLOW: Workflow = {
  id: 'wf-client-meeting-001',
  code: 'WF-2026-001',
  workspaceId: 'ops-desk',
  title: 'Client Meeting Package — Northstar Logistics',
  objective: DEMO_OBJECTIVE,
  createdAt: '09:40:00',
  status: 'planned',
  isDemoScenario: true,
  tasks: [
    {
      id: 'T-01',
      title: 'Decompose meeting objective & map task graph',
      description:
        'Parse objective scope, identify deliverables required for tomorrow’s client meeting, and build a 6-node dependency plan across specialised agents.',
      agentId: 'orchestrator',
      dependencies: [],
      expectedOutput: 'Structured 6-task execution plan with dependency graph',
      status: 'completed',
      retryCount: 0,
      maxRetries: 2,
      durationLabel: '1.4s',
    },
    {
      id: 'T-02',
      title: 'Gather client account context & recent updates',
      description:
        'Compile Northstar Logistics account history, Q4 expansion milestones, stakeholder roles, and recent press/industry signals with source references.',
      agentId: 'research',
      dependencies: ['T-01'],
      expectedOutput: 'Client Intelligence Dossier (4 verified references)',
      status: 'queued',
      retryCount: 0,
      maxRetries: 2,
      durationLabel: '3.2s',
      outputArtifactId: 'art-research-001',
    },
    {
      id: 'T-03',
      title: 'Audit open deliverables & readiness checklist',
      description:
        'Cross-check active delivery milestones, SLA commitments, open blockers, and internal owner assignments ahead of tomorrow’s session.',
      agentId: 'operations',
      dependencies: ['T-01'],
      expectedOutput: 'Operational Readiness & Action Checklist',
      status: 'queued',
      retryCount: 0,
      maxRetries: 2,
      durationLabel: '2.1s',
      outputArtifactId: 'art-checklist-001',
    },
    {
      id: 'T-04',
      title: 'Generate structured client meeting brief',
      description:
        'Synthesize verified research findings and operational checklist items into an executive meeting brief with timed agenda and discussion prompts.',
      agentId: 'documentation',
      dependencies: ['T-02', 'T-03'],
      expectedOutput: 'Client Meeting Brief Document',
      status: 'queued',
      retryCount: 0,
      maxRetries: 2,
      durationLabel: '3.8s',
      outputArtifactId: 'art-brief-001',
    },
    {
      id: 'T-05',
      title: 'Draft post-meeting follow-up email',
      description:
        'Compose a clear, actionable follow-up email summarizing meeting outcomes, owners, and next steps. Held at human approval gate; external send disabled.',
      agentId: 'communication',
      dependencies: ['T-04'],
      expectedOutput: 'Follow-up Email Draft (Human-reviewed, unsent)',
      status: 'queued',
      retryCount: 0,
      maxRetries: 2,
      durationLabel: '1.9s',
      requiresApproval: true,
      approvalActionLabel: 'Approve follow-up email draft for export (sending disabled)',
      approvalDecision: 'pending',
      outputArtifactId: 'art-email-001',
    },
    {
      id: 'T-06',
      title: 'Validate deliverables, citations & safety gates',
      description:
        'Verify source traceability across brief claims, validate agenda completeness, confirm human sign-off on outbound drafts, and check for contradictions.',
      agentId: 'verification',
      dependencies: ['T-04', 'T-05'],
      expectedOutput: 'Verification & Reliability Audit Report',
      status: 'queued',
      retryCount: 0,
      maxRetries: 2,
      durationLabel: '2.4s',
      outputArtifactId: 'art-verify-001',
      verificationChecks: [
        {
          id: 'vc-1',
          label: 'Source traceability',
          status: 'pending',
          detail: 'Awaiting T-02 dossier and T-04 brief completion.',
        },
        {
          id: 'vc-2',
          label: 'Agenda & owner completeness',
          status: 'pending',
          detail: 'Checks that every discussion topic has an owner and target date.',
        },
        {
          id: 'vc-3',
          label: 'External action safety gate',
          status: 'pending',
          detail: 'Confirms no emails were dispatched and human approval was logged.',
        },
        {
          id: 'vc-4',
          label: 'Cross-agent consistency',
          status: 'pending',
          detail: 'Validates milestone dates align between Operations and Documentation.',
        },
      ],
    },
  ],
  artifacts: [
    {
      id: 'art-brief-001',
      title: 'Client Meeting Brief',
      type: 'brief',
      authorAgentId: 'documentation',
      createdAt: '09:40:00',
      kicker: 'DOCUMENTATION AGENT · BRIEFING PACKAGE',
      subtitle: 'Northstar Logistics · Tomorrow, 10:00 AM · 45 min Executive Sync',
      summary:
        'Structured briefing document covering account status, Q4 rollout agenda, risks, and decision items.',
      safetyNotice:
        'Generated from verified Research and Operations outputs. Review final figures prior to client presentation.',
      sections: [
        {
          heading: 'Meeting objective',
          body: 'Align with Northstar Logistics leadership on Phase 2 warehouse telemetry rollout, confirm milestone sign-off for Q4 deployment, and resolve the two open API integration dependencies.',
        },
        {
          heading: 'Account & stakeholder context',
          bullets: [
            'Primary stakeholders: Elena Vance (VP Operations), Marcus Chen (Head of Platform Engineering).',
            'Current contract tier: Enterprise Pilot expanding to 14 regional distribution hubs.',
            'Recent signal: Northstar announced automated cold-chain expansion in Q1 next year.',
          ],
        },
        {
          heading: 'Structured agenda & discussion points',
          bullets: [
            '00–10 min · Phase 1 performance review (99.4% ingestion uptime across 3 pilot hubs).',
            '10–25 min · Phase 2 rollout schedule and ERP webhook authentication cutover.',
            '25–35 min · Risk review: staging sandbox latency and security compliance sign-off.',
            '35–45 min · Decision log, target dates, and weekly cadence confirmation.',
          ],
        },
      ],
    },
    {
      id: 'art-research-001',
      title: 'Client Intelligence Dossier',
      type: 'research_dossier',
      authorAgentId: 'research',
      createdAt: '09:40:00',
      kicker: 'RESEARCH AGENT · SOURCE-REFERENCED DOSSIER',
      subtitle: 'Account background & recent operational signals · 4 sources attached',
      summary: 'Background research compiled with explicit source provenance.',
      safetyNotice: 'Read-only synthesis. All external figures tagged with internal source identifiers.',
      sections: [
        {
          heading: 'Company & operational profile',
          body: 'Northstar Logistics operates 14 regional freight and cold-chain hubs across North America, migrating legacy EDI pipelines to event-driven shipment tracking.',
        },
        {
          heading: 'Attached source references',
          bullets: [
            '[SRC-01] Internal Account Summary Q3 Review (Updated 6 days ago)',
            '[SRC-02] Stakeholder Org Map & Engineering Contacts',
            '[SRC-03] Northstar Q4 Press Release — Cold-Chain Fleet Modernization',
            '[SRC-04] Solution Architecture Integration Notes v2.4',
          ],
        },
      ],
    },
    {
      id: 'art-checklist-001',
      title: 'Operational Readiness Checklist',
      type: 'checklist',
      authorAgentId: 'operations',
      createdAt: '09:40:00',
      kicker: 'OPERATIONS AGENT · PRE-MEETING READINESS',
      subtitle: 'Milestone audit & blocker ownership matrix',
      summary: 'Internal readiness checklist verifying deliverables and open questions.',
      safetyNotice: 'Read-only operational audit. No external project trackers were modified.',
      sections: [
        {
          heading: 'Deliverable status & blockers',
          bullets: [
            '[READY] Pilot SLA performance deck — Verified by Delivery Lead.',
            '[READY] Phase 2 implementation timeline — Updated for 14-hub sequence.',
            '[OPEN BLOCKER] ERP webhook token rotation window requires Marcus Chen confirmation.',
            '[ACTION] Confirm SOC2 Type II addendum distribution with Legal before Friday.',
          ],
        },
      ],
    },
    {
      id: 'art-email-001',
      title: 'Follow-up Email Draft',
      type: 'email_draft',
      authorAgentId: 'communication',
      createdAt: '09:40:00',
      kicker: 'COMMUNICATION AGENT · DRAFT ONLY (UNSENT)',
      subtitle: 'To: Elena Vance, Marcus Chen · Subject: Agenda recap & next steps — Northstar Phase 2',
      summary: 'Draft follow-up message held behind human approval gate.',
      externalActionBlocked: true,
      safetyNotice:
        'HUMAN APPROVAL GATE: External email sending is disabled in ORCHESTRA Safe Mode. Approving marks this draft as reviewed only; no message is transmitted.',
      sections: [
        {
          heading: 'Draft message body',
          body: 'Hi Elena and Marcus,\n\nThank you for making time for tomorrow’s alignment session on the Northstar Phase 2 telemetry rollout. Below is a structured summary of our discussion points and proposed next steps:\n\n1. Phase 1 SLA Sign-Off: Confirming 99.4% ingestion uptime across the three pilot hubs.\n2. ERP Webhook Cutover: Target staging validation window next Tuesday pending engineering confirmation.\n3. Security Compliance: Sharing the SOC2 Type II addendum by end of week.\n\nPlease let us know if you would like to adjust any target dates ahead of next week’s kickoff.\n\nBest regards,\nAccount Delivery Team',
        },
      ],
    },
    {
      id: 'art-verify-001',
      title: 'Verification Audit Report',
      type: 'verification_report',
      authorAgentId: 'verification',
      createdAt: '09:40:00',
      kicker: 'VERIFICATION AGENT · RELIABILITY & SAFETY AUDIT',
      subtitle: 'Automated quality checks & policy enforcement summary',
      summary: 'Validation results for traceability, completeness, and external action safety.',
      safetyNotice: 'Verification runs independently after authoring and human approval stages.',
      sections: [
        {
          heading: 'Audit scope',
          body: 'Validates that all claims in the Client Meeting Brief trace back to the Research Dossier, operational blockers match the Operations Checklist, and Communication Agent outputs remain blocked from external dispatch.',
        },
      ],
    },
  ],
  events: [
    {
      id: 'ev-init-1',
      timestamp: '09:40:00',
      workflowId: 'wf-client-meeting-001',
      taskId: 'T-01',
      agentId: 'orchestrator',
      level: 'info',
      message: 'Objective ingested by Orchestrator Agent.',
      detail: 'Target: "Prepare a complete client meeting package for tomorrow."',
    },
    {
      id: 'ev-init-2',
      timestamp: '09:40:02',
      workflowId: 'wf-client-meeting-001',
      taskId: 'T-01',
      agentId: 'orchestrator',
      level: 'success',
      message: 'Decomposed objective into 6 dependency-linked tasks.',
      detail: 'Assigned Research, Operations, Documentation, Communication, and Verification agents.',
    },
  ],
};

export const SECONDARY_WORKFLOW: Workflow = {
  id: 'wf-q4-ops-audit-002',
  code: 'WF-2026-002',
  workspaceId: 'ops-desk',
  title: 'Weekly Vendor SLA Compliance Digest',
  objective:
    'Audit weekly cloud vendor uptime reports, flag SLA breaches, compile compliance summary, and draft vendor escalation notice.',
  createdAt: '08:15:00',
  status: 'completed',
  tasks: [
    {
      id: 'T-01',
      title: 'Parse SLA audit scope & dependency plan',
      description: 'Identify vendor telemetry feeds and map validation sequence.',
      agentId: 'orchestrator',
      dependencies: [],
      expectedOutput: '5-task compliance audit graph',
      status: 'completed',
      retryCount: 0,
      maxRetries: 2,
      durationLabel: '1.1s',
    },
    {
      id: 'T-02',
      title: 'Collect weekly vendor uptime & latency logs',
      description: 'Ingest SLA snapshots across 3 primary infrastructure providers.',
      agentId: 'research',
      dependencies: ['T-01'],
      expectedOutput: 'Vendor Telemetry Snapshot',
      status: 'completed',
      retryCount: 1,
      maxRetries: 2,
      durationLabel: '4.6s',
      failureReason: 'Recovered after 1 transient timeout from Provider B status endpoint.',
    },
    {
      id: 'T-03',
      title: 'Compile SLA compliance report',
      description: 'Summarize 99.95% threshold adherence and credit eligibility.',
      agentId: 'documentation',
      dependencies: ['T-02'],
      expectedOutput: 'Weekly SLA Compliance Summary',
      status: 'completed',
      retryCount: 0,
      maxRetries: 2,
      durationLabel: '2.5s',
    },
    {
      id: 'T-04',
      title: 'Draft vendor credit inquiry memo',
      description: 'Prepare draft escalation note for human review (unsent).',
      agentId: 'communication',
      dependencies: ['T-03'],
      expectedOutput: 'Reviewed Escalation Draft (Unsent)',
      status: 'completed',
      retryCount: 0,
      maxRetries: 2,
      durationLabel: '1.8s',
      requiresApproval: true,
      approvalActionLabel: 'Approve escalation memo draft (no email sent)',
      approvalDecision: 'approved',
    },
    {
      id: 'T-05',
      title: 'Verify SLA math & policy compliance',
      description: 'Confirm downtime calculations and verify external send lock.',
      agentId: 'verification',
      dependencies: ['T-03', 'T-04'],
      expectedOutput: 'Compliance Verification Pass',
      status: 'completed',
      retryCount: 0,
      maxRetries: 2,
      durationLabel: '1.6s',
      verificationChecks: [
        {
          id: 'vc-s1',
          label: 'Downtime calculation accuracy',
          status: 'passed',
          detail: '42m outage verified against 43,200m monthly window (99.90%).',
        },
        {
          id: 'vc-s2',
          label: 'Human approval logged',
          status: 'passed',
          detail: 'Draft approved for archive; external dispatch disabled.',
        },
      ],
    },
  ],
  artifacts: [
    {
      id: 'art-sla-001',
      title: 'Weekly SLA Compliance Summary',
      type: 'brief',
      authorAgentId: 'documentation',
      createdAt: '08:16:12',
      kicker: 'DOCUMENTATION AGENT · COMPLIANCE REPORT',
      subtitle: 'Infrastructure Vendors · Week 46 Audit',
      summary: 'Summary of vendor uptime performance and credit eligibility.',
      safetyNotice: 'Archived workflow output. No external vendor tickets were submitted.',
      sections: [
        {
          heading: 'SLA summary',
          body: 'Two of three primary providers exceeded the 99.95% uptime target. Provider B recorded 42 minutes of degraded API availability (99.90%), qualifying for a 5% service credit inquiry.',
        },
      ],
    },
  ],
  events: [
    {
      id: 'ev-s1',
      timestamp: '08:15:00',
      workflowId: 'wf-q4-ops-audit-002',
      taskId: 'T-01',
      agentId: 'orchestrator',
      level: 'success',
      message: 'SLA compliance workflow planned (5 tasks).',
    },
    {
      id: 'ev-s2',
      timestamp: '08:15:18',
      workflowId: 'wf-q4-ops-audit-002',
      taskId: 'T-02',
      agentId: 'research',
      level: 'warning',
      message: 'Attempt 1 failed on Provider B endpoint (504 Gateway Timeout). Retrying (1/2)…',
    },
    {
      id: 'ev-s3',
      timestamp: '08:15:22',
      workflowId: 'wf-q4-ops-audit-002',
      taskId: 'T-02',
      agentId: 'research',
      level: 'success',
      message: 'Retry succeeded. Telemetry snapshot gathered across 3 providers.',
    },
    {
      id: 'ev-s4',
      timestamp: '08:16:30',
      workflowId: 'wf-q4-ops-audit-002',
      taskId: 'T-05',
      agentId: 'verification',
      level: 'success',
      message: 'All verification checks passed. Workflow completed safely.',
    },
  ],
};

export const PRESET_OBJECTIVES = [
  {
    label: 'Client Meeting Package (Demo)',
    title: 'Client Meeting Package — Northstar Logistics',
    objective: 'Prepare a complete client meeting package for tomorrow.',
  },
  {
    label: 'Quarterly Board Ops Review',
    title: 'Q4 Operations & Risk Review',
    objective:
      'Compile a Q4 operational performance brief, audit delivery risks across engineering teams, and draft an executive summary email for leadership review.',
  },
  {
    label: 'Vendor Onboarding & Security Check',
    title: 'Vendor Onboarding Readiness',
    objective:
      'Research a prospective SaaS vendor security posture, create an internal onboarding checklist, document compliance gaps, and draft a vendor questionnaire.',
  },
];
