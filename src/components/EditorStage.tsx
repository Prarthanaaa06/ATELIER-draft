import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  GitCompare,
  GitCommit,
  Maximize2,
  Minimize2,
  Edit3,
  BookOpen,
  Download,
  Type,
  Printer,
  RotateCcw,
  RotateCw,
  Palette,
  Edit2,
  X,
  Highlighter,
  History,
  AlignLeft,
  Sparkles,
} from 'lucide-react';
import { Poem, Draft, Collection, AppTheme } from '../types/poetry';
import { ThemeSelectorMenu } from './ThemeSelectorMenu';
import {
  HighlightToolbar,
  FloatingHighlightMenu,
  HighlightColorId,
  TextHighlight,
  getHighlightColor,
  getHighlightedSegments,
  addOrUpdateHighlight,
  removeHighlightById,
} from './HighlightPalette';
import { storageService } from '../services/storageService';

export interface EditorStageProps {
  poem: Poem;
  selectedDraft: Draft;
  isLatestDraft: boolean;
  collection?: Collection;
  isZenMode: boolean;
  currentTheme?: AppTheme;
  onSelectTheme?: (theme: AppTheme) => void;
  onToggleZenMode: () => void;
  onOpenNewDraftModal: () => void;
  onToggleDiff: () => void;
  onJumpToLatestDraft: () => void;
  onUpdateDraftContent: (newStanzas: string) => void;
  onBranchFromDraft?: (draft: Draft) => void;
  onUpdatePoemTitle?: (poemId: string, newTitle: string) => void;
  onEditCollection?: (collection: Collection) => void;
  onBackToDashboard?: () => void;
  onToggleTimeline?: () => void;
}

