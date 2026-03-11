import type { TailoredContent } from "@/types/resumes";
import type { ResumeProfile } from "@/components/resume/resume-pdf";

const SECTION_TITLES: Record<string, string> = {
  education: "Education",
  work_experience: "Professional Experience",
  research: "Research Experience",
  project: "Project Experience",
  volunteering: "Leadership and Activities",
  skill: "Skills and Interests",
};

const DEFAULT_SECTION_ORDER = [
  "education",
  "work_experience",
  "research",
  "project",
  "volunteering",
  "skill",
];

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/–/g, "--")
    .replace(/—/g, "---")
    .replace(/\u2013/g, "--")
    .replace(/\u2014/g, "---");
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function makeBullets(points: string[]): string {
  if (!points.length) return "";
  const items = points.map((bp) => `    \\item ${esc(bp)}`).join("\n");
  return `\\begin{itemize}\n${items}\n\\end{itemize}`;
}

export function generateLatex(
  content: TailoredContent,
  profile?: ResumeProfile,
  sectionOrder?: string[]
): string {
  const order = sectionOrder?.length ? sectionOrder : DEFAULT_SECTION_ORDER;

  const grouped: Record<string, typeof content.blocks> = {};
  for (const block of content.blocks) {
    if (!grouped[block.type]) grouped[block.type] = [];
    grouped[block.type].push(block);
  }

  // Contact line — pipe-separated
  const contactParts = [
    profile?.email,
    profile?.phone,
    profile?.location,
    profile?.linkedin_url,
    profile?.github_url,
    profile?.portfolio_url,
  ].filter(Boolean).map(esc);

  const contactLine = contactParts.join(" \\ $|$ \\ ");

  // Build sections
  const sections = order
    .filter((type) => grouped[type]?.length)
    .map((type) => {
      const blocks = grouped[type];
      const title = SECTION_TITLES[type] ?? type.replace(/_/g, " ");
      const isSkill = type === "skill";
      const isEdu = type === "education";

      if (isSkill) {
        const items = blocks.map((block) => {
          const label = esc(block.title);
          const value = block.bullet_points.filter(Boolean).map(esc).join(", ");
          return `    \\item ${label ? `\\textbf{${label}:} ` : ""}${value}`;
        }).join("\n");
        return `\\section{${title}}\n\\begin{itemize}\n${items}\n\\end{itemize}`;
      }

      const entries = blocks.map((block) => {
        const org = esc(block.organization ?? "");
        const role = esc(block.title ?? "");
        const loc = esc(block.location ?? "");
        const dateStr = block.start_date
          ? `${formatDate(block.start_date)} -- ${formatDate(block.end_date)}`
          : formatDate(block.end_date);

        let bullets: string[] = [...(block.bullet_points ?? [])];

        // For education, inject GPA + coursework as first bullet if present
        if (isEdu) {
          const gpaParts: string[] = [];
          if (block.metadata?.gpa) {
            gpaParts.push(`\\textbf{GPA:} ${esc(String(block.metadata.gpa))}`);
          }
          if (block.metadata?.coursework) {
            gpaParts.push(`\\textbf{Coursework:} ${esc(String(block.metadata.coursework))}`);
          }
          if (gpaParts.length) {
            bullets = [gpaParts.join(" \\ $|$ \\ "), ...bullets];
          }
        }

        return `\\experienceheader{${org}}{${role}}{${loc}}{${dateStr}}\n${makeBullets(bullets)}`;
      }).join("\n\n");

      return `\\section{${title}}\n\n${entries}`;
    })
    .join("\n\n");

  const nameLine = profile?.full_name
    ? `    {\\huge \\textbf{${esc(profile.full_name)}}} \\\\ \\vspace{4pt}\n    ${contactLine}`
    : contactLine;

  return `\\documentclass[11pt,letterpaper]{article}

% --- Packages ---
\\usepackage[left=0.5in, top=0.4in, right=0.5in, bottom=0.5in]{geometry}
\\usepackage{mathptmx}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{titlesec}

% --- Formatting Setup ---
\\pagestyle{empty}
\\raggedright
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

% Section header: small caps, large, bold, with rule underneath
\\titleformat{\\section}{\\scshape\\raggedright\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{5pt}{3pt}

% Extremely tight bullet points
\\setlist[itemize]{leftmargin=*, label=\\small\\textbullet, nosep, noitemsep, topsep=0pt, parsep=0pt, partopsep=0pt}

% Experience header: #1=Company  #2=Role  #3=Location  #4=Dates
\\newcommand{\\experienceheader}[4]{
  \\vspace{3pt}
  \\noindent \\textbf{#1} \\hfill #3 \\\\
  \\textit{#2} \\hfill \\textit{#4}
  \\vspace{1pt}
}

% --- Begin Document ---
\\begin{document}

% --- Header ---
\\begin{center}
${nameLine}
\\end{center}

${sections}

\\end{document}
`;
}

export function downloadAsLatex(
  content: TailoredContent,
  profile?: ResumeProfile,
  filename = "resume",
  sectionOrder?: string[]
): void {
  const tex = generateLatex(content, profile, sectionOrder);
  const blob = new Blob([tex], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.tex`;
  a.click();
  URL.revokeObjectURL(url);
}
