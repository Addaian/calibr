import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClaudeClient, CLAUDE_MODEL } from "@/lib/claude/client";
import { getTailorPrompt } from "@/lib/claude/prompts/tailor";
import { tailoredResumeSchema } from "@/lib/claude/schemas/tailored-resume";
import { tailorSchema } from "@/lib/validators";

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
    const parsed = tailorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { block_ids, job_posting_id, resume_template_text } = parsed.data;

    const [blocksResult, jobResult, profileResult] = await Promise.all([
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
      supabase
        .from("user_profiles")
        .select("skills")
        .eq("id", user.id)
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

    const skillCategories: { category: string; items: string[] }[] =
      Array.isArray(profileResult.data?.skills) ? profileResult.data.skills : [];
    const skillsProfile = skillCategories.length
      ? skillCategories.map((c) => `- ${c.category}: ${c.items.join(", ")}`).join("\n")
      : undefined;

    const blocksText = JSON.stringify(blocksResult.data, null, 2);
    const jobText = JSON.stringify(jobResult.data, null, 2);
    const prompt = getTailorPrompt(blocksText, jobText, resume_template_text, skillsProfile);

    const claude = getClaudeClient();
    const message = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
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

    const tailorResult = tailoredResumeSchema.safeParse(rawJson);
    if (!tailorResult.success) {
      return NextResponse.json(
        { error: "AI returned invalid data format" },
        { status: 422 }
      );
    }
    const tailoredData = tailorResult.data;

    const { data: resume, error: insertError } = await supabase
      .from("generated_resumes")
      .insert({
        user_id: user.id,
        job_posting_id,
        name: `Resume for ${jobResult.data.title}`,
        template: "classic",
        selected_block_ids: block_ids,
        tailored_content: tailoredData,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to save resume" },
        { status: 500 }
      );
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Tailor error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
