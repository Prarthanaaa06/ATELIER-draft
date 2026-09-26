import React, { useState } from 'react';
import { X, Feather } from 'lucide-react';
import { Collection } from '../types/poetry';

interface NewPoemModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  defaultCollectionId?: string;
  onConfirm: (
    title: string,
    collectionId: string,
    stanzas: string,
    author: string,
    subtitle?: string,
    tags?: string[],
    initialNote?: string
  ) => void;
}

export const NewPoemModal: React.FC<NewPoemModalProps> = ({
  isOpen,
  onClose,
  collections,
  defaultCollectionId,
  onConfirm,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('Eleni Rostova');
  const [collectionId, setCollectionId] = useState(
    defaultCollectionId || (collections[0] ? collections[0].id : '')
  );
  const [stanzas, setStanzas] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [initialNote, setInitialNote] = useState('Initial handwritten manuscript');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !stanzas.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onConfirm(
      title.trim(),
      collectionId || (collections[0]?.id ?? 'col-1'),
      stanzas,
      author.trim() || 'Anonymous',
      subtitle.trim() || undefined,
      tags,
      initialNote.trim() || 'Initial manuscript'
    );

    // Reset
    setTitle('');
    setSubtitle('');
    setStanzas('');
    setTagsInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper-900/40 dark:bg-black/70 backdrop-blur-sm transition-all animate-fadeIn">
      <div 
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-paper-50 dark:bg-ink-900 border border-paper-300 dark:border-ink-700 rounded-lg shadow-elevated dark:shadow-dark-elevated p-6 text-paper-900 dark:text-ink-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-paper-200 dark:border-ink-800">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded bg-paper-200 dark:bg-ink-800 text-paper-700 dark:text-ink-300">
              <Feather className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-medium">Begin New Poem</h2>
              <p className="text-xs text-paper-500 dark:text-ink-400">Initialize poem and craft Draft v1</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-paper-400 hover:text-paper-700 dark:text-ink-400 dark:hover:text-ink-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium mb-1">
                Poem Title *
              </label>
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Winter Threshold"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 rounded focus:outline-none focus:ring-1 focus:ring-paper-600 dark:focus:ring-ink-400 font-serif text-base"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium mb-1">
                Collection / Anthology *
              </label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 rounded focus:outline-none focus:ring-1 focus:ring-paper-600 dark:focus:ring-ink-400"
              >
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium mb-1">
                Subtitle / Epigraph
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. For those who watch the snow fall"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 rounded focus:outline-none focus:ring-1 focus:ring-paper-600 dark:focus:ring-ink-400"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium mb-1">
                Poet / Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Poet Name"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 rounded focus:outline-none focus:ring-1 focus:ring-paper-600 dark:focus:ring-ink-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium">
                Initial Stanzas (Draft v1) *
              </label>
              <span className="text-[10px] text-paper-400 dark:text-ink-500">
                Preserves line breaks and empty lines
              </span>
            </div>
            <textarea
              rows={7}
              value={stanzas}
              onChange={(e) => setStanzas(e.target.value)}
              placeholder={`Write or paste your stanzas here...\n\nPreserves all line breaks and indents.`}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 rounded focus:outline-none focus:ring-1 focus:ring-paper-600 dark:focus:ring-ink-400 font-serif leading-relaxed resize-none poem-stanza-text"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="winter, silence, dusk"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 rounded focus:outline-none focus:ring-1 focus:ring-paper-600 dark:focus:ring-ink-400"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-paper-500 dark:text-ink-400 font-medium mb-1">
                Initial Note
              </label>
              <input
                type="text"
                value={initialNote}
                onChange={(e) => setInitialNote(e.target.value)}
                placeholder="Initial manuscript"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-ink-850 border border-paper-300 dark:border-ink-700 rounded focus:outline-none focus:ring-1 focus:ring-paper-600 dark:focus:ring-ink-400"
              />
            </div>
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
              disabled={!title.trim() || !stanzas.trim()}
              className="px-4 py-1.5 bg-paper-800 hover:bg-paper-900 dark:bg-ink-100 dark:hover:bg-white text-white dark:text-ink-950 rounded font-medium disabled:opacity-50 transition-colors"
            >
              Archive & Open Poem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
