export interface DiffLine {
  type: 'unchanged' | 'added' | 'removed' | 'empty';
  leftLineNumber?: number;
  rightLineNumber?: number;
  content: string;
}

export interface WordToken {
  type: 'unchanged' | 'added' | 'removed';
  text: string;
}

export interface SideBySideRow {
  left?: {
    lineNumber: number;
    text: string;
    type: 'unchanged' | 'removed' | 'modified';
    words?: WordToken[];
  };
  right?: {
    lineNumber: number;
    text: string;
    type: 'unchanged' | 'added' | 'modified';
    words?: WordToken[];
  };
}

/**
 * Computes Longest Common Subsequence of lines
 */
function computeLCS(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (a[i] === b[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }
  return dp;
}

/**
 * Computes token-level / word-level diff between two lines
 */
export function computeWordDiff(oldLine: string, newLine: string): { leftWords: WordToken[]; rightWords: WordToken[] } {
  // Tokenize preserving spaces
  const tokenize = (str: string) => str.match(/([^\s]+|\s+)/g) || [];
  const wordsA = tokenize(oldLine);
  const wordsB = tokenize(newLine);

  const dp = computeLCS(wordsA, wordsB);
  let i = wordsA.length;
  let j = wordsB.length;

  const leftWords: WordToken[] = [];
  const rightWords: WordToken[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wordsA[i - 1] === wordsB[j - 1]) {
      leftWords.unshift({ type: 'unchanged', text: wordsA[i - 1] });
      rightWords.unshift({ type: 'unchanged', text: wordsB[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rightWords.unshift({ type: 'added', text: wordsB[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      leftWords.unshift({ type: 'removed', text: wordsA[i - 1] });
      i--;
    }
  }

  return { leftWords, rightWords };
}

/**
 * Computes side-by-side row alignment for two draft strings
 */
export function computeSideBySideDiff(textA: string, textB: string): SideBySideRow[] {
  const linesA = textA.split('\n');
  const linesB = textB.split('\n');

  const dp = computeLCS(linesA, linesB);
  let i = linesA.length;
  let j = linesB.length;

  const diffItems: { type: 'equal' | 'removed' | 'added'; aIdx?: number; bIdx?: number }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      diffItems.unshift({ type: 'equal', aIdx: i - 1, bIdx: j - 1 });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diffItems.unshift({ type: 'added', bIdx: j - 1 });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diffItems.unshift({ type: 'removed', aIdx: i - 1 });
      i--;
    }
  }

  // Group into rows, pairing adjacent removals and additions where feasible
  const rows: SideBySideRow[] = [];
  let k = 0;
  while (k < diffItems.length) {
    const item = diffItems[k];

    if (item.type === 'equal') {
      const lineNumA = item.aIdx! + 1;
      const lineNumB = item.bIdx! + 1;
      const text = linesA[item.aIdx!];
      rows.push({
        left: { lineNumber: lineNumA, text, type: 'unchanged' },
        right: { lineNumber: lineNumB, text, type: 'unchanged' },
      });
      k++;
    } else if (item.type === 'removed') {
      // Check if next item is an addition to align as modified
      if (k + 1 < diffItems.length && diffItems[k + 1].type === 'added') {
        const nextItem = diffItems[k + 1];
        const oldText = linesA[item.aIdx!];
        const newText = linesB[nextItem.bIdx!];
        const { leftWords, rightWords } = computeWordDiff(oldText, newText);

        rows.push({
          left: {
            lineNumber: item.aIdx! + 1,
            text: oldText,
            type: 'modified',
            words: leftWords,
          },
          right: {
            lineNumber: nextItem.bIdx! + 1,
            text: newText,
            type: 'modified',
            words: rightWords,
          },
        });
        k += 2;
      } else {
        rows.push({
          left: {
            lineNumber: item.aIdx! + 1,
            text: linesA[item.aIdx!],
            type: 'removed',
          },
        });
        k++;
      }
    } else if (item.type === 'added') {
      rows.push({
        right: {
          lineNumber: item.bIdx! + 1,
          text: linesB[item.bIdx!],
          type: 'added',
        },
      });
      k++;
    }
  }

  return rows;
}

/**
 * Computes unified inline diff lines
 */
export function computeUnifiedDiff(textA: string, textB: string): DiffLine[] {
  const linesA = textA.split('\n');
  const linesB = textB.split('\n');

  const dp = computeLCS(linesA, linesB);
  let i = linesA.length;
  let j = linesB.length;

  const result: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      result.unshift({
        type: linesA[i - 1].trim() === '' ? 'empty' : 'unchanged',
        leftLineNumber: i,
        rightLineNumber: j,
        content: linesA[i - 1],
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({
        type: 'added',
        rightLineNumber: j,
        content: linesB[j - 1],
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      result.unshift({
        type: 'removed',
        leftLineNumber: i,
        content: linesA[i - 1],
      });
      i--;
    }
  }

  return result;
}

/**
 * Summary stats for diff
 */
export function getDiffStats(textA: string, textB: string) {
  const unified = computeUnifiedDiff(textA, textB);
  const additions = unified.filter((l) => l.type === 'added').length;
  const deletions = unified.filter((l) => l.type === 'removed').length;
  return { additions, deletions };
}
