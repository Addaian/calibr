import { fetchPage } from "./fetcher";
import { cleanHtml } from "./cleaners";

export async function scrapeJobPosting(url: string): Promise<string> {
  const html = await fetchPage(url);
  return cleanHtml(html);
}
