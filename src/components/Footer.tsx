import { Moon, Sun } from 'lucide-react';

interface FooterProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Footer({ isDark, onToggleTheme }: FooterProps) {
  return (
    <footer className="bg-white py-10 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div>
          <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            ResumeLens AI
          </span>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Resume text is processed solely for your analysis and never retained on our servers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
          <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white">
            How it works
          </a>
          <a href="#features" className="hover:text-slate-900 dark:hover:text-white">
            Features
          </a>
          <a href="#analyzer" className="hover:text-slate-900 dark:hover:text-white">
            Analyzer
          </a>
          <a href="#faq" className="hover:text-slate-900 dark:hover:text-white">
            FAQ
          </a>
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}
