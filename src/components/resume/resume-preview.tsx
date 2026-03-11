"use client";

import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { ResumePDF } from "./resume-pdf";
import type { TailoredContent } from "@/types/resumes";
import type { ResumeProfile } from "./resume-pdf";
import { Button } from "@/components/ui/button";
import { Download, FileText, Code } from "lucide-react";
import { downloadAsLatex } from "@/lib/resume-latex";

interface ResumePreviewProps {
  content: TailoredContent;
  profile?: ResumeProfile;
  filename?: string;
  resumeId: string;
  sectionOrder?: string[];
}

export function ResumePreview({
  content,
  profile,
  filename = "resume",
  resumeId,
  sectionOrder,
}: ResumePreviewProps) {
  const pdfDoc = <ResumePDF content={content} profile={profile} sectionOrder={sectionOrder} />;

  return (
    <div className="flex flex-col gap-4">
      {/* Download buttons */}
      <div className="flex items-center gap-3 self-end">
        <PDFDownloadLink document={pdfDoc} fileName={`${filename}.pdf`}>
          {({ loading }) => (
            <Button variant="outline" disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              {loading ? "Preparing…" : "Download PDF"}
            </Button>
          )}
        </PDFDownloadLink>

        <Button asChild>
          <a href={`/api/resumes/${resumeId}/docx`} download>
            <FileText className="mr-2 h-4 w-4" />
            Download DOCX
          </a>
        </Button>

        <Button variant="outline" onClick={() => downloadAsLatex(content, profile, filename, sectionOrder)}>
          <Code className="mr-2 h-4 w-4" />
          Download LaTeX
        </Button>
      </div>

      {/* Live preview */}
      <PDFViewer width="100%" height={900} className="rounded-lg border shadow-sm" showToolbar={false}>
        {pdfDoc}
      </PDFViewer>
    </div>
  );
}
