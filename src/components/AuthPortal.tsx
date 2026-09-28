import React, { useState, useEffect } from 'react';
import {
  Feather,
  BookOpen,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  GitBranch,
  Highlighter,
  CheckCircle2,
  AlertCircle,
  Palette,
  Moon,
  Sun,
  Lock,
} from 'lucide-react';
import { authService, UserProfile } from '../services/authService';
import { isFirebaseConfigured } from '../services/firebase';
import { AppTheme } from '../types/poetry';
import { ThemeSelectorMenu } from './ThemeSelectorMenu';

interface AuthPortalProps {
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  onEnterDemoMode: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onDismiss?: () => void;
}

const POETIC_QUOTES = [
  {
    stanzas: [
      'To see a World in a Grain of Sand',
      'And a Heaven in a Wild Flower,',
      'Hold Infinity in the palm of your hand',
      'And Eternity in an hour.',
    ],
    author: 'William Blake',
    work: 'Auguries of Innocence',
  },
  {
    stanzas: [
      'Tell all the truth but tell it slant —',
      'Success in Circuit lies',
      'Too bright for our infirm Delight',
      'The Truth\'s superb surprise',
    ],
    author: 'Emily Dickinson',
    work: 'Poem 1263',
  },
  {
    stanzas: [
      'I shut my eyes and all the world drops dead;',
      'I lift my lids and all is born again.',
      '(I think I made you up inside my head.)',
    ],
    author: 'Sylvia Plath',
    work: 'Mad Girl\'s Love Song',
  },
  {
    stanzas: [
      'Let everything happen to you: beauty and terror.',
      'Just keep going. No feeling is final.',
      'Near is the country they call life.',
    ],
    author: 'Rainer Maria Rilke',
    work: 'Book of Hours',
  },
];

const GoogleGIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.35 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.65 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const AuthPortal: React.FC<AuthPortalProps> = ({
  currentTheme,
  onSelectTheme,
  onEnterDemoMode,
  onLoginSuccess,
  onDismiss,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Cycle poetic quotations gently
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % POETIC_QUOTES.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  const activeQuote = POETIC_QUOTES[quoteIndex];
  const firebaseReady = isFirebaseConfigured();

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    setErrorMessage(null);
    try {
      const user = await authService.signInWithGoogle();
      onLoginSuccess(user);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err.message === 'FIREBASE_NOT_CONFIGURED') {
        setErrorMessage(
          'Google Firebase is currently waiting for API keys in .env. You can enter Demo Mode right away without credentials!'
        );
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in popup was closed before finishing.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage(
          'This domain is not authorized in Firebase Console -> Authentication -> Settings -> Authorized domains.'
        );
      } else {
        setErrorMessage(err.message || 'Unable to complete Google sign-in. Try Demo Mode below.');
      }
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-paper-100/90 dark:bg-ink-950/95 backdrop-blur-md transition-colors overflow-y-auto">
      {/* Container Card */}
      <div className="w-full max-w-5xl rounded-3xl border border-paper-300/80 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] my-auto">
        
        {/* Left Atmosphere & Quotation Panel (5 cols) */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-paper-150/70 dark:bg-ink-850/80 border-b lg:border-b-0 lg:border-r border-paper-200 dark:border-ink-800 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative watermark */}
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-paper-300/20 dark:bg-ink-700/20 blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none select-none">
            <Feather className="w-40 h-40" />
          </div>

          {/* Top Atelier Brand Seal */}
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-paper-200/90 dark:bg-ink-800 border border-paper-300/60 dark:border-ink-750 text-xs font-mono tracking-widest text-paper-700 dark:text-ink-300 uppercase shadow-xs">
              <Feather className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Atelier Archive</span>
            </div>

            <h1 className="mt-4 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-paper-950 dark:text-paper-50">
              Where verses rest and evolve.
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-paper-600 dark:text-ink-400 font-sans leading-relaxed">
              A minimalist stationery anthology and manuscript atelier crafted for poets, lyricists, and editors.
            </p>
          </div>

          {/* Center Dynamic Poetic Excerpt */}
          <div className="relative z-10 my-8 py-6 px-6 rounded-2xl bg-paper-100/80 dark:bg-ink-900/90 border border-paper-300/50 dark:border-ink-800/80 shadow-subtle transition-all duration-700">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-paper-400 dark:text-ink-500 mb-3">
              <span>Manuscript Excerpt</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600/70 dark:bg-amber-400 animate-pulse" />
            </div>

            <blockquote className="font-serif italic text-sm sm:text-base text-paper-850 dark:text-ink-150 leading-relaxed space-y-1.5">
              {activeQuote.stanzas.map((line, idx) => (
                <div key={idx} className="transition-opacity duration-500">
                  {line}
                </div>
              ))}
            </blockquote>

            <div className="mt-4 pt-3 border-t border-paper-200/60 dark:border-ink-800/60 flex items-center justify-between text-xs text-paper-600 dark:text-ink-400 font-sans">
              <span className="font-serif font-medium">{activeQuote.author}</span>
              <span className="text-[11px] italic font-serif opacity-75">{activeQuote.work}</span>
            </div>
          </div>

          {/* Bottom Feature Badges */}
          <div className="relative z-10 grid grid-cols-2 gap-2 text-[11px] text-paper-600 dark:text-ink-400 font-sans">
            <div className="flex items-center space-x-1.5">
              <GitBranch className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>Revision Diffs</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Highlighter className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>Section Highlighting</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>Anthology Shelves</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>Local Encryption</span>
            </div>
          </div>
        </div>

        {/* Right Interaction & Sign-in Panel (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between relative bg-paper-50 dark:bg-ink-900">
          
          {/* Top Bar with Theme Selector */}
          <div className="flex items-center justify-between pb-6 border-b border-paper-200 dark:border-ink-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs font-mono text-paper-500 dark:text-ink-400 uppercase tracking-wider">
                {firebaseReady ? 'Cloud Sync Enabled' : 'Offline / Local Ready'}
              </span>
            </div>

            {/* Quick Theme Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs border border-paper-300 dark:border-ink-750 bg-paper-100 hover:bg-paper-200 dark:bg-ink-800 dark:hover:bg-ink-750 text-paper-700 dark:text-ink-300 transition-colors"
                title="Change theme preview"
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="capitalize">{currentTheme} Theme</span>
              </button>

              <ThemeSelectorMenu
                currentTheme={currentTheme}
                onSelectTheme={onSelectTheme}
                isOpen={isThemeMenuOpen}
                onClose={() => setIsThemeMenuOpen(false)}
                anchorPosition="top-right"
              />
            </div>
          </div>

          {/* Central Sign-in Content */}
          <div className="my-auto py-8 max-w-md w-full mx-auto">
            <div className="text-center sm:text-left mb-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-paper-900 dark:text-ink-100">
                Welcome to Atelier
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-paper-500 dark:text-ink-400 font-sans">
                Sign in with your Google Account to synchronize manuscripts across devices, or enter Demo Mode for instant private writing.
              </p>
            </div>

            {/* Error Message Notice if any */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-start space-x-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Primary Action: Google Sign In */}
            <div className="space-y-3.5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoadingGoogle}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-paper-50 dark:bg-ink-800 dark:hover:bg-ink-750 text-paper-900 dark:text-ink-100 border border-paper-300 dark:border-ink-700 shadow-sm hover:shadow transition-all flex items-center justify-center space-x-3 group relative cursor-pointer font-medium text-xs sm:text-sm"
              >
                {isLoadingGoogle ? (
                  <div className="w-4 h-4 border-2 border-paper-400 border-t-amber-600 rounded-full animate-spin" />
                ) : (
                  <GoogleGIcon />
                )}
                <span>
                  {isLoadingGoogle ? 'Connecting with Google...' : 'Continue with Google Account'}
                </span>
                <ArrowRight className="w-4 h-4 text-paper-400 group-hover:text-amber-600 dark:text-ink-500 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all ml-auto hidden sm:block" />
              </button>

              {/* Divider */}
              <div className="flex items-center space-x-3 py-1">
                <div className="flex-1 h-px bg-paper-200 dark:bg-ink-800" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-paper-400 dark:text-ink-500">
                  or
                </span>
                <div className="flex-1 h-px bg-paper-200 dark:bg-ink-800" />
              </div>

              {/* Secondary Action: Demo Mode / Offline Archive */}
              <button
                type="button"
                onClick={onEnterDemoMode}
                className="w-full py-3 px-4 rounded-xl bg-paper-900 hover:bg-black text-paper-50 dark:bg-ink-100 dark:hover:bg-white dark:text-ink-950 font-medium text-xs sm:text-sm shadow-subtle hover:shadow-elevated transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5 text-left">
                  <div className="p-1 rounded-lg bg-white/10 dark:bg-black/10">
                    <BookOpen className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                  </div>
                  <div>
                    <div className="leading-tight font-semibold">
                      Enter Demo Mode / Offline Archive
                    </div>
                    <div className="text-[11px] text-paper-300 dark:text-ink-600 leading-tight">
                      Instant evaluation • Sample poems • Zero setup
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-paper-300 group-hover:text-white dark:text-ink-600 dark:group-hover:text-black group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            </div>

            {/* Quick Dismiss if inside app already */}
            {onDismiss && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={onDismiss}
                  className="text-xs text-paper-500 hover:text-paper-800 dark:text-ink-400 dark:hover:text-ink-200 underline underline-offset-4 transition-colors"
                >
                  Return to current workspace
                </button>
              </div>
            )}
          </div>

          {/* Bottom Footnote & Privacy Guarantee */}
          <div className="pt-6 border-t border-paper-200 dark:border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-paper-500 dark:text-ink-500">
            <div className="flex items-center space-x-2">
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Zero telemetry tracking • Local-first manuscript storage</span>
            </div>

            <div className="flex items-center space-x-3 font-mono text-[10px]">
              <span>v2.4 Editorial</span>
              <span>•</span>
              <span>Client-Side Draft Engine</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
