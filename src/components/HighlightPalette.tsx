import React from 'react';
import { Highlighter, Eraser, Trash2, X, Check } from 'lucide-react';

export type HighlightColorId = 'amber' | 'sage' | 'rose' | 'sky' | 'lavender' | 'terracotta';

export interface TextHighlight {
  id: string;
  start: number;
  end: number;
  text: string;
  color: HighlightColorId;
}

export interface HighlightColor {
  id: HighlightColorId;
  name: string;
  dotHex: string;
  ringClass: string;
  badgeClass: string;
  spanClass: string;
}

export const HIGHLIGHT_PALETTE: HighlightColor[] = [
  {
    id: 'amber',
    name: 'Sunlit Amber',
    dotHex: '#f59e0b',
    ringClass: 'ring-amber-500',
    badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    spanClass:
      'bg-amber-300/40 text-paper-950 dark:bg-amber-400/30 dark:text-amber-100 border-b-2 border-amber-500/70',
  },
  {
    id: 'sage',
    name: 'Sage Celadon',
    dotHex: '#10b981',
    ringClass: 'ring-emerald-500',
    badgeClass: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    spanClass:
      'bg-emerald-300/40 text-paper-950 dark:bg-emerald-400/30 dark:text-emerald-100 border-b-2 border-emerald-500/70',
  },
  {
    id: 'rose',
    name: 'Blush Rose',
    dotHex: '#f43f5e',
    ringClass: 'ring-rose-500',
    badgeClass: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30',
    spanClass:
      'bg-rose-300/40 text-paper-950 dark:bg-rose-400/30 dark:text-rose-100 border-b-2 border-rose-500/70',
  },
  {
    id: 'sky',
    name: 'Azure Sky',
    dotHex: '#0ea5e9',
    ringClass: 'ring-sky-500',
    badgeClass: 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30',
    spanClass:
      'bg-sky-300/40 text-paper-950 dark:bg-sky-400/30 dark:text-sky-100 border-b-2 border-sky-500/70',
  },
  {
    id: 'lavender',
    name: 'Wild Lavender',
    dotHex: '#a855f7',
    ringClass: 'ring-purple-500',
    badgeClass: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
    spanClass:
      'bg-purple-300/40 text-paper-950 dark:bg-purple-400/30 dark:text-purple-100 border-b-2 border-purple-500/70',
  },
  {
    id: 'terracotta',
    name: 'Warm Terracotta',
    dotHex: '#ea580c',
    ringClass: 'ring-orange-500',
    badgeClass: 'bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30',
    spanClass:
      'bg-orange-300/40 text-paper-950 dark:bg-orange-400/30 dark:text-orange-100 border-b-2 border-orange-500/70',
  },
];

export const getHighlightColor = (colorId?: string): HighlightColor => {
  return HIGHLIGHT_PALETTE.find((c) => c.id === colorId) || HIGHLIGHT_PALETTE[0];
};

export interface TextSegment {
  key: string;
  text: string;
  highlight?: TextHighlight;
}

/**
 * Splits the manuscript string into non-overlapping plain and highlighted segments.
 */
export const getHighlightedSegments = (
  fullText: string,
  highlights: TextHighlight[]
): TextSegment[] => {
  if (!highlights || highlights.length === 0) {
    return [{ key: 'segment-all', text: fullText }];
  }

  // Filter valid highlights within text boundaries and sort by start index
  const sorted = [...highlights]
    .filter((h) => h.start >= 0 && h.end <= fullText.length && h.start < h.end)
    .sort((a, b) => a.start - b.start);

  if (sorted.length === 0) {
    return [{ key: 'segment-all', text: fullText }];
  }

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (let i = 0; i < sorted.length; i++) {
    const hl = sorted[i];

    // If there is gap before this highlight
    if (hl.start > cursor) {
      segments.push({
        key: `plain-${cursor}-${hl.start}`,
        text: fullText.slice(cursor, hl.start),
      });
    }

    // Ensure we don't back-track if overlapping
    const safeStart = Math.max(cursor, hl.start);
    if (hl.end > safeStart) {
      segments.push({
        key: `hl-${hl.id}-${safeStart}`,
        text: fullText.slice(safeStart, hl.end),
        highlight: hl,
      });
      cursor = hl.end;
    }
  }

  // Any remaining plain text after last highlight
  if (cursor < fullText.length) {
    segments.push({
      key: `plain-${cursor}-${fullText.length}`,
      text: fullText.slice(cursor),
    });
  }

  return segments;
};

/**
 * Inserts or updates a highlight, replacing any directly overlapping highlights.
 */
export const addOrUpdateHighlight = (
  existing: TextHighlight[],
  newHl: TextHighlight
): TextHighlight[] => {
  const nonOverlapping = existing.filter(
    (h) => Math.max(h.start, newHl.start) >= Math.min(h.end, newHl.end)
  );
  return [...nonOverlapping, newHl].sort((a, b) => a.start - b.start);
};

export const removeHighlightById = (
  existing: TextHighlight[],
  id: string
): TextHighlight[] => {
  return existing.filter((h) => h.id !== id);
};

interface FloatingHighlightMenuProps {
  x: number;
  y: number;
  selectedText: string;
  activeColor?: HighlightColorId;
  isExisting: boolean;
  onSelectColor: (color: HighlightColorId) => void;
  onRemove?: () => void;
  onClose: () => void;
}

