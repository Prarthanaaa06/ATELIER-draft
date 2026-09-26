import * as pdfjsLib from 'pdfjs-dist';

// Configure worker for pdfjs-dist
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF.js worker initialization notice:', e);
  }
}

export interface ParsedPoemCandidate {
  id: string;
  title: string;
  subtitle?: string;
  author?: string;
  stanzas: string;
  lineCount: number;
  stanzaCount: number;
  wordCount: number;
  detectedForm: string; // Sonnet, Haiku, Quatrain, Couplet, Free Verse
  suggestedTags: string[];
  primaryTheme: string;
  selected: boolean;
  pageNumber?: number;
}

export type SortPreference =
  | 'original'
  | 'title-asc'
  | 'title-desc'
  | 'length-asc'
  | 'length-desc'
  | 'form'
  | 'theme';

export type GroupPreference =
  | 'new-collection'
  | 'existing-collection'
  | 'by-theme'
  | 'by-form';

export interface FileAnalysisResult {
  fileName: string;
  fileType: 'pdf' | 'text' | 'json';
  rawText: string;
  poems: ParsedPoemCandidate[];
  suggestedCollectionTitle: string;
  totalLines: number;
  totalWords: number;
}

class FileParserService {
  /**
   * Main entry point: parses dropped File (PDF, TXT, MD, JSON)
   */
  async parseFile(file: File): Promise<FileAnalysisResult> {
    const fileName = file.name;
    const lowerName = fileName.toLowerCase();

    let rawText = '';
    let fileType: 'pdf' | 'text' | 'json' = 'text';

    if (lowerName.endsWith('.pdf')) {
      fileType = 'pdf';
      rawText = await this.extractTextFromPdf(file);
    } else if (lowerName.endsWith('.json')) {
      fileType = 'json';
      rawText = await file.text();
    } else {
      fileType = 'text';
      rawText = await file.text();
    }

    const poems = this.segmentPoems(rawText, fileName);

    // Derived collection title from file name without extension
    const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const suggestedCollectionTitle =
      baseName.charAt(0).toUpperCase() + baseName.slice(1) + ' Manuscripts';

    const totalLines = poems.reduce((acc, p) => acc + p.lineCount, 0);
    const totalWords = poems.reduce((acc, p) => acc + p.wordCount, 0);

    return {
      fileName,
      fileType,
      rawText,
      poems,
      suggestedCollectionTitle,
      totalLines,
      totalWords,
    };
  }

  /**
   * Extracts text from PDF files using pdfjs-dist
   */
  private async extractTextFromPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const textPieces: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      let lastY: number | null = null;
      let pageText = '';

