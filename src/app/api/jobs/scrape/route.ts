import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scrapeJobSchema } from "@/lib/validators";
import { scrapeJobPosting } from "@/lib/scraper";
import { getClaudeClient } from "@/lib/claude/client";
import { getScrapeJobPrompt } from "@/lib/claude/prompts/scrape-job";
import { parsedJobSchema } from "@/lib/claude/schemas/parsed-job";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const urlResult = scrapeJobSchema.safeParse(body);

    if (!urlResult.success) {
      return NextResponse.json(
        { error: "Invalid URL", details: urlResult.error.flatten() },
        { status: 400 }
      );
    }

    let cleanedText: string;
    try {
      cleanedText = await scrapeJobPosting(urlResult.data.url);
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Failed to fetch the job posting page",
        },
        { status: 422 }
      );
    }

    if (!cleanedText || cleanedText.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough content from the page" },
        { status: 422 }
      );
    }

    let rawJson: string;
    try {
      const claude = getClaudeClient();
      const message = await claude.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: getScrapeJobPrompt(cleanedText),
          },
        ],
      });

      const textBlock = message.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text response from Claude");
      }

      rawJson = textBlock.text;
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? `AI analysis failed: ${err.message}`
              : "AI analysis failed",
        },
        { status: 502 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response as JSON" },
        { status: 502 }
      );
    }

    const validationResult = parsedJobSchema.safeParse(parsed);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "AI response did not match expected format",
          details: validationResult.error.flatten(),
        },
        { status: 502 }
      );
    }

    return NextResponse.json(validationResult.data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
