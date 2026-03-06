import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClaudeClient, CLAUDE_MODEL } from "@/lib/claude/client";
import { getFitScorePrompt } from "@/lib/claude/prompts/fit-score";
import { fitScoreOutputSchema } from "@/lib/claude/schemas/fit-score";
import { fitScoreSchema as fitScoreInputSchema } from "@/lib/validators";

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
    const parsed = fitScoreInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { block_ids, job_posting_id } = parsed.data;

    const [blocksResult, jobResult] = await Promise.all([
      supabase
        .from("experience_blocks")
        .select("*")
        .in("id", block_ids)
        .eq("user_id", user.id),
      supabase
        .from("job_postings")
        .select("*")
        .eq("id", job_posting_id)
        .eq("user_id", user.id)
        .single(),
    ]);

    if (blocksResult.error || !blocksResult.data.length) {
      return NextResponse.json(
        { error: "Blocks not found" },
        { status: 404 }
      );
    }

    if (jobResult.error || !jobResult.data) {
      return NextResponse.json(
        { error: "Job posting not found" },
        { status: 404 }
      );
    }

    const blocksText = JSON.stringify(blocksResult.data, null, 2);
    const jobText = JSON.stringify(jobResult.data, null, 2);
    const prompt = getFitScorePrompt(blocksText, jobText);

    const claude = getClaudeClient();
    const message = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Unexpected response from AI" },
        { status: 500 }
      );
    }

    let rawJson: unknown;
    try {
      rawJson = JSON.parse(content.text);
    } catch {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json(
          { error: "Failed to parse AI response" },
          { status: 500 }
        );
      }
      try {
        rawJson = JSON.parse(jsonMatch[0]);
      } catch {
        return NextResponse.json(
          { error: "Failed to parse AI response" },
          { status: 422 }
        );
      }
    }

    const fitResult = fitScoreOutputSchema.safeParse(rawJson);
    if (!fitResult.success) {
      return NextResponse.json(
        { error: "AI returned invalid data format" },
        { status: 422 }
      );
    }
    const fitData = fitResult.data;

    return NextResponse.json(fitData);
  } catch (error) {
    console.error("Fit score error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
