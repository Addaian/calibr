export function downloadAsPdf(content: string, filename: string) {
  const win = window.open("", "_blank");
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${filename}</title>
  <style>
    body {
      font-family: Georgia, serif;
      font-size: 12pt;
      line-height: 1.7;
      max-width: 680px;
      margin: 60px auto;
      color: #111;
      white-space: pre-wrap;
    }
    @media print {
      body { margin: 0; }
      @page { margin: 1in; }
    }
  </style>
</head>
<body>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</body>
</html>`);

  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 300);
}

export async function downloadAsDocx(content: string, filename: string) {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");

  const paragraphs = content.split("\n").map(
    (line) =>
      new Paragraph({
        children: [new TextRun({ text: line, size: 24, font: "Georgia" })],
        spacing: { after: line.trim() === "" ? 0 : 160 },
      })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
