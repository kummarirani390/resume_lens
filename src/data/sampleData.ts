import type { ResumeAnalysisResult } from '../types/analysis';

export const SAMPLE_RESUME_TEXT = `MAYA LIN
San Francisco, CA | maya.lin@email.com | github.com/mayalin-dev | linkedin.com/in/mayalin

EDUCATION
University of California, Davis — B.S. in Computer Science (Expected May 2026)
GPA: 3.74 / 4.00 | Relevant Coursework: Data Structures, Databases, Distributed Systems, Web Programming

SKILLS
Languages: TypeScript, JavaScript, Python, SQL, HTML/CSS
Frameworks & Libraries: React, Node.js, Express, Tailwind CSS, Next.js
Tools & Platforms: Git, PostgreSQL, Docker, REST APIs, Figma, Jest

EXPERIENCE
Software Engineering Intern — ClearLedger Financial (Jun 2025 – Aug 2025)
• Worked on the merchant analytics dashboard using React and TypeScript
• Helped the backend team improve slow PostgreSQL queries and API endpoints
• Wrote unit tests for components and fixed UI bugs reported by QA
• Participated in sprint planning and code reviews with senior engineers

Undergraduate Teaching Assistant — UC Davis CS Department (Sep 2024 – Present)
• Held weekly office hours for 120 students in Data Structures & Algorithms
• Graded assignments and helped debug C++ and Python programs

PROJECTS
CampusEats — Group Meal Ordering Web App
• Built a web app with React, Node.js, and PostgreSQL for students to split group takeout orders
• Implemented user login and order tracking pages
• Deployed the application on a cloud server

StudySync — Collaborative Flashcard Tool
• Created a real-time flashcard deck app using React and WebSockets
• Added keyboard shortcuts and dark mode support`;

export const SAMPLE_JOB_DESCRIPTION = `Full-Stack Software Engineer (Early Career / New Grad)
Horizon Payments — San Francisco, CA (Hybrid)

About the Role
Horizon Payments builds modern invoicing and treasury infrastructure for high-growth startups. We are looking for an early-career Full-Stack Software Engineer to help design, build, and scale customer-facing web workflows and reliable payment APIs.

What You'll Do
• Architect and ship responsive, accessible TypeScript and React interfaces in collaboration with product designers
• Design and maintain scalable REST and GraphQL APIs using Node.js and PostgreSQL
• Optimize database indexing, caching (Redis), and frontend bundle performance for low-latency dashboards
• Write automated integration and end-to-end tests (Jest, Playwright) and participate in CI/CD deployments via GitHub Actions and Docker
• Instrument observability metrics and error tracking to maintain 99.9% service reliability

Required Qualifications
• B.S. in Computer Science or equivalent practical experience
• Strong proficiency in TypeScript, React, Node.js, and relational databases (PostgreSQL)
• Experience building production web applications with clean state management and RESTful APIs
• Familiarity with automated testing, Git workflows, and containerized environments (Docker)

Preferred Qualifications
• Experience with Redis caching, GraphQL, or Playwright E2E testing
• Background in fintech, payment workflows, or data-heavy SaaS dashboards
• Demonstrated ownership of measurable product or latency improvements`;

export const HERO_PREVIEW_ANALYSIS: ResumeAnalysisResult = {
  jobTitle: 'Full-Stack Software Engineer · Horizon Payments',
  overallScore: 82,
  atsScore: 86,
  atsExplanation:
    'Standard single-column hierarchy and clean section headings parse reliably across major ATS platforms. Adding explicit testing and CI/CD terms will lift automated ranking further.',
  sectionScores: {
    skills: 84,
    experience: 78,
    education: 94,
    projects: 81,
    formatting: 88,
  },
  matchedKeywords: [
    'TypeScript',
    'React',
    'Node.js',
    'PostgreSQL',
    'REST APIs',
    'Docker',
    'Jest',
    'Git',
  ],
  missingKeywords: ['GraphQL', 'Redis', 'Playwright', 'CI/CD', 'GitHub Actions'],
  strengths: [
    'Strong academic foundation in CS with directly aligned fintech dashboard internship experience.',
    'Core stack (TypeScript, React, Node.js, PostgreSQL) matches 100% of primary requirements.',
  ],
  weaknessesAndFixes: [
    {
      weakness: 'Experience bullets describe duties instead of measurable engineering outcomes.',
      fix: 'Add concrete metrics such as query latency reductions, test coverage gains, or active user counts.',
    },
  ],
  rewrites: [
    {
      context: 'ClearLedger Financial · Internship',
      before: 'Helped the backend team improve slow PostgreSQL queries and API endpoints',
      after: 'Optimized 6 high-traffic PostgreSQL queries with composite indexing, cutting merchant dashboard API p95 latency by 42%.',
      impactNote: 'Replaces passive phrasing with concrete ownership and measurable speed gains.',
    },
  ],
  coverLetter: '',
  interviewQuestions: [],
  professionalSummary: '',
};
