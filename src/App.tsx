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
    showToast(`Archived "${title}" with Draft v1.`);
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
          onOpenAccountModal={() => setIsAccountModalOpen(true)}
          onOpenFilePicker={() => poetryFileInputRef.current?.click()}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
          onSelectPoem={handleSelectPoem}
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

      {/* Main Center Area: Reading/Editing Canvas OR Diff Viewer */}
      {isDiffOpen && activePoem ? (
        <DiffViewer
          poem={activePoem}
          currentDraftId={selectedDraftId}
          initialBaseDraftId={diffBaseDraftId}
          onClose={() => setIsDiffOpen(false)}
        />
      ) : activePoem && selectedDraft ? (
        <PoemCanvas
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

      {/* Right Draft Drawer / Timeline */}
      {!isZenMode && !isDiffOpen && activePoem && (
        <DraftTimeline
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
