import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  TabStopType,
  AlignmentType,
  BorderStyle,
  LevelFormat,
} from "docx";
import type { TailoredContent } from "@/types/resumes";
import type { ResumeProfile } from "@/components/resume/resume-pdf";

// ─── Constants ───────────────────────────────────────────────────────────────

const FONT = "Garamond";
const SIZE = 22;        // 11pt in half-points
const NAME_SIZE = 44;   // 22pt in half-points
const SPACER_SIZE = 10; // 5pt in half-points
const TAB_POS = 10080;  // right tab = content width (7" at 1440 DXA/inch)
const TIGHT = { line: 240, before: 0, after: 0 };

// ─── Text run helpers ─────────────────────────────────────────────────────────

function reg(text: string) {
  return new TextRun({ text, font: FONT, size: SIZE });
}

function bold(text: string) {
  return new TextRun({ text, font: FONT, size: SIZE, bold: true });
}

function italic(text: string) {
  return new TextRun({ text, font: FONT, size: SIZE, italics: true });
}

// ─── Paragraph helpers ────────────────────────────────────────────────────────

function spacer() {
  return new Paragraph({
    spacing: TIGHT,
    children: [new TextRun({ text: " ", font: FONT, size: SPACER_SIZE, bold: true })],
  });
}

function sectionHeader(text: string) {
  return new Paragraph({
    spacing: TIGHT,
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 },
    },
    children: [new TextRun({ text, font: FONT, size: SIZE, bold: true })],
  });
}

function entryHeader(orgName: string, roleTitle: string | null, rightText: string) {
  const children: TextRun[] = [
    new TextRun({ text: orgName, font: FONT, size: SIZE, bold: true }),
  ];
  if (roleTitle) {
    children.push(new TextRun({ text: ", ", font: FONT, size: SIZE, bold: true }));
    children.push(new TextRun({ text: roleTitle, font: FONT, size: SIZE, italics: true }));
  }
  children.push(new TextRun({ text: "\t" }));
  children.push(new TextRun({ text: rightText, font: FONT, size: SIZE, bold: true }));
  return new Paragraph({
    spacing: TIGHT,
    tabStops: [{ type: TabStopType.RIGHT, position: TAB_POS }],
    children,
  });
}

function degreeLine(degreeText: string, labelText?: string, valueText?: string) {
  const children: TextRun[] = [
    new TextRun({ text: degreeText, font: FONT, size: SIZE, italics: true }),
  ];
  if (labelText) {
    children.push(new TextRun({ text: "\t" }));
    children.push(new TextRun({ text: labelText, font: FONT, size: SIZE, bold: true }));
    if (valueText) {
      children.push(new TextRun({ text: valueText, font: FONT, size: SIZE }));
    }
  }
  return new Paragraph({
    spacing: TIGHT,
    tabStops: labelText ? [{ type: TabStopType.RIGHT, position: TAB_POS }] : [],
    children,
  });
}

function bullet(runs: TextRun[]) {
  return new Paragraph({
    spacing: TIGHT,
    numbering: { reference: "bullets", level: 0 },
    children: runs,
  });
}

function projectBullet(text: string) {
  return new Paragraph({
    spacing: TIGHT,
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, font: FONT, size: SIZE, bold: true })],
  });
}

function subBullet(runs: TextRun[]) {
  return new Paragraph({
    spacing: TIGHT,
    numbering: { reference: "sub-bullets", level: 0 },
    children: runs,
  });
}

function selectedProjectLabel() {
  return new Paragraph({
    spacing: TIGHT,
    indent: { left: 360 },
    children: [reg("Selected Project Experience:")],
  });
}

