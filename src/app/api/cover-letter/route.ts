import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClaudeClient } from "@/lib/claude/client";
import { getCoverLetterPrompt } from "@/lib/claude/prompts/cover-letter";
import { coverLetterSchema } from "@/lib/validators";

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
    const parsed = coverLetterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { job_posting_id, generated_resume_id, tone } = parsed.data;

    const { data: job, error: jobError } = await supabase
      .from("job_postings")
      .select("*")
      .eq("id", job_posting_id)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Job posting not found" },
        { status: 404 }
      );
    }

    let blocksData;
    if (generated_resume_id) {
      const { data: resume, error: resumeError } = await supabase
        .from("generated_resumes")
        .select("selected_block_ids")
        .eq("id", generated_resume_id)
        .eq("user_id", user.id)
        .single();

      if (resumeError) {
        return NextResponse.json(
          { error: "Generated resume not found" },
          { status: 404 }
        );
      }

      if (resume?.selected_block_ids?.length) {
        const { data: resumeBlocks, error: blocksError } = await supabase
          .from("experience_blocks")
          .select("*")
          .in("id", resume.selected_block_ids)
          .eq("user_id", user.id);

        if (blocksError) {
          return NextResponse.json({ error: blocksError.message }, { status: 500 });
        }
        blocksData = resumeBlocks;
      }
    }

    if (!blocksData) {
      const { data: allBlocks, error: allBlocksError } = await supabase
        .from("experience_blocks")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order");

      if (allBlocksError) {
        return NextResponse.json({ error: allBlocksError.message }, { status: 500 });
      }
      blocksData = allBlocks;
    }

    const blocksText = JSON.stringify(blocksData || [], null, 2);
    const jobText = JSON.stringify(job, null, 2);
    const prompt = getCoverLetterPrompt(blocksText, jobText, tone);

    const claude = getClaudeClient();
    const message = await claude.messages.create({
      model: "claude-sonnet-4-20250514",
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

    const { data: coverLetter, error: insertError } = await supabase
      .from("cover_letters")
      .insert({
        user_id: user.id,
        job_posting_id,
        generated_resume_id: generated_resume_id || null,
        content: content.text,
        tone,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to save cover letter" },
        { status: 500 }
      );
    }

    return NextResponse.json(coverLetter);
  } catch (error) {
    console.error("Cover letter error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
