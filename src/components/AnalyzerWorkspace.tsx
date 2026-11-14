import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
  AlertTriangle,
  Check,
  FileUp,
  History,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { SAMPLE_JOB_DESCRIPTION, SAMPLE_RESUME_TEXT } from '../data/sampleData';
import type { AnalysisStep, HistoryItem, ResumeAnalysisResult } from '../types/analysis';
import { extractTextFromPdf } from '../utils/pdfExtractor';
import { ResultsDashboard } from './ResultsDashboard';

const HISTORY_STORAGE_KEY = 'resumelens_history_v1';
const MAX_HISTORY_ITEMS = 10;

interface AnalyzerWorkspaceProps {
  sampleTriggerCount: number;
}

function loadHistoryFromStorage(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY_ITEMS) : [];
  } catch {
    return [];
  }
}

function saveHistoryToStorage(items: HistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS)));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

const STEP_LABELS: { key: Exclude<AnalysisStep, 'idle'>; label: string }[] = [
  { key: 'reading', label: 'Reading resume' },
  { key: 'matching', label: 'Matching keywords' },
  { key: 'scoring', label: 'Scoring & writing suggestions' },
];

export function AnalyzerWorkspace({ sampleTriggerCount }: AnalyzerWorkspaceProps) {
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistoryFromStorage());
  const [activeItem, setActiveItem] = useState<HistoryItem | null>(null);

  const [inputMode, setInputMode] = useState<'pdf' | 'paste'>('pdf');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [pdfMeta, setPdfMeta] = useState<{ fileName: string; pageCount: number } | null>(null);
  const [pdfParsing, setPdfParsing] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('idle');
  const [apiError, setApiError] = useState<string | null>(null);
  const [showMobileHistory, setShowMobileHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const jdTextareaRef = useRef<HTMLTextAreaElement>(null);
  const stepTimersRef = useRef<number[]>([]);

  useEffect(() => {
    if (sampleTriggerCount > 0) {
      handleLoadSample();
    }
  }, [sampleTriggerCount]);

  useEffect(() => {
    return () => {
      stepTimersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const clearStepTimers = () => {
    stepTimersRef.current.forEach((id) => window.clearTimeout(id));
    stepTimersRef.current = [];
  };

  const handleLoadSample = () => {
    setActiveItem(null);
    setInputMode('paste');
    setResumeText(SAMPLE_RESUME_TEXT);
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setPdfMeta(null);
    setPdfError(null);
    setValidationError(null);
    setApiError(null);
  };

  const handleFile = async (file: File) => {
    setPdfParsing(true);
    setPdfError(null);
    setValidationError(null);

    try {
      const result = await extractTextFromPdf(file);
      setResumeText(result.text);
      setPdfMeta({ fileName: result.fileName, pageCount: result.pageCount });
    } catch (err) {
      setPdfMeta(null);
      setPdfError(err instanceof Error ? err.message : 'Could not extract text from PDF.');
    } finally {
      setPdfParsing(false);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const runAnalysis = async () => {
    const trimmedResume = resumeText.trim();
    const trimmedJd = jobDescription.trim();

    setValidationError(null);
    setApiError(null);

    if (!trimmedResume) {
      setValidationError('Please upload a resume PDF or paste your resume text before analyzing.');
      if (inputMode === 'paste') resumeTextareaRef.current?.focus();
      return;
    }

    if (trimmedResume.length < 40) {
      setValidationError('Your resume text looks too short. Please include at least your skills or experience.');
      if (inputMode === 'paste') resumeTextareaRef.current?.focus();
      return;
    }

    if (!trimmedJd) {
      setValidationError('Please paste the target job description so we can compare keywords and requirements.');
      jdTextareaRef.current?.focus();
      return;
    }

    if (trimmedJd.length < 30) {
      setValidationError('Please paste a more complete job description (at least 30 characters).');
      jdTextareaRef.current?.focus();
      return;
    }

    clearStepTimers();
    setActiveItem(null);
    setAnalysisStep('reading');

    const t1 = window.setTimeout(() => setAnalysisStep('matching'), 1100);
    const t2 = window.setTimeout(() => setAnalysisStep('scoring'), 2600);
    stepTimersRef.current = [t1, t2];

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: trimmedResume,
          jobDescription: trimmedJd,
        }),
      });

      const payload = (await response.json()) as { analysis?: ResumeAnalysisResult; error?: string };

      if (!response.ok || !payload.analysis) {
        throw new Error(payload.error || 'Failed to analyze resume. Please try again.');
      }

      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        resumePreview: trimmedResume.slice(0, 120),
        resumeText: trimmedResume,
        jobDescription: trimmedJd,
        analysis: payload.analysis,
      };

      const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      setHistory(updatedHistory);
      saveHistoryToStorage(updatedHistory);
      setActiveItem(newItem);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong during analysis. Please try again.');
    } finally {
      clearStepTimers();
      setAnalysisStep('idle');
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setActiveItem(item);
    setResumeText(item.resumeText);
    setJobDescription(item.jobDescription);
    setInputMode('paste');
    setPdfMeta(null);
    setPdfError(null);
    setValidationError(null);
    setApiError(null);
    setShowMobileHistory(false);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const next = history.filter((entry) => entry.id !== id);
    setHistory(next);
    saveHistoryToStorage(next);
    if (activeItem?.id === id) {
      setActiveItem(null);
    }
  };

  const handleStartNewAnalysis = () => {
    setActiveItem(null);
    setApiError(null);
    setValidationError(null);
  };

  const isAnalyzing = analysisStep !== 'idle';
  const currentStepIndex = STEP_LABELS.findIndex((s) => s.key === analysisStep);

  return (
    <section
      id="analyzer"
      className="border-b border-slate-200/80 bg-white py-16 sm:py-20 dark:border-slate-800/80 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Title + Mobile History Toggle */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Resume Analyzer Workspace
            </h2>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
              Upload your resume, paste the target job description, and inspect your tailored report.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowMobileHistory((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 lg:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <History className="h-4 w-4" aria-hidden="true" />
            <span>History ({history.length})</span>
          </button>
        </div>

        {/* Workspace Grid: History Sidebar + Main Content */}
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-12">
          {/* History Sidebar */}
          <aside
            aria-label="Analysis history"
            className={`${
              showMobileHistory ? 'block' : 'hidden'
            } rounded-2xl border border-slate-200 bg-slate-50/70 p-4 lg:col-span-3 lg:block dark:border-slate-800 dark:bg-slate-900/70`}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Recent Analyses
                </h3>
              </div>
              <button
                type="button"
                onClick={handleStartNewAnalysis}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-50 whitespace-nowrap shrink-0 dark:text-teal-400 dark:hover:bg-teal-950/60"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>New</span>
              </button>
            </div>

            {history.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No analyses yet
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Your last 10 resume evaluations are saved automatically in this browser.
                </p>
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {history.map((entry) => {
                  const isSelected = activeItem?.id === entry.id;
                  return (
                    <li key={entry.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => handleSelectHistoryItem(entry)}
                        className={`w-full rounded-xl border p-3 pr-9 text-left transition-colors ${
                          isSelected
                            ? 'border-teal-600 bg-white shadow-xs dark:border-teal-500 dark:bg-slate-800'
                            : 'border-slate-200/80 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {entry.analysis.jobTitle}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-mono font-semibold text-teal-700 tabular-nums dark:text-teal-400">
                            {entry.analysis.overallScore}/100
                          </span>
                          <span aria-hidden="true">·</span>
                          <time dateTime={entry.createdAt} className="tabular-nums">
                            {new Date(entry.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </time>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteHistoryItem(entry.id)}
                        aria-label={`Delete analysis for ${entry.analysis.jobTitle}`}
                        title="Remove from history"
                        className="absolute top-2.5 right-2 inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 opacity-75 transition-colors hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-950/60 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          {/* Main Analyzer Column */}
          <div className="lg:col-span-9">
            {/* State 1: Loading / Analyzing */}
            {isAnalyzing && (
              <div
                aria-live="polite"
                className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-teal-600 dark:text-teal-400" aria-hidden="true" />
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        Analyzing your resume against the role
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        This usually takes 5 to 10 seconds.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step-by-step progress */}
                <div className="grid gap-3 sm:grid-cols-3">
                  {STEP_LABELS.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <div
                        key={step.key}
                        className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-xs font-medium transition-colors ${
                          isCurrent
                            ? 'border-teal-600 bg-teal-50/70 text-teal-900 dark:border-teal-500 dark:bg-teal-950/50 dark:text-teal-200'
                            : isCompleted
                              ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300'
                              : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        ) : isCurrent ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-teal-600 dark:text-teal-400" aria-hidden="true" />
                        ) : (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden="true" />
                        )}
                        <span>{step.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Skeleton Dashboard Placeholder */}
                <div className="grid gap-6 pt-2 lg:grid-cols-12" aria-hidden="true">
                  <div className="h-56 animate-pulse rounded-2xl bg-slate-100 lg:col-span-5 dark:bg-slate-800/70" />
                  <div className="h-56 animate-pulse rounded-2xl bg-slate-100 lg:col-span-7 dark:bg-slate-800/70" />
                  <div className="h-36 animate-pulse rounded-2xl bg-slate-100 lg:col-span-6 dark:bg-slate-800/70" />
                  <div className="h-36 animate-pulse rounded-2xl bg-slate-100 lg:col-span-6 dark:bg-slate-800/70" />
                </div>
              </div>
            )}

            {/* State 2: Results Dashboard */}
            {!isAnalyzing && activeItem && (
              <ResultsDashboard item={activeItem} onEditInputs={handleStartNewAnalysis} />
            )}

            {/* State 3: Input Form (shown when not analyzing and no active result) */}
            {!isAnalyzing && !activeItem && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-xs sm:p-7 dark:border-slate-800 dark:bg-slate-900/70">
                {/* Quick Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    1. Resume & 2. Target Job Description
                  </span>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                    <span>Try sample resume and job</span>
                  </button>
                </div>

                {/* Error Banners */}
                {apiError && (
                  <div
                    role="alert"
                    className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-200"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                      <span>{apiError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={runAnalysis}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-700 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-rose-800 whitespace-nowrap shrink-0"
                    >
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Retry</span>
                    </button>
                  </div>
                )}

                {validationError && (
                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Two-part Input Grid */}
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  {/* Part 1: Resume Input */}
                  <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label
                        htmlFor="resume-text-input"
                        className="text-sm font-semibold text-slate-900 dark:text-white"
                      >
                        Your Resume
                      </label>

                      <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
                        <button
                          type="button"
                          onClick={() => setInputMode('pdf')}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                            inputMode === 'pdf'
                              ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                          }`}
                        >
                          Upload PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => setInputMode('paste')}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                            inputMode === 'paste'
                              ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                          }`}
                        >
                          Paste Text
                        </button>
                      </div>
                    </div>

                    {inputMode === 'pdf' && (
                      <div className="mt-4 flex flex-1 flex-col gap-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleFileInputChange}
                          className="sr-only"
                          id="resume-pdf-upload"
                        />
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                          className={`flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-7 text-center transition-colors ${
                            isDragging
                              ? 'border-teal-600 bg-teal-50/60 dark:border-teal-400 dark:bg-teal-950/30'
                              : 'border-slate-300 bg-slate-50/70 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-slate-600'
                          }`}
                        >
                          {pdfParsing ? (
                            <>
                              <Loader2 className="h-7 w-7 animate-spin text-teal-600 dark:text-teal-400" aria-hidden="true" />
                              <p className="mt-2.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                                Extracting text from PDF in browser...
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-700 shadow-xs dark:bg-slate-800 dark:text-teal-400">
                                <FileUp className="h-5 w-5" aria-hidden="true" />
                              </div>
                              <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                                Drop your resume PDF here, or{' '}
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="text-teal-700 underline underline-offset-2 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
                                >
                                  browse files
                                </button>
                              </p>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                PDF up to 10 MB · Parsed locally in your browser
                              </p>
                            </>
                          )}
                        </div>

                        {pdfError && (
                          <div
                            role="alert"
                            className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-relaxed text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-200"
                          >
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>{pdfError}</span>
                          </div>
                        )}

                        {pdfMeta && !pdfError && (
                          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                            <div className="flex items-center gap-2 truncate">
                              <Upload className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              <span className="truncate font-medium">{pdfMeta.fileName}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums shrink-0">
                                {pdfMeta.pageCount} {pdfMeta.pageCount === 1 ? 'page' : 'pages'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setPdfMeta(null);
                                setResumeText('');
                              }}
                              className="ml-2 font-medium text-emerald-800 underline hover:text-emerald-950 dark:text-emerald-300"
                            >
                              Clear
                            </button>
                          </div>
                        )}

                        {resumeText && (
                          <div className="flex flex-1 flex-col">
                            <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                              <span>Extracted text (editable)</span>
                              <span className="font-mono tabular-nums">{resumeText.length} chars</span>
                            </div>
                            <textarea
                              id="resume-text-input"
                              ref={resumeTextareaRef}
                              value={resumeText}
                              onChange={(e) => setResumeText(e.target.value)}
                              rows={6}
                              className="w-full flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800 focus:border-teal-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:focus:border-teal-500 dark:focus:bg-slate-900"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {inputMode === 'paste' && (
                      <div className="mt-4 flex flex-1 flex-col">
                        <textarea
                          id="resume-text-input"
                          ref={resumeTextareaRef}
                          value={resumeText}
                          onChange={(e) => {
                            setResumeText(e.target.value);
                            if (validationError) setValidationError(null);
                          }}
                          placeholder="Paste your full resume text here (education, skills, experience, projects)..."
                          rows={12}
                          className="w-full flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:bg-slate-900"
                        />
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-mono tabular-nums">{resumeText.trim().length} characters</span>
                          {resumeText && (
                            <button
                              type="button"
                              onClick={() => {
                                setResumeText('');
                                setPdfMeta(null);
                              }}
                              className="font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                              Clear resume
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Part 2: Job Description Input */}
                  <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="job-description-input"
                        className="text-sm font-semibold text-slate-900 dark:text-white"
                      >
                        Job Description
                      </label>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Role title, requirements & skills
                      </span>
                    </div>

                    <div className="mt-4 flex flex-1 flex-col">
                      <textarea
                        id="job-description-input"
                        ref={jdTextareaRef}
                        value={jobDescription}
                        onChange={(e) => {
                          setJobDescription(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        placeholder="Paste the job posting details, responsibilities, and required qualifications here..."
                        rows={12}
                        className="w-full flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:bg-slate-900"
                      />
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono tabular-nums">{jobDescription.trim().length} characters</span>
                        {jobDescription && (
                          <button
                            type="button"
                            onClick={() => setJobDescription('')}
                            className="font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                          >
                            Clear job description
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Bar + Privacy Note */}
                <div className="mt-6 flex flex-col justify-between gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center dark:border-slate-800">
                  <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                    <span>
                      Your resume text is only used to generate this analysis and is never stored on our servers. History stays locally in your browser.
                    </span>
                  </p>

                  <button
                    type="button"
                    onClick={runAnalysis}
                    disabled={pdfParsing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap shrink-0"
                  >
                    <span>Analyze Resume</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
