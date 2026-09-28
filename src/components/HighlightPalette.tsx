import React from 'react';
import { Highlighter, Eraser, Trash2, X, Check, Sparkles } from 'lucide-react';

export type HighlightColorId = 'amber' | 'sage' | 'rose' | 'sky' | 'lavender' | 'terracotta';

export interface HighlightColor {
  id: HighlightColorId;
  name: string;
  dotHex: string;
  ringClass: string;
  badgeClass: string;
  lineStyle: string;
}

export const HIGHLIGHT_PALETTE: HighlightColor[] = [
  {
    id: 'amber',
    name: 'Sunlit Amber',
    dotHex: '#f59e0b',
    ringClass: 'ring-amber-500',
    badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    lineStyle:
      'bg-amber-400/20 dark:bg-amber-400/25 border-l-[3px] border-amber-500 dark:border-amber-400 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.18)]',
  },
  {
    id: 'sage',
    name: 'Sage Celadon',
    dotHex: '#10b981',
    ringClass: 'ring-emerald-500',
    badgeClass: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    lineStyle:
      'bg-emerald-500/20 dark:bg-emerald-400/25 border-l-[3px] border-emerald-500 dark:border-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.18)]',
  },
  {
    id: 'rose',
    name: 'Blush Rose',
    dotHex: '#f43f5e',
    ringClass: 'ring-rose-500',
    badgeClass: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30',
    lineStyle:
      'bg-rose-500/20 dark:bg-rose-400/25 border-l-[3px] border-rose-500 dark:border-rose-400 shadow-[inset_0_0_0_1px_rgba(244,63,94,0.18)]',
  },
  {
    id: 'sky',
    name: 'Azure Sky',
    dotHex: '#0ea5e9',
    ringClass: 'ring-sky-500',
    badgeClass: 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30',
    lineStyle:
      'bg-sky-500/20 dark:bg-sky-400/25 border-l-[3px] border-sky-500 dark:border-sky-400 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.18)]',
  },
  {
    id: 'lavender',
    name: 'Wild Lavender',
    dotHex: '#a855f7',
    ringClass: 'ring-purple-500',
    badgeClass: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
    lineStyle:
      'bg-purple-500/20 dark:bg-purple-400/25 border-l-[3px] border-purple-500 dark:border-purple-400 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.18)]',
  },
  {
    id: 'terracotta',
    name: 'Warm Terracotta',
    dotHex: '#ea580c',
    ringClass: 'ring-orange-500',
    badgeClass: 'bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30',
    lineStyle:
      'bg-orange-500/20 dark:bg-orange-400/25 border-l-[3px] border-orange-500 dark:border-orange-400 shadow-[inset_0_0_0_1px_rgba(234,88,12,0.18)]',
  },
];

export const getHighlightLineStyle = (colorId?: string): string => {
  if (!colorId) return '';
  const match = HIGHLIGHT_PALETTE.find((c) => c.id === colorId);
  return match ? match.lineStyle : '';
};

export const getHighlightColor = (colorId?: string): HighlightColor | undefined => {
  return HIGHLIGHT_PALETTE.find((c) => c.id === colorId);
};

