import { createClient } from "@/lib/supabase/server";
import { buildResumeDocx } from "@/lib/resume-docx";

export async function GET(
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
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Fetch resume + profile in parallel
    const [resumeResult, profileResult] = await Promise.all([
      supabase
        .from("generated_resumes")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single(),
    ]);

    if (resumeResult.error || !resumeResult.data) {
      return new Response(JSON.stringify({ error: "Resume not found" }), { status: 404 });
    }

    const resume = resumeResult.data;
    const profile = profileResult.data ?? {};

    // Optional section order from query param ?sections=work_experience,education,...
    const url = new URL(request.url);
    const sectionsParam = url.searchParams.get("sections");
    const sectionOrder = sectionsParam?.split(",").filter(Boolean);

    const buffer = await buildResumeDocx(
      resume.tailored_content,
      profile,
      sectionOrder
    );

    const filename = (resume.name ?? "resume").replace(/[^a-z0-9_\-]/gi, "_");

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}.docx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("DOCX generation error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
