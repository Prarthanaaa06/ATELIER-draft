import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Collection, Poem } from '../types/poetry';
import { storageService } from './storageService';
import { authService, UserProfile } from './authService';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'unconfigured' | 'guest';

export interface CloudArchiveData {
  collections: Collection[];
  poems: Poem[];
  lastSyncedAt: string;
  updatedBy?: string;
}

class CloudSyncService {
  private syncStatus: SyncStatus = 'guest';
  private lastSyncedTime: Date | null = null;
  private statusListeners: ((status: SyncStatus, lastSynced: Date | null) => void)[] = [];
  private firestoreUnsubscribe: Unsubscribe | null = null;

  private autoSyncTimeout: any = null;

  constructor() {
    this.init();
  }

  private init() {
    // Listen for auth state changes
    authService.onAuthStateChanged((user) => {
      if (user) {
        if (user.isDemo) {
          this.setStatus('synced', new Date());
        } else if (isFirebaseConfigured() && db) {
          this.subscribeToUserCloudData(user.uid);
        } else {
          this.setStatus('unconfigured');
        }
      } else {
        this.unsubscribeFirestore();
        this.setStatus('guest', null);
      }
    });

    // Auto-sync whenever local storage updates
    storageService.onStorageChange(() => {
      const user = authService.getCurrentUser();
      if (!user) return;
      if (this.autoSyncTimeout) clearTimeout(this.autoSyncTimeout);
      this.autoSyncTimeout = setTimeout(() => {
        this.triggerAutoSync();
      }, 1200);
    });
  }

  private setStatus(status: SyncStatus, lastSynced: Date | null = this.lastSyncedTime) {
    this.syncStatus = status;
    if (lastSynced !== undefined) {
      this.lastSyncedTime = lastSynced;
    }
    this.statusListeners.forEach((fn) => fn(this.syncStatus, this.lastSyncedTime));
  }

  onSyncStatusChange(callback: (status: SyncStatus, lastSynced: Date | null) => void): () => void {
    this.statusListeners.push(callback);
    callback(this.syncStatus, this.lastSyncedTime);
    return () => {
      this.statusListeners = this.statusListeners.filter((fn) => fn !== callback);
    };
  }

  getSyncStatus(): { status: SyncStatus; lastSynced: Date | null } {
    return { status: this.syncStatus, lastSynced: this.lastSyncedTime };
  }

  private unsubscribeFirestore() {
    if (this.firestoreUnsubscribe) {
      this.firestoreUnsubscribe();
      this.firestoreUnsubscribe = null;
    }
  }

  /**
   * Subscribes to real-time updates from Firestore for the signed-in user.
   */
  private subscribeToUserCloudData(uid: string) {
    this.unsubscribeFirestore();
    if (!db) return;

    this.setStatus('syncing');
    const userDocRef = doc(db, 'users', uid, 'archive', 'main');

    this.firestoreUnsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as CloudArchiveData;
          if (Array.isArray(data.collections) && Array.isArray(data.poems)) {
            // Update local storage without looping
            storageService.saveCollections(data.collections);
            storageService.savePoems(data.poems);
            this.setStatus('synced', data.lastSyncedAt ? new Date(data.lastSyncedAt) : new Date());
          }
        } else {
          // New cloud user: initial push from local data if available
          this.uploadLocalToCloud(uid).catch((err) => {
            console.error('Initial cloud push failed:', err);
            this.setStatus('synced', new Date());
          });
        }
      },
      (error) => {
        console.warn('Firestore subscription error:', error);
        this.setStatus('offline');
      }
    );
  }

  /**
   * Push current local poems & collections to Firestore
   */
  async uploadLocalToCloud(uid?: string): Promise<boolean> {
    const user = authService.getCurrentUser();
    const targetUid = uid || user?.uid;

    if (!targetUid) return false;

    if (user?.isDemo) {
      this.setStatus('syncing');
      await new Promise((resolve) => setTimeout(resolve, 600));
      this.setStatus('synced', new Date());
      return true;
    }

    if (!isFirebaseConfigured() || !db) {
      this.setStatus('unconfigured');
      return false;
    }

    try {
      this.setStatus('syncing');
      const collections = storageService.getCollections();
      const poems = storageService.getPoems();
      const userDocRef = doc(db, 'users', targetUid, 'archive', 'main');

      const payload: CloudArchiveData = {
        collections,
        poems,
        lastSyncedAt: new Date().toISOString(),
        updatedBy: user?.email || targetUid,
      };

      await setDoc(userDocRef, payload, { merge: true });
      this.setStatus('synced', new Date());
      return true;
    } catch (error) {
      console.error('Failed to sync to cloud:', error);
      this.setStatus('offline');
      throw error;
    }
  }

  /**
   * Pull latest data from Firestore to local
   */
  async pullFromCloud(): Promise<{ collections: Collection[]; poems: Poem[] } | null> {
    const user = authService.getCurrentUser();
    if (!user || user.isDemo) {
      return {
        collections: storageService.getCollections(),
        poems: storageService.getPoems(),
      };
    }

    if (!isFirebaseConfigured() || !db) {
      return null;
    }

    try {
      this.setStatus('syncing');
      const userDocRef = doc(db, 'users', user.uid, 'archive', 'main');
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        const data = snap.data() as CloudArchiveData;
        if (Array.isArray(data.collections) && Array.isArray(data.poems)) {
          storageService.saveCollections(data.collections);
          storageService.savePoems(data.poems);
          this.setStatus('synced', data.lastSyncedAt ? new Date(data.lastSyncedAt) : new Date());
          return { collections: data.collections, poems: data.poems };
        }
      }
      this.setStatus('synced', new Date());
      return null;
    } catch (error) {
      console.error('Pull from cloud failed:', error);
      this.setStatus('offline');
      throw error;
    }
  }

  /**
   * Syncs changes automatically whenever local data changes
   */
  async triggerAutoSync(): Promise<void> {
    const user = authService.getCurrentUser();
    if (!user) return;

    if (user.isDemo) {
      this.setStatus('syncing');
      setTimeout(() => this.setStatus('synced', new Date()), 400);
      return;
    }

    if (isFirebaseConfigured() && db) {
      try {
        await this.uploadLocalToCloud(user.uid);
      } catch (e) {
        console.warn('Auto sync warning:', e);
      }
    }
  }
}

export const cloudSyncService = new CloudSyncService();
