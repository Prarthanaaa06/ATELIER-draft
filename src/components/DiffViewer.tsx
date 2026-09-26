import React, { useState } from 'react';
import {
  X,
  Columns,
  AlignLeft,
  ArrowRight,
  GitCompare,
  Plus,
  Minus,
} from 'lucide-react';
import { Poem, Draft } from '../types/poetry';
import {
  computeSideBySideDiff,
  computeUnifiedDiff,
  getDiffStats,
} from '../utils/diffHelper';

interface DiffViewerProps {
  poem: Poem;
  currentDraftId: string;
  initialBaseDraftId?: string;
  onClose: () => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  poem,
  currentDraftId,
  initialBaseDraftId,
  onClose,
}) => {
  const drafts = poem.drafts;

  // Determine current draft object
  const currentDraft = drafts.find((d) => d.id === currentDraftId) || drafts[drafts.length - 1];

  // Determine default base draft (preceding version if available, or previous in array)
  const defaultBaseDraftId =
    initialBaseDraftId ||
    drafts.find((d) => d.versionNumber === currentDraft.versionNumber - 1)?.id ||
    (drafts.length > 1 ? drafts[0].id : currentDraft.id);

  const [baseDraftId, setBaseDraftId] = useState<string>(defaultBaseDraftId);
  const [targetDraftId, setTargetDraftId] = useState<string>(currentDraft.id);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');

  const baseDraft = drafts.find((d) => d.id === baseDraftId) || drafts[0];
  const targetDraft = drafts.find((d) => d.id === targetDraftId) || currentDraft;

  // Compute diffs
  const sideBySideRows = computeSideBySideDiff(baseDraft.stanzas, targetDraft.stanzas);
  const unifiedRows = computeUnifiedDiff(baseDraft.stanzas, targetDraft.stanzas);
  const { additions, deletions } = getDiffStats(baseDraft.stanzas, targetDraft.stanzas);

  return (
    <div className="flex-1 flex flex-col h-screen bg-paper-50 dark:bg-ink-900 text-paper-900 dark:text-ink-100 overflow-hidden">
      {/* Diff Header Bar */}
      <div className="px-6 py-3 border-b border-paper-300 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded bg-paper-200 dark:bg-ink-800 text-paper-700 dark:text-ink-300">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight flex items-center gap-1.5">
              <span>Compare Versions</span>
              <span className="text-paper-400 dark:text-ink-600">—</span>
              <span className="font-serif italic">{poem.title}</span>
            </h2>
            <div className="flex items-center space-x-2 text-xs text-paper-500 dark:text-ink-400 mt-0.5">
              <span className="flex items-center text-green-700 dark:text-green-400">
                <Plus className="w-3 h-3 mr-0.5" />
                {additions} {additions === 1 ? 'line added' : 'lines added'}
              </span>
              <span>•</span>
              <span className="flex items-center text-red-700 dark:text-red-400">
                <Minus className="w-3 h-3 mr-0.5" />
                {deletions} {deletions === 1 ? 'line removed' : 'lines removed'}
              </span>
            </div>
          </div>
        </div>

        {/* Draft Pickers and Mode Switcher */}
        <div className="flex items-center space-x-3">
          {/* Base vs Target Selectors */}
          <div className="flex items-center space-x-1.5 text-xs bg-paper-200/60 dark:bg-ink-850 p-1 rounded border border-paper-300 dark:border-ink-750">
            <select
              value={baseDraftId}
              onChange={(e) => setBaseDraftId(e.target.value)}
              className="bg-paper-50 dark:bg-ink-900 px-2 py-1 rounded text-paper-800 dark:text-ink-200 border-none focus:outline-none font-mono text-xs cursor-pointer"
            >
              {drafts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.versionTag} (v{d.versionNumber})
                </option>
              ))}
            </select>

            <ArrowRight className="w-3.5 h-3.5 text-paper-400 dark:text-ink-500" />

            <select
              value={targetDraftId}
              onChange={(e) => setTargetDraftId(e.target.value)}
              className="bg-paper-50 dark:bg-ink-900 px-2 py-1 rounded text-paper-800 dark:text-ink-200 border-none focus:outline-none font-mono text-xs cursor-pointer"
            >
              {drafts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.versionTag} (v{d.versionNumber})
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-0.5 bg-paper-200/70 dark:bg-ink-850 p-0.5 rounded border border-paper-300 dark:border-ink-750">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`p-1.5 rounded text-xs transition-colors flex items-center space-x-1 ${
                viewMode === 'side-by-side'
                  ? 'bg-paper-50 dark:bg-ink-700 text-paper-900 dark:text-white shadow-subtle'
                  : 'text-paper-500 hover:text-paper-800 dark:text-ink-400'
              }`}
              title="Side by Side Columns"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Side by Side</span>
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`p-1.5 rounded text-xs transition-colors flex items-center space-x-1 ${
                viewMode === 'unified'
                  ? 'bg-paper-50 dark:bg-ink-700 text-paper-900 dark:text-white shadow-subtle'
                  : 'text-paper-500 hover:text-paper-800 dark:text-ink-400'
              }`}
              title="Unified Inline"
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Inline</span>
            </button>
          </div>

          {/* Close Diff View */}
          <button
            onClick={onClose}
            title="Return to Reading Canvas"
            className="p-1.5 text-paper-500 hover:text-paper-900 dark:text-ink-400 dark:hover:text-white rounded hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comparison Details Banner */}
      <div className="px-6 py-2 bg-paper-150/70 dark:bg-ink-950/70 border-b border-paper-200 dark:border-ink-850 grid grid-cols-2 text-xs">
        <div className="pr-4 border-r border-paper-200 dark:border-ink-800 flex items-center justify-between">
          <div>
            <span className="font-semibold text-paper-800 dark:text-ink-200 font-mono">
              {baseDraft.versionTag}
            </span>
            <span className="ml-2 text-paper-500 dark:text-ink-400 italic font-serif">
              "{baseDraft.revisionNote}"
            </span>
          </div>
          <span className="text-[10px] text-paper-400 dark:text-ink-500 font-mono">
            {new Date(baseDraft.timestamp).toLocaleDateString()}
          </span>
        </div>
        <div className="pl-4 flex items-center justify-between">
          <div>
            <span className="font-semibold text-paper-800 dark:text-ink-200 font-mono">
              {targetDraft.versionTag}
            </span>
            <span className="ml-2 text-paper-500 dark:text-ink-400 italic font-serif">
              "{targetDraft.revisionNote}"
            </span>
          </div>
          <span className="text-[10px] text-paper-400 dark:text-ink-500 font-mono">
            {new Date(targetDraft.timestamp).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Main Diff Content Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto bg-paper-50 dark:bg-ink-900 border border-paper-300 dark:border-ink-800 rounded-lg shadow-subtle overflow-hidden">
          {viewMode === 'side-by-side' ? (
            /* Side By Side View */
            <div className="divide-y divide-paper-200 dark:divide-ink-850 text-sm font-serif">
              {sideBySideRows.map((row, idx) => {
                const hasLeft = Boolean(row.left);
                const hasRight = Boolean(row.right);

                return (
                  <div key={idx} className="grid grid-cols-2 divide-x divide-paper-200 dark:divide-ink-800">
                    {/* Left Column (Base) */}
                    <div
                      className={`p-2.5 flex items-start space-x-3 text-base leading-relaxed ${
                        !hasLeft
                          ? 'bg-paper-150/40 dark:bg-ink-950/40'
                          : row.left?.type === 'removed'
                          ? 'bg-red-500/10 dark:bg-red-950/20 text-red-900 dark:text-red-300'
                          : row.left?.type === 'modified'
                          ? 'bg-amber-500/10 dark:bg-amber-950/20'
                          : 'text-paper-800 dark:text-ink-200'
                      }`}
                    >
                      <span className="w-6 shrink-0 text-right text-[11px] font-mono text-paper-400 dark:text-ink-600 select-none pt-0.5">
                        {row.left?.lineNumber ?? ''}
                      </span>
                      <div className="flex-1 whitespace-pre-wrap poem-stanza-text">
                        {row.left?.type === 'modified' && row.left.words ? (
                          row.left.words.map((w, wIdx) => (
                            <span
                              key={wIdx}
                              className={w.type === 'removed' ? 'diff-del' : ''}
                            >
                              {w.text}
                            </span>
                          ))
                        ) : row.left?.type === 'removed' ? (
                          <span className="diff-del">{row.left.text}</span>
                        ) : (
                          row.left?.text || '\u00A0'
                        )}
                      </div>
                    </div>

                    {/* Right Column (Target) */}
                    <div
                      className={`p-2.5 flex items-start space-x-3 text-base leading-relaxed ${
                        !hasRight
                          ? 'bg-paper-150/40 dark:bg-ink-950/40'
                          : row.right?.type === 'added'
                          ? 'bg-green-500/10 dark:bg-green-950/20 text-green-900 dark:text-green-300'
                          : row.right?.type === 'modified'
                          ? 'bg-amber-500/10 dark:bg-amber-950/20'
                          : 'text-paper-800 dark:text-ink-200'
                      }`}
                    >
                      <span className="w-6 shrink-0 text-right text-[11px] font-mono text-paper-400 dark:text-ink-600 select-none pt-0.5">
                        {row.right?.lineNumber ?? ''}
                      </span>
                      <div className="flex-1 whitespace-pre-wrap poem-stanza-text">
                        {row.right?.type === 'modified' && row.right.words ? (
                          row.right.words.map((w, wIdx) => (
                            <span
                              key={wIdx}
                              className={w.type === 'added' ? 'diff-add font-medium' : ''}
                            >
                              {w.text}
                            </span>
                          ))
                        ) : row.right?.type === 'added' ? (
                          <span className="diff-add font-medium">{row.right.text}</span>
                        ) : (
                          row.right?.text || '\u00A0'
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Unified Inline View */
            <div className="divide-y divide-paper-200 dark:divide-ink-850 text-sm font-serif">
              {unifiedRows.map((line, idx) => {
                const isAdd = line.type === 'added';
                const isDel = line.type === 'removed';
                const isEmpty = line.type === 'empty';

                return (
                  <div
                    key={idx}
                    className={`flex items-start space-x-3 p-2.5 text-base leading-relaxed ${
                      isAdd
                        ? 'bg-green-500/10 dark:bg-green-950/20 text-green-900 dark:text-green-300'
                        : isDel
                        ? 'bg-red-500/10 dark:bg-red-950/20 text-red-900 dark:text-red-300'
                        : isEmpty
                        ? 'py-2 bg-transparent'
                        : 'text-paper-800 dark:text-ink-200'
                    }`}
                  >
                    {/* Line indicators */}
                    <div className="w-14 shrink-0 flex items-center justify-between text-[11px] font-mono text-paper-400 dark:text-ink-600 select-none pt-0.5">
                      <span className="w-5 text-right">{line.leftLineNumber ?? ''}</span>
                      <span className="w-5 text-right">{line.rightLineNumber ?? ''}</span>
                      <span className="w-3 text-center font-bold">
                        {isAdd ? '+' : isDel ? '-' : ' '}
                      </span>
                    </div>

                    <div className="flex-1 whitespace-pre-wrap poem-stanza-text">
                      {isAdd ? (
                        <span className="diff-add">{line.content}</span>
                      ) : isDel ? (
                        <span className="diff-del">{line.content}</span>
                      ) : (
                        line.content || '\u00A0'
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
