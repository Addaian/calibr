import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getClaudeClient, CLAUDE_MODEL } from "@/lib/claude/client";
import { getRefineResumePrompt } from "@/lib/claude/prompts/refine-resume";
import { tailoredResumeSchema } from "@/lib/claude/schemas/tailored-resume";

const refineSchema = z.object({
  message: z.string().min(1).max(1000),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = refineSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const { data: resume, error: fetchError } = await supabase
      .from("generated_resumes")
      .select("tailored_content")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const prompt = getRefineResumePrompt(resume.tailored_content, parsed.data.message);

    const claude = getClaudeClient();
    const message = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8192,
      system: prompt.system,
      messages: [
        { role: "user", content: prompt.user },
        { role: "assistant", content: "{" },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const rawText = "{" + textBlock.text;
    let rawJson: unknown;
    try {
      rawJson = JSON.parse(rawText.replace(/:\s*undefined\b/g, ": null"));
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const result = tailoredResumeSchema.safeParse(rawJson);
    if (!result.success) {
      return NextResponse.json({ error: "AI returned invalid format" }, { status: 422 });
    }

    const { error: updateError } = await supabase
      .from("generated_resumes")
      .update({ tailored_content: result.data })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to save changes" }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Refine error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
