import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'How does ResumeLens AI calculate the overall match and ATS scores?',
    answer:
      'Your resume is evaluated directly against the target job description across core technical and domain skills, experience impact, education alignment, projects, and ATS formatting clarity. The ATS score specifically checks section hierarchy, clear headings, and keyword coverage.',
  },
  {
    question: 'Is my resume stored on your servers?',
    answer:
      'No. Your PDF is parsed directly inside your browser, and the extracted text is sent solely for the live analysis request. Your last 10 reports are saved only in your own browser localStorage so you can revisit them anytime.',
  },
  {
    question: 'What if my PDF cannot be read or is a scanned image?',
    answer:
      'ResumeLens AI checks that your PDF contains selectable text. If you upload an image-only scan or a password-protected file, you will see a clear notice prompting you to export a text-based PDF or paste your resume text directly.',
  },
  {
    question: 'How should I use the Before and After bullet rewrites?',
    answer:
      'Use the rewritten bullets as structural templates—replacing any estimated percentages or user counts with your true metrics before submitting applications. Always make sure every keyword and metric reflects your real experience.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="border-b border-slate-200/80 bg-slate-50/60 py-16 sm:py-20 dark:border-slate-800/80 dark:bg-slate-900/30"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
            Clear answers about scoring, privacy, PDF parsing, and bullet rewrites.
          </p>
        </div>

        <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50/70 sm:text-base dark:text-white dark:hover:bg-slate-800/50"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 dark:text-slate-400 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