export const EditorStage: React.FC<EditorStageProps> = ({
  poem,
  selectedDraft,
  isLatestDraft,
  collection,
  isZenMode,
  currentTheme,
  onSelectTheme,
  onToggleZenMode,
  onOpenNewDraftModal,
  onToggleDiff,
  onJumpToLatestDraft,
  onUpdateDraftContent,
  onBranchFromDraft,
  onUpdatePoemTitle,
  onEditCollection,
  onBackToDashboard,
  onToggleTimeline,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStanzas, setEditedStanzas] = useState(selectedDraft.stanzas);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('normal');
  const [fontFamily, setFontFamily] = useState<'garamond' | 'newsreader' | 'mono'>('garamond');
  const [lineHeight, setLineHeight] = useState<'normal' | 'relaxed' | 'loose'>('relaxed');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(poem.title);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // --- Text Editing Undo / Redo History Stack ---
  const [textHistory, setTextHistory] = useState<string[]>([selectedDraft.stanzas]);
  const [textHistoryIndex, setTextHistoryIndex] = useState(0);
  const textHistoryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Text Section Highlighting State & History Stack ---
  const [textHighlights, setTextHighlights] = useState<TextHighlight[]>(() =>
    storageService.getTextHighlights(poem.id, selectedDraft.id)
  );
  const [highlightHistory, setHighlightHistory] = useState<TextHighlight[][]>(() => [
    storageService.getTextHighlights(poem.id, selectedDraft.id),
  ]);
  const [highlightHistoryIndex, setHighlightHistoryIndex] = useState(0);

  const [isHighlightBarOpen, setIsHighlightBarOpen] = useState(false);
  const [activeHighlightColor, setActiveHighlightColor] = useState<HighlightColorId>('amber');
  const [floatingMenu, setFloatingMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    start: number;
    end: number;
    text: string;
    activeHighlightId?: string;
    activeColor?: HighlightColorId;
  } | null>(null);

  // Sync text highlights when poem or selected draft changes
  useEffect(() => {
    const currentHls = storageService.getTextHighlights(poem.id, selectedDraft.id);
    setTextHighlights(currentHls);
    setHighlightHistory([currentHls]);
    setHighlightHistoryIndex(0);
    setFloatingMenu(null);
  }, [poem.id, selectedDraft.id]);

  // Close floating popover when clicking anywhere else
  useEffect(() => {
    const handleDocumentClick = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) return;
      setFloatingMenu(null);
    };
    window.addEventListener('click', handleDocumentClick);
    return () => window.removeEventListener('click', handleDocumentClick);
  }, []);

  // Sync title when poem changes
  useEffect(() => {
    setEditedTitle(poem.title);
    setIsEditingTitle(false);
  }, [poem.id, poem.title]);

  // Sync edited stanzas when draft changes
  useEffect(() => {
    setEditedStanzas(selectedDraft.stanzas);
    setTextHistory([selectedDraft.stanzas]);
    setTextHistoryIndex(0);
    setIsEditing(false);
  }, [selectedDraft.id]);

  // Handle text modifications with history snapshotting
  const handleTextChange = (newStanzas: string) => {
    setEditedStanzas(newStanzas);
    onUpdateDraftContent(newStanzas);

    if (textHistoryTimerRef.current) {
      clearTimeout(textHistoryTimerRef.current);
    }

    textHistoryTimerRef.current = setTimeout(() => {
      setTextHistory((prev) => {
        const next = prev.slice(0, textHistoryIndex + 1);
        if (next[next.length - 1] === newStanzas) return prev;
        return [...next, newStanzas];
      });
      setTextHistoryIndex((prev) => prev + 1);
    }, 350);
  };

  const handleUndoText = () => {
    if (textHistoryTimerRef.current) {
      clearTimeout(textHistoryTimerRef.current);
    }
    if (textHistoryIndex > 0) {
      const targetIndex = textHistoryIndex - 1;
      const targetText = textHistory[targetIndex];
      setTextHistoryIndex(targetIndex);
      setEditedStanzas(targetText);
      onUpdateDraftContent(targetText);
    }
  };

  const handleRedoText = () => {
    if (textHistoryTimerRef.current) {
      clearTimeout(textHistoryTimerRef.current);
    }
    if (textHistoryIndex < textHistory.length - 1) {
      const targetIndex = textHistoryIndex + 1;
      const targetText = textHistory[targetIndex];
      setTextHistoryIndex(targetIndex);
      setEditedStanzas(targetText);
      onUpdateDraftContent(targetText);
    }
  };

  const applyHighlightsWithHistory = (updated: TextHighlight[]) => {
    setTextHighlights(updated);
    storageService.saveTextHighlights(poem.id, updated, selectedDraft.id);
    setHighlightHistory((prev) => {
      const next = prev.slice(0, highlightHistoryIndex + 1);
      return [...next, updated];
    });
    setHighlightHistoryIndex((prev) => prev + 1);
  };

  const handleUndoHighlight = () => {
    if (highlightHistoryIndex > 0) {
      const targetIndex = highlightHistoryIndex - 1;
      const targetHls = highlightHistory[targetIndex];
      setHighlightHistoryIndex(targetIndex);
      setTextHighlights(targetHls);
      storageService.saveTextHighlights(poem.id, targetHls, selectedDraft.id);
    }
  };

  const handleRedoHighlight = () => {
    if (highlightHistoryIndex < highlightHistory.length - 1) {
      const targetIndex = highlightHistoryIndex + 1;
      const targetHls = highlightHistory[targetIndex];
      setHighlightHistoryIndex(targetIndex);
      setTextHighlights(targetHls);
      storageService.saveTextHighlights(poem.id, targetHls, selectedDraft.id);
    }
  };

  const canUndo = isEditing
    ? textHistoryIndex > 0
    : highlightHistoryIndex > 0 || textHistoryIndex > 0;

  const canRedo = isEditing
    ? textHistoryIndex < textHistory.length - 1
    : highlightHistoryIndex < highlightHistory.length - 1 || textHistoryIndex < textHistory.length - 1;

  const handleUndo = () => {
    if (isEditing) {
      handleUndoText();
    } else if (highlightHistoryIndex > 0) {
      handleUndoHighlight();
    } else if (textHistoryIndex > 0) {
      handleUndoText();
    }
  };

  const handleRedo = () => {
    if (isEditing) {
      handleRedoText();
    } else if (highlightHistoryIndex < highlightHistory.length - 1) {
      handleRedoHighlight();
    } else if (textHistoryIndex < textHistory.length - 1) {
      handleRedoText();
    }
  };

  // Keyboard Shortcuts inside EditorStage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditingTitle) {
          handleCancelTitleEdit();
          return;
        }
        if (floatingMenu) {
          setFloatingMenu(null);
          return;
        }
        if (isHighlightBarOpen) {
          setIsHighlightBarOpen(false);
          return;
        }
        if (isZenMode) {
          onToggleZenMode();
          return;
        }
      }

      // Ctrl+Z / Cmd+Z: Undo (or Redo if Shift is held)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      // Ctrl+Y / Cmd+Y: Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Ctrl+\: Toggle Zen Mode
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        onToggleZenMode();
        return;
      }

      // Ctrl+E / Cmd+E: Toggle Reading / Edit View
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        if (isLatestDraft) {
          e.preventDefault();
          setIsEditing((prev) => !prev);
          return;
        }
      }

      // Alt+H: Toggle Highlighter palette
      if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsHighlightBarOpen((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isZenMode,
    onToggleZenMode,
    isEditing,
    isLatestDraft,
    isEditingTitle,
    floatingMenu,
    isHighlightBarOpen,
    canUndo,
    canRedo,
    textHistoryIndex,
    textHistory,
    highlightHistoryIndex,
    highlightHistory,
  ]);

  // Compute metrics
  const lines = (isEditing ? editedStanzas : selectedDraft.stanzas).split('\n');
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
  const stanzaCount = (isEditing ? editedStanzas : selectedDraft.stanzas)
    .split(/\n\s*\n/)
    .filter((s) => s.trim().length > 0).length;
  const wordCount = (isEditing ? editedStanzas : selectedDraft.stanzas)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const handleCopyCleanText = () => {
    const textToCopy = isEditing ? editedStanzas : selectedDraft.stanzas;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const content = `${poem.title.toUpperCase()}\n${poem.subtitle ? poem.subtitle + '\n' : ''}By ${poem.author}\n\n[Draft: ${selectedDraft.versionTag} — ${new Date(selectedDraft.timestamp).toLocaleDateString()}]\n\n${selectedDraft.stanzas}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${poem.title.toLowerCase().replace(/\s+/g, '-')}-${selectedDraft.versionTag}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() && onUpdatePoemTitle) {
      onUpdatePoemTitle(poem.id, editedTitle.trim());
    } else {
      setEditedTitle(poem.title);
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitleEdit = () => {
    setEditedTitle(poem.title);
    setIsEditingTitle(false);
  };

  // Text selection highlight popup handlers
  const handleMouseUpSelection = () => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !textContainerRef.current) return;

      const range = selection.getRangeAt(0);
      if (!textContainerRef.current.contains(range.commonAncestorContainer)) return;

      const rawSelected = selection.toString();
      if (!rawSelected || rawSelected.trim().length === 0) return;

      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(textContainerRef.current);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      let start = preCaretRange.toString().length;
      let end = start + rawSelected.length;

      const fullText = selectedDraft.stanzas;
      if (fullText.slice(start, end) !== rawSelected) {
        const found = fullText.indexOf(rawSelected, Math.max(0, start - 25));
        if (found !== -1) {
          start = found;
          end = found + rawSelected.length;
        }
      }

      const rect = range.getBoundingClientRect();
      setFloatingMenu({
        isOpen: true,
        x: Math.max(120, Math.min(window.innerWidth - 120, rect.left + rect.width / 2)),
        y: Math.max(70, rect.top - 6),
        start,
        end,
        text: rawSelected,
        activeColor: activeHighlightColor,
        activeHighlightId: undefined,
      });
    }, 10);
  };

  const handleHighlightSpanClick = (hl: TextHighlight, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setFloatingMenu({
      isOpen: true,
      x: Math.max(120, Math.min(window.innerWidth - 120, rect.left + rect.width / 2)),
      y: Math.max(70, rect.top - 6),
      start: hl.start,
      end: hl.end,
      text: hl.text,
      activeColor: hl.color,
      activeHighlightId: hl.id,
    });
  };

  const handleApplyHighlight = (color: HighlightColorId) => {
    if (!floatingMenu) return;
    setActiveHighlightColor(color);
    const newHl: TextHighlight = {
      id:
        floatingMenu.activeHighlightId ||
        `hl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      start: floatingMenu.start,
      end: floatingMenu.end,
      text: floatingMenu.text,
      color,
    };
    const updated = addOrUpdateHighlight(textHighlights, newHl);
    applyHighlightsWithHistory(updated);
    window.getSelection()?.removeAllRanges();
    setFloatingMenu(null);
  };

  const handleRemoveHighlight = () => {
    if (!floatingMenu?.activeHighlightId) return;
    const updated = removeHighlightById(textHighlights, floatingMenu.activeHighlightId);
    applyHighlightsWithHistory(updated);
    setFloatingMenu(null);
  };

  const handleClearAllHighlights = () => {
    applyHighlightsWithHistory([]);
    setFloatingMenu(null);
  };

  return (
    <main
      className={`flex-1 flex flex-col h-screen overflow-y-auto bg-paper-50 dark:bg-ink-900 text-paper-900 dark:text-ink-100 transition-colors zen-transition relative ${
        isZenMode ? 'px-4 sm:px-12 py-10' : 'px-4 sm:px-8 pt-8 pb-12'
      }`}
    >
      {/* Top Floating Control Bar */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between pb-6 border-b border-paper-200/80 dark:border-ink-800/80 no-print">
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex items-center space-x-2 text-xs text-paper-500 dark:text-ink-400">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex items-center space-x-1 hover:text-paper-950 dark:hover:text-white transition-colors mr-1 group/back font-medium"
              title="Return to Manuscripts Gallery Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover/back:-translate-x-0.5 transition-transform" />
              <span>Dashboard</span>
            </button>
          )}

          <span>/</span>
          <span className="uppercase tracking-widest font-mono text-[10px] text-paper-400 dark:text-ink-500">
            Anthology
          </span>
          <span>/</span>

          {collection && onEditCollection ? (
            <button
              onClick={() => onEditCollection(collection)}
              className="group/bc flex items-center space-x-1.5 font-serif italic text-paper-700 dark:text-ink-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
              title="Click to edit collection title & details"
            >
              <span>{collection.title}</span>
              <Edit2 className="w-2.5 h-2.5 opacity-40 group-hover/bc:opacity-100 transition-opacity" />
            </button>
          ) : (
            <span className="font-serif italic text-paper-700 dark:text-ink-300">
              {collection?.title || 'Archive'}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Typography Controls */}
          <div className="hidden sm:flex items-center space-x-1 border border-paper-200 dark:border-ink-800 rounded px-1 py-0.5 bg-paper-100/50 dark:bg-ink-850 text-xs">
            <button
              onClick={() =>
                setFontSize(fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'xl' : 'normal')
              }
              title="Toggle Font Size"
              className="px-1.5 py-0.5 rounded hover:bg-paper-200 dark:hover:bg-ink-700 font-serif text-xs transition-colors"
            >
              <Type className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                setFontFamily(
                  fontFamily === 'garamond' ? 'newsreader' : fontFamily === 'newsreader' ? 'mono' : 'garamond'
                )
              }
              title={`Switch Font (${fontFamily === 'garamond' ? 'Cormorant' : fontFamily === 'newsreader' ? 'Newsreader' : 'Mono'})`}
              className="px-1.5 py-0.5 rounded hover:bg-paper-200 dark:hover:bg-ink-700 font-serif text-[11px] transition-colors"
            >
              {fontFamily === 'garamond' ? 'Garamond' : fontFamily === 'newsreader' ? 'Newsreader' : 'Mono'}
            </button>
            <button
              onClick={() =>
                setLineHeight(lineHeight === 'normal' ? 'relaxed' : lineHeight === 'relaxed' ? 'loose' : 'normal')
              }
              title={`Line Spacing: ${lineHeight}`}
              className="p-1 rounded hover:bg-paper-200 dark:hover:bg-ink-700 transition-colors"
            >
              <AlignLeft className="w-3 h-3" />
            </button>
          </div>

          {/* Theme Selector */}
          {onSelectTheme && currentTheme && (
            <div className="relative">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                title={`Visual Theme: ${currentTheme} (Click to switch)`}
                className="flex items-center space-x-1 px-2 py-1 rounded text-xs border border-paper-300 dark:border-ink-750 bg-paper-100/70 hover:bg-paper-200 dark:bg-ink-850 dark:hover:bg-ink-800 text-paper-700 dark:text-ink-200 transition-colors"
              >
                <Palette className="w-3.5 h-3.5 text-paper-600 dark:text-ink-400" />
                <span className="hidden lg:inline capitalize text-[11px]">{currentTheme}</span>
              </button>

              <ThemeSelectorMenu
                currentTheme={currentTheme}
                onSelectTheme={onSelectTheme}
                isOpen={isThemeMenuOpen}
                onClose={() => setIsThemeMenuOpen(false)}
                anchorPosition="top-right"
              />
            </div>
          )}

          {/* Highlighter Palette Toggle */}
          <button
            onClick={() => setIsHighlightBarOpen(!isHighlightBarOpen)}
            title={
              isHighlightBarOpen
                ? 'Close Highlighter Palette (Alt+H)'
                : 'Highlighter Palette (Alt+H) — select text to highlight'
            }
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs border transition-all ${
              isHighlightBarOpen
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-200 font-medium shadow-xs ring-1 ring-amber-500/30'
                : 'border-paper-300 dark:border-ink-750 bg-paper-100/70 hover:bg-paper-200 dark:bg-ink-850 dark:hover:bg-ink-800 text-paper-700 dark:text-ink-200'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
              style={{ backgroundColor: getHighlightColor(activeHighlightColor).dotHex }}
            />
            <Highlighter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Highlight</span>
            {textHighlights.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-paper-300/80 dark:bg-ink-750 text-paper-800 dark:text-ink-200">
                {textHighlights.length}
              </span>
            )}
          </button>

          {/* Undo & Redo Controls */}
          <div className="flex items-center space-x-0.5 border border-paper-300 dark:border-ink-750 rounded px-1 py-0.5 bg-paper-100/70 dark:bg-ink-850">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className={`p-1 rounded transition-colors ${
                canUndo
                  ? 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-700 cursor-pointer'
                  : 'text-paper-300 dark:text-ink-700 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
              className={`p-1 rounded transition-colors ${
                canRedo
                  ? 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-700 cursor-pointer'
                  : 'text-paper-300 dark:text-ink-700 cursor-not-allowed'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timeline Drawer Toggle */}
          {onToggleTimeline && (
            <button
              onClick={onToggleTimeline}
              title={`Revision Timeline (${poem.drafts.length} drafts)`}
              className="p-1.5 rounded text-paper-500 hover:text-paper-900 dark:text-ink-400 dark:hover:text-white hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Diff Button */}
          {poem.drafts.length > 1 && (
            <button
              onClick={onToggleDiff}
              title="Compare drafts and view line diffs (Ctrl+D)"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs border border-paper-300 dark:border-ink-750 bg-paper-100/70 hover:bg-paper-200 dark:bg-ink-850 dark:hover:bg-ink-800 text-paper-700 dark:text-ink-200 transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Compare</span>
            </button>
          )}

          {/* Copy Clean Verse */}
          <button
            onClick={handleCopyCleanText}
            title="Copy clean stanza text without UI artifacts"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs border border-paper-300 dark:border-ink-750 bg-paper-100/70 hover:bg-paper-200 dark:bg-ink-850 dark:hover:bg-ink-800 text-paper-700 dark:text-ink-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {/* Download Text */}
          <button
            onClick={handleDownloadTxt}
            title="Export as Text (.txt)"
            className="p-1.5 rounded text-paper-500 hover:text-paper-900 dark:text-ink-400 dark:hover:text-white hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Print Clean Page */}
          <button
            onClick={() => window.print()}
            title="Print Clean Anthology Page (Ctrl+P)"
            className="p-1.5 rounded text-paper-500 hover:text-paper-900 dark:text-ink-400 dark:hover:text-white hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Distraction Free / Zen Mode */}
          <button
            onClick={onToggleZenMode}
            title={isZenMode ? 'Exit Zen Mode (Esc / Ctrl+\\)' : 'Distraction-Free Zen Mode (Ctrl+\\ / Alt+Z)'}
            className="p-1.5 rounded text-paper-500 hover:text-paper-900 dark:text-ink-400 dark:hover:text-white hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors"
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Highlighter Palette Bar */}
      <div className="mt-4">
        <HighlightToolbar
          isOpen={isHighlightBarOpen}
          onClose={() => setIsHighlightBarOpen(false)}
          activeColor={activeHighlightColor}
          onSelectColor={(c) => setActiveHighlightColor(c)}
          highlightedCount={textHighlights.length}
          onClearAll={handleClearAllHighlights}
        />
      </div>

      {/* Read-Only Notice Banner */}
      {!isLatestDraft && (
        <div className="max-w-2xl w-full mx-auto mt-4 px-4 py-2.5 rounded bg-paper-200/70 dark:bg-ink-850 border border-paper-300 dark:border-ink-750 flex items-center justify-between text-xs animate-fadeIn no-print">
          <div className="flex items-center space-x-2">
            <span className="font-mono px-1.5 py-0.5 rounded bg-paper-300 dark:bg-ink-750 text-paper-800 dark:text-ink-200 font-medium">
              [Viewing Draft {selectedDraft.versionTag} — Read Only]
            </span>
            <span className="hidden sm:inline text-paper-600 dark:text-ink-400 italic font-serif">
              "{selectedDraft.revisionNote}"
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onBranchFromDraft && (
              <button
                onClick={() => onBranchFromDraft(selectedDraft)}
                className="flex items-center space-x-1 text-paper-700 dark:text-ink-300 hover:text-paper-950 dark:hover:text-white font-medium bg-paper-300/60 dark:bg-ink-750 px-2 py-1 rounded transition-colors"
                title={`Branch new working revision from ${selectedDraft.versionTag}`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Branch from this draft</span>
              </button>
            )}
            <button
              onClick={onJumpToLatestDraft}
              className="text-amber-700 dark:text-amber-400 hover:underline font-medium"
            >
              Jump to latest draft →
            </button>
          </div>
        </div>
      )}

      {/* Central Poem Writing Stage */}
      <article className="max-w-2xl w-full mx-auto my-auto py-8 flex flex-col justify-start">
        {/* Title Area */}
        <header className="mb-8">
          {isEditingTitle ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelTitleEdit();
                  }}
                  className={`w-full font-serif font-bold tracking-tight bg-paper-100 dark:bg-ink-850 border-2 border-amber-600/70 dark:border-amber-400/70 rounded-xl px-3 py-1.5 focus:outline-none text-paper-950 dark:text-paper-50 shadow-sm ${
                    fontSize === 'normal'
                      ? 'text-2xl sm:text-3xl'
                      : fontSize === 'large'
                      ? 'text-3xl sm:text-4xl'
                      : 'text-4xl sm:text-5xl'
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="p-2.5 rounded-xl bg-paper-900 hover:bg-black text-paper-50 dark:bg-ink-100 dark:text-ink-950 dark:hover:bg-white transition-colors shrink-0 shadow-xs"
                  title="Save title (Enter)"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelTitleEdit}
                  className="p-2.5 rounded-xl bg-paper-200 dark:bg-ink-800 text-paper-700 dark:text-ink-300 hover:bg-paper-300 dark:hover:bg-ink-700 transition-colors shrink-0"
                  title="Cancel (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-paper-400 dark:text-ink-500 font-sans">
                Press <kbd className="px-1.5 py-0.5 rounded bg-paper-200 dark:bg-ink-800 text-mono text-[10px]">Enter</kbd> to save, <kbd className="px-1.5 py-0.5 rounded bg-paper-200 dark:bg-ink-800 text-mono text-[10px]">Esc</kbd> to cancel
              </p>
            </div>
          ) : (
            <div className="group/title inline-flex items-center gap-2.5 max-w-full">
              <h1
                onClick={() => onUpdatePoemTitle && setIsEditingTitle(true)}
                className={`font-serif tracking-normal text-paper-950 dark:text-paper-50 leading-tight cursor-pointer hover:opacity-90 inline ${
                  fontSize === 'normal'
                    ? 'text-3xl sm:text-4xl'
                    : fontSize === 'large'
                    ? 'text-4xl sm:text-5xl'
                    : 'text-5xl sm:text-6xl'
                }`}
                title="Click to edit title"
              >
                {poem.title}
              </h1>
              {onUpdatePoemTitle && (
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover/title:opacity-100 p-1.5 rounded-lg hover:bg-paper-200/80 dark:hover:bg-ink-800 text-paper-400 hover:text-amber-600 dark:text-ink-500 dark:hover:text-amber-400 transition-all shrink-0"
                  title="Edit poem title"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {poem.subtitle && (
            <p className="mt-2 text-base sm:text-lg font-serif italic text-paper-600 dark:text-ink-400">
              {poem.subtitle}
            </p>
          )}

          {/* Minimalist Subtext Line */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-paper-500 dark:text-ink-500 font-sans border-b border-paper-200/60 dark:border-ink-850 pb-4">
            <span className="font-serif italic text-paper-700 dark:text-ink-300">
              {poem.author}
            </span>
            <span>•</span>
            <span className="font-mono text-[11px]">
              Draft {selectedDraft.versionTag}
            </span>
            <span>•</span>
            <span>{new Date(selectedDraft.timestamp).toLocaleDateString()}</span>

            {/* Mode switch (Read / Edit) if latest draft */}
            {isLatestDraft && (
              <div className="ml-auto flex items-center space-x-2 no-print">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-1 text-xs text-paper-600 dark:text-ink-400 hover:text-paper-950 dark:hover:text-white px-2 py-0.5 rounded hover:bg-paper-200/60 dark:hover:bg-ink-800 transition-colors"
                  title={isEditing ? 'Switch to Reading View (Ctrl+E)' : 'Edit Verse (Ctrl+E)'}
                >
                  {isEditing ? (
                    <>
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Reading View</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Verse</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Verse Stanzas Content Container */}
        <div
          className={`w-full ${
            fontFamily === 'garamond'
              ? 'font-serif'
              : fontFamily === 'newsreader'
              ? 'font-["Newsreader",Georgia,serif]'
              : 'font-mono'
          }`}
        >
          {isEditing && isLatestDraft ? (
            /* Editable Verse Textarea */
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={editedStanzas}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={Math.max(14, editedStanzas.split('\n').length + 2)}
                className={`w-full bg-transparent border-none focus:outline-none resize-none poem-stanza-text text-paper-900 dark:text-ink-100 ${
                  lineHeight === 'normal'
                    ? 'leading-relaxed'
                    : lineHeight === 'relaxed'
                    ? 'leading-loose'
                    : 'leading-[2.5]'
                } ${
                  fontSize === 'normal'
                    ? 'text-lg'
                    : fontSize === 'large'
                    ? 'text-xl'
                    : 'text-2xl'
                }`}
                placeholder="Compose your stanzas..."
                autoFocus
              />
              <div className="mt-4 pt-4 border-t border-paper-200 dark:border-ink-800 flex items-center justify-between no-print">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-paper-500 dark:text-ink-400">
                    Editing live working copy
                  </span>
                  <div className="flex items-center space-x-1 border border-paper-200 dark:border-ink-800 rounded px-1.5 py-0.5 bg-paper-100/70 dark:bg-ink-850">
                    <button
                      type="button"
                      onClick={handleUndoText}
                      disabled={textHistoryIndex <= 0}
                      className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-xs transition-colors ${
                        textHistoryIndex > 0
                          ? 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-750 cursor-pointer'
                          : 'text-paper-300 dark:text-ink-700 cursor-not-allowed'
                      }`}
                      title="Undo text change (Ctrl+Z)"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Undo</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRedoText}
                      disabled={textHistoryIndex >= textHistory.length - 1}
                      className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-xs transition-colors ${
                        textHistoryIndex < textHistory.length - 1
                          ? 'text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-750 cursor-pointer'
                          : 'text-paper-300 dark:text-ink-700 cursor-not-allowed'
                      }`}
                      title="Redo text change (Ctrl+Y / Ctrl+Shift+Z)"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Redo</span>
                    </button>
                  </div>
                </div>
                <button
                  onClick={onOpenNewDraftModal}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-paper-900 hover:bg-black text-paper-50 dark:bg-ink-100 dark:text-ink-950 rounded text-xs font-medium tracking-wide transition-colors shadow-xs"
                  title="Commit New Major Draft (Ctrl+S)"
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>Commit New Major Draft</span>
                </button>
              </div>
            </div>
          ) : (
            /* Pristine Read-Only Stanza Display with Interactive Text Selection Highlights */
            <div
              ref={textContainerRef}
              onMouseUp={handleMouseUpSelection}
              className={`poem-stanza-text select-text whitespace-pre-wrap text-paper-900 dark:text-ink-100 ${
                lineHeight === 'normal'
                  ? 'leading-relaxed'
                  : lineHeight === 'relaxed'
                  ? 'leading-loose'
                  : 'leading-[2.5]'
              } ${
                fontSize === 'normal'
                  ? 'text-lg sm:text-xl'
                  : fontSize === 'large'
                  ? 'text-xl sm:text-2xl'
                  : 'text-2xl sm:text-3xl'
              }`}
            >
              {getHighlightedSegments(selectedDraft.stanzas, textHighlights).map((seg) => {
                if (!seg.highlight) {
                  return <span key={seg.key}>{seg.text}</span>;
                }

                const color = getHighlightColor(seg.highlight.color);
                return (
                  <mark
                    key={seg.key}
                    onClick={(e) => handleHighlightSpanClick(seg.highlight!, e)}
                    className={`cursor-pointer rounded-sm px-1 py-0.5 transition-all duration-150 ${color.spanClass} hover:opacity-90`}
                    title={`Highlighted in ${color.name} (Click to change color or remove)`}
                  >
                    {seg.text}
                  </mark>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Highlight Color Selection Popover */}
        {floatingMenu?.isOpen && (
          <FloatingHighlightMenu
            x={floatingMenu.x}
            y={floatingMenu.y}
            selectedText={floatingMenu.text}
            activeColor={floatingMenu.activeColor || activeHighlightColor}
            isExisting={Boolean(floatingMenu.activeHighlightId)}
            onSelectColor={handleApplyHighlight}
            onRemove={handleRemoveHighlight}
            onClose={() => setFloatingMenu(null)}
          />
        )}

        {/* Minimalist Page Footer Metrics */}
        <footer className="mt-16 pt-6 border-t border-paper-200/60 dark:border-ink-850 flex items-center justify-between text-xs text-paper-500 dark:text-ink-500 font-sans no-print">
          <div className="flex items-center space-x-3">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{nonEmptyLines.length} lines</span>
            <span>•</span>
            <span>{stanzaCount} stanzas</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-mono text-[11px] text-paper-400 dark:text-ink-500">
              ATELIER ARCHIVE
            </span>
          </div>
        </footer>
      </article>
    </main>
  );
};
