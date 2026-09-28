import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  FolderPlus,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  FileText,
  GitCompare,
  ArrowRight,
  Download,
  Calendar,
  Layers,
  BookOpen,
  Sparkles,
  UploadCloud,
  Check,
  X,
} from 'lucide-react';
import { Poem, Collection, Draft } from '../types/poetry';

interface ManuscriptGridProps {
  poems: Poem[];
  collections: Collection[];
  activePoemId: string | null;
  onSelectPoem: (poemId: string) => void;
  onOpenNewPoem: () => void;
  onOpenNewCollection: () => void;
  onOpenFilePicker: () => void;
  onDeletePoem: (poemId: string) => void;
  onDuplicatePoem: (poemId: string) => void;
  onUpdatePoemTitle: (poemId: string, newTitle: string) => void;
  onOpenDiff?: (poemId: string) => void;
  onShowToast?: (msg: string) => void;
}

export const ManuscriptGrid: React.FC<ManuscriptGridProps> = ({
  poems,
  collections,
  activePoemId,
  onSelectPoem,
  onOpenNewPoem,
  onOpenNewCollection,
  onOpenFilePicker,
  onDeletePoem,
  onDuplicatePoem,
  onUpdatePoemTitle,
  onOpenDiff,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeMenuPoemId, setActiveMenuPoemId] = useState<string | null>(null);
  const [editingTitlePoemId, setEditingTitlePoemId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState('');

  // Calculate statistics across all manuscripts
  const stats = useMemo(() => {
    let totalDrafts = 0;
    let totalWords = 0;
    poems.forEach((p) => {
      totalDrafts += p.drafts.length;
      const latest = p.drafts[p.drafts.length - 1];
      if (latest) {
        totalWords += latest.stanzas.trim().split(/\s+/).filter(Boolean).length;
      }
    });
    return {
      totalPoems: poems.length,
      totalDrafts,
      totalWords,
      totalCollections: collections.length,
    };
  }, [poems, collections]);

  // Filter poems by search and collection
  const filteredPoems = useMemo(() => {
    return poems.filter((poem) => {
      const matchesCollection =
        selectedCollectionId === 'all' || poem.collectionId === selectedCollectionId;
      if (!matchesCollection) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchesTitle = poem.title.toLowerCase().includes(q);
      const matchesAuthor = poem.author.toLowerCase().includes(q);
      const matchesTags = poem.tags.some((t) => t.toLowerCase().includes(q));
      const latestDraft = poem.drafts[poem.drafts.length - 1];
      const matchesStanzas = latestDraft?.stanzas.toLowerCase().includes(q);

      return matchesTitle || matchesAuthor || matchesTags || matchesStanzas;
    });
  }, [poems, selectedCollectionId, searchQuery]);

  const handleStartRename = (poem: Poem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitlePoemId(poem.id);
    setEditingTitleValue(poem.title);
    setActiveMenuPoemId(null);
  };

  const handleSaveRename = (poemId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editingTitleValue.trim()) {
      onUpdatePoemTitle(poemId, editingTitleValue.trim());
      onShowToast?.(`Renamed to "${editingTitleValue.trim()}"`);
    }
    setEditingTitlePoemId(null);
  };

  const handleExportTxt = (poem: Poem, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuPoemId(null);
    const latest = poem.drafts[poem.drafts.length - 1];
    if (!latest) return;
    const content = `${poem.title.toUpperCase()}\n${poem.subtitle ? poem.subtitle + '\n' : ''}By ${poem.author}\n\n[Draft: ${latest.versionTag} — ${new Date(latest.timestamp).toLocaleDateString()}]\n\n${latest.stanzas}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${poem.title.toLowerCase().replace(/\s+/g, '-')}-${latest.versionTag}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast?.(`Exported "${poem.title}" (.txt)`);
  };

  const handleExportMarkdown = (poem: Poem, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuPoemId(null);
    const latest = poem.drafts[poem.drafts.length - 1];
    if (!latest) return;
    const md = `# ${poem.title}\n\n*By ${poem.author}*\n\n> Draft ${latest.versionTag} — ${new Date(latest.timestamp).toLocaleDateString()}\n\n---\n\n${latest.stanzas}\n`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${poem.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast?.(`Exported "${poem.title}" (.md)`);
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diffSecs < 60) return 'Just now';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-paper-50 dark:bg-ink-950 text-paper-900 dark:text-ink-100 flex flex-col transition-colors">
      
      {/* Top Header Dashboard Bar */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-paper-50/90 dark:bg-ink-950/90 border-b border-paper-200 dark:border-ink-800 px-6 sm:px-10 py-5 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Title & Stats Summary */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-paper-500 dark:text-ink-400 mb-1">
              <span>Anthology Archive</span>
              <span>•</span>
              <span>{stats.totalPoems} Manuscripts</span>
              <span>•</span>
              <span>{stats.totalDrafts} Drafts</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-paper-950 dark:text-paper-50 tracking-tight">
              Manuscripts &amp; Drafts
            </h1>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Search Bar */}
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-paper-400 dark:text-ink-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search manuscripts... (Ctrl+K)"
                className="w-full pl-8 pr-7 py-2 text-xs bg-paper-100/80 dark:bg-ink-900 border border-paper-300/80 dark:border-ink-800 rounded-xl placeholder-paper-400 dark:placeholder-ink-500 focus:outline-none focus:ring-1 focus:ring-amber-600 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-paper-400 hover:text-paper-700 dark:hover:text-ink-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle: Grid vs List */}
            <div className="flex items-center border border-paper-300 dark:border-ink-800 rounded-xl p-0.5 bg-paper-100/70 dark:bg-ink-900">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-paper-250 dark:bg-ink-800 text-paper-950 dark:text-white shadow-xs'
                    : 'text-paper-500 hover:text-paper-800 dark:text-ink-400'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-paper-250 dark:bg-ink-800 text-paper-950 dark:text-white shadow-xs'
                    : 'text-paper-500 hover:text-paper-800 dark:text-ink-400'
                }`}
                title="List Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Import PDF/Text Button */}
            <button
              onClick={onOpenFilePicker}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 bg-paper-200 hover:bg-paper-250 dark:bg-ink-850 dark:hover:bg-ink-800 text-paper-800 dark:text-ink-200 rounded-xl border border-paper-300 dark:border-ink-750 text-xs font-medium transition-colors cursor-pointer shadow-xs"
              title="Import PDF, Word or Text Manuscript"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Import</span>
            </button>

            {/* Primary CTA: New Poem */}
            <button
              onClick={onOpenNewPoem}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-paper-900 hover:bg-black text-paper-50 dark:bg-ink-100 dark:hover:bg-white dark:text-ink-950 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-subtle hover:shadow-elevated cursor-pointer shrink-0"
              title="Create a new blank manuscript (Ctrl+N)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Manuscript</span>
            </button>
          </div>
        </div>

        {/* Collections Shelf (Horizontally Scrollable Filter Pills) */}
        <div className="max-w-6xl mx-auto mt-4 pt-3 border-t border-paper-200/60 dark:border-ink-850 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-2 shrink-0 py-0.5">
            {/* All Shelf Pill */}
            <button
              type="button"
              onClick={() => setSelectedCollectionId('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 shrink-0 ${
                selectedCollectionId === 'all'
                  ? 'bg-paper-900 text-paper-50 dark:bg-ink-100 dark:text-ink-950 shadow-xs'
                  : 'bg-paper-200/70 hover:bg-paper-200 dark:bg-ink-900 dark:hover:bg-ink-850 text-paper-700 dark:text-ink-300'
              }`}
            >
              <span>All Manuscripts</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
                {poems.length}
              </span>
            </button>

            {/* Individual Collection Pills */}
            {collections.map((col) => {
              const count = poems.filter((p) => p.collectionId === col.id).length;
              const isSelected = selectedCollectionId === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setSelectedCollectionId(col.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-paper-900 text-paper-50 dark:bg-ink-100 dark:text-ink-950 shadow-xs'
                      : 'bg-paper-200/70 hover:bg-paper-200 dark:bg-ink-900 dark:hover:bg-ink-850 text-paper-700 dark:text-ink-300 border border-paper-300/60 dark:border-ink-800'
                  }`}
                >
                  <span className="font-serif italic">{col.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Create Collection Pill */}
            <button
              type="button"
              onClick={onOpenNewCollection}
              className="px-2.5 py-1.5 rounded-full text-xs text-paper-600 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white hover:bg-paper-200 dark:hover:bg-ink-800 border border-dashed border-paper-300 dark:border-ink-750 transition-colors flex items-center space-x-1 shrink-0"
              title="Create a new collection shelf"
            >
              <Plus className="w-3 h-3" />
              <span>New Shelf</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-8 flex-1">
        
        {/* Drag & Drop Intake Banner */}
        <div
          onClick={onOpenFilePicker}
          className="mb-8 p-4 rounded-2xl border border-dashed border-paper-300 dark:border-ink-750 bg-paper-100/50 hover:bg-paper-150/60 dark:bg-ink-900/40 dark:hover:bg-ink-850/60 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-serif font-bold text-paper-900 dark:text-ink-100">
                Import and organize an existing poetry collection
              </div>
              <div className="text-[11px] text-paper-500 dark:text-ink-400">
                Drop your manuscript (.pdf, .txt, .md) anywhere or click to browse files
              </div>
            </div>
          </div>
          <span className="hidden sm:inline text-xs font-mono font-medium text-amber-700 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
            Browse files →
          </span>
        </div>

        {/* Empty State */}
        {filteredPoems.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-paper-200/80 dark:bg-ink-850 flex items-center justify-center text-paper-400 dark:text-ink-500 mb-4 shadow-inner">
              <BookOpen className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-xl font-bold text-paper-900 dark:text-ink-100">
              {searchQuery ? 'No manuscripts match your query' : 'The page awaits your first stanza'}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-paper-500 dark:text-ink-400 leading-relaxed font-sans">
              {searchQuery
                ? `No poems found for "${searchQuery}". Clear your search or create a new manuscript.`
                : 'Begin crafting a fresh poem or import an existing draft collection to organize in your anthology.'}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-paper-200 dark:bg-ink-800 text-paper-800 dark:text-ink-200 text-xs font-medium hover:bg-paper-300 transition-colors"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={onOpenNewPoem}
                  className="px-4 py-2 rounded-xl bg-paper-900 hover:bg-black text-paper-50 dark:bg-ink-100 dark:text-ink-950 text-xs font-semibold tracking-wide transition-all shadow-subtle hover:shadow"
                >
                  + New Manuscript
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* =========================================================
             MANUSCRIPT CARDS GRID VIEW
             ========================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPoems.map((poem) => {
              const latestDraft = poem.drafts[poem.drafts.length - 1];
              const collection = collections.find((c) => c.id === poem.collectionId);
              const previewLines = latestDraft?.stanzas
                .split('\n')
                .filter((l) => l.trim().length > 0)
                .slice(0, 3);
              const wordCount = latestDraft?.stanzas
                .trim()
                .split(/\s+/)
                .filter(Boolean).length || 0;
              const lineCount = latestDraft?.stanzas.split('\n').length || 0;
              const isSelected = activePoemId === poem.id;

              return (
                <div
                  key={poem.id}
                  onClick={() => onSelectPoem(poem.id)}
                  className={`group relative rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer select-none ${
                    isSelected
                      ? 'bg-paper-100 dark:bg-ink-900 border-amber-600/50 dark:border-amber-400/50 shadow-md ring-1 ring-amber-600/30'
                      : 'bg-paper-100/70 hover:bg-paper-150/80 dark:bg-ink-900/80 dark:hover:bg-ink-850 border-paper-200/90 dark:border-ink-800/90 shadow-subtle hover:shadow-elevated hover:-translate-y-0.5'
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      {/* Collection & Version Badge */}
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono text-paper-500 dark:text-ink-400">
                        <span className="uppercase tracking-widest font-serif italic text-paper-700 dark:text-ink-300">
                          {collection?.title || 'Archive'}
                        </span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 rounded bg-paper-200 dark:bg-ink-800 text-paper-700 dark:text-ink-300 font-medium">
                          {latestDraft?.versionTag || 'v1'}
                        </span>
                      </div>

                      {/* Card Context Menu Trigger */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuPoemId(activeMenuPoemId === poem.id ? null : poem.id)
                          }
                          className="p-1 rounded-lg hover:bg-paper-250 dark:hover:bg-ink-800 text-paper-400 hover:text-paper-800 dark:text-ink-500 dark:hover:text-ink-200 transition-colors"
                          title="Manuscript Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuPoemId === poem.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-paper-300 dark:border-ink-750 bg-paper-50 dark:bg-ink-900 shadow-elevated py-1 z-30 text-xs animate-fadeIn">
                            <button
                              onClick={() => {
                                onSelectPoem(poem.id);
                                setActiveMenuPoemId(null);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-paper-200 dark:hover:bg-ink-800 flex items-center space-x-2"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                              <span>Open in Atelier</span>
                            </button>
                            <button
                              onClick={(e) => handleStartRename(poem, e)}
                              className="w-full text-left px-3 py-2 hover:bg-paper-200 dark:hover:bg-ink-800 flex items-center space-x-2"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Rename Title</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuPoemId(null);
                                onDuplicatePoem(poem.id);
                                onShowToast?.(`Duplicated "${poem.title}"`);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-paper-200 dark:hover:bg-ink-800 flex items-center space-x-2"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Duplicate</span>
                            </button>
                            {poem.drafts.length > 1 && onOpenDiff && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuPoemId(null);
                                  onOpenDiff(poem.id);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-paper-200 dark:hover:bg-ink-800 flex items-center space-x-2"
                              >
                                <GitCompare className="w-3.5 h-3.5" />
                                <span>Compare Diffs</span>
                              </button>
                            )}
                            <button
                              onClick={(e) => handleExportTxt(poem, e)}
                              className="w-full text-left px-3 py-2 hover:bg-paper-200 dark:hover:bg-ink-800 flex items-center space-x-2"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Export (.txt)</span>
                            </button>
                            <button
                              onClick={(e) => handleExportMarkdown(poem, e)}
                              className="w-full text-left px-3 py-2 hover:bg-paper-200 dark:hover:bg-ink-800 flex items-center space-x-2"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Export (.md)</span>
                            </button>
                            <div className="h-px bg-paper-200 dark:bg-ink-800 my-1" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuPoemId(null);
                                if (window.confirm(`Delete "${poem.title}" permanently?`)) {
                                  onDeletePoem(poem.id);
                                  onShowToast?.(`Deleted "${poem.title}"`);
                                }
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center space-x-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Manuscript</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Editable Title */}
                    {editingTitlePoemId === poem.id ? (
                      <form
                        onSubmit={(e) => handleSaveRename(poem.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center space-x-1.5 mb-2"
                      >
                        <input
                          type="text"
                          value={editingTitleValue}
                          onChange={(e) => setEditingTitleValue(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm font-serif font-bold bg-white dark:bg-ink-900 border border-amber-600 rounded focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="p-1 rounded bg-amber-600 text-white"
                          title="Save title"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTitlePoemId(null);
                          }}
                          className="p-1 rounded text-paper-500 hover:bg-paper-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <h2 className="font-serif text-lg font-bold text-paper-950 dark:text-paper-50 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">
                        {poem.title}
                      </h2>
                    )}

                    {poem.subtitle && (
                      <p className="text-xs font-serif italic text-paper-500 dark:text-ink-400 line-clamp-1 mb-3">
                        {poem.subtitle}
                      </p>
                    )}

                    {/* Stanza Excerpt Preview */}
                    <div className="font-serif text-xs sm:text-sm text-paper-700 dark:text-ink-300 leading-relaxed italic space-y-1 py-2 border-t border-paper-200/50 dark:border-ink-800/50 opacity-90">
                      {previewLines && previewLines.length > 0 ? (
                        previewLines.map((line, idx) => (
                          <div key={idx} className="truncate">
                            {line}
                          </div>
                        ))
                      ) : (
                        <div className="text-paper-400 dark:text-ink-500 font-sans italic text-xs">
                          [Empty manuscript draft]
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Metadata */}
                  <div className="mt-4 pt-3 border-t border-paper-200/60 dark:border-ink-800/60 flex items-center justify-between text-[11px] text-paper-500 dark:text-ink-400 font-sans">
                    <div className="flex items-center space-x-2">
                      <span>{wordCount} words</span>
                      <span>•</span>
                      <span>{lineCount} lines</span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-paper-400 dark:text-ink-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatRelativeTime(latestDraft?.timestamp || poem.dateCreated)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* =========================================================
             MANUSCRIPT LIST TABLE VIEW
             ========================================================= */
          <div className="rounded-2xl border border-paper-200 dark:border-ink-800 bg-paper-100/60 dark:bg-ink-900/60 overflow-hidden divide-y divide-paper-200 dark:divide-ink-800 text-xs">
            {filteredPoems.map((poem) => {
              const latestDraft = poem.drafts[poem.drafts.length - 1];
              const collection = collections.find((c) => c.id === poem.collectionId);
              const wordCount = latestDraft?.stanzas.trim().split(/\s+/).filter(Boolean).length || 0;
              const isSelected = activePoemId === poem.id;

              return (
                <div
                  key={poem.id}
                  onClick={() => onSelectPoem(poem.id)}
                  className={`p-4 flex items-center justify-between gap-4 hover:bg-paper-150/80 dark:hover:bg-ink-850 cursor-pointer transition-colors ${
                    isSelected ? 'bg-amber-500/10 dark:bg-amber-500/10 font-medium' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-paper-200 dark:bg-ink-800 flex items-center justify-center shrink-0 text-paper-600 dark:text-ink-300">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif text-sm font-bold text-paper-950 dark:text-paper-50 truncate">
                          {poem.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-paper-200 dark:bg-ink-800 text-[10px] font-mono text-paper-600 dark:text-ink-400 shrink-0">
                          {latestDraft?.versionTag || 'v1'}
                        </span>
                      </div>
                      <div className="text-[11px] text-paper-500 dark:text-ink-400 font-serif italic truncate">
                        {poem.author} • {collection?.title || 'Archive'}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center space-x-6 text-paper-500 dark:text-ink-400 text-[11px] font-mono shrink-0">
                    <span>{wordCount} words</span>
                    <span>{poem.drafts.length} drafts</span>
                    <span>{formatRelativeTime(latestDraft?.timestamp || poem.dateCreated)}</span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPoem(poem.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-paper-250 dark:hover:bg-ink-800 text-paper-600 dark:text-ink-300"
                      title="Open in Atelier"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
};
