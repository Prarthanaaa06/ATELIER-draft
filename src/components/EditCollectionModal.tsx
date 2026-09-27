import React, { useState, useEffect } from 'react';
import { X, Folder, Trash2, Check, AlertTriangle } from 'lucide-react';
import { Collection } from '../types/poetry';

interface EditCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection | null;
  onConfirm: (collectionId: string, title: string, description: string, coverMotto?: string) => void;
  onDelete?: (collectionId: string) => void;
}

export const EditCollectionModal: React.FC<EditCollectionModalProps> = ({
  isOpen,
  onClose,
  collection,
  onConfirm,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [motto, setMotto] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (collection) {
      setTitle(collection.title || '');
      setDescription(collection.description || '');
      setMotto(collection.coverMotto || '');
      setShowDeleteConfirm(false);
    }
  }, [collection, isOpen]);

  if (!isOpen || !collection) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onConfirm(collection.id, title.trim(), description.trim(), motto.trim() || undefined);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(collection.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper-900/40 dark:bg-black/70 backdrop-blur-sm transition-all animate-fadeIn">
      <div
        className="w-full max-w-md bg-paper-50 dark:bg-ink-900 border border-paper-300 dark:border-ink-700 rounded-2xl shadow-elevated dark:shadow-dark-elevated p-6 text-paper-900 dark:text-ink-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-paper-200 dark:border-ink-800">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-paper-200 dark:bg-ink-800 text-paper-700 dark:text-ink-300">
              <Folder className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-paper-900 dark:text-ink-100">
                Edit Collection
              </h2>
              <p className="text-xs text-paper-500 dark:text-ink-400">
                Rename and refine collection metadata
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-paper-400 hover:text-paper-700 dark:text-ink-400 dark:hover:text-ink-200 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium mb-1">
              Anthology Title *
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nocturnes & Solitudes"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-serif text-base"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium mb-1">
              Description / Scope
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief scope of themes, forms, or emotional resonance..."
              className="w-full px-3 py-2 text-xs bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium mb-1">
              Epigraph / Cover Motto
            </label>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              placeholder="e.g. In silence, the verse takes root"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-serif italic"
            />
          </div>

          {showDeleteConfirm ? (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center space-x-2 text-red-700 dark:text-red-400 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Delete this collection?</span>
              </div>
              <p className="text-[11px] text-red-600/90 dark:text-red-300/80">
                Poems inside this collection will become uncategorized.
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium text-xs transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 bg-paper-200 dark:bg-ink-800 text-paper-700 dark:text-ink-300 rounded-md font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between pt-3 border-t border-paper-200 dark:border-ink-800">
            {onDelete && !showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-1.5 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                title="Delete this collection"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs rounded-lg border border-paper-300 dark:border-ink-700 hover:bg-paper-150 dark:hover:bg-ink-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-paper-900 hover:bg-black text-paper-50 dark:bg-ink-100 dark:hover:bg-white dark:text-ink-950 text-xs font-medium rounded-lg transition-colors shadow-subtle disabled:opacity-40"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
