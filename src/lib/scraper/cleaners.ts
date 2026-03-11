import * as cheerio from "cheerio";

// Tags that are never content
const REMOVE_TAGS = [
  "script",
  "style",
  "iframe",
  "noscript",
  "svg",
  "picture",
  "video",
  "audio",
  "canvas",
  "nav",
  "footer",
];

// UI noise selectors — do NOT remove <header> or role=complementary
// because many job sites (Greenhouse, Lever) put job details there
const NOISE_SELECTORS = [
  "[class*='cookie']",
  "[class*='consent']",
  "[class*='banner-ad']",
  "[class*='advertisement']",
  "[class*='ad-wrapper']",
  "[class*='popup']",
  "[id*='cookie']",
  "[id*='consent']",
  "[id*='ad-']",
  "[id*='advertisement']",
  "[role='navigation']",
  "[aria-label='breadcrumb']",
  "[class*='share-']",
  "[class*='social-']",
  "[class*='related-jobs']",
  "[class*='similar-jobs']",
];

// Known job content selectors — checked in order, first match wins
const JOB_CONTENT_SELECTORS = [
  // Greenhouse
  "#content",
  ".job-post",
  ".posting-description",
  // Lever
  ".posting",
  ".section-wrapper",
  // Workday
  "[data-automation-id='jobPostingDescription']",
  // LinkedIn (partial — often behind auth)
  ".description__text",
  ".show-more-less-html",
  // Indeed
  "#jobDescriptionText",
  ".jobsearch-jobDescriptionText",
  // Generic semantic candidates
  "article",
  "[role='main']",
  "main",
  ".job-description",
  "#job-description",
  "[class*='job-detail']",
  "[class*='job_detail']",
  "[class*='jobDescription']",
  "[class*='job-posting']",
];

const MAX_OUTPUT_LENGTH = 20000;

export function cleanHtml(html: string): string {
  const $ = cheerio.load(html);

  // Remove definite noise
  REMOVE_TAGS.forEach((tag) => $(tag).remove());
  NOISE_SELECTORS.forEach((selector) => $(selector).remove());

  // Insert newlines before block-level elements so text() preserves structure
  const BLOCK_TAGS = "h1,h2,h3,h4,h5,h6,p,li,br,div,section,article,tr,blockquote";
  $(BLOCK_TAGS).each((_, el) => {
    $(el).prepend("\n");
  });

  // Try to find the most relevant content container
  let contentText = "";
  for (const selector of JOB_CONTENT_SELECTORS) {
    const el = $(selector).first();
    if (el.length) {
      contentText = el.text();
      if (contentText.trim().length > 200) break;
    }
  }

  // Fall back to full body if no container found or content too short
  if (contentText.trim().length < 200) {
    contentText = $("body").text();
  }

  const cleaned = contentText
    .replace(/[ \t]+/g, " ")       // collapse horizontal whitespace
    .replace(/\n[ \t]+/g, "\n")    // trim leading spaces on each line
    .replace(/\n{3,}/g, "\n\n")    // max 2 consecutive newlines
    .trim();

  if (cleaned.length > MAX_OUTPUT_LENGTH) {
    return cleaned.slice(0, MAX_OUTPUT_LENGTH);
  }

  return cleaned;
}
