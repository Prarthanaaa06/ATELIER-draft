import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Layers,
  ArrowUpDown,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  BookOpen,
  FolderPlus,
  Folder,
  Eye,
  ChevronDown,
  ChevronUp,
  Tag,
  Hash,
  AlertCircle
} from 'lucide-react';
import { Collection } from '../types/poetry';
import {
  FileAnalysisResult,
  ParsedPoemCandidate,
  SortPreference,
  GroupPreference,
  fileParserService,
} from '../services/fileParserService';

interface OrganizeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: FileAnalysisResult | null;
  existingCollections: Collection[];
  onConfirmImport: (config: {
    selectedPoems: ParsedPoemCandidate[];
    groupMode: GroupPreference;
    collectionId?: string;
    newCollectionTitle?: string;
    newCollectionDescription?: string;
  }) => void;
}

export const OrganizeImportModal: React.FC<OrganizeImportModalProps> = ({
  isOpen,
  onClose,
  analysis,
  existingCollections,
  onConfirmImport,
}) => {
  if (!isOpen || !analysis) return null;

  // Organization Preferences
  const [groupMode, setGroupMode] = useState<GroupPreference>('new-collection');
  const [newTitle, setNewTitle] = useState(analysis.suggestedCollectionTitle);
  const [newDesc, setNewDesc] = useState(
    `Imported from "${analysis.fileName}" with automated poetic structure analysis.`
  );
  const [selectedExistingColId, setSelectedExistingColId] = useState<string>(
    existingCollections[0]?.id || ''
  );

  // Sorting Preference
  const [sortPref, setSortPref] = useState<SortPreference>('original');

  // Candidate poems local state (to allow inline title editing and selection toggles)
  const [candidates, setCandidates] = useState<ParsedPoemCandidate[]>(analysis.poems);
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null);

  // Sort candidate list based on preference
  const sortedCandidates = useMemo(() => {
    return fileParserService.sortPoems(candidates, sortPref);
  }, [candidates, sortPref]);

  const selectedCount = candidates.filter((c) => c.selected).length;

  const handleToggleSelect = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setCandidates((prev) => prev.map((c) => ({ ...c, selected: select })));
  };

  const handleUpdateTitle = (id: string, updatedTitle: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: updatedTitle } : c))
    );
  };

  const handleConfirm = () => {
    const chosen = sortedCandidates.filter((c) => c.selected);
    if (chosen.length === 0) return;

    onConfirmImport({
      selectedPoems: chosen,
      groupMode,
      collectionId: groupMode === 'existing-collection' ? selectedExistingColId : undefined,
      newCollectionTitle: newTitle.trim() || analysis.suggestedCollectionTitle,
      newCollectionDescription: newDesc.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-4xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/10 dark:bg-amber-500/10 border border-amber-600/20 dark:border-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                  Organize &amp; Import Poetry
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase font-semibold">
                  {analysis.fileType.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                From <span className="font-mono text-stone-700 dark:text-stone-300 font-medium">{analysis.fileName}</span> &bull; {analysis.poems.length} pieces identified ({analysis.totalLines} lines)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Controls Bar */}
        <div className="px-6 py-3.5 bg-white dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Grouping Strategy */}
          <div className="space-y-1.5">
            <label className="font-semibold text-stone-700 dark:text-stone-300 flex items-center space-x-1.5">
              <Folder className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Organize Into Collection:</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg">
              <button
                type="button"
                onClick={() => setGroupMode('new-collection')}
                className={`py-1.5 px-2 rounded-md font-medium transition-all text-center ${
                  groupMode === 'new-collection'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                New Collection
              </button>
              <button
                type="button"
                onClick={() => setGroupMode('existing-collection')}
                disabled={existingCollections.length === 0}
                className={`py-1.5 px-2 rounded-md font-medium transition-all text-center disabled:opacity-40 ${
                  groupMode === 'existing-collection'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Existing
              </button>
              <button
                type="button"
                onClick={() => setGroupMode('by-theme')}
                className={`py-1.5 px-2 rounded-md font-medium transition-all text-center ${
                  groupMode === 'by-theme'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Auto by Theme
              </button>
            </div>

            {groupMode === 'new-collection' && (
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="New Anthology Title"
                className="w-full mt-1.5 px-2.5 py-1.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            )}

            {groupMode === 'existing-collection' && (
              <select
                value={selectedExistingColId}
                onChange={(e) => setSelectedExistingColId(e.target.value)}
                className="w-full mt-1.5 px-2.5 py-1.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {existingCollections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            )}

            {groupMode === 'by-theme' && (
              <p className="text-[11px] text-amber-700 dark:text-amber-400 italic mt-1">
                Poems will be categorized into thematic anthologies (e.g. "Nature &amp; Landscapes", "Love &amp; Devotion").
              </p>
            )}
          </div>

          {/* Sorting Preference */}
          <div className="space-y-1.5">
            <label className="font-semibold text-stone-700 dark:text-stone-300 flex items-center space-x-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Sort Poems By:</span>
            </label>
            <select
              value={sortPref}
              onChange={(e) => setSortPref(e.target.value as SortPreference)}
              className="w-full px-2.5 py-2 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            >
              <option value="original">Original Manuscript Order (As in File)</option>
              <option value="title-asc">Title: A to Z (Alphabetical)</option>
              <option value="title-desc">Title: Z to A (Reverse Alphabetical)</option>
              <option value="length-asc">Length: Shortest First (Line Count)</option>
              <option value="length-desc">Length: Longest First (Line Count)</option>
              <option value="form">Poetic Form (Sonnet, Haiku, Quatrains...)</option>
              <option value="theme">Mood &amp; Theme (Nature, Love, Philosophy...)</option>
            </select>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Order will determine the reading index and archival sequence.
            </p>
          </div>
        </div>

        {/* Subheader: Selection Summary */}
        <div className="px-6 py-2.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/20 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <span className="font-medium text-stone-700 dark:text-stone-300">
              {selectedCount} of {candidates.length} poems selected
            </span>
            <div className="flex items-center space-x-2 border-l border-stone-300 dark:border-stone-700 pl-3">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="text-amber-700 dark:text-amber-400 hover:underline font-medium"
              >
                Select All
              </button>
              <span className="text-stone-300 dark:text-stone-600">&bull;</span>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:underline"
              >
                Deselect All
              </button>
            </div>
          </div>

          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            Click poem title to edit &bull; Expand for stanza preview
          </span>
        </div>

        {/* Main List of Detected Poems */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          {sortedCandidates.length === 0 ? (
            <div className="py-12 text-center text-stone-500 dark:text-stone-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-stone-400" />
              <p>No poems detected in this file.</p>
            </div>
          ) : (
            sortedCandidates.map((poem, idx) => {
              const isExpanded = expandedPreviewId === poem.id;

              return (
                <div
                  key={poem.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    poem.selected
                      ? 'bg-white dark:bg-stone-850 border-amber-500/40 dark:border-amber-500/30 shadow-xs'
                      : 'bg-stone-100/50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleSelect(poem.id)}
                      className="mt-1 text-amber-600 dark:text-amber-400 shrink-0"
                    >
                      {poem.selected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-400" />
                      )}
                    </button>

                    {/* Number Badge */}
                    <span className="font-mono text-xs text-stone-400 dark:text-stone-500 w-5 pt-0.5 shrink-0">
                      {idx + 1}.
                    </span>

                    {/* Title & Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <input
                          type="text"
                          value={poem.title}
                          onChange={(e) => handleUpdateTitle(poem.id, e.target.value)}
                          placeholder="Untitled Piece"
                          className="font-serif font-semibold text-sm text-stone-900 dark:text-stone-100 bg-transparent border-b border-transparent hover:border-stone-300 dark:hover:border-stone-700 focus:border-amber-500 dark:focus:border-amber-500 focus:outline-none px-1 py-0.5 -ml-1 transition-colors"
                        />

                        {/* Badges */}
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-medium">
                            {poem.detectedForm}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 font-medium">
                            {poem.lineCount} lines &bull; {poem.stanzaCount} stanzas
                          </span>
                        </div>
                      </div>

                      {/* Theme / Tags */}
                      <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                        <span className="flex items-center space-x-1 text-amber-700/90 dark:text-amber-400/90">
                          <Sparkles className="w-3 h-3" />
                          <span>{poem.primaryTheme}</span>
                        </span>
                        {poem.author && (
                          <>
                            <span>&bull;</span>
                            <span>By {poem.author}</span>
                          </>
                        )}
                        <span>&bull;</span>
                        <button
                          type="button"
                          onClick={() => setExpandedPreviewId(isExpanded ? null : poem.id)}
                          className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 flex items-center space-x-0.5"
                        >
                          <Eye className="w-3 h-3 inline mr-1" />
                          <span>{isExpanded ? 'Hide lines' : 'Preview stanzas'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {/* Expandable Preview */}
                      {isExpanded && (
                        <div className="mt-3 p-3.5 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200/80 dark:border-stone-800/80 font-serif text-xs text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                          {poem.stanzas}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-950/40 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedCount === 0}
            className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-black dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-medium text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-40 flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>
              Import &amp; Organize {selectedCount} {selectedCount === 1 ? 'Poem' : 'Poems'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
