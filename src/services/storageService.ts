import { Collection, Poem, Draft, AppTheme } from '../types/poetry';
import { INITIAL_COLLECTIONS, INITIAL_POEMS } from '../data/mockPoetry';

const STORAGE_KEYS = {
  COLLECTIONS: 'poetry_archive_collections_v2',
  POEMS: 'poetry_archive_poems_v2',
  THEME: 'poetry_archive_theme_v1',
};

class StorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private changeListeners: (() => void)[] = [];

  onStorageChange(listener: () => void): () => void {
    this.changeListeners.push(listener);
    return () => {
      this.changeListeners = this.changeListeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.changeListeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error('Storage listener error:', e);
      }
    });
  }

  // --- Collections ---
  getCollections(): Collection[] {
    if (!this.isBrowser()) return INITIAL_COLLECTIONS;
    const stored = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    if (!stored) {
      this.saveCollections(INITIAL_COLLECTIONS);
      return INITIAL_COLLECTIONS;
    }
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_COLLECTIONS;
    } catch (e) {
      console.error('Failed to parse collections from storage:', e);
      return INITIAL_COLLECTIONS;
    }
  }

  saveCollections(collections: Collection[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    this.notify();
  }

  createCollection(title: string, description: string, coverMotto?: string): Collection {
    const collections = this.getCollections();
    const newCollection: Collection = {
      id: `col-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      createdDate: new Date().toISOString().split('T')[0],
      coverMotto: coverMotto?.trim(),
    };
    const updated = [...collections, newCollection];
    this.saveCollections(updated);
    return newCollection;
  }

  deleteCollection(id: string): void {
    const collections = this.getCollections().filter((c) => c.id !== id);
    this.saveCollections(collections);
  }

  updateCollection(
    id: string,
    updates: Partial<Pick<Collection, 'title' | 'description' | 'coverMotto'>>
  ): Collection {
    const collections = this.getCollections();
    const index = collections.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Collection not found');

    const updatedCollection: Collection = {
      ...collections[index],
      ...updates,
      title: updates.title !== undefined ? updates.title.trim() : collections[index].title,
      description: updates.description !== undefined ? updates.description.trim() : collections[index].description,
      coverMotto: updates.coverMotto !== undefined ? updates.coverMotto?.trim() : collections[index].coverMotto,
    };

    collections[index] = updatedCollection;
    this.saveCollections(collections);
    return updatedCollection;
  }

  // --- Poems ---
  getPoems(): Poem[] {
    if (!this.isBrowser()) return INITIAL_POEMS;
    const stored = localStorage.getItem(STORAGE_KEYS.POEMS);
    if (!stored) {
      this.savePoems(INITIAL_POEMS);
      return INITIAL_POEMS;
    }
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_POEMS;
    } catch (e) {
      console.error('Failed to parse poems from storage:', e);
      return INITIAL_POEMS;
    }
  }

  savePoems(poems: Poem[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.POEMS, JSON.stringify(poems));
    this.notify();
  }

  getPoem(id: string): Poem | undefined {
    return this.getPoems().find((p) => p.id === id);
  }

  createPoem(
    title: string,
    collectionId: string,
    initialStanzas: string,
    author: string = 'Anonymous',
    subtitle?: string,
    tags: string[] = [],
    initialNote: string = 'Initial draft'
  ): Poem {
    const poems = this.getPoems();
    const draftId = `draft-${Date.now()}-v1`;
    const initialDraft: Draft = {
      id: draftId,
      versionNumber: 1,
      versionTag: 'v1-init',
      timestamp: new Date().toISOString(),
      revisionNote: initialNote.trim() || 'Initial manuscript',
      stanzas: initialStanzas,
    };

    const newPoem: Poem = {
      id: `poem-${Date.now()}`,
      title: title.trim() || 'Untitled Poem',
      subtitle: subtitle?.trim(),
      collectionId,
      author: author.trim() || 'Anonymous',
      dateCreated: new Date().toISOString(),
      tags: tags.map((t) => t.trim()).filter(Boolean),
      drafts: [initialDraft],
    };

    const updated = [newPoem, ...poems];
    this.savePoems(updated);
    return newPoem;
  }

  addDraft(poemId: string, stanzas: string, revisionNote: string): Draft {
    const poems = this.getPoems();
    const poemIndex = poems.findIndex((p) => p.id === poemId);
    if (poemIndex === -1) {
      throw new Error(`Poem with id ${poemId} not found`);
    }

    const poem = poems[poemIndex];
    const nextVersionNumber = (poem.drafts.length > 0 ? Math.max(...poem.drafts.map((d) => d.versionNumber)) : 0) + 1;
    const versionTag = nextVersionNumber === 1 ? 'v1-init' : `v${nextVersionNumber}-revision`;

    const newDraft: Draft = {
      id: `draft-${Date.now()}-v${nextVersionNumber}`,
      versionNumber: nextVersionNumber,
      versionTag,
      timestamp: new Date().toISOString(),
      revisionNote: revisionNote.trim() || `Draft revision ${nextVersionNumber}`,
      stanzas: stanzas,
    };

    const updatedPoem: Poem = {
      ...poem,
      drafts: [...poem.drafts, newDraft],
    };

    poems[poemIndex] = updatedPoem;
    this.savePoems(poems);
    return newDraft;
  }

  updatePoemMetadata(
    poemId: string,
    updates: Partial<Pick<Poem, 'title' | 'subtitle' | 'collectionId' | 'tags' | 'author'>>
  ): Poem {
    const poems = this.getPoems();
    const poemIndex = poems.findIndex((p) => p.id === poemId);
    if (poemIndex === -1) throw new Error('Poem not found');

    const updatedPoem: Poem = {
      ...poems[poemIndex],
      ...updates,
    };
    poems[poemIndex] = updatedPoem;
    this.savePoems(poems);
    return updatedPoem;
  }

  deletePoem(id: string): void {
    const poems = this.getPoems().filter((p) => p.id !== id);
    this.savePoems(poems);
  }

  resetToMockData(): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(INITIAL_COLLECTIONS));
    localStorage.setItem(STORAGE_KEYS.POEMS, JSON.stringify(INITIAL_POEMS));
  }

  exportArchiveJson(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      collections: this.getCollections(),
      poems: this.getPoems(),
    };
    return JSON.stringify(data, null, 2);
  }

  importArchiveJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data && Array.isArray(data.collections) && Array.isArray(data.poems)) {
        this.saveCollections(data.collections);
        this.savePoems(data.poems);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // --- Theme ---
  getAppTheme(): AppTheme {
    if (!this.isBrowser()) return 'brown';
    const stored = localStorage.getItem('poetry_archive_theme_v2') as AppTheme;
    if (['dark', 'light', 'brown', 'pastel'].includes(stored)) {
      return stored;
    }
    // Check legacy theme setting
    const legacy = localStorage.getItem(STORAGE_KEYS.THEME);
    if (legacy === 'dark') return 'dark';
    return 'brown';
  }

  saveAppTheme(theme: AppTheme): void {
    if (!this.isBrowser()) return;
    localStorage.setItem('poetry_archive_theme_v2', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }
}

export const storageService = new StorageService();
