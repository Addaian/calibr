import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { TailoredContent } from "@/types/resumes";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ResumeProfile {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
}

interface ResumePDFProps {
  content: TailoredContent;
  profile?: ResumeProfile;
  sectionOrder?: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

// Times-Roman family is built into react-pdf and visually equivalent to
// the Garamond used in the .docx (same style, slightly different letterforms).
const BODY = "Times-Roman";
const BOLD = "Times-Bold";
const ITALIC = "Times-Italic";

const BODY_PT = 11;
const NAME_PT = 22;
const MARGIN_PT = 54; // 0.75 inch

const DEFAULT_SECTION_ORDER = [
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined): string {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatRight(location: string | null, start: string | null, end: string | null): string {
  const dateRange = start ? `${formatDate(start)} \u2013 ${formatDate(end)}` : "";
  if (location && dateRange) return `${location} | ${dateRange}`;
  return location ?? dateRange;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ResumePDF({ content, profile, sectionOrder: sectionOrderProp }: ResumePDFProps) {
  const activeSectionOrder = sectionOrderProp?.length ? sectionOrderProp : DEFAULT_SECTION_ORDER;

  const grouped: Record<string, typeof content.blocks> = {};
  for (const block of content.blocks) {
    if (!grouped[block.type]) grouped[block.type] = [];
    grouped[block.type].push(block);
  }

  const contactParts = [
    profile?.phone,
    profile?.email,
    profile?.location,
    profile?.linkedin_url,
    profile?.github_url,
    profile?.portfolio_url,
  ].filter((x): x is string => Boolean(x));

  return (
    <Document>
      <Page
        size="LETTER"
        style={{
          fontFamily: BODY,
          fontSize: BODY_PT,
          color: "#000000",
          paddingTop: MARGIN_PT,
          paddingBottom: MARGIN_PT,
          paddingHorizontal: MARGIN_PT,
          lineHeight: 1.1,
        }}
      >
        {/* ── Name ── */}
        {profile?.full_name && (
          <Text
            style={{
              fontFamily: BOLD,
              fontSize: NAME_PT,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {profile.full_name}
          </Text>
        )}

        {/* ── Contact line ── */}
        {contactParts.length > 0 && (
          <Text
            style={{
              fontFamily: BODY,
              fontSize: BODY_PT,
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            {contactParts.join(" | ")}
          </Text>
        )}

        {/* ── Sections ── */}
        {activeSectionOrder
          .filter((type) => grouped[type]?.length)
          .map((type) => {
            const blocks = grouped[type];
            const isSkill = type === "skill";

            return (
              <View key={type} style={{ marginTop: 6 }}>
                {/* Section header with bottom rule */}
                <View
                  style={{
                    borderBottomWidth: 0.75,
                    borderBottomColor: "#000000",
                    borderBottomStyle: "solid",
                    paddingBottom: 1,
                    marginBottom: 2,
                  }}
                >
                  <Text style={{ fontFamily: BOLD, fontSize: BODY_PT }}>
                    {SECTION_TITLES[type] ?? type.toUpperCase()}
                  </Text>
                </View>

                {isSkill ? (
                  /* Skills: Bold label + Regular value */
                  blocks.map((block, i) => {
                    const value = block.bullet_points.filter(Boolean).join(", ");
                    const label = block.title?.trim();
                    return (
                      <Text key={i} style={{ fontFamily: BODY, fontSize: BODY_PT }}>
                        {label ? (
                          <>
                            <Text style={{ fontFamily: BOLD }}>{label}: </Text>
                            {value}
                          </>
                        ) : (
                          value || label
                        )}
                      </Text>
                    );
                  })
                ) : (
                  /* Standard entries */
                  blocks.map((block, i) => {
                    const right = formatRight(block.location, block.start_date, block.end_date);
                    const isEducation = type === "education";

                    return (
                      <View key={i} style={{ marginTop: i > 0 ? 5 : 0 }}>
                        {/* Entry header: Org + Role left, Location | Date right */}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Text style={{ flex: 1, marginRight: 10, fontSize: BODY_PT }}>
                            <Text style={{ fontFamily: BOLD }}>
                              {block.organization ?? ""}
                            </Text>
                            {!isEducation && block.title ? (
                              <Text>
                                <Text style={{ fontFamily: BOLD }}>{", "}</Text>
                                <Text style={{ fontFamily: ITALIC }}>{block.title}</Text>
                              </Text>
                            ) : null}
                          </Text>
                          {right ? (
                            <Text
                              style={{
                                fontFamily: BOLD,
                                fontSize: BODY_PT,
                                flexShrink: 0,
                              }}
                            >
                              {right}
                            </Text>
                          ) : null}
                        </View>

                        {/* Degree line (education only) */}
                        {isEducation && block.title && (
                          <Text style={{ fontFamily: ITALIC, fontSize: BODY_PT }}>
                            {block.title}
                            {block.metadata?.gpa ? ` | GPA: ${block.metadata.gpa}` : ""}
                          </Text>
                        )}

                        {/* Bullet points */}
                        {block.bullet_points.map((bp, j) => (
                          <View
                            key={j}
                            style={{ flexDirection: "row", paddingLeft: 14, marginTop: 1 }}
                          >
                            <Text
                              style={{ width: 10, fontFamily: BODY, fontSize: BODY_PT }}
                            >
                              {"•"}
                            </Text>
                            <Text
                              style={{
                                flex: 1,
                                fontFamily: BODY,
                                fontSize: BODY_PT,
                                lineHeight: 1.2,
                              }}
                            >
                              {bp}
                            </Text>
                          </View>
                        ))}
                      </View>
                    );
                  })
                )}
              </View>
            );
          })}
      </Page>
    </Document>
  );
}
