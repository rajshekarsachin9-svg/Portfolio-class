export type PageId = 'Overview' | 'Workflows' | 'Agents' | 'Activity' | 'Settings';

export type WorkspaceId = 'ops-desk' | 'exec-briefing';

export type AgentId =
  | 'orchestrator'
  | 'research'
  | 'documentation'
  | 'operations'
  | 'communication'
  | 'verification';

export type AgentTone = 'indigo' | 'blue' | 'cyan' | 'amber' | 'emerald' | 'rose';

export interface AgentDefinition {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  guardrails: string[];
  tone: AgentTone;
}

export type TaskStatus =
  | 'queued'
  | 'running'
  | 'retrying'
  | 'completed'
  | 'failed'
  | 'awaiting_approval'
  | 'blocked';

export type VerificationStatus = 'passed' | 'warning' | 'failed' | 'pending';

export interface VerificationCheck {
  id: string;
  label: string;
  status: VerificationStatus;
  detail: string;
}

export interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  agentId: AgentId;
  dependencies: string[];
  expectedOutput: string;
  status: TaskStatus;
  retryCount: number;
  maxRetries: number;
  durationLabel: string;
  requiresApproval?: boolean;
  approvalActionLabel?: string;
  approvalDecision?: 'pending' | 'approved' | 'rejected';
  failureReason?: string;
  verificationChecks?: VerificationCheck[];
  outputArtifactId?: string;
}

export type ArtifactType =
  | 'research_dossier'
  | 'checklist'
  | 'brief'
  | 'email_draft'
  | 'verification_report';

export interface ArtifactSection {
  heading: string;
  body?: string;
  bullets?: string[];
}

export interface Artifact {
  id: string;
  title: string;
  type: ArtifactType;
  authorAgentId: AgentId;
  createdAt: string;
  summary: string;
  kicker: string;
  subtitle: string;
  sections: ArtifactSection[];
  externalActionBlocked?: boolean;
  safetyNotice: string;
}

export type EventLevel = 'info' | 'running' | 'success' | 'warning' | 'error';

export interface ExecutionEvent {
  id: string;
  timestamp: string;
  workflowId: string;
  taskId?: string;
  agentId: AgentId;
  level: EventLevel;
  message: string;
  detail?: string;
}

export type WorkflowStatus =
  | 'planned'
  | 'running'
  | 'awaiting_approval'
  | 'completed'
  | 'failed';

export interface Workflow {
  id: string;
  code: string;
  workspaceId: WorkspaceId;
  title: string;
  objective: string;
  createdAt: string;
  status: WorkflowStatus;
  tasks: WorkflowTask[];
  artifacts: Artifact[];
  events: ExecutionEvent[];
  isDemoScenario?: boolean;
}

export interface OrchestraSettings {
  safeModeEnforced: true; // Locked in frontend prototype: never executes external writes
  requireApprovalForComms: boolean;
  requireApprovalForOps: boolean;
  maxRetries: number;
  simulateTransientFailure: boolean;
  strictVerification: boolean;
  autoAdvanceVerification: boolean;
}
