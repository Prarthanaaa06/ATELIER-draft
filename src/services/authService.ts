import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

const DEMO_USER_KEY = 'poetry_archive_demo_user';

class AuthService {
  private listeners: ((user: UserProfile | null) => void)[] = [];
  private currentUser: UserProfile | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Check if demo user is stored locally
    const storedDemo = localStorage.getItem(DEMO_USER_KEY);
    if (storedDemo) {
      try {
        this.currentUser = JSON.parse(storedDemo);
      } catch {
        localStorage.removeItem(DEMO_USER_KEY);
      }
    }

    if (isFirebaseConfigured() && auth) {
      onAuthStateChanged(auth, (user: User | null) => {
        if (user) {
          const profile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            isDemo: false,
          };
          this.currentUser = profile;
          localStorage.removeItem(DEMO_USER_KEY);
          this.notify(profile);
        } else {
          // If no Firebase user, check if demo user is active
          const demo = localStorage.getItem(DEMO_USER_KEY);
          if (demo) {
            this.currentUser = JSON.parse(demo);
            this.notify(this.currentUser);
          } else {
            this.currentUser = null;
            this.notify(null);
          }
        }
      });
    }
  }

  private notify(user: UserProfile | null) {
    this.listeners.forEach((listener) => listener(user));
  }

  onAuthStateChanged(listener: (user: UserProfile | null) => void): () => void {
    this.listeners.push(listener);
    // Send immediate initial state
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  async signInWithGoogle(): Promise<UserProfile> {
    if (!isFirebaseConfigured() || !auth || !googleProvider) {
      throw new Error('FIREBASE_NOT_CONFIGURED');
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const profile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        isDemo: false,
      };
      this.currentUser = profile;
      localStorage.removeItem(DEMO_USER_KEY);
      this.notify(profile);
      return profile;
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  }

  signInDemoAccount(name: string = 'Sylvia Plath (Demo)', email: string = 'sylvia@google.poetry'): UserProfile {
    const demoProfile: UserProfile = {
      uid: 'demo-google-user-101',
      displayName: name,
      email: email,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isDemo: true,
    };
    this.currentUser = demoProfile;
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoProfile));
    this.notify(demoProfile);
    return demoProfile;
  }

  async signOut(): Promise<void> {
    if (this.currentUser?.isDemo) {
      localStorage.removeItem(DEMO_USER_KEY);
      this.currentUser = null;
      this.notify(null);
      return;
    }

    if (auth) {
      await fbSignOut(auth);
    }
    localStorage.removeItem(DEMO_USER_KEY);
    this.currentUser = null;
    this.notify(null);
  }
}

export const authService = new AuthService();
