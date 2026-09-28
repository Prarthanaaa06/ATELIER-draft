import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  category: string;
  items: ShortcutItem[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const groups: ShortcutGroup[] = [
    {
      category: 'Writing & Editing',
      items: [
        { keys: [modKey, 'Z'], description: 'Undo last text edit or highlight' },
        { keys: [modKey, isMac ? '⇧ Z' : 'Y'], description: 'Redo previously undone change' },
        { keys: [modKey, 'S'], description: 'Save & commit draft revision' },
        { keys: [modKey, 'E'], description: 'Toggle Verse Editor / Reading View' },
      ],
    },
    {
      category: 'Anthology & Navigation',
      items: [
        { keys: [modKey, 'N'], description: 'Create a new poem' },
        { keys: [modKey, 'Shift', 'N'], description: 'Create a new collection' },
        { keys: [modKey, 'K'], description: 'Focus search bar' },
        { keys: [modKey, 'B'], description: 'Toggle sidebar collapse' },
        { keys: [modKey, 'D'], description: 'Toggle revision diff comparison' },
      ],
    },
    {
      category: 'Aesthetics & Atmosphere',
      items: [
        { keys: ['Alt', 'H'], description: 'Toggle highlighter palette' },
        { keys: ['Alt', 'Z'], description: 'Toggle distraction-free Zen mode' },
        { keys: ['Alt', 'T'], description: 'Cycle visual themes (Dark, Light, Brown, Pastel)' },
        { keys: [modKey, 'P'], description: 'Print clean manuscript page' },
        { keys: ['Esc'], description: 'Exit Zen mode / close open dialogs' },
        { keys: ['?'], description: 'Open this keyboard shortcuts guide' },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper-900/40 dark:bg-black/70 backdrop-blur-sm transition-all animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-paper-50 dark:bg-ink-900 border border-paper-300 dark:border-ink-700 rounded-2xl shadow-elevated dark:shadow-dark-elevated p-6 text-paper-900 dark:text-ink-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-paper-200 dark:border-ink-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-paper-200 dark:bg-ink-800 text-amber-700 dark:text-amber-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-paper-900 dark:text-ink-100">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-paper-500 dark:text-ink-400">
                Speed up your poetic workflow with standard keybindings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-paper-400 hover:text-paper-700 dark:text-ink-400 dark:hover:text-ink-200 rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Groups */}
        <div className="mt-5 space-y-6">
          {groups.map((group) => (
            <div key={group.category} className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-paper-500 dark:text-ink-400 font-semibold">
                {group.category}
              </h3>
              <div className="rounded-xl border border-paper-200 dark:border-ink-800 bg-white/60 dark:bg-ink-850/60 divide-y divide-paper-200/60 dark:divide-ink-800/60 text-xs">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3.5 py-2.5 hover:bg-paper-100/50 dark:hover:bg-ink-800/40 transition-colors"
                  >
                    <span className="text-paper-700 dark:text-ink-200 font-sans">
                      {item.description}
                    </span>
                    <div className="flex items-center space-x-1 shrink-0 ml-3">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-0.5 rounded-md bg-paper-200/80 dark:bg-ink-750 text-paper-800 dark:text-ink-200 font-mono text-[11px] font-medium border border-paper-300 dark:border-ink-700 shadow-2xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-paper-200 dark:border-ink-800 flex items-center justify-between text-xs text-paper-400 dark:text-ink-500">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-paper-200 dark:bg-ink-800 font-mono text-[10px]">Esc</kbd> anytime to dismiss</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-paper-900 hover:bg-black text-paper-50 dark:bg-ink-100 dark:text-ink-950 text-xs font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
