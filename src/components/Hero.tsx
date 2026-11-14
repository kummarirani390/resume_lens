import { ArrowRight, Check, Minus } from 'lucide-react';
import { HERO_PREVIEW_ANALYSIS } from '../data/sampleData';
import { ScoreRing } from './ScoreRing';

interface HeroProps {
  onAnalyzeClick: () => void;
  onTrySampleClick: () => void;
}

const SECTION_BARS = [
  { label: 'Skills', value: HERO_PREVIEW_ANALYSIS.sectionScores.skills },
  { label: 'Experience', value: HERO_PREVIEW_ANALYSIS.sectionScores.experience },
  { label: 'Education', value: HERO_PREVIEW_ANALYSIS.sectionScores.education },
  { label: 'Projects', value: HERO_PREVIEW_ANALYSIS.sectionScores.projects },
  { label: 'Formatting', value: HERO_PREVIEW_ANALYSIS.sectionScores.formatting },
];

export function Hero({ onAnalyzeClick, onTrySampleClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-50/70 to-white py-14 sm:py-20 lg:py-24 dark:border-slate-800/80 dark:from-slate-900/40 dark:to-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Core Proposition */}
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-sm font-medium text-teal-700 dark:text-teal-400">
              Built for students, graduates, and working engineers
            </p>

            <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-slate-900 [text-wrap:balance] sm:text-5xl dark:text-white">
              See how your resume scores before a recruiter ever reads it.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
              Compare your resume against any job description in seconds. Get an honest ATS compatibility score, spot missing keywords, rewrite weak bullet points with measurable impact, and prepare for the interview.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onAnalyzeClick}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 whitespace-nowrap shrink-0"
              >
                <span>Analyze My Resume</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onTrySampleClick}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Load sample resume & job
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span>In-browser PDF parsing</span>
              <span aria-hidden="true">·</span>
              <span>Structured ATS scoring</span>
              <span aria-hidden="true">·</span>
              <span>No account required</span>
            </div>
          </div>

          {/* Right Column: Live Dashboard Preview */}
          <div className="lg:col-span-6">
            <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
              {/* Preview Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Sample Evaluation Preview
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                    {HERO_PREVIEW_ANALYSIS.jobTitle}
                  </h2>
                </div>
                <div className="text-right font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                  ATS Score: <span className="font-semibold text-slate-900 dark:text-slate-100">{HERO_PREVIEW_ANALYSIS.atsScore}/100</span>
                </div>
              </div>

              {/* Score Ring + Section Breakdown */}
              <div className="my-6 grid items-center gap-6 sm:grid-cols-12">
                <div className="flex justify-center sm:col-span-5">
                  <ScoreRing score={HERO_PREVIEW_ANALYSIS.overallScore} size={124} strokeWidth={10} animate={false} />
                </div>
                <div className="space-y-3 sm:col-span-7">
                  {SECTION_BARS.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                        <span className="font-mono text-slate-600 tabular-nums dark:text-slate-400">{item.value}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-teal-600 dark:bg-teal-500"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keyword Snapshot & Rewrite Preview */}
              <div className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-1.5">
                  {HERO_PREVIEW_ANALYSIS.matchedKeywords.slice(0, 4).map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    >
                      <Check className="h-3 w-3" aria-hidden="true" />
                      {kw}
                    </span>
                  ))}
                  {HERO_PREVIEW_ANALYSIS.missingKeywords.slice(0, 2).map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                    >
                      <Minus className="h-3 w-3" aria-hidden="true" />
                      {kw}
                    </span>
                  ))}
                </div>

                <div className="rounded-xl bg-slate-50 p-3.5 text-xs leading-relaxed dark:bg-slate-800/70">
                  <p className="font-medium text-slate-500 line-through dark:text-slate-400">
                    {HERO_PREVIEW_ANALYSIS.rewrites[0].before}
                  </p>
                  <p className="mt-1.5 font-medium text-slate-900 dark:text-slate-100">
                    {HERO_PREVIEW_ANALYSIS.rewrites[0].after}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
