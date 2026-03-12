"use client";

import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { ResumePDF } from "./resume-pdf";
import type { TailoredContent } from "@/types/resumes";
import type { ResumeProfile } from "./resume-pdf";
import { Button } from "@/components/ui/button";
import { Download, FileText, Code } from "lucide-react";
import { downloadAsLatex } from "@/lib/resume-latex";

interface ResumePdfDialogProps {
  content: TailoredContent;
  profile?: ResumeProfile;
  resumeId: string;
  filename?: string;
}

export function ResumePdfDialog({
  content,
  profile,
  resumeId,
  filename = "resume",
}: ResumePdfDialogProps) {
  const pdfDoc = <ResumePDF content={content} profile={profile} />;

  return (
    <div className="flex h-full flex-col">
      {/* Download buttons */}
      <div className="flex items-center gap-2 border-b px-6 py-2">
        <PDFDownloadLink document={pdfDoc} fileName={`${filename}.pdf`}>
          {({ loading }) => (
            <Button variant="outline" size="sm" disabled={loading}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {loading ? "Preparing…" : "Download PDF"}
            </Button>
          )}
        </PDFDownloadLink>
        <Button asChild variant="outline" size="sm">
          <a href={`/api/resumes/${resumeId}/docx`} download>
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Download DOCX
          </a>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadAsLatex(content, profile, filename)}
        >
          <Code className="mr-1.5 h-3.5 w-3.5" />
          Download LaTeX
        </Button>
      </div>

      {/* PDF viewer */}
      <div className="flex-1">
        <PDFViewer width="100%" height="100%" showToolbar={false} style={{ border: "none" }}>
          {pdfDoc}
        </PDFViewer>
      </div>
    </div>
  );
}
