import React, { useState } from 'react';
import { X, BookOpen } from 'lucide-react';

interface NewCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string, description: string, coverMotto?: string) => void;
}

export const NewCollectionModal: React.FC<NewCollectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [motto, setMotto] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onConfirm(title, description, motto);
    setTitle('');
    setDescription('');
    setMotto('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper-900/40 dark:bg-black/70 backdrop-blur-sm transition-all animate-fadeIn">
      <div 
        className="w-full max-w-md bg-paper-50 dark:bg-ink-900 border border-paper-300 dark:border-ink-700 rounded-lg shadow-elevated dark:shadow-dark-elevated p-6 text-paper-900 dark:text-ink-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-paper-200 dark:border-ink-800">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded bg-paper-200 dark:bg-ink-800 text-paper-700 dark:text-ink-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-medium">Create Collection</h2>
              <p className="text-xs text-paper-500 dark:text-ink-400">Curate a new thematic anthology</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-paper-400 hover:text-paper-700 dark:text-ink-400 dark:hover:text-ink-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium mb-1">
              Anthology Title
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nocturnes & Soliloquies"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 rounded focus:outline-none focus:ring-1 focus:ring-paper-600 dark:focus:ring-ink-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium mb-1">
              Curatorial Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief scope of themes, forms, or emotional resonance..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 rounded focus:outline-none focus:ring-1 focus:ring-paper-600 dark:focus:ring-ink-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium mb-1">
              Epigraph / Cover Motto (Optional)
            </label>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              placeholder="e.g. In quietness we find our measure"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 rounded focus:outline-none focus:ring-1 focus:ring-paper-600 dark:focus:ring-ink-400"
            />
          </div>

          <div className="pt-3 border-t border-paper-200 dark:border-ink-800 flex items-center justify-end space-x-2 text-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-paper-600 dark:text-ink-300 hover:text-paper-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-1.5 bg-paper-800 hover:bg-paper-900 dark:bg-ink-100 dark:hover:bg-white text-white dark:text-ink-950 rounded font-medium disabled:opacity-50 transition-colors"
            >
              Create Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
