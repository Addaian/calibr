export async function fetchPage(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch page: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("text/plain") &&
      !contentType.includes("application/xhtml+xml")
    ) {
      throw new Error(
        `Unexpected content type: ${contentType}. Expected an HTML page.`
      );
    }

    return await response.text();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Request timed out after 15 seconds for URL: ${url}`);
    }
    if (error instanceof TypeError) {
      throw new Error(`Network error while fetching ${url}: ${error.message}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
