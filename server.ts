import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const PORT = Number(process.env.PORT) || 3000;
const MAX_TEXT_LENGTH = 30000;

interface AnalyzeBody {
  resumeText?: unknown;
  jobDescription?: unknown;
}

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const analysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    jobTitle: {
      type: Type.STRING,
      description: 'Concise target role title and optional company name, e.g. "Full-Stack Software Engineer · Horizon Payments".',
    },
    overallScore: {
      type: Type.INTEGER,
      description: 'Overall match score between 0 and 100 based on skills, experience alignment, and impact.',
    },
    atsScore: {
      type: Type.INTEGER,
      description: 'ATS compatibility score between 0 and 100 reflecting keyword coverage, clear section headers, and parseability.',
    },
    atsExplanation: {
      type: Type.STRING,
      description: '2 to 3 clear sentences explaining the ATS compatibility score, section structure, and keyword density.',
    },
    sectionScores: {
      type: Type.OBJECT,
      properties: {
        skills: { type: Type.INTEGER, description: 'Score 0-100 for technical and domain skills match.' },
        experience: { type: Type.INTEGER, description: 'Score 0-100 for relevance and measurable impact of work experience.' },
        education: { type: Type.INTEGER, description: 'Score 0-100 for education, coursework, or certifications alignment.' },
        projects: { type: Type.INTEGER, description: 'Score 0-100 for project depth, relevance, and outcomes.' },
        formatting: { type: Type.INTEGER, description: 'Score 0-100 for clarity, scannability, bullet conciseness, and ATS formatting.' },
      },
      required: ['skills', 'experience', 'education', 'projects', 'formatting'],
    },
    matchedKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '8 to 16 concrete skills, tools, frameworks, or qualifications found in both the resume and job description.',
    },
    missingKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '5 to 12 important skills, tools, or requirements from the job description that are missing or underemphasized in the resume.',
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 to 5 specific, evidence-backed strengths from the candidate resume relative to this job.',
    },
    weaknessesAndFixes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          weakness: { type: Type.STRING, description: 'Specific gap or weakness observed in the resume.' },
          fix: { type: Type.STRING, description: 'Concrete, actionable step the candidate can take to fix it.' },
        },
        required: ['weakness', 'fix'],
      },
      description: '3 to 5 specific weaknesses paired with actionable fixes.',
    },
    rewrites: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          context: { type: Type.STRING, description: 'Short label for which role or project this bullet comes from.' },
          before: { type: Type.STRING, description: 'Exact or closely quoted weak bullet point from the original resume.' },
          after: { type: Type.STRING, description: 'Rewritten bullet using strong action verbs, target keywords, and realistic measurable metrics.' },
          impactNote: { type: Type.STRING, description: 'Brief 1-sentence explanation of why the rewrite performs better.' },
        },
        required: ['context', 'before', 'after', 'impactNote'],
      },
      description: 'Exactly 3 before-and-after bullet rewrites taken from weak bullets in the resume.',
    },
    coverLetter: {
      type: Type.STRING,
      description: 'A crisp, natural 3-paragraph tailored cover letter (180-250 words) connecting candidate achievements to the role.',
    },
    interviewQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: 'A realistic interview question likely to be asked for this role and background.' },
          focusArea: { type: Type.STRING, description: 'Short 2-3 word topic tag such as "System Design" or "React State".' },
          tip: { type: Type.STRING, description: '1-2 sentences of practical guidance on how to answer strongly using the candidate experience.' },
        },
        required: ['question', 'focusArea', 'tip'],
      },
      description: 'Exactly 8 likely interview questions tailored to the resume and job description.',
    },
    professionalSummary: {
      type: Type.STRING,
      description: 'A rewritten 3-line professional summary tailored for the top of the candidate resume for this specific role.',
    },
  },
  required: [
    'jobTitle',
    'overallScore',
    'atsScore',
    'atsExplanation',
    'sectionScores',
    'matchedKeywords',
    'missingKeywords',
    'strengths',
    'weaknessesAndFixes',
    'rewrites',
    'coverLetter',
    'interviewQuestions',
    'professionalSummary',
  ],
};

function clampScore(value: unknown): number {
  const num = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : 0;
  return Math.max(0, Math.min(100, num));
}

