import React, { useState, useEffect, useRef } from 'react';
import { Collection, Poem, Draft, ViewFilter } from './types/poetry';
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
import { UserAccountModal } from './components/UserAccountModal';
import { OrganizeImportModal } from './components/OrganizeImportModal';
import { DropZoneOverlay } from './components/DropZoneOverlay';

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

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Modals State ---
  const [isNewDraftModalOpen, setIsNewDraftModalOpen] = useState(false);
  const [isNewPoemModalOpen, setIsNewPoemModalOpen] = useState(false);
  const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] = useState(false);

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
      // Don't intercept when inside inputs/textareas unless specific shortcuts
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      // Ctrl+S or Cmd+S: Save/Commit Draft
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsNewDraftModalOpen(true);
      }
      // Ctrl+D or Cmd+D (outside input): Toggle Diff View
      if (!isInput && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsDiffOpen((prev) => !prev);
      }
      // Ctrl+Shift+Z: Toggle Zen Mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setIsZenMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          currentUser={currentUser}
          syncStatus={syncStatus}
          lastSyncedTime={lastSyncedTime}
          onOpenAccountModal={() => setIsAccountModalOpen(true)}
          onOpenFilePicker={() => poetryFileInputRef.current?.click()}
          onSelectPoem={handleSelectPoem}
          onSelectFilter={setFilter}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onOpenNewPoem={() => setIsNewPoemModalOpen(true)}
          onOpenNewCollection={() => setIsNewCollectionModalOpen(true)}
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
          onToggleZenMode={() => setIsZenMode(!isZenMode)}
          onOpenNewDraftModal={() => setIsNewDraftModalOpen(true)}
          onToggleDiff={() => handleOpenDiff()}
          onJumpToLatestDraft={handleJumpToLatestDraft}
          onUpdateDraftContent={setWorkingStanzas}
          onBranchFromDraft={handleBranchFromDraft}
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
