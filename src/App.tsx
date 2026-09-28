import React, { useState, useEffect, useRef } from 'react';
import { Collection, Poem, Draft, ViewFilter, AppTheme } from './types/poetry';
import { storageService } from './services/storageService';
import { authService, UserProfile } from './services/authService';
import { cloudSyncService, SyncStatus } from './services/cloudSyncService';
import {
  fileParserService,
  FileAnalysisResult,
  ParsedPoemCandidate,
  GroupPreference,
} from './services/fileParserService';
import { Sidebar } from './components/Sidebar';
import { PoemCanvas } from './components/PoemCanvas';
import { DraftTimeline } from './components/DraftTimeline';
import { DiffViewer } from './components/DiffViewer';
import { NewDraftModal } from './components/NewDraftModal';
import { NewPoemModal } from './components/NewPoemModal';
import { NewCollectionModal } from './components/NewCollectionModal';
import { EditCollectionModal } from './components/EditCollectionModal';
import { UserAccountModal } from './components/UserAccountModal';
import { OrganizeImportModal } from './components/OrganizeImportModal';
import { DropZoneOverlay } from './components/DropZoneOverlay';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { AuthPortal } from './components/AuthPortal';
import { ManuscriptGrid } from './components/ManuscriptGrid';
import { EditorStage } from './components/EditorStage';
import { VersionTimeline } from './components/VersionTimeline';
import {
  Cloud,
  LayoutGrid,
  Edit3,
  Keyboard,
  LogOut,
  LogIn,
  ChevronDown,
} from 'lucide-react';

