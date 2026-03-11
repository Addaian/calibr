# Calibr

Calibr is an AI-powered resume tailoring and job tracking web app built for CS students recruiting at big tech. You build a library of your experience as reusable blocks, track every application in a structured pipeline, and let Claude rewrite and score your blocks to match each role — generating a tailored resume and cover letter in seconds.

## Features

### Job Pipeline
- **Job Tracker** — Inline-editable table with 14 pipeline statuses across 5 stages (Tracking → Application → Interviews → Offer Stage → Closed). Edit notes, source, recruiter, follow-up date, deadline, priority, and salary inline. Sortable by any column.
- **Views** — Switch between List, Compact, Kanban (drag-and-drop via @dnd-kit), and Sankey pipeline diagram (d3-sankey).
- **Job Ingestion** — Add jobs by pasting a URL (auto-scraped with Cheerio; Workday SPA support via their CXS JSON API) or pasting the description directly. Claude extracts title, company, skills, keywords, responsibilities, and deadline into structured data.
- **Deadline Tracking** — Deadline column with overdue warnings (red) on the tracker and job detail page.
- **Offer Comparison** — Side-by-side table comparing base salary, signing bonus, RSUs, relocation, Year 1 total, and annual steady-state compensation across all offers.
- **Bulk Operations** — Multi-select jobs with checkboxes, bulk set status, bulk delete. Import jobs from CSV with column alias mapping and a preview step.
- **Interview Rounds** — Track each round (phone screen, technical, behavioral, etc.) with outcome, scheduled time, duration, interviewer, and notes. Displayed as a vertical timeline on the job detail page.
- **Structured Compensation** — Enter base, signing bonus, RSUs, vest period, and relocation per job. Live Year 1 and steady-state calculations update as you type.

### Resume & AI
- **Experience Blocks** — Modular resume entries by type: work experience, projects, education, research, and volunteering. Each block stores bullet points, technologies, dates, and metadata.
- **Import from Resume** — Upload a PDF and Claude parses it into blocks for selective saving.
- **Tailor Resume** — Select blocks and a job; Claude rewrites bullet points to match keywords, reorders by relevance, and writes a tailored summary. Optionally upload a PDF style template so Claude mirrors your formatting and writing style.
- **Multi-Dimensional Fit Score** — 5-dimension score (0–100): Skills Match (30, algorithmic), Experience Relevance (30, Claude), Education Fit (15, algorithmic), Keyword Coverage (15, algorithmic), Overall Impression (10, Claude). Displayed as a ring gauge with per-dimension progress bars, source badges (ATS/AI), and qualitative strengths/gaps/suggestions.
- **ATS Keyword Warnings** — Before exporting, see exactly which required keywords are missing from the resume with one-click copy chips.
- **Cover Letter** — Generate in professional, conversational, or enthusiastic tone, grounded in your blocks and the tailored resume.
- **Export** — Export tailored resumes to PDF or DOCX.

### Contacts & Templates
- **Contacts** — Track recruiters, hiring managers, and connections. Link contacts to specific jobs. Searchable grid with name, company, role, email, phone, LinkedIn, and last-contacted date.
- **Message Templates** — Save reusable email templates for cold outreach, follow-ups, thank-yous, referral requests, negotiation, and withdrawal. Variable substitution (`{{company}}`, `{{recruiter_name}}`, `{{role}}`, etc.). 6 built-in starter templates included. One-click copy to clipboard.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui + Radix UI |
| AI | Claude (claude-sonnet-4-6) via Anthropic SDK |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Drag & drop | @dnd-kit |
| Pipeline diagram | d3-sankey |
| PDF parsing | pdf-parse |
| PDF generation | @react-pdf/renderer |
| DOCX generation | docx |
| Validation | Zod |
| Data fetching | SWR |

## Architecture

The app is a Next.js App Router project. `src/app/(app)` contains all authenticated pages; `src/app/api` contains all API route handlers — there is no separate backend.

Auth is handled by Supabase Auth with SSR cookies via `@supabase/ssr`. Middleware (`src/middleware.ts`) protects all `(app)` routes.

### Database tables

All tables have Row Level Security — users can only access their own rows.

| Table | Purpose |
|---|---|
| `user_profiles` | Auto-created on signup; stores skills profile |
| `experience_blocks` | Modular resume entries |
| `job_postings` | Structured job data with pipeline status, compensation, recruiter info |
| `interview_rounds` | Per-round interview tracking linked to a job |
| `generated_resumes` | Claude-tailored resumes with fit score and analysis |
| `cover_letters` | Generated cover letters linked to a job and resume |
| `contacts` | Recruiter and networking contacts, optionally linked to a job |
| `message_templates` | User-saved email templates with variable placeholders |

Migrations are in `supabase/migrations/` and must be run in numeric order.

### AI integration

All Claude calls go through `src/lib/claude/client.ts`. Each feature has a prompt in `src/lib/claude/prompts/` and a Zod output schema in `src/lib/claude/schemas/`.

| Feature | Prompt | Schema |
|---|---|---|
| Parse resume PDF | `parse-resume.ts` | `parsed-resume.ts` |
| Scrape/parse job posting | `scrape-job.ts` | `parsed-job.ts` |
| Tailor blocks for a job | `tailor.ts` | `tailored-resume.ts` |
| Fit score (AI dimensions) | `fit-score.ts` | `fit-score.ts` |
| Generate cover letter | `cover-letter.ts` | free text |

Claude is instructed to return JSON only. Routes try `JSON.parse()` first, then fall back to regex extraction, and validate output with Zod `.safeParse()`.

### Fit score pipeline

Scoring is a three-phase pipeline in `POST /api/fit-score`:
1. **Algorithmic** — Skills Match, Keyword Coverage, and Education Fit are computed deterministically in `src/lib/fit-score-calc.ts` using word-boundary regex matching against a corpus built from all block text and the user's skills profile.
2. **Claude** — Experience Relevance and Overall Impression are scored by Claude, which also returns pros, cons, and suggestions.
3. **Assembly** — All 5 dimension scores are summed into a total and the full `FitAnalysis` object is persisted to `generated_resumes.fit_analysis`.

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

### Setup

1. Clone and install:

```bash
npm install
```

2. Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

3. Run migrations in the Supabase SQL Editor in numeric order from `supabase/migrations/`.

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up.