interface HighlightToolbarProps {
  isOpen: boolean;
  onClose: () => void;
  activeColor: HighlightColorId;
  onSelectColor: (color: HighlightColorId) => void;
  isEraserActive: boolean;
  onToggleEraser: () => void;
  highlightedCount: number;
  onClearAll: () => void;
}

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  isOpen,
  onClose,
  activeColor,
  onSelectColor,
  isEraserActive,
  onToggleEraser,
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
          className={`p-1.5 rounded-lg border flex items-center justify-center transition-colors ${
            isEraserActive
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : currentColor?.badgeClass || 'bg-amber-500/10 text-amber-700'
          }`}
        >
          {isEraserActive ? (
            <Eraser className="w-4 h-4" />
          ) : (
            <Highlighter className="w-4 h-4" style={{ color: currentColor?.dotHex }} />
          )}
        </div>
        <div>
          <div className="font-semibold text-paper-900 dark:text-ink-100 flex items-center gap-1.5">
            <span>Highlighter Palette</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-paper-250 dark:bg-ink-800 text-paper-600 dark:text-ink-400">
              Active
            </span>
          </div>
          <p className="text-[11px] text-paper-500 dark:text-ink-400">
            {isEraserActive
              ? 'Eraser tool selected — click any line to remove its highlight.'
              : `Click any verse line to highlight in ${currentColor?.name || 'color'}.`}
          </p>
        </div>
      </div>

      {/* Center: Swatches & Eraser */}
      <div className="flex items-center space-x-1.5 bg-paper-50/80 dark:bg-ink-900/80 p-1 rounded-xl border border-paper-200/80 dark:border-ink-800 shadow-inner">
        {HIGHLIGHT_PALETTE.map((c) => {
          const isSelected = !isEraserActive && activeColor === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelectColor(c.id)}
              className={`relative group p-1 rounded-lg transition-transform hover:scale-110 flex items-center justify-center ${
                isSelected
                  ? 'ring-2 ring-offset-1 ring-offset-paper-50 dark:ring-offset-ink-900 ' + c.ringClass
                  : 'opacity-85 hover:opacity-100'
              }`}
              title={`Select ${c.name}`}
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

        <div className="w-px h-4 bg-paper-200 dark:bg-ink-750 mx-0.5" />

        {/* Eraser Button */}
        <button
          onClick={onToggleEraser}
          title="Eraser tool (click any line to erase highlight)"
          className={`p-1.5 rounded-lg text-paper-600 dark:text-ink-400 hover:text-paper-950 dark:hover:text-white transition-all flex items-center justify-center ${
            isEraserActive
              ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500 ring-offset-1 ring-offset-paper-50 dark:ring-offset-ink-900 font-medium'
              : 'hover:bg-paper-200/60 dark:hover:bg-ink-800'
          }`}
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Count, Clear All, and Dismiss */}
      <div className="flex items-center space-x-2">
        {highlightedCount > 0 && (
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-mono text-paper-500 dark:text-ink-400">
              {highlightedCount} {highlightedCount === 1 ? 'line' : 'lines'}
            </span>
            <button
              onClick={onClearAll}
              title="Clear all line highlights for this poem"
              className="p-1 text-paper-400 hover:text-rose-600 dark:text-ink-500 dark:hover:text-rose-400 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
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

interface LineHighlightMenuProps {
  currentHighlight?: string;
  onSelectColor: (color: HighlightColorId) => void;
  onRemove: () => void;
  onClose: () => void;
}

export const LineHighlightMenu: React.FC<LineHighlightMenuProps> = ({
  currentHighlight,
  onSelectColor,
  onRemove,
  onClose,
}) => {
  return (
    <div
      className="absolute -top-10 left-0 z-30 flex items-center space-x-1 p-1 bg-white dark:bg-ink-850 rounded-xl shadow-elevated border border-paper-300 dark:border-ink-700 animate-fadeIn select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {HIGHLIGHT_PALETTE.map((c) => {
        const isSelected = currentHighlight === c.id;
        return (
          <button
            key={c.id}
            onClick={() => {
              onSelectColor(c.id);
              onClose();
            }}
            className={`w-5 h-5 rounded-full relative flex items-center justify-center transition-transform hover:scale-115 ${
              isSelected ? 'ring-2 ring-offset-1 ' + c.ringClass : ''
            }`}
            style={{ backgroundColor: c.dotHex }}
            title={c.name}
          >
            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
          </button>
        );
      })}

      {currentHighlight && (
        <>
          <div className="w-px h-3.5 bg-paper-200 dark:bg-ink-700 mx-0.5" />
          <button
            onClick={() => {
              onRemove();
              onClose();
            }}
            className="p-1 text-paper-400 hover:text-rose-500 dark:text-ink-400 dark:hover:text-rose-400 rounded transition-colors"
            title="Remove highlight"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </>
      )}

      <button
        onClick={onClose}
        className="p-1 text-paper-400 hover:text-paper-700 dark:text-ink-500 dark:hover:text-ink-300 rounded transition-colors"
        title="Close"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