async function generateAnalysisWithRetry(resumeText: string, jobDescription: string) {
  const ai = getAiClient();

  const prompt = `Analyze the following candidate resume against the target job description. Be thorough, honest, constructive, and specific to the actual text provided.

<RESUME>
${resumeText}
</RESUME>

<JOB_DESCRIPTION>
${jobDescription}
</JOB_DESCRIPTION>

Requirements:
- Ground every matched/missing keyword, strength, weakness, and bullet rewrite in the actual resume and job description text.
- For "rewrites", pick 3 of the weakest or vaguest bullets from the resume and rewrite them using strong action verbs and realistic quantified placeholders/metrics where exact numbers weren't given (e.g. "reducing API latency by ~35%" or "supporting 12K+ monthly users" — mark estimated targets cleanly if needed, e.g. "[X]%" only when no data exists, or use clear measurable framing).
- For "professionalSummary", write a crisp 3-line summary ready to paste at the top of the resume.
- For "interviewQuestions", provide exactly 8 realistic questions covering technical skills, past projects, and potential gaps from missing keywords.
- Ensure all scores are integers between 0 and 100.`;

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an expert technical recruiter, ATS specialist, and career coach. Return strictly valid JSON adhering to the schema. Keep tone direct, practical, and free of buzzwords.',
          responseMimeType: 'application/json',
          responseSchema: analysisResponseSchema,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.MEDIUM,
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('Empty response received from Gemini API.');
      }

      const parsed = JSON.parse(rawText);
      return {
        jobTitle: String(parsed.jobTitle || 'Target Role').slice(0, 120),
        overallScore: clampScore(parsed.overallScore),
        atsScore: clampScore(parsed.atsScore),
        atsExplanation: String(parsed.atsExplanation || ''),
        sectionScores: {
          skills: clampScore(parsed.sectionScores?.skills),
          experience: clampScore(parsed.sectionScores?.experience),
          education: clampScore(parsed.sectionScores?.education),
          projects: clampScore(parsed.sectionScores?.projects),
          formatting: clampScore(parsed.sectionScores?.formatting),
        },
        matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords.map(String).slice(0, 20) : [],
        missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords.map(String).slice(0, 16) : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String).slice(0, 5) : [],
        weaknessesAndFixes: Array.isArray(parsed.weaknessesAndFixes)
          ? parsed.weaknessesAndFixes.slice(0, 5).map((item: { weakness?: unknown; fix?: unknown }) => ({
              weakness: String(item.weakness || ''),
              fix: String(item.fix || ''),
            }))
          : [],
        rewrites: Array.isArray(parsed.rewrites)
          ? parsed.rewrites.slice(0, 3).map((item: { context?: unknown; before?: unknown; after?: unknown; impactNote?: unknown }) => ({
              context: String(item.context || 'Experience'),
              before: String(item.before || ''),
              after: String(item.after || ''),
              impactNote: String(item.impactNote || ''),
            }))
          : [],
        coverLetter: String(parsed.coverLetter || ''),
        interviewQuestions: Array.isArray(parsed.interviewQuestions)
          ? parsed.interviewQuestions.slice(0, 8).map((item: { question?: unknown; focusArea?: unknown; tip?: unknown }) => ({
              question: String(item.question || ''),
              focusArea: String(item.focusArea || 'General'),
              tip: String(item.tip || ''),
            }))
          : [],
        professionalSummary: String(parsed.professionalSummary || ''),
      };
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('GEMINI_API_KEY_MISSING') || msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED') || msg.includes('400') || msg.includes('403')) {
        throw err;
      }
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 600 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/analyze', async (req: Request, res: Response) => {
    try {
      const body = (req.body || {}) as AnalyzeBody;
      const resumeText = typeof body.resumeText === 'string' ? body.resumeText.trim() : '';
      const jobDescription = typeof body.jobDescription === 'string' ? body.jobDescription.trim() : '';

      if (resumeText.length < 40) {
        res.status(400).json({
          error: 'Please provide a complete resume (at least 40 characters) before analyzing.',
        });
        return;
      }

      if (jobDescription.length < 30) {
        res.status(400).json({
          error: 'Please paste a job description (at least 30 characters) so we can score the match.',
        });
        return;
      }

      const safeResume = resumeText.slice(0, MAX_TEXT_LENGTH);
      const safeJd = jobDescription.slice(0, MAX_TEXT_LENGTH);

      const analysis = await generateAnalysisWithRetry(safeResume, safeJd);
      res.json({ analysis });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected analysis error.';
      console.error('Analysis error:', message);

      if (message.includes('GEMINI_API_KEY_MISSING')) {
        res.status(500).json({
          error: 'The AI service is not configured yet. Please check your GEMINI_API_KEY in Settings > Secrets.',
        });
        return;
      }

      if (message.includes('PERMISSION_DENIED') || message.includes('API_KEY_INVALID')) {
        res.status(403).json({
          error: 'API authentication failed. Please verify your Gemini API key in Settings > Secrets.',
        });
        return;
      }

      if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429')) {
        res.status(429).json({
          error: 'Analysis rate limit reached. Please wait a moment and click Retry.',
        });
        return;
      }

      res.status(500).json({
        error: 'We could not complete the resume analysis right now. Please try again.',
      });
    }
  });

  const distDir = path.resolve(process.cwd(), 'dist');
  const isProd = process.env.NODE_ENV === 'production' && existsSync(distDir);

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResumeLens AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
