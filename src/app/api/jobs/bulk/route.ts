import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bulkSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("delete"),
    ids: z.array(z.string().uuid()).min(1).max(200),
  }),
  z.object({
    action: z.literal("set_status"),
    ids: z.array(z.string().uuid()).min(1).max(200),
    status: z.enum([
      "active", "applying", "applied", "screening", "interview",
      "assessment", "final_round", "offer", "negotiating", "accepted",
      "rejected", "withdrawn", "ghosted", "declined",
    ]),
  }),
]);

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { action, ids } = parsed.data;

    if (action === "delete") {
      const { error } = await supabase
        .from("job_postings")
        .delete()
        .in("id", ids)
        .eq("user_id", user.id);

      if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
      return NextResponse.json({ deleted: ids.length });
    }

    if (action === "set_status") {
      const { error } = await supabase
        .from("job_postings")
        .update({ status: parsed.data.status, status_date: new Date().toISOString().split("T")[0] })
        .in("id", ids)
        .eq("user_id", user.id);

      if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
      return NextResponse.json({ updated: ids.length });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
