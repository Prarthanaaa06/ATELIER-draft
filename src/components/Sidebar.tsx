import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Folder,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  FolderPlus,
  FileText,
  RotateCcw,
  Download,
  Upload,
  Feather,
  Cloud,
} from 'lucide-react';
import { Collection, Poem, ViewFilter } from '../types/poetry';
import { UserProfile } from '../services/authService';
import { SyncStatus } from '../services/cloudSyncService';

interface SidebarProps {
  collections: Collection[];
  poems: Poem[];
  activePoemId: string | null;
  filter: ViewFilter;
  isCollapsed: boolean;
  isDarkMode: boolean;
  currentUser?: UserProfile | null;
  syncStatus?: SyncStatus;
  lastSyncedTime?: Date | null;
  onOpenAccountModal?: () => void;
  onOpenFilePicker?: () => void;
  onSelectPoem: (poemId: string) => void;
  onSelectFilter: (filter: ViewFilter) => void;
  onToggleCollapse: () => void;
  onToggleDarkMode: () => void;
  onOpenNewPoem: () => void;
  onOpenNewCollection: () => void;
  onResetData: () => void;
  onExportJson: () => void;
  onImportJson: (json: string) => void;
}

const GoogleGIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.31 21.41 7.37 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.31 2.59 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({
  collections,
  poems,
  activePoemId,
  filter,
  isCollapsed,
  isDarkMode,
  currentUser,
  syncStatus = 'guest',
  lastSyncedTime,
  onOpenAccountModal,
  onOpenFilePicker,
  onSelectPoem,
  onSelectFilter,
  onToggleCollapse,
  onToggleDarkMode,
  onOpenNewPoem,
  onOpenNewCollection,
  onResetData,
  onExportJson,
  onImportJson,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollectionsExpanded, setIsCollectionsExpanded] = useState(true);

  // Filter poems based on active collection and search query
  const filteredPoems = useMemo(() => {
    return poems.filter((poem) => {
      // Collection filter
      if (filter.type === 'collection' && filter.collectionId) {
        if (poem.collectionId !== filter.collectionId) return false;
      }

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = poem.title.toLowerCase().includes(q);
      const subtitleMatch = poem.subtitle?.toLowerCase().includes(q);
      const tagMatch = poem.tags.some((t) => t.toLowerCase().includes(q));
      const contentMatch = poem.drafts.some((d) => d.stanzas.toLowerCase().includes(q));
      return titleMatch || subtitleMatch || tagMatch || contentMatch;
    });
  }, [poems, filter, searchQuery]);

  const activeCollection = collections.find((c) => c.id === filter.collectionId);

  // Hidden file input for importing JSON archive
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onImportJson(content);
        }
      };
      reader.readAsText(file);
    }
  };

  if (isCollapsed) {
    return (
      <aside className="w-14 h-screen border-r border-paper-300 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 flex flex-col items-center py-4 justify-between select-none z-20">
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={onToggleCollapse}
            title="Expand Sidebar"
            className="p-2 text-paper-500 hover:text-paper-800 dark:text-ink-400 dark:hover:text-white rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="w-6 h-px bg-paper-300 dark:bg-ink-800 my-1" />
          <button
            onClick={() => onSelectFilter({ type: 'all' })}
            title="All Poems"
            className={`p-2 rounded transition-colors ${
              filter.type === 'all'
                ? 'bg-paper-200 dark:bg-ink-800 text-paper-900 dark:text-white'
                : 'text-paper-500 hover:text-paper-800 dark:text-ink-400'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenNewPoem}
            title="New Poem"
            className="p-2 text-paper-600 hover:text-paper-900 dark:text-ink-300 dark:hover:text-white rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenFilePicker}
            title="Import & Organize PDF or Manuscript"
            className="p-2 text-paper-600 hover:text-paper-900 dark:text-ink-300 dark:hover:text-white rounded transition-colors"
          >
            <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </button>
        </div>

        <div className="flex flex-col items-center space-y-3">
          {/* Account & Sync button */}
          <button
            onClick={onOpenAccountModal}
            title={currentUser ? `${currentUser.displayName || 'Google Account'} (${syncStatus})` : 'Sign in with Google'}
            className="p-2 text-paper-500 hover:text-paper-800 dark:text-ink-400 dark:hover:text-white rounded transition-colors relative"
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Google User"
                className="w-5 h-5 rounded-full object-cover border border-amber-500/50"
              />
            ) : (
              <Cloud className="w-4 h-4" />
            )}
            <span
              className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                syncStatus === 'synced'
                  ? 'bg-emerald-500'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-stone-400'
              }`}
            />
          </button>

          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Paper Mode' : 'Ink Mode'}
            className="p-2 text-paper-500 hover:text-paper-800 dark:text-ink-400 dark:hover:text-white rounded transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 md:w-80 h-screen border-r border-paper-300 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 flex flex-col justify-between select-none z-20 text-paper-800 dark:text-ink-200">
      {/* Top Header & Brand */}
      <div className="p-4 border-b border-paper-200 dark:border-ink-850">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="font-serif text-lg tracking-wider font-semibold text-paper-900 dark:text-ink-100 flex items-center gap-1.5">
              <Feather className="w-4 h-4 text-paper-600 dark:text-ink-400 stroke-[1.5]" />
              ATELIER
            </span>
            <span className="text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded bg-paper-200 dark:bg-ink-800 text-paper-600 dark:text-ink-400 font-mono">
              ARCHIVE
            </span>
          </div>
          <button
            onClick={onToggleCollapse}
            title="Collapse Sidebar"
            className="p-1 text-paper-400 hover:text-paper-700 dark:text-ink-500 dark:hover:text-ink-200 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Google Cloud Sync Account Widget */}
        <div className="mb-3">
          {currentUser ? (
            <button
              onClick={onOpenAccountModal}
              className="w-full p-2 rounded-xl bg-paper-200/70 hover:bg-paper-200 dark:bg-ink-900/80 dark:hover:bg-ink-850 border border-paper-300/80 dark:border-ink-800 transition-all flex items-center justify-between group text-left shadow-xs"
              title="Click to view Google Account & Sync Settings"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-7 h-7 rounded-full object-cover border border-amber-500/40 shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-paper-900 dark:text-ink-100 truncate">
                    {currentUser.displayName || currentUser.email || 'Google User'}
                  </div>
                  <div className="text-[10px] text-paper-500 dark:text-ink-400 flex items-center space-x-1.5">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        syncStatus === 'synced'
                          ? 'bg-emerald-500'
                          : syncStatus === 'syncing'
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-stone-400'
                      }`}
                    />
                    <span className="truncate">
                      {syncStatus === 'synced'
                        ? 'Google Synced'
                        : syncStatus === 'syncing'
                        ? 'Syncing to Cloud...'
                        : 'Offline cache'}
                    </span>
                  </div>
                </div>
              </div>
              <Cloud className="w-3.5 h-3.5 text-paper-400 dark:text-ink-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 shrink-0 transition-colors ml-1" />
            </button>
          ) : (
            <button
              onClick={onOpenAccountModal}
              className="w-full py-2 px-2.5 rounded-xl bg-white hover:bg-paper-50 dark:bg-ink-900 dark:hover:bg-ink-850 border border-paper-300 dark:border-ink-800 shadow-xs transition-all flex items-center justify-between group text-left"
              title="Sign in with Google to sync poems across devices"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <GoogleGIcon />
                <div className="text-left min-w-0">
                  <div className="text-xs font-semibold text-paper-900 dark:text-ink-100 leading-tight">
                    Sign in with Google
                  </div>
                  <div className="text-[10px] text-paper-500 dark:text-ink-400 leading-tight">
                    Cloud backup &amp; sync
                  </div>
                </div>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 shrink-0">
                Sync
              </span>
            </button>
          )}
        </div>

        {/* Action Buttons: New Poem & Import PDF */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={onOpenNewPoem}
            className="flex items-center justify-center space-x-1.5 px-2.5 py-2 bg-paper-900 hover:bg-black text-paper-50 dark:bg-ink-100 dark:text-ink-950 dark:hover:bg-white rounded-lg transition-colors text-xs font-medium tracking-wide shadow-subtle"
            title="Create a new blank poem draft"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Poem</span>
          </button>
          <button
            onClick={onOpenFilePicker}
            className="flex items-center justify-center space-x-1.5 px-2.5 py-2 bg-paper-200/90 hover:bg-paper-300/80 dark:bg-ink-900 dark:hover:bg-ink-800 text-paper-800 dark:text-ink-200 border border-paper-300/80 dark:border-ink-800 rounded-lg transition-colors text-xs font-medium tracking-wide shadow-xs"
            title="Drop or upload a PDF or text manuscript to sort and organize"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Import PDF</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-paper-400 dark:text-ink-500" />
          <input
            type="text"
            placeholder="Search titles, stanzas, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-paper-50 dark:bg-ink-900 border border-paper-300 dark:border-ink-800 rounded placeholder-paper-400 dark:placeholder-ink-600 focus:outline-none focus:ring-1 focus:ring-paper-600 dark:focus:ring-ink-400 transition-colors"
          />
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {/* Collections Overview */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-medium tracking-wider uppercase text-paper-500 dark:text-ink-500">
            <button
              onClick={() => setIsCollectionsExpanded(!isCollectionsExpanded)}
              className="hover:text-paper-900 dark:hover:text-ink-300 flex items-center space-x-1"
            >
              <span>Collections</span>
            </button>
            <button
              onClick={onOpenNewCollection}
              title="Create Collection"
              className="hover:text-paper-900 dark:hover:text-ink-200 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-1 space-y-0.5">
            {/* All Poems Item */}
            <button
              onClick={() => onSelectFilter({ type: 'all' })}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors ${
                filter.type === 'all'
                  ? 'bg-paper-250 dark:bg-ink-800/80 text-paper-900 dark:text-white font-medium shadow-subtle'
                  : 'text-paper-600 dark:text-ink-400 hover:bg-paper-200/60 dark:hover:bg-ink-900 hover:text-paper-900 dark:hover:text-ink-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5" />
                <span>All Poems</span>
              </div>
              <span className="text-[11px] font-mono text-paper-400 dark:text-ink-500">
                {poems.length}
              </span>
            </button>

            {/* Individual Collections */}
            {isCollectionsExpanded &&
              collections.map((col) => {
                const count = poems.filter((p) => p.collectionId === col.id).length;
                const isSelected = filter.type === 'collection' && filter.collectionId === col.id;
                return (
                  <button
                    key={col.id}
                    onClick={() => onSelectFilter({ type: 'collection', collectionId: col.id })}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors ${
                      isSelected
                        ? 'bg-paper-250 dark:bg-ink-800/80 text-paper-900 dark:text-white font-medium shadow-subtle'
                        : 'text-paper-600 dark:text-ink-400 hover:bg-paper-200/60 dark:hover:bg-ink-900 hover:text-paper-900 dark:hover:text-ink-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <Folder className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{col.title}</span>
                    </div>
                    <span className="text-[11px] font-mono text-paper-400 dark:text-ink-500">
                      {count}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-paper-200 dark:bg-ink-850 mx-1" />

        {/* Poems List */}
        <div>
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-medium tracking-wider uppercase text-paper-500 dark:text-ink-500">
            <span>
              {filter.type === 'all'
                ? 'Poems'
                : activeCollection
                ? activeCollection.title
                : 'Collection'}
            </span>
            <span className="text-[10px] font-mono">
              {filteredPoems.length} {filteredPoems.length === 1 ? 'piece' : 'pieces'}
            </span>
          </div>

          <div className="mt-1 space-y-1">
            {filteredPoems.length === 0 ? (
              <div className="p-4 text-center text-xs text-paper-400 dark:text-ink-600 italic">
                No verses found
              </div>
            ) : (
              filteredPoems.map((poem) => {
                const isSelected = activePoemId === poem.id;
                const latestDraft = poem.drafts[poem.drafts.length - 1];
                const draftCount = poem.drafts.length;

                return (
                  <div
                    key={poem.id}
                    onClick={() => onSelectPoem(poem.id)}
                    className={`group relative p-2.5 rounded cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-paper-50 dark:bg-ink-850 border-paper-300 dark:border-ink-700 shadow-subtle'
                        : 'border-transparent hover:bg-paper-150/70 dark:hover:bg-ink-900 text-paper-700 dark:text-ink-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4
                        className={`text-sm font-serif leading-snug line-clamp-1 ${
                          isSelected
                            ? 'font-semibold text-paper-950 dark:text-ink-50'
                            : 'font-medium group-hover:text-paper-950 dark:group-hover:text-white'
                        }`}
                      >
                        {poem.title}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-paper-200 dark:bg-ink-800 text-paper-600 dark:text-ink-400 shrink-0 ml-1">
                        {latestDraft?.versionTag || `v${draftCount}`}
                      </span>
                    </div>

                    {poem.subtitle && (
                      <p className="text-[11px] font-serif italic text-paper-500 dark:text-ink-400 line-clamp-1 mt-0.5">
                        {poem.subtitle}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-paper-200/50 dark:border-ink-800/60 text-[10px] text-paper-400 dark:text-ink-500">
                      <span>{poem.author || 'Anonymous'}</span>
                      <span className="font-mono">
                        {draftCount} {draftCount === 1 ? 'draft' : 'drafts'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer Utility Bar */}
      <div className="p-3 border-t border-paper-200 dark:border-ink-850 bg-paper-150/50 dark:bg-ink-900/50 text-xs">
        <div className="flex items-center justify-between">
          {/* Dark / Light Mode Switch */}
          <button
            onClick={onToggleDarkMode}
            className="flex items-center space-x-1.5 px-2 py-1 rounded hover:bg-paper-200 dark:hover:bg-ink-800 text-paper-600 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white transition-colors"
            title="Toggle theme (Warm Paper / Ink)"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{isDarkMode ? 'Paper' : 'Ink'}</span>
          </button>

          {/* Archive Utilities */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onOpenAccountModal}
              title={`Cloud Sync: ${syncStatus}`}
              className="p-1 rounded hover:bg-paper-200 dark:hover:bg-ink-800 text-paper-500 dark:text-ink-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors relative"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span
                className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-500'
                    : syncStatus === 'syncing'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-stone-400'
                }`}
              />
            </button>
            <button
              onClick={onExportJson}
              title="Export Archive (JSON)"
              className="p-1 rounded hover:bg-paper-200 dark:hover:bg-ink-800 text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import Archive (JSON)"
              className="p-1 rounded hover:bg-paper-200 dark:hover:bg-ink-800 text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={onResetData}
              title="Reset to Sample Mock Data"
              className="p-1 rounded hover:bg-paper-200 dark:hover:bg-ink-800 text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
