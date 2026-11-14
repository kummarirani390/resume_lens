const STEPS = [
  {
    number: '01',
    title: 'Upload your PDF or paste resume text',
    description:
      'Drop in your resume PDF or paste plain text. Everything in your PDF is extracted directly inside your browser so you can review and edit it before running a check.',
  },
  {
    number: '02',
    title: 'Add the target job description',
    description:
      'Paste the full posting including responsibilities and preferred qualifications. ResumeLens compares your background against the exact skills and seniority expectations of the role.',
  },
  {
    number: '03',
    title: 'Apply targeted rewrites and prepare',
    description:
      'Review your match and ATS scores, close missing keyword gaps, replace vague bullets with quantified rewrites, and grab your tailored cover letter and interview prep.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-slate-200/80 bg-white py-16 sm:py-20 dark:border-slate-800/80 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            How ResumeLens AI works
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
            Three straightforward steps from raw draft to a role-tailored application.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
            >
              <span className="font-mono text-sm font-semibold text-teal-700 tabular-nums dark:text-teal-400">
                {step.number}.
              </span>
              <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
