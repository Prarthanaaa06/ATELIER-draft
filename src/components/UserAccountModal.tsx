import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Smartphone,
  HardDrive
} from 'lucide-react';
import { authService, UserProfile } from '../services/authService';
import { cloudSyncService, SyncStatus } from '../services/cloudSyncService';
import { isFirebaseConfigured } from '../services/firebase';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  syncStatus: SyncStatus;
  lastSyncedTime: Date | null;
  onShowToast: (message: string) => void;
  onRefreshData?: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  syncStatus,
  lastSyncedTime,
  onShowToast,
  onRefreshData,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const firebaseReady = isFirebaseConfigured();

  const handleGoogleSignIn = async () => {
    setErrorNotice(null);
    try {
      await authService.signInWithGoogle();
      onShowToast('Successfully signed in with Google!');
      if (onRefreshData) onRefreshData();
      onClose();
    } catch (err: any) {
      if (err.message === 'FIREBASE_NOT_CONFIGURED') {
        setShowConfigGuide(true);
      } else if (err.code === 'auth/popup-closed-by-user') {
        // User closed popup, no error needed
      } else {
        setErrorNotice(err.message || 'Failed to sign in with Google. Check Firebase config.');
      }
    }
  };

  const handleDemoSignIn = () => {
    authService.signInDemoAccount();
    onShowToast('Signed in with Demo Google account');
    if (onRefreshData) onRefreshData();
    onClose();
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      onShowToast('Signed out of account');
      if (onRefreshData) onRefreshData();
      onClose();
    } catch (err: any) {
      console.error(err);
      onShowToast('Failed to sign out');
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await cloudSyncService.uploadLocalToCloud();
      onShowToast('Poetry archive synced to Google Cloud!');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      onShowToast('Sync failed. Please check internet connection.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromCloud = async () => {
    setIsSyncing(true);
    try {
      const res = await cloudSyncService.pullFromCloud();
      if (res) {
        onShowToast(`Pulled ${res.poems.length} poems from cloud`);
        if (onRefreshData) onRefreshData();
      } else {
        onShowToast('Cloud archive is up to date.');
      }
    } catch (err) {
      onShowToast('Failed to pull from cloud.');
    } finally {
      setIsSyncing(false);
    }
  };

  const envSnippet = `# Add these to your .env file or Vercel/Netlify Environment Variables:
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef`;

  const copyEnvToClipboard = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
    onShowToast('Environment variables template copied!');
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-950/30">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600/10 dark:bg-amber-500/10 border border-amber-600/20 dark:border-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Google Account & Cloud Sync
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {currentUser ? 'Continuous backup & cross-device synchronization' : 'Connect your account to backup your poems'}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {errorNotice && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-start space-x-3 text-red-700 dark:text-red-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{errorNotice}</div>
            </div>
          )}

          {currentUser ? (
            /* --- Signed In State --- */
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 shadow-sm flex items-center space-x-4">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google Profile'}
                    className="w-14 h-14 rounded-full border-2 border-amber-500/40 object-cover shadow"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white font-bold text-xl flex items-center justify-center shadow">
                    {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {currentUser.displayName || 'Google Poet'}
                    </h3>
                    {currentUser.isDemo ? (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        Demo
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center space-x-1">
                        <ShieldCheck className="w-2.5 h-2.5 inline mr-0.5" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                    {currentUser.email || 'Google Account'}
                  </p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Real-time Cloud Archive Active</span>
                  </p>
                </div>
              </div>

              {/* Sync Status Banner */}
              <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        syncStatus === 'synced'
                          ? 'bg-emerald-500'
                          : syncStatus === 'syncing'
                          ? 'bg-amber-500 animate-ping'
                          : 'bg-stone-400'
                      }`}
                    />
                    <div
                      className={`absolute inset-0 w-3 h-3 rounded-full ${
                        syncStatus === 'synced' ? 'bg-emerald-500' : syncStatus === 'syncing' ? 'bg-amber-500' : 'bg-stone-400'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-stone-900 dark:text-stone-200">
                      {syncStatus === 'synced'
                        ? 'Cloud Database Synced'
                        : syncStatus === 'syncing'
                        ? 'Syncing with Firestore...'
                        : 'Offline / Cached Locally'}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      Last synchronized: {formatLastSync(lastSyncedTime)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  title="Push local drafts to Google Cloud"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
              </div>

              {currentUser.isDemo && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-1">
                  <p className="font-semibold flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Demo Mode Enabled</span>
                  </p>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    You are exploring with a demo profile. Add your Firebase keys in <code className="px-1 py-0.5 bg-amber-200/50 dark:bg-amber-900/50 rounded font-mono">.env</code> to connect real Google OAuth & live Firestore sync.
                  </p>
                  <button
                    onClick={() => setShowConfigGuide(!showConfigGuide)}
                    className="text-amber-700 dark:text-amber-400 underline text-xs font-medium pt-1 inline-block"
                  >
                    {showConfigGuide ? 'Hide setup instructions' : 'View Firebase setup steps'}
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={handlePullFromCloud}
                  disabled={isSyncing}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <HardDrive className="w-4 h-4 text-stone-500" />
                  <span>Pull Latest Cloud Copy</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* --- Not Signed In State --- */
            <div className="space-y-6">
              <div className="text-center py-2 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                  <Cloud className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                  Sync Your Poetry with Google
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                  Sign in with your Google account to automatically safeguard your manuscript drafts, revisions, and anthologies in Cloud Firestore.
                </p>
              </div>

              {/* Features grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">Continuous Backup</span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">Every stanza change is safely saved to Google Cloud.</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 flex items-start space-x-2.5">
                  <Smartphone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">Cross-Device</span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">Write on desktop, review on mobile anytime.</p>
                  </div>
                </div>
              </div>

              {/* Sign In Primary CTA */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-medium text-sm flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-all"
                >
                  {/* Google SVG G */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  <span>Sign In with Google</span>
                </button>

                {!firebaseReady && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      onClick={handleDemoSignIn}
                      className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 underline font-medium"
                    >
                      Explore Demo Account
                    </button>
                    <button
                      onClick={() => setShowConfigGuide(!showConfigGuide)}
                      className="text-amber-700 dark:text-amber-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Setup Firebase Project</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Firebase Configuration Guide Accordion */}
          {(showConfigGuide || (!firebaseReady && !currentUser)) && (
            <div className="mt-4 p-4 rounded-xl bg-stone-100/80 dark:bg-stone-850/80 border border-stone-200 dark:border-stone-800 text-xs space-y-3">
              <div className="flex items-center justify-between font-semibold text-stone-900 dark:text-stone-100">
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>How to Connect Your Free Firebase Project</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-medium">
                  2 Minutes Setup
                </span>
              </div>

              <ol className="list-decimal list-inside space-y-1.5 text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
                <li>
                  Open <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-amber-600 dark:text-amber-400 underline font-semibold">console.firebase.google.com</a> and click <strong>Add project</strong>.
                </li>
                <li>
                  Under <strong>Build &gt; Authentication &gt; Sign-in method</strong>, enable <strong>Google</strong>.
                </li>
                <li>
                  Under <strong>Build &gt; Firestore Database</strong>, click <strong>Create database</strong> (choose Start in Test mode or configure rules).
                </li>
                <li>
                  Go to <strong>Project Settings (gear icon) &gt; General &gt; Your apps</strong>, click <strong>Web (&lt;/&gt;)</strong> and copy the config keys.
                </li>
                <li>
                  Paste them into your local <code className="bg-stone-200 dark:bg-stone-700 px-1 py-0.5 rounded font-mono">.env</code> file (or Vercel / Netlify environment variables when deploying).
                </li>
              </ol>

              <div className="relative pt-2">
                <pre className="p-3 bg-stone-900 text-stone-200 rounded-lg font-mono text-[10px] overflow-x-auto">
                  {envSnippet}
                </pre>
                <button
                  onClick={copyEnvToClipboard}
                  className="absolute top-4 right-2 p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md transition-colors flex items-center space-x-1 text-[10px]"
                >
                  {copiedEnv ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-950/30 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>End-to-end encrypted in personal Firestore collection</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
