import { FileCheck2, SearchCheck, PenLine, BriefcaseBusiness } from 'lucide-react';

const FEATURES = [
  {
    icon: FileCheck2,
    title: 'ATS & Section-Level Scoring',
    description:
      'See how applicant tracking systems read your resume alongside dedicated scores for Skills, Experience, Education, Projects, and Formatting.',
  },
  {
    icon: SearchCheck,
    title: 'Matched & Missing Keyword Audit',
    description:
      'Spot the exact frameworks, domain tools, and qualifications the hiring team expects—clearly separated into what you already show and what is missing.',
  },
  {
    icon: PenLine,
    title: 'Before & After Bullet Rewrites',
    description:
      'Turns passive, duty-based bullets from your resume into concise, action-verb statements framed around measurable outcomes.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Cover Letter & Interview Prep',
    description:
      'Generates a tailored 3-paragraph cover letter, a 3-line resume summary, and 8 likely interview questions grounded in your actual gaps.',
  },
];

export function Features() {
  return (
    <section id="features" className="border-b border-slate-200/80 bg-slate-50/60 py-16 sm:py-20 dark:border-slate-800/80 dark:bg-slate-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Built to catch what generic spellcheckers miss
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
            Every recommendation ties directly to the resume you provide and the job you are applying for.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/70 dark:text-teal-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
