import React, { useState } from 'react';
import { X, GitCommit, Sparkles } from 'lucide-react';
import { Draft } from '../types/poetry';

interface NewDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (revisionNote: string) => void;
  currentDraft?: Draft;
  nextVersionNumber: number;
}

const QUICK_NOTES = [
  'Adjusted line breaks & stanza pacing',
  'Polished cadence & internal rhymes',
  'Reworked metaphors in stanza 2',
  'Tightened the concluding couplet',
  'Sharpened sensory imagery',
  'Trimmed extraneous syllables',
];

export const NewDraftModal: React.FC<NewDraftModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentDraft,
  nextVersionNumber,
}) => {
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    onConfirm(note.trim());
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper-900/40 dark:bg-black/70 backdrop-blur-sm transition-all animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-paper-50 dark:bg-ink-900 border border-paper-300 dark:border-ink-700 rounded-lg shadow-elevated dark:shadow-dark-elevated p-6 text-paper-900 dark:text-ink-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-paper-200 dark:border-ink-800">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded bg-paper-200 dark:bg-ink-800 text-paper-700 dark:text-ink-300">
              <GitCommit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-medium tracking-tight">Save New Major Draft</h2>
              <p className="text-xs text-paper-500 dark:text-ink-400">
                Commit current verse state as <span className="font-mono font-medium">v{nextVersionNumber}</span> (from {currentDraft ? `v${currentDraft.versionNumber}` : 'scratch'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-paper-400 hover:text-paper-700 dark:text-ink-400 dark:hover:text-ink-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium mb-1.5">
              Revision Note / Editorial Log
            </label>
            <textarea
              autoFocus
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Adjusted line breaks in stanza 2, tightened closing rhyme..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 rounded focus:outline-none focus:ring-1 focus:ring-paper-600 dark:focus:ring-ink-400 font-sans resize-none"
              required
            />
          </div>

          <div>
            <div className="flex items-center space-x-1.5 text-xs text-paper-500 dark:text-ink-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick suggestions:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_NOTES.map((sugg, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setNote(sugg)}
                  className="text-xs px-2.5 py-1 rounded bg-paper-150 hover:bg-paper-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-paper-700 dark:text-ink-300 transition-colors border border-paper-200 dark:border-ink-750 text-left"
                >
                  {sugg}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-paper-200 dark:border-ink-800 flex items-center justify-between text-xs">
            <span className="text-paper-500 dark:text-ink-400 italic">
              Drafts are immutable once saved
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-paper-600 dark:text-ink-300 hover:text-paper-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!note.trim()}
                className="px-4 py-1.5 bg-paper-800 hover:bg-paper-900 dark:bg-ink-100 dark:hover:bg-white text-white dark:text-ink-950 rounded font-medium disabled:opacity-50 transition-colors"
              >
                Commit v{nextVersionNumber}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
