import React, { useEffect, useRef } from 'react';
import { Moon, Sun, BookOpen, Sparkles, Check, X, Palette } from 'lucide-react';
import { AppTheme } from '../types/poetry';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  subtitle: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  dots: string[]; // 4 preview color dots: background, surface, text, accent
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'brown',
    name: 'Brown (Warm)',
    subtitle: 'Antique Vellum & Sepia',
    badge: 'Heritage',
    description: 'Warm book parchment, aged linen, rich espresso ink, and burnt amber accents.',
    icon: <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />,
    dots: ['#FAF6EE', '#E7DBC7', '#342416', '#B45309'],
  },
  {
    id: 'light',
    name: 'Light',
    subtitle: 'Minimalist Clean Studio',
    badge: 'Modern',
    description: 'Pristine pure alabaster surfaces with high-contrast slate editorial typography.',
    icon: <Sun className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
    dots: ['#FFFFFF', '#E2E8F0', '#0F172A', '#2563EB'],
  },
  {
    id: 'dark',
    name: 'Dark',
    subtitle: 'Midnight Ink & Obsidian',
    badge: 'Nocturne',
    description: 'Deep nocturnal atmosphere with luminous moonlight typography and amber glow.',
    icon: <Moon className="w-4 h-4 text-amber-400" />,
    dots: ['#0B0C0E', '#1E2026', '#F1F3F9', '#F59E0B'],
  },
  {
    id: 'pastel',
    name: 'Pastel',
    subtitle: 'Twilight Lavender & Blush',
    badge: 'Poetic',
    description: 'Dreamy soft lavender mist, delicate orchid borders, and deep dusk plum verse.',
    icon: <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
    dots: ['#FAF5FA', '#E4D2E8', '#3A2444', '#9333EA'],
  },
];

interface ThemeSelectorMenuProps {
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  isOpen: boolean;
  onClose: () => void;
  anchorPosition?: 'bottom-left' | 'top-right' | 'modal';
}

export const ThemeSelectorMenu: React.FC<ThemeSelectorMenuProps> = ({
  currentTheme,
  onSelectTheme,
  isOpen,
  onClose,
  anchorPosition = 'bottom-left',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <div
      ref={containerRef}
      className={`w-80 p-3 bg-paper-50 dark:bg-ink-900 border border-paper-300 dark:border-ink-800 rounded-2xl shadow-elevated dark:shadow-dark-elevated text-paper-900 dark:text-ink-100 z-50 animate-fadeIn backdrop-blur-md ${
        anchorPosition === 'bottom-left'
          ? 'absolute bottom-12 left-0'
          : anchorPosition === 'top-right'
          ? 'absolute top-12 right-0'
          : 'relative max-w-sm w-full mx-4'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 mb-2 border-b border-paper-200 dark:border-ink-800">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-paper-600 dark:text-ink-400" />
          <span className="text-xs font-serif font-bold tracking-wide uppercase text-paper-800 dark:text-ink-200">
            Select Visual Theme
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-paper-400 hover:text-paper-700 dark:text-ink-400 dark:hover:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors"
          title="Close theme selector"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Theme Cards List */}
      <div className="space-y-1.5">
        {THEME_OPTIONS.map((theme) => {
          const isSelected = currentTheme === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => {
                onSelectTheme(theme.id);
                onClose();
              }}
              className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start justify-between group ${
                isSelected
                  ? 'bg-paper-200/90 dark:bg-ink-800 border-paper-400 dark:border-ink-600 shadow-xs'
                  : 'bg-paper-100/60 dark:bg-ink-900/50 hover:bg-paper-150 dark:hover:bg-ink-850 border-transparent hover:border-paper-200 dark:hover:border-ink-800'
              }`}
            >
              <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                <div className="p-1.5 rounded-lg bg-paper-200 dark:bg-ink-800 mt-0.5 shrink-0 group-hover:scale-105 transition-transform">
                  {theme.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-paper-900 dark:text-ink-100">
                      {theme.name}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-paper-250 dark:bg-ink-750 text-paper-700 dark:text-ink-300 font-medium">
                      {theme.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-paper-500 dark:text-ink-400 truncate mt-0.5">
                    {theme.subtitle}
                  </p>

                  {/* Swatch color dots */}
                  <div className="flex items-center space-x-1 mt-1.5">
                    {theme.dots.map((color, i) => (
                      <span
                        key={i}
                        className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10 shadow-2xs inline-block"
                        style={{ backgroundColor: color }}
                        title={`Palette sample ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-paper-900 dark:bg-ink-100 text-paper-50 dark:text-ink-950 flex items-center justify-center shrink-0 ml-2 mt-1 shadow-xs">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-2 pt-2 border-t border-paper-200 dark:border-ink-800 text-[10px] text-paper-400 dark:text-ink-500 text-center font-mono">
        Shortcut: Alt+T to cycle themes
      </div>
    </div>
  );

  if (anchorPosition === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-fadeIn">
        {content}
      </div>
    );
  }

  return content;
};
