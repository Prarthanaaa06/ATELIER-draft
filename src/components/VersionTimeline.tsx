import React from 'react';
import {
  History,
  GitCommit,
  GitCompare,
  Plus,
  ChevronRight,
  ChevronLeft,
  Clock,
  FileCheck,
  Eye,
  Copy,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Poem, Draft } from '../types/poetry';

export interface VersionTimelineProps {
  poem: Poem;
  selectedDraftId: string;
  isCollapsed: boolean;
  onSelectDraft: (draftId: string) => void;
  onOpenNewDraftModal: () => void;
  onToggleDiff: (baseDraftId?: string) => void;
  onToggleCollapse: () => void;
  onCopyDraftText: (text: string) => void;
  onRestoreDraft?: (draft: Draft) => void;
}

export const VersionTimeline: React.FC<VersionTimelineProps> = ({
  poem,
  selectedDraftId,
  isCollapsed,
  onSelectDraft,
  onOpenNewDraftModal,
  onToggleDiff,
  onToggleCollapse,
  onCopyDraftText,
  onRestoreDraft,
}) => {
  const drafts = poem.drafts;
  const latestDraft = drafts[drafts.length - 1];

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  if (isCollapsed) {
    return (
      <aside className="w-12 h-screen border-l border-paper-300 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 flex flex-col items-center py-4 justify-between select-none z-20 transition-all">
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={onToggleCollapse}
            title="Expand Revision Timeline"
            className="p-2 text-paper-500 hover:text-paper-800 dark:text-ink-400 dark:hover:text-white rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="w-6 h-px bg-paper-300 dark:bg-ink-800 my-1" />
          <button
            onClick={onOpenNewDraftModal}
            title="Save New Major Draft"
            className="p-2 text-paper-700 hover:text-paper-950 dark:text-ink-300 dark:hover:text-white rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="text-[10px] font-mono text-paper-400 dark:text-ink-500 rotate-90 my-6 whitespace-nowrap tracking-widest">
            {drafts.length} DRAFTS
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 md:w-80 h-screen border-l border-paper-300 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 flex flex-col justify-between select-none z-20 text-paper-800 dark:text-ink-200 transition-all">
      {/* Drawer Header */}
      <div className="p-4 border-b border-paper-200 dark:border-ink-850">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-paper-600 dark:text-ink-400 stroke-[1.5]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-paper-700 dark:text-ink-300">
              Revision Timeline
            </h3>
          </div>
          <button
            onClick={onToggleCollapse}
            title="Collapse Timeline"
            className="p-1 text-paper-400 hover:text-paper-700 dark:text-ink-500 dark:hover:text-ink-200 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-paper-500 dark:text-ink-400 font-serif italic mb-3">
          Chronological snapshots of "{poem.title}"
        </p>

        {/* Snapshot CTA Button */}
        <button
          onClick={onOpenNewDraftModal}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-paper-900 hover:bg-black text-paper-50 dark:bg-ink-100 dark:text-ink-950 dark:hover:bg-white rounded-xl transition-all text-xs font-medium tracking-wide shadow-subtle cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Commit Snapshot Draft</span>
        </button>
      </div>

      {/* Drafts List (Timeline) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {drafts
          .slice()
          .reverse()
          .map((draft, idx) => {
            const isLatest = draft.id === latestDraft.id;
            const isSelected = draft.id === selectedDraftId;
            const wordCount = draft.stanzas.trim().split(/\s+/).filter(Boolean).length;
            const lineCount = draft.stanzas.split('\n').filter((l) => l.trim().length > 0).length;

            return (
              <div
                key={draft.id}
                className={`relative pl-4 border-l-2 transition-all rounded-r-xl p-2.5 ${
                  isSelected
                    ? 'border-amber-600 dark:border-amber-400 bg-paper-200/60 dark:bg-ink-900/90 shadow-xs'
                    : 'border-paper-300 dark:border-ink-800 hover:border-paper-400 dark:hover:border-ink-700 bg-paper-50/50 dark:bg-ink-900/30'
                }`}
              >
                {/* Node icon */}
                <div
                  className={`absolute -left-[9px] top-3.5 w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-amber-600 dark:bg-amber-400 text-white dark:text-ink-950 ring-4 ring-paper-100 dark:ring-ink-950'
                      : isLatest
                      ? 'bg-paper-400 dark:bg-ink-600 text-white'
                      : 'bg-paper-300 dark:bg-ink-800 text-paper-600 dark:text-ink-400'
                  }`}
                >
                  <GitCommit className="w-2.5 h-2.5" />
                </div>

                {/* Draft Information */}
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={() => onSelectDraft(draft.id)}
                    className="font-mono text-xs font-semibold hover:underline flex items-center space-x-1.5"
                  >
                    <span>{draft.versionTag}</span>
                    {isLatest && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-sans uppercase font-bold tracking-wider">
                        Current
                      </span>
                    )}
                  </button>
                  <span className="text-[10px] text-paper-400 dark:text-ink-500 font-mono">
                    #{draft.versionNumber}
                  </span>
                </div>

                {/* Revision Note */}
                <p
                  onClick={() => onSelectDraft(draft.id)}
                  className="text-xs text-paper-700 dark:text-ink-300 font-serif italic mb-2 cursor-pointer leading-snug"
                >
                  "{draft.revisionNote || 'Draft revision'}"
                </p>

                {/* Metadata & Actions */}
                <div className="flex items-center justify-between text-[10px] text-paper-500 dark:text-ink-500 border-t border-paper-200/60 dark:border-ink-800/60 pt-1.5 mt-1.5">
                  <div className="flex items-center space-x-1.5 font-mono">
                    <span>{wordCount}w</span>
                    <span>•</span>
                    <span>{lineCount}l</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* Compare with Current Draft */}
                    {!isLatest && (
                      <button
                        onClick={() => onToggleDiff(draft.id)}
                        title="Compare with latest draft"
                        className="p-1 rounded hover:bg-paper-300 dark:hover:bg-ink-800 text-paper-600 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white transition-colors"
                      >
                        <GitCompare className="w-3 h-3" />
                      </button>
                    )}

                    {/* Restore / Branch Snapshot */}
                    {onRestoreDraft && !isLatest && (
                      <button
                        onClick={() => onRestoreDraft(draft)}
                        title={`Branch/Restore from ${draft.versionTag}`}
                        className="p-1 rounded hover:bg-paper-300 dark:hover:bg-ink-800 text-paper-600 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}

                    {/* Copy Stanza Content */}
                    <button
                      onClick={() => onCopyDraftText(draft.stanzas)}
                      title="Copy draft stanzas"
                      className="p-1 rounded hover:bg-paper-300 dark:hover:bg-ink-800 text-paper-600 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="text-[9px] text-paper-400 dark:text-ink-500 font-mono mt-1">
                  {formatTimestamp(draft.timestamp)}
                </div>
              </div>
            );
          })}
      </div>

      {/* Drawer Footer Metrics */}
      <div className="p-3 border-t border-paper-200 dark:border-ink-850 text-center text-[10px] text-paper-500 dark:text-ink-400 font-mono">
        <span>{drafts.length} total snapshots archived</span>
      </div>
    </aside>
  );
};
