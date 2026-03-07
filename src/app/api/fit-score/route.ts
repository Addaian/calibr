import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClaudeClient, CLAUDE_MODEL } from "@/lib/claude/client";
import { getFitScorePrompt } from "@/lib/claude/prompts/fit-score";
import { fitScoreOutputSchema } from "@/lib/claude/schemas/fit-score";
import { fitScoreSchema as fitScoreInputSchema } from "@/lib/validators";
import {
  computeSkillsMatchScore,
  computeKeywordCoverageScore,
  computeEducationFitScore,
} from "@/lib/fit-score-calc";
import type { FitAnalysis } from "@/types/resumes";

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

    const { block_ids, job_posting_id, resume_id } = parsed.data;

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
      return NextResponse.json({ error: "Blocks not found" }, { status: 404 });
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

    const blocks = blocksResult.data;
    const job = jobResult.data;

    // Phase 1: Compute algorithmic dimensions
    const skillsMatch = computeSkillsMatchScore(job, blocks, skillCategories);
    const keywordCoverage = computeKeywordCoverageScore(job, blocks, skillCategories);

    // Detect in-progress education for education fit + candidate context
    const today = new Date();
    const inProgressEdu = blocks.filter((b: { type: string; end_date?: string | null }) => {
      if (b.type !== "education") return false;
      if (!b.end_date) return true;
      return new Date(b.end_date) > today;
    });
    const candidateContext =
      inProgressEdu.length > 0
        ? "Candidate is currently enrolled in a degree program (in progress, not yet graduated)."
        : undefined;

    const educationFit = computeEducationFitScore(job, blocks);

    // Phase 2: Call Claude for AI dimensions
    const blocksText = JSON.stringify(blocks, null, 2);
    const jobText = JSON.stringify(job, null, 2);
    const prompt = getFitScorePrompt(
      blocksText,
      jobText,
      {
        skillsMatch: skillsMatch.score,
        keywordCoverage: keywordCoverage.score,
        educationFit: educationFit.score,
      },
      skillsProfile,
      candidateContext
    );

    const claude = getClaudeClient();
    const message = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: prompt.system,
      messages: [
        { role: "user", content: prompt.user },
        { role: "assistant", content: "{" },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Unexpected response from AI" },
        { status: 500 }
      );
    }

    const rawText = "{" + content.text;
    let rawJson: unknown;
    try {
      rawJson = JSON.parse(rawText.replace(/:\s*undefined\b/g, ": null"));
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
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

    // Phase 3: Assemble full FitAnalysis
    const { experience_relevance, overall_impression, pros, cons, suggestions } = fitResult.data;

    const totalScore =
      skillsMatch.score +
      experience_relevance +
      educationFit.score +
      keywordCoverage.score +
      overall_impression;

    const fitAnalysis: FitAnalysis = {
      totalScore,
      dimensions: [
        { label: "Skills Match", score: skillsMatch.score, maxScore: 30, source: "algorithmic" },
        { label: "Experience Relevance", score: experience_relevance, maxScore: 30, source: "ai" },
        { label: "Education Fit", score: educationFit.score, maxScore: 15, source: "algorithmic" },
        { label: "Keyword Coverage", score: keywordCoverage.score, maxScore: 15, source: "algorithmic" },
        { label: "Overall Impression", score: overall_impression, maxScore: 10, source: "ai" },
      ],
      pros,
      cons,
      suggestions,
    };

    // Persist to DB if a resume ID was provided
    if (resume_id) {
      await supabase
        .from("generated_resumes")
        .update({ fit_score: totalScore, fit_analysis: fitAnalysis })
        .eq("id", resume_id)
        .eq("user_id", user.id);
    }

    return NextResponse.json(fitAnalysis);
  } catch (error) {
    console.error("Fit score error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
