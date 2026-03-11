export type StyleId = "standard" | "classic" | "modern";
export type Density = "tight" | "standard" | "spacious";

export interface ResumeStyleDef {
  id: StyleId;
  name: string;
  description: string;
  // typography
  bodyFont: string;
  boldFont: string;
  italicFont: string;
  boldItalicFont: string;
  bodySize: number;
  nameSize: number;
  // page
  pageSize: "LETTER" | "A4";
  marginH: number; // horizontal padding in pts
  marginV: number; // vertical padding in pts
  // section headers
  sectionRule: "bottom" | "left-bar";
  ruleColor: string;
  ruleWidth: number;
  sectionHeaderSize: number;
  // spacing
  sectionGap: number;  // marginBottom on section
  entryGap: number;    // marginBottom on entry
  // contact row separator
  contactSep: string;
  // header
  nameLetterSpacing: number;
  nameUppercase: boolean;
  headerAlign: "center" | "left";
}

// Spacing overrides keyed by density — applied on top of any base style
export const DENSITY_SPACING: Record<Density, { sectionGap: number; entryGap: number; marginH: number; marginV: number }> = {
  tight:    { sectionGap: 3,  entryGap: 2, marginH: 36, marginV: 22 },
  standard: { sectionGap: 6,  entryGap: 4, marginH: 40, marginV: 30 },
  spacious: { sectionGap: 10, entryGap: 7, marginH: 48, marginV: 40 },
};

export const RESUME_STYLES: Record<StyleId, ResumeStyleDef> = {
  standard: {
    id: "standard",
    name: "Standard",
    description: "Clean Helvetica layout — ideal for tech and business roles",
    bodyFont: "Helvetica",
    boldFont: "Helvetica-Bold",
    italicFont: "Helvetica-Oblique",
    boldItalicFont: "Helvetica-BoldOblique",
    bodySize: 10,
    nameSize: 18,
    pageSize: "LETTER",
    marginH: 40,
    marginV: 30,
    sectionRule: "bottom",
    ruleColor: "#000000",
    ruleWidth: 0.75,
    sectionHeaderSize: 10,
    sectionGap: 6,
    entryGap: 4,
    contactSep: "|",
    nameLetterSpacing: 0,
    nameUppercase: false,
    headerAlign: "center",
  },
  classic: {
    id: "classic",
    name: "Classic",
    description: "Times New Roman with generous spacing — preferred for law, finance, and academia",
    bodyFont: "Times-Roman",
    boldFont: "Times-Bold",
    italicFont: "Times-Italic",
    boldItalicFont: "Times-BoldItalic",
    bodySize: 10.5,
    nameSize: 18,
    pageSize: "LETTER",
    marginH: 48,
    marginV: 36,
    sectionRule: "bottom",
    ruleColor: "#555555",
    ruleWidth: 0.75,
    sectionHeaderSize: 10,
    sectionGap: 6,
    entryGap: 4,
    contactSep: "·",
    nameLetterSpacing: 0,
    nameUppercase: false,
    headerAlign: "center",
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Bold left-bar section accents — stands out for leadership and creative roles",
    bodyFont: "Helvetica",
    boldFont: "Helvetica-Bold",
    italicFont: "Helvetica-Oblique",
    boldItalicFont: "Helvetica-BoldOblique",
    bodySize: 10,
    nameSize: 20,
    pageSize: "LETTER",
    marginH: 40,
    marginV: 30,
    sectionRule: "left-bar",
    ruleColor: "#111111",
    ruleWidth: 3,
    sectionHeaderSize: 10,
    sectionGap: 6,
    entryGap: 4,
    contactSep: "·",
    nameLetterSpacing: 0.5,
    nameUppercase: false,
    headerAlign: "left",
  },
};

export const DEFAULT_STYLE_ID: StyleId = "standard";