export const App: React.FC = () => {
  // --- Persistent & Core State ---
  const [collections, setCollections] = useState<Collection[]>(() => storageService.getCollections());
  const [poems, setPoems] = useState<Poem[]>(() => storageService.getPoems());
  const [activePoemId, setActivePoemId] = useState<string>(() => {
    const list = storageService.getPoems();
    return list.length > 0 ? list[0].id : '';
  });

  // --- Auth & Cloud Sync State ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => cloudSyncService.getSyncStatus().status);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date | null>(() => cloudSyncService.getSyncStatus().lastSynced);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isAuthPortalOpen, setIsAuthPortalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // --- Central Workspace View Mode ---
  const [viewMode, setViewMode] = useState<'dashboard' | 'atelier'>('dashboard');

  // --- Drag & Drop / File Intake State ---
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const [fileAnalysis, setFileAnalysis] = useState<FileAnalysisResult | null>(null);
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const poetryFileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to auth, sync status, and storage changes
  useEffect(() => {
    const unsubAuth = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    const unsubSync = cloudSyncService.onSyncStatusChange((status, lastSynced) => {
      setSyncStatus(status);
      setLastSyncedTime(lastSynced);
    });
    const unsubStorage = storageService.onStorageChange(() => {
      const cols = storageService.getCollections();
      const pms = storageService.getPoems();
      setCollections(cols);
      setPoems(pms);
    });
    return () => {
      unsubAuth();
      unsubSync();
      unsubStorage();
    };
  }, []);

  const activePoem = poems.find((p) => p.id === activePoemId) || poems[0];

  // Selected draft ID (for draft switcher / viewing past versions)
  const [selectedDraftId, setSelectedDraftId] = useState<string>(() => {
    if (activePoem && activePoem.drafts.length > 0) {
      return activePoem.drafts[activePoem.drafts.length - 1].id;
    }
    return '';
  });

  // Keep selectedDraftId in sync when active poem changes
  useEffect(() => {
    if (activePoem && activePoem.drafts.length > 0) {
      // Check if selectedDraftId belongs to active poem
      const exists = activePoem.drafts.some((d) => d.id === selectedDraftId);
      if (!exists) {
        setSelectedDraftId(activePoem.drafts[activePoem.drafts.length - 1].id);
      }
    }
  }, [activePoemId]);

  // Working draft stanzas for live editing
  const [workingStanzas, setWorkingStanzas] = useState<string>('');

  useEffect(() => {
    if (activePoem) {
      const draft = activePoem.drafts.find((d) => d.id === selectedDraftId) || activePoem.drafts[activePoem.drafts.length - 1];
      if (draft) {
        setWorkingStanzas(draft.stanzas);
      }
    }
  }, [activePoemId, selectedDraftId]);

  // --- UI Layout & Navigation State ---
  const [filter, setFilter] = useState<ViewFilter>({ type: 'all' });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [diffBaseDraftId, setDiffBaseDraftId] = useState<string | undefined>(undefined);

  // --- Theme State (dark, light, brown, pastel) ---
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => storageService.getAppTheme());

  useEffect(() => {
    storageService.saveAppTheme(currentTheme);
    const root = document.documentElement;
    root.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [currentTheme]);

  const handleSelectTheme = (theme: AppTheme) => {
    setCurrentTheme(theme);
    const names: Record<AppTheme, string> = {
      brown: 'Brown (Warm Parchment)',
      light: 'Light (Minimal Studio)',
      dark: 'Dark (Midnight Ink)',
      pastel: 'Pastel (Dreamy Reverie)',
    };
    showToast(`Theme switched to ${names[theme]}`);
  };

  const isDarkMode = currentTheme === 'dark';

  // --- Modals State ---
  const [isNewDraftModalOpen, setIsNewDraftModalOpen] = useState(false);
  const [isNewPoemModalOpen, setIsNewPoemModalOpen] = useState(false);
  const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [isEditCollectionOpen, setIsEditCollectionOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active Draft resolution
  const latestDraft = activePoem?.drafts[activePoem.drafts.length - 1];
  const selectedDraft = activePoem?.drafts.find((d) => d.id === selectedDraftId) || latestDraft;
  const isLatestDraft = selectedDraft?.id === latestDraft?.id;

  const activeCollection = collections.find((c) => c.id === activePoem?.collectionId);

  // --- Handlers ---
  const handleSelectPoem = (poemId: string) => {
    setActivePoemId(poemId);
    const targetPoem = poems.find((p) => p.id === poemId);
    if (targetPoem && targetPoem.drafts.length > 0) {
      setSelectedDraftId(targetPoem.drafts[targetPoem.drafts.length - 1].id);
    }
    setIsDiffOpen(false);
  };

  const handleSelectDraft = (draftId: string) => {
    setSelectedDraftId(draftId);
    setIsDiffOpen(false);
  };

  const handleJumpToLatestDraft = () => {
    if (latestDraft) {
      setSelectedDraftId(latestDraft.id);
    }
  };

  const handleOpenDiff = (baseDraftId?: string) => {
    setDiffBaseDraftId(baseDraftId);
    setIsDiffOpen(true);
  };

  const handleCommitNewDraft = (revisionNote: string) => {
    if (!activePoem) return;
    try {
      const newDraft = storageService.addDraft(activePoem.id, workingStanzas, revisionNote);
      const updatedPoems = storageService.getPoems();
      setPoems(updatedPoems);
      setSelectedDraftId(newDraft.id);
      showToast(`Saved draft ${newDraft.versionTag} to revision history.`);
    } catch (e) {
      console.error(e);
      showToast('Error committing draft.');
    }
  };

  const handleCreatePoem = (
    title: string,
    collectionId: string,
    stanzas: string,
    author: string,
    subtitle?: string,
    tags?: string[],
    initialNote?: string
  ) => {
    const newPoem = storageService.createPoem(
      title,
      collectionId,
      stanzas,
      author,
      subtitle,
      tags,
      initialNote
    );
    const updated = storageService.getPoems();
    setPoems(updated);
    setActivePoemId(newPoem.id);
    setSelectedDraftId(newPoem.drafts[0].id);
    setWorkingStanzas(stanzas);
    setViewMode('atelier');
    showToast(`Archived "${title}" with Draft v1.`);
  };

  const handleDeletePoem = (poemId: string) => {
    storageService.deletePoem(poemId);
    const updated = storageService.getPoems();
    setPoems(updated);
    if (activePoemId === poemId) {
      if (updated.length > 0) {
        setActivePoemId(updated[0].id);
        setSelectedDraftId(updated[0].drafts[updated[0].drafts.length - 1].id);
      } else {
        setActivePoemId('');
      }
    }
    showToast('Manuscript deleted from archive');
  };

  const handleDuplicatePoem = (poemId: string) => {
    const dup = storageService.duplicatePoem(poemId);
    if (dup) {
      const updated = storageService.getPoems();
      setPoems(updated);
      setActivePoemId(dup.id);
      setSelectedDraftId(dup.drafts[dup.drafts.length - 1].id);
      showToast(`Duplicated as "${dup.title}"`);
    }
  };

  const handleCreateCollection = (title: string, description: string, motto?: string) => {
    const newCol = storageService.createCollection(title, description, motto);
    setCollections(storageService.getCollections());
    setFilter({ type: 'collection', collectionId: newCol.id });
    showToast(`Created collection "${title}".`);
  };

  const handleUpdatePoemTitle = (poemId: string, newTitle: string) => {
    storageService.updatePoemMetadata(poemId, { title: newTitle });
    const updated = storageService.getPoems();
    setPoems(updated);
    showToast(`Renamed poem to "${newTitle}".`);
  };

  const handleOpenEditCollection = (col: Collection) => {
    setEditingCollection(col);
    setIsEditCollectionOpen(true);
  };

  const handleConfirmEditCollection = (
    collectionId: string,
    title: string,
    description: string,
    coverMotto?: string
  ) => {
    storageService.updateCollection(collectionId, {
      title,
      description,
      coverMotto,
    });
    setCollections(storageService.getCollections());
    showToast(`Updated collection "${title}".`);
  };

  const handleDeleteCollection = (collectionId: string) => {
    const colToDelete = collections.find((c) => c.id === collectionId);
    storageService.deleteCollection(collectionId);
    setCollections(storageService.getCollections());
    if (filter.type === 'collection' && filter.collectionId === collectionId) {
      setFilter({ type: 'all' });
    }
    showToast(`Deleted collection "${colToDelete?.title || 'Collection'}".`);
  };

  const handleResetData = () => {
    if (window.confirm('Reset archive to initial mock collections and multi-draft poems?')) {
      storageService.resetToMockData();
      const newCollections = storageService.getCollections();
      const newPoems = storageService.getPoems();
      setCollections(newCollections);
      setPoems(newPoems);
      if (newPoems.length > 0) {
        setActivePoemId(newPoems[0].id);
        setSelectedDraftId(newPoems[0].drafts[newPoems[0].drafts.length - 1].id);
      }
      setFilter({ type: 'all' });
      showToast('Archive reset to original sample anthologies.');
    }
  };

  const handleExportJson = () => {
    const json = storageService.exportArchiveJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poetry-archive-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported complete archive as JSON.');
  };

  const handleImportJson = (jsonString: string) => {
    const success = storageService.importArchiveJson(jsonString);
    if (success) {
      const updatedCols = storageService.getCollections();
      const updatedPoems = storageService.getPoems();
      setCollections(updatedCols);
      setPoems(updatedPoems);
      if (updatedPoems.length > 0) {
        setActivePoemId(updatedPoems[0].id);
        setSelectedDraftId(updatedPoems[0].drafts[updatedPoems[0].drafts.length - 1].id);
      }
      showToast('Archive successfully imported.');
    } else {
      showToast('Invalid archive JSON file.');
    }
  };

  const handleCopyStanzas = (stanzas: string) => {
    navigator.clipboard.writeText(stanzas);
    showToast('Copied draft text to clipboard.');
  };

  const handleBranchFromDraft = (draft: Draft) => {
    setWorkingStanzas(draft.stanzas);
    if (latestDraft) {
      setSelectedDraftId(latestDraft.id);
    }
    setIsNewDraftModalOpen(true);
    showToast(`Loaded ${draft.versionTag} into editor. Ready to commit new revision.`);
  };

  // --- File Intake & Smart Organization Handlers ---
  const handleProcessFile = async (file: File) => {
    try {
      showToast(`Analyzing "${file.name}"...`);
      const result = await fileParserService.parseFile(file);
      setFileAnalysis(result);
      setIsOrganizeModalOpen(true);
    } catch (err: any) {
      console.error('File parse error:', err);
      showToast(`Failed to parse file: ${err.message || 'Unknown format'}`);
    }
  };

  const handleConfirmImport = (config: {
    selectedPoems: ParsedPoemCandidate[];
    groupMode: GroupPreference;
    collectionId?: string;
    newCollectionTitle?: string;
    newCollectionDescription?: string;
  }) => {
    const { selectedPoems, groupMode, collectionId, newCollectionTitle, newCollectionDescription } = config;
    if (selectedPoems.length === 0) return;

    let targetCollectionId = collectionId;

    if (groupMode === 'new-collection') {
      const col = storageService.createCollection(
        newCollectionTitle || 'Imported Anthology',
        newCollectionDescription || 'Imported from manuscript',
        'Archived Anthology'
      );
      targetCollectionId = col.id;
    }

    let firstCreatedPoemId: string | null = null;

    if (groupMode === 'by-theme') {
      // Group poems by theme into distinct thematic collections
      const byTheme: Record<string, ParsedPoemCandidate[]> = {};
      selectedPoems.forEach((p) => {
        const theme = p.primaryTheme || 'General Anthology';
        if (!byTheme[theme]) byTheme[theme] = [];
        byTheme[theme].push(p);
      });

      Object.entries(byTheme).forEach(([theme, themePoems]) => {
        const col = storageService.createCollection(
          theme,
          `Curated poems themed around ${theme.toLowerCase()}.`,
          'Thematic Volume'
        );
        themePoems.forEach((poem) => {
          const newP = storageService.createPoem(
            poem.title,
            col.id,
            poem.stanzas,
            poem.author || 'Anonymous',
            undefined,
            poem.suggestedTags,
            'Imported manuscript draft'
          );
          if (!firstCreatedPoemId) firstCreatedPoemId = newP.id;
        });
      });
    } else {
      // Single collection destination
      selectedPoems.forEach((poem) => {
        const newP = storageService.createPoem(
          poem.title,
          targetCollectionId || collections[0]?.id || '',
          poem.stanzas,
          poem.author || 'Anonymous',
          undefined,
          poem.suggestedTags,
          'Imported manuscript draft'
        );
        if (!firstCreatedPoemId) firstCreatedPoemId = newP.id;
      });
    }

    const updatedCols = storageService.getCollections();
    const updatedPoems = storageService.getPoems();
    setCollections(updatedCols);
    setPoems(updatedPoems);

    if (targetCollectionId) {
      setFilter({ type: 'collection', collectionId: targetCollectionId });
    } else {
      setFilter({ type: 'all' });
    }

    if (firstCreatedPoemId) {
      setActivePoemId(firstCreatedPoemId);
      const target = updatedPoems.find((p) => p.id === firstCreatedPoemId);
      if (target && target.drafts.length > 0) {
        setSelectedDraftId(target.drafts[target.drafts.length - 1].id);
      }
    }

    showToast(`Organized & imported ${selectedPoems.length} poems into your archive!`);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      // Esc: Dismiss modals if any are open
      if (e.key === 'Escape') {
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
        if (isOrganizeModalOpen) {
          setIsOrganizeModalOpen(false);
          return;
        }
        if (isAccountModalOpen) {
          setIsAccountModalOpen(false);
          return;
        }
        if (isEditCollectionOpen) {
          setIsEditCollectionOpen(false);
          return;
        }
        if (isNewCollectionModalOpen) {
          setIsNewCollectionModalOpen(false);
          return;
        }
        if (isNewPoemModalOpen) {
          setIsNewPoemModalOpen(false);
          return;
        }
        if (isNewDraftModalOpen) {
          setIsNewDraftModalOpen(false);
          return;
        }
        if (isDiffOpen) {
          setIsDiffOpen(false);
          return;
        }
        if (isZenMode) {
          setIsZenMode(false);
          return;
        }
      }

      // ? or Shift+/: Open Keyboard Shortcuts modal (when outside inputs)
      if (!isInput && (e.key === '?' || (e.shiftKey && e.key === '/'))) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // Ctrl+K or Cmd+K: Focus search bar in Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
        }
        setTimeout(() => {
          const searchInput = document.getElementById('atelier-sidebar-search') as HTMLInputElement | null;
          searchInput?.focus();
          searchInput?.select();
        }, 60);
        return;
      }

      // Ctrl+B or Cmd+B: Toggle Sidebar collapse
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
        return;
      }

      // Ctrl+Shift+N or Cmd+Shift+N: New Collection
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNewCollectionModalOpen(true);
        return;
      }

      // Ctrl+N or Cmd+N: New Poem
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNewPoemModalOpen(true);
        return;
      }

      // Ctrl+S or Cmd+S: Save / Commit Draft Revision
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsNewDraftModalOpen(true);
        return;
      }

      // Ctrl+D or Cmd+D (outside input): Toggle Diff View
      if (!isInput && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsDiffOpen((prev) => !prev);
        return;
      }

      // Alt+Z or F11: Toggle Distraction-free Zen Mode
      if ((e.altKey && e.key.toLowerCase() === 'z') || e.key === 'F11') {
        e.preventDefault();
        setIsZenMode((prev) => !prev);
        return;
      }

      // Alt+T: Cycle Themes (Brown -> Light -> Dark -> Pastel)
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        const themes: AppTheme[] = ['brown', 'light', 'dark', 'pastel'];
        const nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
        handleSelectTheme(themes[nextIndex]);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentTheme,
    isSidebarCollapsed,
    isZenMode,
    isDiffOpen,
    isShortcutsModalOpen,
    isOrganizeModalOpen,
    isAccountModalOpen,
    isEditCollectionOpen,
    isNewCollectionModalOpen,
    isNewPoemModalOpen,
    isNewDraftModalOpen,
  ]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleCloseProfileMenu = () => setIsProfileMenuOpen(false);
    window.addEventListener('click', handleCloseProfileMenu);
    return () => window.removeEventListener('click', handleCloseProfileMenu);
  }, []);

  // --- Authentication State Router ---
  // If unauthenticated: Display the dedicated Login / Welcome Portal
  if (!currentUser) {
    return (
      <AuthPortal
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        onEnterDemoMode={() => {
          const demo = authService.signInDemoAccount();
          setCurrentUser(demo);
          showToast('Entered Demo Mode — welcome to your offline archive!');
        }}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.displayName || 'Poet'}!`);
        }}
      />
    );
  }

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-paper-50 dark:bg-ink-950 font-sans relative"
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
          setIsDragging(true);
        }
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current <= 0) {
          setIsDragging(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleProcessFile(e.dataTransfer.files[0]);
        }
      }}
    >
      {/* Full-screen Drag and Drop Indicator */}
      <DropZoneOverlay isDragging={isDragging} />

      {/* Hidden file input for file picker button */}
      <input
        type="file"
        ref={poetryFileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleProcessFile(e.target.files[0]);
            e.target.value = '';
          }
        }}
        accept=".pdf,.txt,.md,.text,.json"
        className="hidden"
      />

      {/* Floating / Top Action Bar */}
      {!isZenMode && (
        <div className="fixed top-3 right-4 sm:right-6 z-30 flex items-center space-x-2 bg-paper-100/90 hover:bg-paper-100 dark:bg-ink-900/90 dark:hover:bg-ink-900 backdrop-blur-md border border-paper-300/80 dark:border-ink-800 rounded-2xl p-1 shadow-subtle text-xs transition-all no-print">
          {/* View Mode Switcher */}
          <div className="flex items-center border border-paper-250 dark:border-ink-750 rounded-xl p-0.5 bg-paper-200/50 dark:bg-ink-850">
            <button
              type="button"
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'dashboard'
                  ? 'bg-paper-50 dark:bg-ink-700 text-paper-950 dark:text-white font-medium shadow-xs'
                  : 'text-paper-500 hover:text-paper-800 dark:text-ink-400'
              }`}
              title="Manuscripts Gallery Dashboard"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gallery</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('atelier')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'atelier'
                  ? 'bg-paper-50 dark:bg-ink-700 text-paper-950 dark:text-white font-medium shadow-xs'
                  : 'text-paper-500 hover:text-paper-800 dark:text-ink-400'
              }`}
              title="Writing Atelier Studio"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Atelier</span>
            </button>
          </div>

          {/* Cloud Sync Status Badge */}
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="flex items-center space-x-1.5 px-2 py-1 rounded-xl hover:bg-paper-200/80 dark:hover:bg-ink-800 transition-colors text-paper-600 dark:text-ink-300 cursor-pointer"
            title={`Cloud Sync Status: ${syncStatus} (Click to manage)`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced'
                  ? 'bg-emerald-500'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-stone-400'
              }`}
            />
            <span className="hidden lg:inline capitalize font-mono text-[10px]">
              {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Offline'}
            </span>
          </button>

          {/* Keyboard Shortcuts (?) */}
          <button
            onClick={() => setIsShortcutsModalOpen(true)}
            className="p-1.5 rounded-xl hover:bg-paper-200/80 dark:hover:bg-ink-800 text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>

          {/* Profile Avatar Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileMenuOpen(!isProfileMenuOpen);
              }}
              className="flex items-center space-x-1 p-1 pl-1.5 rounded-xl hover:bg-paper-200/80 dark:hover:bg-ink-800 transition-colors cursor-pointer"
              title="Account & Profile options"
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-5 h-5 rounded-full object-cover border border-amber-500/50"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-[10px]">
                  {(currentUser?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <ChevronDown className="w-3 h-3 text-paper-400 dark:text-ink-500" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-60 rounded-2xl border border-paper-300 dark:border-ink-750 bg-paper-50 dark:bg-ink-900 shadow-elevated p-2 text-xs z-50 animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2 border-b border-paper-200 dark:border-ink-800 mb-1">
                  <div className="font-semibold text-paper-900 dark:text-ink-100 truncate">
                    {currentUser?.displayName || 'Poet'}
                  </div>
                  <div className="text-[11px] text-paper-500 dark:text-ink-400 truncate">
                    {currentUser?.email || 'Local Atelier'}
                  </div>
                  {currentUser?.isDemo && (
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-mono uppercase font-bold">
                      Demo Sandbox
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setViewMode('dashboard');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 flex items-center space-x-2 text-paper-700 dark:text-ink-200"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
                  <span>Manuscripts Gallery</span>
                </button>

                <button
                  onClick={() => {
                    setViewMode('atelier');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 flex items-center space-x-2 text-paper-700 dark:text-ink-200"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Writing Atelier</span>
                </button>

                <button
                  onClick={() => {
                    setIsAccountModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 flex items-center space-x-2 text-paper-700 dark:text-ink-200"
                >
                  <Cloud className="w-3.5 h-3.5 text-blue-500" />
                  <span>Sync &amp; Account Settings</span>
                </button>

                <button
                  onClick={() => {
                    setIsAuthPortalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-paper-200 dark:hover:bg-ink-800 flex items-center space-x-2 text-paper-700 dark:text-ink-200"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Welcome / Login Portal</span>
                </button>

                <div className="h-px bg-paper-200 dark:bg-ink-800 my-1" />

                <button
                  onClick={async () => {
                    setIsProfileMenuOpen(false);
                    await authService.signOut();
                    showToast('Signed out of Atelier');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center space-x-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Left Sidebar (Collections & Poems list) */}
      {!isZenMode && (
        <Sidebar
          collections={collections}
          poems={poems}
          activePoemId={activePoemId}
          filter={filter}
          isCollapsed={isSidebarCollapsed}
          isDarkMode={isDarkMode}
          currentTheme={currentTheme}
          onSelectTheme={handleSelectTheme}
          currentUser={currentUser}
          syncStatus={syncStatus}
          lastSyncedTime={lastSyncedTime}
          viewMode={viewMode}
          onNavigateToDashboard={() => setViewMode('dashboard')}
          onNavigateToAtelier={() => setViewMode('atelier')}
          onOpenAuthPortal={() => setIsAuthPortalOpen(true)}
          onOpenAccountModal={() => setIsAccountModalOpen(true)}
          onOpenFilePicker={() => poetryFileInputRef.current?.click()}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
          onSelectPoem={(poemId) => {
            handleSelectPoem(poemId);
            setViewMode('atelier');
          }}
          onSelectFilter={setFilter}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onToggleDarkMode={() => handleSelectTheme(currentTheme === 'dark' ? 'brown' : 'dark')}
          onOpenNewPoem={() => setIsNewPoemModalOpen(true)}
          onOpenNewCollection={() => setIsNewCollectionModalOpen(true)}
          onEditCollection={handleOpenEditCollection}
          onResetData={handleResetData}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
        />
      )}

      {/* Main Center Area: Dashboard Grid OR Reading/Editing Atelier OR Diff Viewer */}
      {isDiffOpen && activePoem ? (
        <DiffViewer
          poem={activePoem}
          currentDraftId={selectedDraftId}
          initialBaseDraftId={diffBaseDraftId}
          onClose={() => setIsDiffOpen(false)}
        />
      ) : viewMode === 'dashboard' ? (
        <ManuscriptGrid
          poems={poems}
          collections={collections}
          activePoemId={activePoemId}
          onSelectPoem={(poemId) => {
            handleSelectPoem(poemId);
            setViewMode('atelier');
          }}
          onOpenNewPoem={() => setIsNewPoemModalOpen(true)}
          onOpenNewCollection={() => setIsNewCollectionModalOpen(true)}
          onOpenFilePicker={() => poetryFileInputRef.current?.click()}
          onDeletePoem={handleDeletePoem}
          onDuplicatePoem={handleDuplicatePoem}
          onUpdatePoemTitle={handleUpdatePoemTitle}
          onOpenDiff={(poemId) => {
            handleSelectPoem(poemId);
            handleOpenDiff();
          }}
          onShowToast={showToast}
        />
      ) : activePoem && selectedDraft ? (
        <EditorStage
          poem={activePoem}
          selectedDraft={selectedDraft}
          isLatestDraft={isLatestDraft}
          collection={activeCollection}
          isZenMode={isZenMode}
          currentTheme={currentTheme}
          onSelectTheme={handleSelectTheme}
          onToggleZenMode={() => setIsZenMode(!isZenMode)}
          onOpenNewDraftModal={() => setIsNewDraftModalOpen(true)}
          onToggleDiff={() => handleOpenDiff()}
          onJumpToLatestDraft={handleJumpToLatestDraft}
          onUpdateDraftContent={setWorkingStanzas}
          onBranchFromDraft={handleBranchFromDraft}
          onUpdatePoemTitle={handleUpdatePoemTitle}
          onEditCollection={handleOpenEditCollection}
          onBackToDashboard={() => setViewMode('dashboard')}
          onToggleTimeline={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-paper-500 dark:text-ink-500">
          <p className="font-serif text-xl italic mb-3">No poems in this collection</p>
          <button
            onClick={() => setIsNewPoemModalOpen(true)}
            className="px-4 py-2 bg-paper-900 text-paper-50 dark:bg-ink-100 dark:text-ink-950 rounded text-xs font-medium"
          >
            Create First Poem
          </button>
        </div>
      )}

      {/* Right Draft Drawer / Timeline (Visible in Atelier Focus mode) */}
      {!isZenMode && !isDiffOpen && activePoem && viewMode === 'atelier' && (
        <VersionTimeline
          poem={activePoem}
          selectedDraftId={selectedDraftId}
          isCollapsed={isTimelineCollapsed}
          onSelectDraft={handleSelectDraft}
          onOpenNewDraftModal={() => setIsNewDraftModalOpen(true)}
          onToggleDiff={(baseId) => handleOpenDiff(baseId)}
          onToggleCollapse={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
          onCopyDraftText={handleCopyStanzas}
          onRestoreDraft={handleBranchFromDraft}
        />
      )}

      {/* Modals */}
      {activePoem && (
        <NewDraftModal
          isOpen={isNewDraftModalOpen}
          onClose={() => setIsNewDraftModalOpen(false)}
          onConfirm={handleCommitNewDraft}
          currentDraft={selectedDraft}
          nextVersionNumber={
            (activePoem.drafts.length > 0
              ? Math.max(...activePoem.drafts.map((d) => d.versionNumber))
              : 0) + 1
          }
        />
      )}

      <NewPoemModal
        isOpen={isNewPoemModalOpen}
        onClose={() => setIsNewPoemModalOpen(false)}
        collections={collections}
        defaultCollectionId={filter.type === 'collection' ? filter.collectionId : undefined}
        onConfirm={handleCreatePoem}
      />

      <NewCollectionModal
        isOpen={isNewCollectionModalOpen}
        onClose={() => setIsNewCollectionModalOpen(false)}
        onConfirm={handleCreateCollection}
      />

      <EditCollectionModal
        isOpen={isEditCollectionOpen}
        onClose={() => {
          setIsEditCollectionOpen(false);
          setEditingCollection(null);
        }}
        collection={editingCollection}
        onConfirm={handleConfirmEditCollection}
        onDelete={handleDeleteCollection}
      />

      {/* User Account & Cloud Sync Modal */}
      <UserAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentUser={currentUser}
        syncStatus={syncStatus}
        lastSyncedTime={lastSyncedTime}
        onShowToast={showToast}
        onRefreshData={() => {
          setCollections(storageService.getCollections());
          setPoems(storageService.getPoems());
        }}
      />

      {/* Organize & Import Poetry Modal */}
      <OrganizeImportModal
        isOpen={isOrganizeModalOpen}
        onClose={() => setIsOrganizeModalOpen(false)}
        analysis={fileAnalysis}
        existingCollections={collections}
        onConfirmImport={handleConfirmImport}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Auth / Welcome Portal Modal */}
      {isAuthPortalOpen && (
        <AuthPortal
          currentTheme={currentTheme}
          onSelectTheme={handleSelectTheme}
          onEnterDemoMode={() => {
            const demo = authService.signInDemoAccount();
            setCurrentUser(demo);
            setIsAuthPortalOpen(false);
            showToast('Entered Demo Mode');
          }}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthPortalOpen(false);
            showToast(`Welcome back, ${user.displayName || 'Poet'}!`);
          }}
          onDismiss={() => setIsAuthPortalOpen(false)}
        />
      )}

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-paper-900 dark:bg-ink-100 text-paper-50 dark:text-ink-950 text-xs font-medium rounded-full shadow-elevated transition-all animate-toast flex items-center space-x-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