function skillLine(label: string, value: string) {
  return new Paragraph({
    spacing: TIGHT,
    children: [bold(label + ": "), reg(value)],
  });
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined): string {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatRight(
  location: string | null,
  startDate: string | null,
  endDate: string | null
): string {
  const dateRange = startDate
    ? `${formatDate(startDate)} \u2013 ${formatDate(endDate)}`
    : "";
  if (location && dateRange) return `${location} | ${dateRange}`;
  if (location) return location;
  return dateRange;
}

// ─── Section ordering ─────────────────────────────────────────────────────────

const SECTION_ORDER = [
  "education",
  "work_experience",
  "research",
  "project",
  "volunteering",
  "skill",
];

const SECTION_TITLES: Record<string, string> = {
  education: "EDUCATION",
  work_experience: "WORK EXPERIENCE",
  research: "RESEARCH EXPERIENCE",
  project: "PROJECT EXPERIENCE",
  volunteering: "LEADERSHIP EXPERIENCE",
  skill: "SKILLS & INTERESTS",
};

// ─── Main builder ─────────────────────────────────────────────────────────────

export async function buildResumeDocx(
  content: TailoredContent,
  profile: ResumeProfile,
  sectionOrderOverride?: string[]
): Promise<Buffer> {
  // Group blocks by type
  const grouped: Record<string, typeof content.blocks> = {};
  for (const block of content.blocks) {
    if (!grouped[block.type]) grouped[block.type] = [];
    grouped[block.type].push(block);
  }

  // Contact line
  const contactParts = [
    profile.phone,
    profile.email,
    profile.location,
    profile.linkedin_url ?? null,
    profile.github_url ?? null,
    profile.portfolio_url ?? null,
  ].filter((x): x is string => Boolean(x));

  const children: Paragraph[] = [];

  // ── Name ──
  if (profile.full_name) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: TIGHT,
        children: [
          new TextRun({ text: profile.full_name, font: FONT, size: NAME_SIZE, bold: true }),
        ],
      })
    );
  }

  // ── Contact line ──
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: TIGHT,
        children: [reg(contactParts.join(" | "))],
      })
    );
  }

  // ── Sections ──
  const order = sectionOrderOverride?.length ? sectionOrderOverride : SECTION_ORDER;

  for (const type of order) {
    const blocks = grouped[type];
    if (!blocks?.length) continue;

    children.push(spacer());
    children.push(sectionHeader(SECTION_TITLES[type] ?? type.toUpperCase()));

    if (type === "skill") {
      // Skills: block.title = label (e.g. "Technical Skills"), bullet_points = values
      // Fall back to title alone if bullet_points is empty
      for (const block of blocks) {
        const value = block.bullet_points.filter(Boolean).join(", ");
        const label = block.title?.trim();
        if (label && value) {
          children.push(skillLine(label, value));
        } else if (label) {
          // No bullet_points — render the title as a plain line
          children.push(
            new Paragraph({ spacing: TIGHT, children: [reg(label)] })
          );
        } else if (value) {
          children.push(
            new Paragraph({ spacing: TIGHT, children: [reg(value)] })
          );
        }
      }
      continue;
    }

    // Standard section entries
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (i > 0) children.push(spacer());

      const right = formatRight(block.location, block.start_date, block.end_date);

      if (type === "education") {
        // Org = school, title = degree (italic line below)
        children.push(entryHeader(block.organization ?? "", null, right));
        if (block.title) {
          children.push(degreeLine(block.title));
        }
      } else {
        // title = role, organization = company/org
        children.push(entryHeader(block.organization ?? "", block.title || null, right));
      }

      // Bullets
      for (const bp of block.bullet_points) {
        children.push(bullet([reg(bp)]));
      }
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE },
          paragraph: { spacing: TIGHT },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: { indent: { left: 360, hanging: 360 } },
              },
            },
          ],
        },
        {
          reference: "sub-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "o",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: { indent: { left: 720, hanging: 360 } },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
          },
        },
        children,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

// Re-export helpers for use in API routes that want to render custom bullet runs
export { reg, bold, italic, bullet, subBullet, projectBullet, selectedProjectLabel };
