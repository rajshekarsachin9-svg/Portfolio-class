import React from 'react';
import { ChevronRight, Menu, Plus, Search, ShieldCheck } from 'lucide-react';
import type { PageId } from '../types/orchestra';

interface TopBarProps {
  activePage: PageId;
  workspaceName: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenMobileMenu: () => void;
  onOpenComposer: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activePage,
  workspaceName,
  searchQuery,
  onSearchChange,
  onOpenMobileMenu,
  onOpenComposer,
}) => {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-[#1E2942] bg-[#080D1A]/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Left: Mobile Trigger + Breadcrumb */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="rounded-md p-2 text-slate-400 hover:bg-[#141E36] hover:text-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
          <span className="hidden truncate text-slate-400 sm:inline">
            {workspaceName}
          </span>
          <ChevronRight
            className="hidden h-4 w-4 shrink-0 text-slate-600 sm:inline"
            aria-hidden="true"
          />
          <span className="truncate font-semibold text-slate-100">{activePage}</span>
        </nav>
      </div>

      {/* Right: Search + Safe Mode + Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative hidden md:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter tasks or logs…"
            aria-label="Filter tasks or activity logs"
            className="w-48 rounded-lg border border-[#1E2942] bg-[#0F172A] py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none lg:w-60"
          />
        </div>

        <span className="hidden items-center gap-1.5 text-xs text-slate-400 xl:inline-flex whitespace-nowrap shrink-0">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
          <span>Safe Sandbox</span>
        </span>

        <button
          type="button"
          onClick={onOpenComposer}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 whitespace-nowrap shrink-0"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>New Workflow</span>
        </button>
      </div>
    </header>
  );
};
