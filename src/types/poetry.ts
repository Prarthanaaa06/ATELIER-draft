export interface Draft {
  id: string;
  versionNumber: number;
  versionTag: string; // e.g., 'v1-init', 'v2-revision', 'v3-final'
  timestamp: string; // ISO date string or formatted
  revisionNote: string; // Short note on changes
  stanzas: string; // Raw stanza text (line breaks preserved)
  wordCount?: number;
  lineCount?: number;
}

export interface Poem {
  id: string;
  title: string;
  collectionId: string;
  author: string;
  subtitle?: string;
  dateCreated: string;
  tags: string[];
  drafts: Draft[]; // Chronological list of immutable drafts
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  createdDate: string;
  coverMotto?: string;
}

export type ViewFilter = {
  type: 'all' | 'collection';
  collectionId?: string;
};

export type ReadingModeTheme = 'warm' | 'cream' | 'dark' | 'contrast';
