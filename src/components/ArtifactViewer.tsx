import React from 'react';
import { FileText, Mail, ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import type { Artifact, VerificationCheck } from '../types/orchestra';
import { getAgentLabel } from '../services/orchestrationService';

interface ArtifactViewerProps {
  artifacts: Artifact[];
  selectedArtifactId: string;
  onSelectArtifact: (id: string) => void;
  verificationChecks?: VerificationCheck[];
  approvalDecision?: 'pending' | 'approved' | 'rejected';
  onApproveDraft?: () => void;
  onRejectDraft?: () => void;
}

export const ArtifactViewer: React.FC<ArtifactViewerProps> = ({
  artifacts,
  selectedArtifactId,
  onSelectArtifact,
  verificationChecks,
  approvalDecision,
  onApproveDraft,
  onRejectDraft,
}) => {
  const active =
    artifacts.find((a) => a.id === selectedArtifactId) ?? artifacts[0] ?? null;

  if (!active) {
    return (
      <div className="rounded-lg border border-[#1E2942] bg-[#0C1324] p-8 text-center">
        <p className="text-sm font-medium text-slate-300">No artifacts generated yet</p>
        <p className="mt-1 text-xs text-slate-400">
          Execute the workflow to generate briefs, checklists, drafts, and verification audits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Artifact Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#1E2942] pb-3">
        {artifacts.map((art) => {
          const isSelected = art.id === active.id;
          return (
            <button
              key={art.id}
              type="button"
              onClick={() => onSelectArtifact(art.id)}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40'
                  : 'text-slate-400 border border-transparent hover:bg-[#131D35] hover:text-slate-200'
              }`}
            >
              {art.type === 'email_draft' ? (
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              ) : art.type === 'verification_report' ? (
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{art.title}</span>
            </button>
          );
        })}
      </div>

      {/* Document Surface */}
      <div className="rounded-lg border border-[#23304D] bg-[#0B1222] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#1E2942] pb-4">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-wide text-indigo-300">
              {active.kicker}
            </p>
            <h4 className="mt-1 text-lg font-semibold text-slate-100">{active.title}</h4>
            <p className="mt-0.5 text-xs text-slate-400">
              {active.subtitle} · Authored by {getAgentLabel(active.authorAgentId)}
            </p>
          </div>
          <span className="font-mono text-xs text-slate-400 tabular-nums">
            {active.createdAt}
          </span>
        </div>

        {/* External Safety Gate Callout for Email Drafts */}
        {active.type === 'email_draft' && (
          <div className="mt-4 rounded-md border border-amber-700/50 bg-amber-950/30 p-3.5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5">
                <ShieldAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
                  aria-hidden="true"
                />
                <div className="text-xs leading-relaxed text-amber-100/90">
                  <span className="font-semibold text-amber-200">
                    Human Approval Gate · External Send Disabled:
                  </span>{' '}
                  {active.safetyNotice}
                </div>
              </div>

              {onApproveDraft && onRejectDraft && (
                <div className="flex items-center gap-2 shrink-0">
                  {approvalDecision === 'approved' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-700/60 bg-emerald-950/60 px-2.5 py-1 text-xs font-medium text-emerald-300 whitespace-nowrap">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Reviewed (Unsent)
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={onRejectDraft}
                        className="rounded-md border border-slate-700 bg-[#131C33] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 whitespace-nowrap shrink-0"
                      >
                        Request Revision
                      </button>
                      <button
                        type="button"
                        onClick={onApproveDraft}
                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 whitespace-nowrap shrink-0"
                      >
                        Approve Draft
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verification Checks Matrix when viewing Verification Report */}
        {active.type === 'verification_report' && verificationChecks && (
          <div className="mt-4 space-y-2">
            <h5 className="text-xs font-semibold text-slate-300">
              Validation & Reliability Checks
            </h5>
            <div className="divide-y divide-[#1E2942] rounded-md border border-[#1E2942] bg-[#0F172A]">
              {verificationChecks.map((check) => (
                <div
                  key={check.id}
                  className="flex items-start justify-between gap-4 px-3.5 py-2.5"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-200">{check.label}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{check.detail}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 font-mono text-[11px] font-medium whitespace-nowrap shrink-0 ${
                      check.status === 'passed'
                        ? 'text-emerald-300'
                        : check.status === 'failed'
                          ? 'text-rose-300'
                          : check.status === 'warning'
                            ? 'text-amber-300'
                            : 'text-slate-400'
                    }`}
                  >
                    {check.status === 'passed' && (
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {check.status === 'warning' && (
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {check.status === 'failed' && (
                      <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {check.status === 'pending' && (
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {check.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artifact Sections */}
        <div className="mt-5 space-y-4">
          {active.sections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <h5 className="text-xs font-semibold text-slate-200">{section.heading}</h5>
              {section.body && (
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">
                  {section.body}
                </p>
              )}
              {section.bullets && (
                <ul className="space-y-1.5 pl-4 text-sm text-slate-300 list-disc marker:text-indigo-400">
                  {section.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="leading-relaxed">
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-[#1E2942] pt-3 text-xs text-slate-400">
          {active.safetyNotice}
        </div>
      </div>
    </div>
  );
};
