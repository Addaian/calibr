import * as cheerio from "cheerio";

const REMOVE_TAGS = [
  "script",
  "style",
  "nav",
  "footer",
  "header",
  "iframe",
  "noscript",
  "svg",
  "picture",
  "video",
  "audio",
  "canvas",
];

const AD_COOKIE_SELECTORS = [
  "[class*='cookie']",
  "[class*='consent']",
  "[class*='banner-ad']",
  "[class*='advertisement']",
  "[class*='ad-wrapper']",
  "[class*='popup']",
  "[class*='modal-overlay']",
  "[id*='cookie']",
  "[id*='consent']",
  "[id*='ad-']",
  "[id*='advertisement']",
  "[role='banner']",
  "[role='complementary']",
];

const MAX_OUTPUT_LENGTH = 10000;

export function cleanHtml(html: string): string {
  const $ = cheerio.load(html);

  REMOVE_TAGS.forEach((tag) => $(tag).remove());
  AD_COOKIE_SELECTORS.forEach((selector) => $(selector).remove());

  const text = $("body").text();
  const cleaned = text.replace(/\s+/g, " ").trim();

  if (cleaned.length > MAX_OUTPUT_LENGTH) {
    return cleaned.slice(0, MAX_OUTPUT_LENGTH);
  }

  return cleaned;
}
