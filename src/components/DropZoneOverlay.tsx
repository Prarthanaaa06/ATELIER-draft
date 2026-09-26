import React from 'react';
import { UploadCloud, FileText, Sparkles, Feather } from 'lucide-react';

interface DropZoneOverlayProps {
  isDragging: boolean;
}

export const DropZoneOverlay: React.FC<DropZoneOverlayProps> = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-8 bg-stone-900/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl p-10 rounded-3xl border-2 border-dashed border-amber-500/80 bg-stone-50/95 dark:bg-stone-900/95 shadow-2xl flex flex-col items-center text-center space-y-4 animate-scale-up">
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
          <UploadCloud className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-widest">
            <Feather className="w-3.5 h-3.5" />
            <span>Manuscript &amp; Anthology Intake</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Drop Poetry File or PDF Here
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
            Our atelier will parse the manuscript, detect poetic forms (sonnets, quatrains, free verse), and let you sort and organize into custom anthologies.
          </p>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            PDF Manuscripts (.pdf)
          </span>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            Text &amp; Markdown (.txt, .md)
          </span>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            JSON Archives (.json)
          </span>
        </div>
      </div>
    </div>
  );
};
