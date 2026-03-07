# Calibr

Calibr is an AI-powered resume tailoring and job tracking web app. You build a library of your experience as reusable blocks, track your job applications in a structured pipeline, and let Claude rewrite and rank your blocks to match each role — generating a tailored resume and cover letter in seconds.

## What it does

- **Experience Blocks** — Break your resume into modular blocks by type: work experience, projects, education, research, and volunteering. Each block stores bullet points, technologies, dates, and role-specific fields (e.g. professor and institution for research).
- **Import from Resume** — Upload a PDF resume and Claude automatically parses it into blocks, which you can review and save selectively.
- **Job Pipeline Tracker** — Track every application in an Excel-style table with 14 pipeline statuses (Tracking → Application → Interviews → Offer Stage → Closed). Inline-edit notes, source, recruiter contact, follow-up date, priority stars, salary, and offer amount. View the same data as a Kanban board or a Sankey pipeline diagram. Sortable by any column.
- **Job Postings** — Add jobs by pasting a URL (auto-scraped) or pasting the description directly. Claude extracts the title, company, skills, keywords, and responsibilities into structured data.
- **Tailor Resume** — Select blocks and a job, and Claude rewrites your bullet points to naturally match the job's keywords, reorders blocks by relevance, and writes a tailored professional summary. Optionally upload an existing resume PDF so Claude mirrors your writing style.
- **Fit Score** — After tailoring, Claude scores the resume against the job (0–100) with pros, cons, and suggestions.
- **Cover Letter** — Generate a cover letter for any job in professional, conversational, or enthusiastic tone, grounded in your experience blocks.
- **Export** — Export tailored resumes to PDF or DOCX directly from the app.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui + Radix UI |
| AI | Claude (claude-sonnet-4-6) via Anthropic SDK |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Drag & drop | @dnd-kit |
| Pipeline diagram | d3-sankey |
| PDF parsing | pdf-parse |
| PDF generation | @react-pdf/renderer |
| DOCX generation | docx |
| Validation | Zod |
| Data fetching | SWR |

## How it's implemented

### Architecture

The app is a Next.js App Router project with a `src/app/(app)` route group for authenticated pages and `src/app/api` for all backend logic. There is no separate backend — all API routes run as Next.js Route Handlers.

Authentication is handled by Supabase Auth with SSR cookies via `@supabase/ssr`. Middleware (`src/middleware.ts`) protects all `(app)` routes and redirects unauthenticated users to `/login`.

### Database

Tables in Supabase PostgreSQL, all with Row Level Security (RLS) so users can only access their own data:

- **`user_profiles`** — created automatically on signup via a Postgres trigger; stores skills profile
- **`experience_blocks`** — modular resume entries with type, bullet points, technologies, and metadata
- **`job_postings`** — structured job data extracted by Claude from URLs or pasted text; includes pipeline status, recruiter info, salary, offer amount, notes, priority, and follow-up date
- **`generated_resumes`** — tailored resumes produced by Claude, with a `source` field distinguishing `uploaded` (from PDF import) vs `generated` (by AI); stores fit score and analysis
- **`cover_letters`** — cover letter text linked to a job and optionally a generated resume

Migrations are in `supabase/migrations/` and must be run in order.

### AI integration

All Claude calls go through `src/lib/claude/client.ts` which wraps the Anthropic SDK. Each feature has a dedicated prompt file in `src/lib/claude/prompts/` and a Zod output schema in `src/lib/claude/schemas/`.

| Feature | Prompt | Output schema |
|---|---|---|
| Parse resume PDF into blocks | `parse-resume.ts` | `parsed-resume.ts` |
| Scrape/parse job posting | `scrape-job.ts` | `parsed-job.ts` |
| Tailor blocks for a job | `tailor.ts` | `tailored-resume.ts` |
| Score fit against a job | `fit-score.ts` | `fit-score.ts` |
| Generate cover letter | `cover-letter.ts` | free text |

Claude is instructed to return JSON only. API routes try `JSON.parse()` on the raw response first, then fall back to regex extraction (`/\{[\s\S]*\}/`) if Claude wraps the output in prose. Output is validated with `.safeParse()` and a 422 is returned if the schema doesn't match.

### Job pipeline tracker

The job tracker is an inline-editable CSS Grid table (`src/app/(app)/jobs/page.tsx`) with 14 columns. Key design details:

- **Status system** — 14 statuses grouped into 5 stages: Tracking (`active`, `applying`), Application (`applied`, `screening`), Interviews (`interview`, `assessment`, `final_round`), Offer Stage (`offer`, `negotiating`, `accepted`), Closed (`rejected`, `withdrawn`, `ghosted`, `declined`).
- **Inline editing** — `src/components/jobs/job-cells.tsx` provides `InlineText`, `InlineDate`, `InlineSource`, and `InlinePriority` components that switch to inputs on click and save on blur/Enter via `PUT /api/jobs/[id]`.
- **Sorting** — clicking any column header sorts ascending/descending; date and priority columns default to descending on first click.
- **Hover expansion** — truncated cell values expand in place on hover via Tailwind `group/cell` + `group-hover/cell:whitespace-normal`.
- **Views** — List, Compact (same table, less row padding), Kanban (5 grouped columns with drag-and-drop via @dnd-kit), Pipeline (Sankey flow diagram via d3-sankey with hover highlighting and tooltips).

### Job ingestion

Jobs can be added two ways:
- **URL mode** — `POST /api/jobs/scrape` fetches the page with `cheerio`, strips HTML, and sends the cleaned text to Claude
- **Paste mode** — `POST /api/jobs/parse` sends the pasted text directly to Claude, skipping scraping

### Resume tailoring flow

1. User selects blocks and a job on `/jobs/[id]/tailor`
2. Optionally uploads a PDF style template — `POST /api/resume-template` extracts its text with pdf-parse
3. `POST /api/tailor` sends blocks + job + optional style template text to Claude
4. Claude returns a structured JSON object with a summary and rewritten blocks
5. Result is saved to `generated_resumes` and the user is shown a preview with fit score

### Security

Every API route authenticates via `supabase.auth.getUser()` and all database queries filter by `user_id` so data is strictly scoped per user. RLS policies on all tables provide a second layer of enforcement at the database level.

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

### Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

3. Run the database migrations by pasting each file from `supabase/migrations/` into the Supabase SQL Editor and running them in numeric order.

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up for an account.
