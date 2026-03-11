import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClaudeClient, CLAUDE_MODEL } from "@/lib/claude/client";
import { getScrapeJobPrompt } from "@/lib/claude/prompts/scrape-job";
import { parsedJobSchema } from "@/lib/claude/schemas/parsed-job";
import { z } from "zod";

const parseJobSchema = z.object({
  text: z.string().min(50, "Job description is too short"),
});

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
    const result = parseJobSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    let rawJson: string;
    try {
      const claude = getClaudeClient();
      const message = await claude.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: getScrapeJobPrompt(result.data.text),
          },
          { role: "assistant", content: "{" },
        ],
      });

      const textBlock = message.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text response from Claude");
      }

      rawJson = "{" + textBlock.text;
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
      parsed = JSON.parse(rawJson.replace(/:\s*undefined\b/g, ": null"));
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

    return NextResponse.json({ ...validationResult.data, description_raw: result.data.text });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
