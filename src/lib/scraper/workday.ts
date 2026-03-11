/**
 * Workday-specific scraper.
 *
 * Workday job boards are SPAs — a normal fetch returns an empty shell.
 * However, Workday exposes a public CXS JSON API that the SPA itself uses.
 *
 * URL pattern:  https://{company}.wd{N}.myworkdayjobs.com/{site}/job/{location}/{slug}
 * CXS API:      https://{company}.wd{N}.myworkdayjobs.com/wday/cxs/{company}/{site}/job/{location}/{slug}
 */

export function isWorkdayUrl(url: string): boolean {
  return url.includes(".myworkdayjobs.com/");
}

interface WorkdayJobInfo {
  title?: string;
  location?: string;
  additionalLocations?: string[];
  timeType?: string;
  postedOn?: string;
  startDate?: string;
  endDate?: string;
  // description lives here on most Workday responses
  jobDescription?: string;
}

interface WorkdayResponse {
  jobPostingInfo?: WorkdayJobInfo;
  // fallback keys seen on some tenants
  jobDescription?: string;
  description?: string;
}

export async function scrapeWorkday(url: string): Promise<string> {
  const parsed = new URL(url);
  const company = parsed.hostname.split(".")[0]; // "salesforce"

  // Build CXS API URL: prepend /wday/cxs/{company} to the existing path
  const cxsUrl = `${parsed.origin}/wday/cxs/${company}${parsed.pathname}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let data: WorkdayResponse;
  try {
    const res = await fetch(cxsUrl, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      throw new Error(`Workday CXS API returned ${res.status}`);
    }

    data = await res.json();
  } catch (err) {
    throw new Error(
      `Failed to fetch Workday job data: ${err instanceof Error ? err.message : String(err)}`
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const info = data.jobPostingInfo ?? {};
  // Description can be nested inside jobPostingInfo (most tenants) or at root level
  const rawDescription = info.jobDescription ?? data.jobDescription ?? data.description ?? "";

  // Strip HTML tags from the description (it's usually HTML)
  const descriptionText = rawDescription
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!descriptionText) {
    throw new Error("Workday API returned no job description content");
  }

  // Build a structured text block for Claude
  const lines: string[] = [];
  if (info.title) lines.push(`Job Title: ${info.title}`);
  const allLocations = [info.location, ...(info.additionalLocations ?? [])].filter(Boolean);
  if (allLocations.length) lines.push(`Location: ${allLocations.join(", ")}`);
  if (info.timeType) lines.push(`Time Type: ${info.timeType}`);
  if (info.startDate) lines.push(`Start Date: ${info.startDate}`);
  if (info.endDate) lines.push(`Application Deadline: ${info.endDate}`);

  if (lines.length > 0) {
    lines.push("", descriptionText);
  } else {
    lines.push(descriptionText);
  }

  return lines.join("\n");
}
