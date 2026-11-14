import { jsPDF } from 'jspdf';
import type { HistoryItem } from '../types/analysis';

export function formatReportAsText(item: HistoryItem): string {
  const { analysis, createdAt } = item;
  const dateStr = new Date(createdAt).toLocaleString();

  const lines: string[] = [
    'RESUMELENS AI — RESUME ANALYSIS REPORT',
    `Target Role: ${analysis.jobTitle}`,
    `Analyzed: ${dateStr}`,
    '',
    'SCORES',
    `Overall Match Score: ${analysis.overallScore}/100`,
    `ATS Compatibility Score: ${analysis.atsScore}/100`,
    `ATS Note: ${analysis.atsExplanation}`,
    '',
    'SECTION BREAKDOWN',
    `- Skills: ${analysis.sectionScores.skills}/100`,
    `- Experience: ${analysis.sectionScores.experience}/100`,
    `- Education: ${analysis.sectionScores.education}/100`,
    `- Projects: ${analysis.sectionScores.projects}/100`,
    `- Formatting: ${analysis.sectionScores.formatting}/100`,
    '',
    'KEYWORDS',
    `Matched (${analysis.matchedKeywords.length}): ${analysis.matchedKeywords.join(', ') || 'None'}`,
    `Missing (${analysis.missingKeywords.length}): ${analysis.missingKeywords.join(', ') || 'None'}`,
    '',
    'STRENGTHS',
    ...analysis.strengths.map((s, idx) => `${idx + 1}. ${s}`),
    '',
    'WEAKNESSES & ACTIONABLE FIXES',
    ...analysis.weaknessesAndFixes.map((w, idx) => `${idx + 1}. Issue: ${w.weakness}\n   Fix: ${w.fix}`),
    '',
    'REWRITE SUGGESTIONS (BEFORE -> AFTER)',
    ...analysis.rewrites.map(
      (r, idx) =>
        `${idx + 1}. [${r.context}]\n   Before: ${r.before}\n   After: ${r.after}\n   Why: ${r.impactNote}`
    ),
    '',
    'REWRITTEN PROFESSIONAL SUMMARY',
    analysis.professionalSummary,
    '',
    'TAILORED COVER LETTER',
    analysis.coverLetter,
    '',
    'LIKELY INTERVIEW QUESTIONS',
    ...analysis.interviewQuestions.map(
      (q, idx) => `${idx + 1}. [${q.focusArea}] ${q.question}\n   Tip: ${q.tip}`
    ),
  ];

  return lines.join('\n');
}

export function downloadReportAsPdf(item: HistoryItem): void {
  const { analysis, createdAt } = item;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  let y = 52;

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 48) {
      doc.addPage();
      y = 52;
    }
  };

  const writeSectionHeading = (title: string) => {
    ensureSpace(32);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(13, 148, 136); // #0D9488
    doc.text(title.toUpperCase(), margin, y);
    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;
  };

  const writeWrapped = (
    text: string,
    options: { size?: number; bold?: boolean; color?: [number, number, number]; indent?: number; gap?: number } = {}
  ) => {
    const size = options.size ?? 10;
    const indent = options.indent ?? 0;
    const gap = options.gap ?? 6;
    doc.setFont('helvetica', options.bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    const [r, g, b] = options.color ?? [30, 41, 59];
    doc.setTextColor(r, g, b);

    const wrapped = doc.splitTextToSize(text, contentWidth - indent) as string[];
    const lineHeight = size * 1.42;

    for (const line of wrapped) {
      ensureSpace(lineHeight + 2);
      doc.text(line, margin + indent, y);
      y += lineHeight;
    }
    y += gap;
  };

  // Document Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text('ResumeLens AI — Analysis Report', margin, y);
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `${analysis.jobTitle}  |  Generated ${new Date(createdAt).toLocaleDateString()}`,
    margin,
    y
  );
  y += 20;

  // Scores Overview
  writeSectionHeading('Match & ATS Overview');
  writeWrapped(
    `Overall Match Score: ${analysis.overallScore}/100    |    ATS Compatibility Score: ${analysis.atsScore}/100`,
    { bold: true, size: 11, color: [15, 23, 42], gap: 6 }
  );
  writeWrapped(analysis.atsExplanation, { size: 10, color: [51, 65, 85], gap: 10 });

  writeWrapped(
    `Section Scores — Skills: ${analysis.sectionScores.skills}%  |  Experience: ${analysis.sectionScores.experience}%  |  Education: ${analysis.sectionScores.education}%  |  Projects: ${analysis.sectionScores.projects}%  |  Formatting: ${analysis.sectionScores.formatting}%`,
    { size: 9.5, color: [71, 85, 105], gap: 10 }
  );

  // Keywords
  writeSectionHeading('Keyword Comparison');
  writeWrapped(`Matched Keywords (${analysis.matchedKeywords.length}): ${analysis.matchedKeywords.join(', ') || 'None'}`, {
    size: 9.5,
    color: [22, 101, 52],
    gap: 6,
  });
  writeWrapped(`Missing Keywords (${analysis.missingKeywords.length}): ${analysis.missingKeywords.join(', ') || 'None'}`, {
    size: 9.5,
    color: [153, 27, 27],
    gap: 10,
  });

  // Strengths
  writeSectionHeading('Strengths');
  analysis.strengths.forEach((strength, idx) => {
    writeWrapped(`${idx + 1}. ${strength}`, { size: 10, gap: 5 });
  });

  // Weaknesses & Fixes
  writeSectionHeading('Weaknesses & Actionable Fixes');
  analysis.weaknessesAndFixes.forEach((item, idx) => {
    writeWrapped(`${idx + 1}. ${item.weakness}`, { bold: true, size: 10, color: [15, 23, 42], gap: 2 });
    writeWrapped(`Fix: ${item.fix}`, { size: 9.5, color: [51, 65, 85], indent: 12, gap: 8 });
  });

  // Rewrites
  writeSectionHeading('Bullet Rewrite Suggestions');
  analysis.rewrites.forEach((rw, idx) => {
    writeWrapped(`${idx + 1}. ${rw.context}`, { bold: true, size: 10, color: [15, 23, 42], gap: 3 });
    writeWrapped(`Before: ${rw.before}`, { size: 9.5, color: [100, 116, 139], indent: 12, gap: 3 });
    writeWrapped(`After: ${rw.after}`, { size: 9.5, color: [13, 148, 136], bold: true, indent: 12, gap: 3 });
    writeWrapped(`Impact: ${rw.impactNote}`, { size: 9, color: [71, 85, 105], indent: 12, gap: 8 });
  });

  // Professional Summary
  writeSectionHeading('Rewritten Professional Summary');
  writeWrapped(analysis.professionalSummary, { size: 10, gap: 10 });

  // Cover Letter
  writeSectionHeading('Tailored Cover Letter');
  writeWrapped(analysis.coverLetter, { size: 10, gap: 10 });

  // Interview Questions
  writeSectionHeading('8 Likely Interview Questions');
  analysis.interviewQuestions.forEach((q, idx) => {
    writeWrapped(`${idx + 1}. [${q.focusArea}] ${q.question}`, { bold: true, size: 10, color: [15, 23, 42], gap: 2 });
    writeWrapped(`Preparation Tip: ${q.tip}`, { size: 9.5, color: [71, 85, 105], indent: 12, gap: 7 });
  });

  const slug = analysis.jobTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'resume-analysis';

  doc.save(`ResumeLens-${slug}.pdf`);
}
