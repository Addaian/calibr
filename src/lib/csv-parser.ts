/**
 * Minimal RFC-4180-compatible CSV parser.
 * Returns rows as arrays of strings; first row is treated as headers.
 */
export function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  function parseLine(line: string): string[] {
    const cells: string[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        // Quoted field
        let value = "";
        i++; // skip opening quote
        while (i < line.length) {
          if (line[i] === '"' && line[i + 1] === '"') {
            value += '"';
            i += 2;
          } else if (line[i] === '"') {
            i++; // skip closing quote
            break;
          } else {
            value += line[i++];
          }
        }
        cells.push(value);
        if (line[i] === ",") i++;
      } else {
        // Unquoted field
        const end = line.indexOf(",", i);
        if (end === -1) {
          cells.push(line.slice(i).trim());
          break;
        } else {
          cells.push(line.slice(i, end).trim());
          i = end + 1;
        }
      }
    }
    return cells;
  }

  const nonEmpty = lines.filter(l => l.trim() !== "");
  if (nonEmpty.length === 0) return { headers: [], rows: [] };

  const headers = parseLine(nonEmpty[0]).map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < nonEmpty.length; i++) {
    const cells = parseLine(nonEmpty[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (cells[idx] ?? "").trim();
    });
    rows.push(row);
  }

  return { headers, rows };
}

// Column aliases: maps common CSV column names → JobPosting field names
const COLUMN_ALIASES: Record<string, string> = {
  job_title: "title",
  role: "title",
  position: "title",
  job_role: "title",
  "company_name": "company",
  employer: "company",
  org: "company",
  city: "location",
  remote: "location",
  type: "employment_type",
  work_type: "employment_type",
  job_type: "employment_type",
  salary: "salary_range",
  pay: "salary_range",
  compensation: "salary_range",
  url: "url",
  link: "url",
  job_url: "url",
  apply_url: "url",
  note: "notes",
  comment: "notes",
  comments: "notes",
  deadline: "deadline",
  due: "deadline",
  due_date: "deadline",
  apply_by: "deadline",
  recruiter: "recruiter_name",
  contact: "recruiter_name",
  source: "source",
  applied_date: "status_date",
  date_applied: "status_date",
  applied: "status_date",
  status: "status",
};

export type MappedRow = {
  title: string;
  company?: string;
  location?: string;
  url?: string;
  employment_type?: string;
  salary_range?: string;
  notes?: string;
  deadline?: string;
  recruiter_name?: string;
  source?: string;
  status_date?: string;
  status?: string;
};

/** Normalise a single CSV row using column aliases into a MappedRow */
export function mapRow(row: Record<string, string>): MappedRow | null {
  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(row)) {
    if (!value) continue;
    const canonical = COLUMN_ALIASES[key] ?? key;
    out[canonical] = value;
  }

  // title is required
  if (!out.title) return null;

  return {
    title: out.title,
    ...(out.company && { company: out.company }),
    ...(out.location && { location: out.location }),
    ...(out.url && { url: out.url }),
    ...(out.employment_type && { employment_type: out.employment_type }),
    ...(out.salary_range && { salary_range: out.salary_range }),
    ...(out.notes && { notes: out.notes }),
    ...(out.deadline && { deadline: out.deadline }),
    ...(out.recruiter_name && { recruiter_name: out.recruiter_name }),
    ...(out.source && { source: out.source }),
    ...(out.status_date && { status_date: out.status_date }),
    ...(out.status && { status: out.status }),
  };
}
