import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createInterviewRoundSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("job_id");

    let query = supabase
      .from("interview_rounds")
      .select("*")
      .eq("user_id", user.id)
      .order("round_number", { ascending: true });

    if (jobId) query = query.eq("job_posting_id", jobId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: "Failed to fetch interview rounds" }, { status: 500 });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const result = createInterviewRoundSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("interview_rounds")
      .insert({ ...result.data, user_id: user.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: "Failed to create interview round" }, { status: 500 });

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