/**
 * Floating luxury palette popover that anchors directly above selected text.
 */
export const FloatingHighlightMenu: React.FC<FloatingHighlightMenuProps> = ({
  x,
  y,
  selectedText,
  activeColor = 'amber',
  isExisting,
  onSelectColor,
  onRemove,
  onClose,
}) => {
  return (
    <div
      className="fixed z-50 animate-fadeIn pointer-events-auto select-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -100%)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative mb-2 flex items-center space-x-1.5 p-1.5 px-2 bg-stone-900/95 dark:bg-stone-950/95 text-stone-100 rounded-full shadow-2xl border border-stone-700/60 backdrop-blur-md">
        <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 pl-1 pr-0.5">
          {isExisting ? 'Edit' : 'Highlight'}
        </span>

        <div className="w-px h-3.5 bg-stone-700 mx-0.5" />

        {/* 6 Palette Color Dots */}
        {HIGHLIGHT_PALETTE.map((c) => {
          const isSelected = activeColor === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectColor(c.id)}
              className={`w-6 h-6 rounded-full relative flex items-center justify-center transition-transform hover:scale-120 active:scale-95 shadow-sm ${
                isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-stone-900 scale-105' : 'opacity-90 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.dotHex }}
              title={`Highlight with ${c.name}`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />}
            </button>
          );
        })}

        {/* Remove/Erase button if editing an existing highlight */}
        {isExisting && onRemove && (
          <>
            <div className="w-px h-3.5 bg-stone-700 mx-0.5" />
            <button
              type="button"
              onClick={onRemove}
              className="p-1 rounded-full hover:bg-stone-800 text-stone-400 hover:text-rose-400 transition-colors"
              title="Remove highlight"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          title="Dismiss"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Downward pointing triangle caret */}
        <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-stone-900/95 border-r border-b border-stone-700/60 rotate-45" />
      </div>
    </div>
  );
};

interface HighlightToolbarProps {
  isOpen: boolean;
  onClose: () => void;
  activeColor: HighlightColorId;
  onSelectColor: (color: HighlightColorId) => void;
  highlightedCount: number;
  onClearAll: () => void;
}

/**
 * Top floating control banner for section highlighting guidance and color switching.
 */
export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  isOpen,
  onClose,
  activeColor,
  onSelectColor,
  highlightedCount,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const currentColor = getHighlightColor(activeColor);

  return (
    <div className="max-w-2xl w-full mx-auto mb-6 p-2.5 sm:p-3 rounded-2xl bg-paper-100/90 dark:bg-ink-850/90 border border-paper-300/80 dark:border-ink-750 shadow-elevated dark:shadow-dark-elevated backdrop-blur-md animate-fadeIn flex flex-wrap items-center justify-between gap-3 text-xs no-print select-none">
      {/* Left: Tool mode badge & instructions */}
      <div className="flex items-center space-x-2.5">
        <div
          className={`p-1.5 rounded-lg border flex items-center justify-center transition-colors ${currentColor.badgeClass}`}
        >
          <Highlighter className="w-4 h-4" style={{ color: currentColor.dotHex }} />
        </div>
        <div>
          <div className="font-semibold text-paper-900 dark:text-ink-100 flex items-center gap-1.5">
            <span>Passage Highlighter</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-paper-250 dark:bg-ink-800 text-paper-600 dark:text-ink-400">
              Active
            </span>
          </div>
          <p className="text-[11px] text-paper-500 dark:text-ink-400">
            Select any words, phrases, or stanzas with your cursor to highlight.
          </p>
        </div>
      </div>

      {/* Center: Swatches */}
      <div className="flex items-center space-x-1.5 bg-paper-50/80 dark:bg-ink-900/80 p-1 rounded-xl border border-paper-200/80 dark:border-ink-800 shadow-inner">
        {HIGHLIGHT_PALETTE.map((c) => {
          const isSelected = activeColor === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectColor(c.id)}
              className={`relative group p-1 rounded-lg transition-transform hover:scale-110 flex items-center justify-center ${
                isSelected
                  ? 'ring-2 ring-offset-1 ring-offset-paper-50 dark:ring-offset-ink-900 ' + c.ringClass
                  : 'opacity-85 hover:opacity-100'
              }`}
              title={`Default color: ${c.name}`}
            >
              <span
                className="w-5 h-5 rounded-full inline-block shadow-xs border border-black/10 dark:border-white/10"
                style={{ backgroundColor: c.dotHex }}
              />
              {isSelected && (
                <Check className="w-3 h-3 text-white absolute drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right: Count, Clear All, and Dismiss */}
      <div className="flex items-center space-x-2">
        {highlightedCount > 0 && (
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-mono text-paper-500 dark:text-ink-400">
              {highlightedCount} {highlightedCount === 1 ? 'passage' : 'passages'}
            </span>
            <button
              type="button"
              onClick={onClearAll}
              title="Clear all text highlights in this poem"
              className="p-1 text-paper-400 hover:text-rose-600 dark:text-ink-500 dark:hover:text-rose-400 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-paper-400 hover:text-paper-700 dark:text-ink-500 dark:hover:text-ink-200 hover:bg-paper-200/60 dark:hover:bg-ink-800 transition-colors"
          title="Close highlighter toolbar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
