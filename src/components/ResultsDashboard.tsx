import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Wrench,
} from 'lucide-react';
import type { HistoryItem } from '../types/analysis';
import { downloadReportAsPdf, formatReportAsText } from '../utils/exportReport';
import { ScoreRing } from './ScoreRing';

interface ResultsDashboardProps {
  item: HistoryItem;
  onEditInputs: () => void;
}

type ExtraToolTab = 'cover-letter' | 'interview' | 'summary';

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-teal-600 dark:bg-teal-500';
  if (score >= 60) return 'bg-amber-500 dark:bg-amber-400';
  return 'bg-rose-500 dark:bg-rose-400';
}

export function ResultsDashboard({ item, onEditInputs }: ResultsDashboardProps) {
  const { analysis, createdAt } = item;
  const [activeTab, setActiveTab] = useState<ExtraToolTab>('cover-letter');
  const [barsReady, setBarsReady] = useState(false);

  useEffect(() => {
    setBarsReady(false);
    const id = requestAnimationFrame(() => setBarsReady(true));
    return () => cancelAnimationFrame(id);
  }, [item.id]);

  const sectionList = [
    { key: 'skills', label: 'Skills', score: analysis.sectionScores.skills },
    { key: 'experience', label: 'Experience', score: analysis.sectionScores.experience },
    { key: 'education', label: 'Education', score: analysis.sectionScores.education },
    { key: 'projects', label: 'Projects', score: analysis.sectionScores.projects },
    { key: 'formatting', label: 'Formatting', score: analysis.sectionScores.formatting },
  ];

  return (
    <div className="space-y-6">
      {/* Results Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Analysis Report</span>
            <span aria-hidden="true">·</span>
            <time dateTime={createdAt} className="tabular-nums">
              {new Date(createdAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </time>
          </div>
          <h3 className="mt-1 truncate text-lg font-semibold text-slate-900 sm:text-xl dark:text-white">
            {analysis.jobTitle}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <CopyButton text={formatReportAsText(item)} label="Copy Text Report" />

          <button
            type="button"
            onClick={() => downloadReportAsPdf(item)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={onEditInputs}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-teal-700 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Edit / New Check</span>
          </button>
        </div>
      </div>

      {/* Top Score Cards: Overall Ring + ATS Score + Section Bars */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Overall + ATS Scores */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-center border-b border-slate-100 pb-6 text-center dark:border-slate-800">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Overall Role Match
            </h4>
            <div className="mt-4">
              <ScoreRing score={analysis.overallScore} size={144} strokeWidth={11} />
            </div>
          </div>

          <div className="pt-5">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                ATS Compatibility
              </h4>
              <span className="font-mono text-base font-semibold text-teal-700 tabular-nums dark:text-teal-400">
                {analysis.atsScore} / 100
              </span>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(analysis.atsScore)}`}
                style={{ width: barsReady ? `${analysis.atsScore}%` : '0%' }}
              />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {analysis.atsExplanation}
            </p>
          </div>
        </div>

        {/* Section Scores */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Section Breakdown
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Weighted evaluation across the five sections recruiters scan first.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {sectionList.map((sec) => (
              <div key={sec.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{sec.label}</span>
                  <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                    {sec.score}%
                  </span>
                </div>
                <div
                  className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                  role="progressbar"
                  aria-valuenow={sec.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${sec.label} score: ${sec.score}%`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(sec.score)}`}
                    style={{ width: barsReady ? `${sec.score}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matched & Missing Keywords */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Matched Keywords
            </h4>
            <span className="font-mono text-xs font-semibold text-emerald-700 tabular-nums dark:text-emerald-400">
              {analysis.matchedKeywords.length} found
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Skills and qualifications from the posting already present in your resume.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {analysis.matchedKeywords.length > 0 ? (
              analysis.matchedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/60 dark:text-emerald-300"
                >
                  <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{kw}</span>
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No direct keyword matches detected.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Missing Keywords
            </h4>
            <span className="font-mono text-xs font-semibold text-rose-700 tabular-nums dark:text-rose-400">
              {analysis.missingKeywords.length} missing
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Important terms from the job description to weave in honestly where you have experience.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {analysis.missingKeywords.length > 0 ? (
              analysis.missingKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/60 dark:text-rose-300"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{kw}</span>
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Great coverage—no major keywords from the posting are missing.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses/Fixes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Key Strengths
          </h4>
          <ul className="mt-4 space-y-3.5">
            {analysis.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Weaknesses & Specific Fixes
          </h4>
          <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {analysis.weaknessesAndFixes.map((wf, idx) => (
              <li key={idx} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start gap-2.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <span>{wf.weakness}</span>
                </div>
                <p className="mt-1.5 pl-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  <span className="font-medium text-teal-700 dark:text-teal-400">Fix: </span>
                  {wf.fix}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bullet Rewrite Suggestions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-white">
              Before & After Bullet Rewrites
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Three weak bullets from your resume rewritten with strong action verbs and measurable impact.
            </p>
          </div>
        </div>

        <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
          {analysis.rewrites.map((rw, idx) => (
            <div key={idx} className="py-5 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  0{idx + 1}. {rw.context}
                </span>
                <CopyButton text={rw.after} label="Copy improved bullet" />
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                    Before
                  </span>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {rw.before}
                  </p>
                </div>

                <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900/60 dark:bg-teal-950/30">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400">
                    <span>After</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-100">
                    {rw.after}
                  </p>
                </div>
              </div>

              <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400">
                Why it works: {rw.impactNote}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Extra Tools Tabs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-white">
              Application Toolkit
            </h4>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Tailored writing and interview preparation generated for this exact role.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Application toolkit tabs"
            className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'cover-letter'}
              onClick={() => setActiveTab('cover-letter')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'cover-letter'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Cover Letter</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'interview'}
              onClick={() => setActiveTab('interview')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'interview'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Interview Questions (8)</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'summary'}
              onClick={() => setActiveTab('summary')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'summary'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Professional Summary</span>
            </button>
          </div>
        </div>

        {/* Tab Panels */}
        <div className="pt-5">
          {activeTab === 'cover-letter' && (
            <div role="tabpanel" aria-label="Cover Letter" className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Short, role-specific cover letter ready to customize with hiring manager details.
                </p>
                <CopyButton text={analysis.coverLetter} label="Copy Cover Letter" />
              </div>
              <div className="whitespace-pre-line rounded-xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
                {analysis.coverLetter}
              </div>
            </div>
          )}

          {activeTab === 'interview' && (
            <div role="tabpanel" aria-label="Interview Questions" className="space-y-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Eight likely questions tailored to your projects and the requirements in this job description.
              </p>
              <ol className="divide-y divide-slate-100 dark:divide-slate-800">
                {analysis.interviewQuestions.map((q, idx) => (
                  <li key={idx} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        <span className="mr-2 font-mono text-teal-700 tabular-nums dark:text-teal-400">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        {q.question}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {q.focusArea}
                      </span>
                    </div>
                    <p className="mt-1.5 pl-7 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      <span className="font-medium text-slate-700 dark:text-slate-200">Prep angle: </span>
                      {q.tip}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {activeTab === 'summary' && (
            <div role="tabpanel" aria-label="Professional Summary" className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Concise 3-line summary tailored for the top of your resume.
                </p>
                <CopyButton text={analysis.professionalSummary} label="Copy Summary" />
              </div>
              <div className="rounded-xl border border-teal-200/80 bg-teal-50/40 p-5 text-sm leading-relaxed text-slate-900 dark:border-teal-900/50 dark:bg-teal-950/20 dark:text-slate-100">
                {analysis.professionalSummary}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
