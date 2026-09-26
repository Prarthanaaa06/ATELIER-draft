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
} from 'lucide-react';
import { Poem, Draft } from '../types/poetry';

interface DraftTimelineProps {
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

export const DraftTimeline: React.FC<DraftTimelineProps> = ({
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
      <aside className="w-12 h-screen border-l border-paper-300 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 flex flex-col items-center py-4 justify-between select-none z-20">
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={onToggleCollapse}
            title="Expand Revision Timeline"
            className="p-2 text-paper-500 hover:text-paper-800 dark:text-ink-400 dark:hover:text-white rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="w-6 h-px bg-paper-300 dark:bg-ink-800 my-1" />
          <button
            onClick={onOpenNewDraftModal}
            title="Save New Major Draft"
            className="p-2 text-paper-700 hover:text-paper-950 dark:text-ink-300 dark:hover:text-white rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="text-[10px] font-mono text-paper-400 dark:text-ink-500 rotate-90 my-4">
            {drafts.length} DRAFTS
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 md:w-80 h-screen border-l border-paper-300 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 flex flex-col justify-between select-none z-20 text-paper-800 dark:text-ink-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-paper-200 dark:border-ink-850">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-paper-600 dark:text-ink-400 stroke-[1.5]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-paper-700 dark:text-ink-300">
              Revision History
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
        <p className="text-[11px] text-paper-500 dark:text-ink-400 leading-tight">
          Immutable draft iterations of <span className="italic font-serif">"{poem.title}"</span>
        </p>

        {/* CTA to commit new draft */}
        <button
          onClick={onOpenNewDraftModal}
          className="mt-3 w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-paper-200 hover:bg-paper-250 dark:bg-ink-850 dark:hover:bg-ink-800 text-paper-900 dark:text-ink-100 rounded border border-paper-300 dark:border-ink-700 text-xs font-medium tracking-wide transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Save New Major Draft</span>
        </button>
      </div>

      {/* Chronological Rail */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="relative pl-6">
          {/* Vertical connecting line */}
          <div className="absolute left-2.5 top-2 bottom-3 w-px bg-paper-300 dark:bg-ink-800" />

          {/* List of Drafts (most recent at top or chronological bottom-up, let's reverse for top = latest) */}
          <div className="space-y-4">
            {[...drafts].reverse().map((draft, idx) => {
              const isSelected = selectedDraftId === draft.id;
              const isLatest = draft.id === latestDraft?.id;
              const prevDraft = drafts.find((d) => d.versionNumber === draft.versionNumber - 1);

              return (
                <div key={draft.id} className="relative group">
                  {/* Timeline Node dot */}
                  <div
                    className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 transition-all ${
                      isSelected
                        ? 'bg-paper-900 dark:bg-ink-100 border-paper-900 dark:border-ink-100 ring-2 ring-paper-300 dark:ring-ink-700'
                        : isLatest
                        ? 'bg-paper-500 dark:bg-ink-400 border-paper-50 dark:bg-ink-950'
                        : 'bg-paper-200 dark:bg-ink-800 border-paper-400 dark:border-ink-600'
                    }`}
                  />

                  {/* Draft Card */}
                  <div
                    onClick={() => onSelectDraft(draft.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-paper-50 dark:bg-ink-850 border-paper-350 dark:border-ink-700 shadow-subtle'
                        : 'bg-paper-150/50 dark:bg-ink-900/60 border-paper-200/80 dark:border-ink-800/80 hover:bg-paper-50 dark:hover:bg-ink-850 hover:border-paper-300 dark:hover:border-ink-700'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-xs font-semibold text-paper-900 dark:text-ink-100">
                          {draft.versionTag || `v${draft.versionNumber}`}
                        </span>
                        {isLatest && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-paper-800 text-paper-100 dark:bg-ink-100 dark:text-ink-950 font-medium">
                            Latest
                          </span>
                        )}
                      </div>

                      {/* Read only / viewing badge */}
                      {isSelected && !isLatest && (
                        <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono flex items-center gap-0.5">
                          <Eye className="w-3 h-3" />
                          Viewing
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center space-x-1 text-[10px] text-paper-400 dark:text-ink-500 mb-2">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(draft.timestamp)}</span>
                    </div>

                    {/* Revision Note */}
                    <p className="text-xs font-serif italic text-paper-700 dark:text-ink-300 leading-relaxed border-l-2 border-paper-300 dark:border-ink-700 pl-2 py-0.5 mb-2">
                      "{draft.revisionNote || 'Draft revision'}"
                    </p>

                    {/* Meta & Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-paper-200/60 dark:border-ink-800/60 text-[10px] text-paper-400 dark:text-ink-500">
                      <span>
                        {draft.stanzas.split('\n').filter((l) => l.trim().length > 0).length} lines
                      </span>

                      <div className="flex items-center space-x-1">
                        {/* Compare with previous */}
                        {prevDraft && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDraft(draft.id);
                              onToggleDiff(prevDraft.id);
                            }}
                            title={`Compare ${draft.versionTag} with ${prevDraft.versionTag}`}
                            className="p-1 rounded hover:bg-paper-200 dark:hover:bg-ink-750 text-paper-600 dark:text-ink-300 hover:text-paper-900 dark:hover:text-white transition-colors"
                          >
                            <GitCompare className="w-3 h-3" />
                          </button>
                        )}

                        {/* Restore / Branch from this draft */}
                        {!isLatest && onRestoreDraft && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRestoreDraft(draft);
                            }}
                            title={`Branch & restore from ${draft.versionTag}`}
                            className="p-1 rounded hover:bg-paper-200 dark:hover:bg-ink-750 text-paper-600 dark:text-ink-300 hover:text-paper-900 dark:hover:text-white transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        )}

                        {/* Copy draft text */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopyDraftText(draft.stanzas);
                          }}
                          title="Copy this draft's text"
                          className="p-1 rounded hover:bg-paper-200 dark:hover:bg-ink-750 text-paper-600 dark:text-ink-300 hover:text-paper-900 dark:hover:text-white transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-paper-200 dark:border-ink-850 bg-paper-150/40 dark:bg-ink-900/40 text-[11px] text-paper-500 dark:text-ink-400 text-center">
        <span>Click any draft above to review</span>
      </div>
    </aside>
  );
};