      for (const item of textContent.items as any[]) {
        if ('str' in item) {
          // If Y position changed significantly, treat as new line
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageText += '\n';
          } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
            pageText += ' ';
          }
          pageText += item.str;
          lastY = item.transform[5];
        }
      }

      if (pageText.trim()) {
        textPieces.push(pageText.trim());
      }
    }

    return textPieces.join('\n\n--- PAGE BREAK ---\n\n');
  }

  /**
   * Segments raw manuscript or anthology text into individual poem candidates
   */
  segmentPoems(rawText: string, fileName: string): ParsedPoemCandidate[] {
    // Check if JSON format
    if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
      try {
        const json = JSON.parse(rawText);
        if (Array.isArray(json)) {
          return json.map((item, idx) =>
            this.buildCandidate(
              item.title || `Poem ${idx + 1}`,
              item.stanzas || item.content || item.text || '',
              item.author,
              idx
            )
          );
        } else if (json.poems && Array.isArray(json.poems)) {
          return json.poems.map((item: any, idx: number) =>
            this.buildCandidate(
              item.title || `Poem ${idx + 1}`,
              item.drafts?.[0]?.stanzas || item.stanzas || item.content || '',
              item.author,
              idx
            )
          );
        }
      } catch {
        // Fallback to text parsing
      }
    }

    // Normalized text lines
    const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Split on page breaks or major section headers (---, ===, ***, or 3+ empty lines)
    const rawChunks = normalized
      .split(/(?:\n\s*[-=*]{3,}\s*\n|\n{3,}|\n--- PAGE BREAK ---\n)/g)
      .map((c) => c.trim())
      .filter((c) => c.length > 10);

    const candidates: ParsedPoemCandidate[] = [];

    if (rawChunks.length > 1) {
      rawChunks.forEach((chunk, index) => {
        const candidate = this.extractSinglePoemFromChunk(chunk, index, fileName);
        if (candidate) candidates.push(candidate);
      });
    } else {
      // Single chunk: try to see if multiple poems are marked by headers or Roman Numerals
      const subChunks = this.splitByPoeticHeadings(normalized);
      subChunks.forEach((chunk, index) => {
        const candidate = this.extractSinglePoemFromChunk(chunk, index, fileName);
        if (candidate) candidates.push(candidate);
      });
    }

    // If nothing segmented, treat entire text as one poem
    if (candidates.length === 0 && normalized.trim().length > 0) {
      const fallback = this.extractSinglePoemFromChunk(normalized.trim(), 0, fileName);
      if (fallback) candidates.push(fallback);
    }

    return candidates;
  }

  private splitByPoeticHeadings(text: string): string[] {
    const lines = text.split('\n');
    const sections: string[] = [];
    let currentSection: string[] = [];

    const isHeading = (line: string): boolean => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length > 60) return false;
      // Markdown header
      if (/^#{1,3}\s+\S+/.test(trimmed)) return true;
      // Roman numerals: I., II., III., IV., etc.
      if (/^(?:[IVXLCDM]+|[0-9]+)\.\s+/i.test(trimmed)) return true;
      // All Caps short line followed by blank line
      if (trimmed === trimmed.toUpperCase() && trimmed.length >= 3 && /^[A-Z\s,'"-]+$/.test(trimmed)) return true;
      return false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isHeading(line) && currentSection.length > 0) {
        sections.push(currentSection.join('\n'));
        currentSection = [line];
      } else {
        currentSection.push(line);
      }
    }

    if (currentSection.length > 0) {
      sections.push(currentSection.join('\n'));
    }

    return sections.filter((s) => s.trim().length > 10);
  }

  private extractSinglePoemFromChunk(
    chunk: string,
    index: number,
    fileName: string
  ): ParsedPoemCandidate | null {
    const lines = chunk.split('\n').map((l) => l.trimEnd());
    if (lines.length === 0) return null;

    // Find first non-empty line as title candidate
    let title = '';
    let author: string | undefined = undefined;
    let startIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (!title) {
        // Strip leading # or numbering
        title = line.replace(/^#{1,3}\s+/, '').replace(/^(?:[IVXLCDM]+|[0-9]+)\.\s*/i, '');
        startIndex = i + 1;
      } else if (!author && /^(?:by|author:?|—|-)\s+(.+)/i.test(line)) {
        const match = line.match(/^(?:by|author:?|—|-)\s+(.+)/i);
        if (match) author = match[1].trim();
        startIndex = i + 1;
      } else {
        break;
      }
    }

    const stanzas = lines.slice(startIndex).join('\n').trim();
    if (!stanzas && !title) return null;

    if (!title) {
      title = `${fileName.replace(/\.[^/.]+$/, '')} - Piece ${index + 1}`;
    }

    return this.buildCandidate(title, stanzas || chunk, author, index);
  }

  private buildCandidate(
    title: string,
    stanzas: string,
    author: string | undefined,
    index: number
  ): ParsedPoemCandidate {
    const lines = stanzas.split('\n').filter((l) => l.trim().length > 0);
    const lineCount = lines.length;
    const stanzaBlocks = stanzas.split(/\n\s*\n/).filter((s) => s.trim().length > 0);
    const stanzaCount = Math.max(1, stanzaBlocks.length);
    const wordCount = stanzas.trim() ? stanzas.trim().split(/\s+/).length : 0;

    // Poetic form estimation
    let detectedForm = 'Free Verse';
    if (lineCount === 14) {
      detectedForm = 'Sonnet';
    } else if (lineCount === 3 && wordCount < 25) {
      detectedForm = 'Haiku';
    } else if (lineCount % 4 === 0 && stanzaCount > 1) {
      detectedForm = 'Quatrains';
    } else if (lineCount % 2 === 0 && stanzaCount > 1 && lineCount <= 12) {
      detectedForm = 'Couplets';
    } else if (lineCount > 30) {
      detectedForm = 'Epic / Narrative';
    } else if (lineCount <= 12) {
      detectedForm = 'Lyric Poem';
    }

    // Theme & mood heuristic detection
    const lower = (title + ' ' + stanzas).toLowerCase();
    const tags: string[] = [detectedForm.toLowerCase()];
    let primaryTheme = 'Philosophical & Reflective';

    if (/\b(love|heart|kiss|passion|beloved|darling|adore)\b/.test(lower)) {
      primaryTheme = 'Love & Devotion';
      tags.push('romance');
    } else if (/\b(tree|forest|river|mountain|sea|ocean|flower|spring|autumn|winter|summer|breeze|sky)\b/.test(lower)) {
      primaryTheme = 'Nature & Landscapes';
      tags.push('nature');
    } else if (/\b(death|grief|sorrow|tear|grave|weep|mourn|melancholy|shadow|darkness|lost)\b/.test(lower)) {
      primaryTheme = 'Melancholy & Elegy';
      tags.push('elegy');
    } else if (/\b(night|star|moon|midnight|dream|sleep|twilight|dusk)\b/.test(lower)) {
      primaryTheme = 'Night & Dreams';
      tags.push('nocturne');
    } else if (/\b(time|memory|silence|soul|god|eternity|mind|truth|fate)\b/.test(lower)) {
      primaryTheme = 'Philosophy & Being';
      tags.push('reflection');
    }

    return {
      id: `candidate-${Date.now()}-${index}`,
      title: title.trim(),
      author: author?.trim() || undefined,
      stanzas: stanzas,
      lineCount,
      stanzaCount,
      wordCount,
      detectedForm,
      suggestedTags: Array.from(new Set(tags)),
      primaryTheme,
      selected: true,
    };
  }

  /**
   * Sorts candidate poems according to user preference
   */
  sortPoems(poems: ParsedPoemCandidate[], preference: SortPreference): ParsedPoemCandidate[] {
    const list = [...poems];
    switch (preference) {
      case 'title-asc':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return list.sort((a, b) => b.title.localeCompare(a.title));
      case 'length-asc':
        return list.sort((a, b) => a.lineCount - b.lineCount);
      case 'length-desc':
        return list.sort((a, b) => b.lineCount - a.lineCount);
      case 'form':
        return list.sort((a, b) => a.detectedForm.localeCompare(b.detectedForm));
      case 'theme':
        return list.sort((a, b) => a.primaryTheme.localeCompare(b.primaryTheme));
      case 'original':
      default:
        return list;
    }
  }
}

export const fileParserService = new FileParserService();
