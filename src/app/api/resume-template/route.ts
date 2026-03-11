import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClaudeClient, CLAUDE_MODEL } from "@/lib/claude/client";
import type { StyleId, Density } from "@/lib/resume-styles";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 5MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text for use as template context in tailoring
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse/lib/pdf-parse");
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text?.trim() ?? "";

    // Analyze formatting with Claude vision (PDF document input)
    let suggestedStyle: StyleId = "standard";
    let styleReason = "";
    let detectedSections: string[] = [];
    let density: Density = "standard";
    let nameUppercase = false;
    let headerAlign: "center" | "left" = "center";

    const VALID_SECTIONS = ["work_experience", "research", "project", "education", "skill", "volunteering"];

    try {
      const claude = getClaudeClient();
      const message = await claude.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: buffer.toString("base64"),
                },
              } as { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string } },
              {
                type: "text",
                text: `Look at this resume PDF carefully and return a JSON object with these fields:

"style": One of "standard" | "classic" | "modern"
  - "standard": Sans-serif font (Helvetica/Arial), dense bullets, tight margins, tech/business feel
  - "classic": Serif font (Times/Georgia), more whitespace, formal — law/finance/academia
  - "modern": Bold name, strong visual hierarchy, creative/leadership positioning

"reason": One sentence explaining the style choice.

"density": One of "tight" | "standard" | "spacious"
  - "tight": Very little whitespace, dense — lots of content packed per page
  - "standard": Moderate spacing between sections and entries
  - "spacious": Clear breathing room between sections, generous margins

"headerAlign": "center" if the name/header is centered on the page, "left" if left-aligned.

"nameUppercase": true if the person's name appears in ALL CAPS, false otherwise.

"sections": Ordered array of section types found in the resume, using ONLY these exact values (in the order they appear top-to-bottom):
  ["work_experience", "research", "project", "education", "skill", "volunteering"]

Respond with ONLY valid JSON. Example:
{"style":"standard","reason":"Helvetica-like font with dense bullets.","density":"tight","headerAlign":"center","nameUppercase":false,"sections":["work_experience","project","education","skill"]}`,
              },
            ],
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        let raw: unknown;
        try {
          raw = JSON.parse(content.text);
        } catch {
          const match = content.text.match(/\{[\s\S]*\}/);
          if (match) {
            try { raw = JSON.parse(match[0]); } catch { /* ignore */ }
          }
        }
        if (raw && typeof raw === "object") {
          const r = raw as Record<string, unknown>;
          if (["standard", "classic", "modern"].includes(r.style as string)) {
            suggestedStyle = r.style as StyleId;
          }
          if (typeof r.reason === "string") styleReason = r.reason;
          if (["tight", "standard", "spacious"].includes(r.density as string)) {
            density = r.density as Density;
          }
          if (r.headerAlign === "left" || r.headerAlign === "center") {
            headerAlign = r.headerAlign;
          }
          if (typeof r.nameUppercase === "boolean") nameUppercase = r.nameUppercase;
          if (Array.isArray(r.sections)) {
            detectedSections = (r.sections as unknown[])
              .filter((s): s is string => typeof s === "string" && VALID_SECTIONS.includes(s));
          }
        }
      }
    } catch {
      // Non-blocking — fall back to defaults
    }

    return NextResponse.json({ text, suggestedStyle, styleReason, detectedSections, density, nameUppercase, headerAlign });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
