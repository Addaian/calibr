import { fetchPage } from "./fetcher";
import { cleanHtml } from "./cleaners";
import { isWorkdayUrl, scrapeWorkday } from "./workday";

export async function scrapeJobPosting(url: string): Promise<string> {
  // Workday SPAs return empty HTML — use their CXS JSON API instead
  if (isWorkdayUrl(url)) {
    return scrapeWorkday(url);
  }

  const html = await fetchPage(url);
  return cleanHtml(html);
}
