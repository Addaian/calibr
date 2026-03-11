"use client";

import { useState, useRef } from "react";
import { Upload, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { parseCSV, mapRow, type MappedRow } from "@/lib/csv-parser";

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImported: () => void;
}

const PREVIEW_LIMIT = 5;

export function CsvImportDialog({ open, onOpenChange, onImported }: CsvImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<MappedRow[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<"upload" | "preview">("upload");

  function reset() {
    setRows([]);
    setSkipped(0);
    setFileName("");
    setStep("upload");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleClose(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  async function handleFile(file: File) {
    const text = await file.text();
    const { rows: rawRows } = parseCSV(text);
    const mapped: MappedRow[] = [];
    let sk = 0;
    for (const row of rawRows) {
      const m = mapRow(row);
      if (m) mapped.push(m);
      else sk++;
    }
    setRows(mapped);
    setSkipped(sk);
    setFileName(file.name);
    setStep("preview");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
      handleFile(file);
    } else {
      toast.error("Please drop a CSV file");
    }
  }

  async function handleImport() {
    if (rows.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/jobs/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(`Imported ${data.imported} job${data.imported !== 1 ? "s" : ""}`);
      onImported();
      handleClose(false);
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Jobs from CSV</DialogTitle>
        </DialogHeader>

        {step === "upload" ? (
          <div
            className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed py-14 cursor-pointer hover:bg-muted/40 transition-colors"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Drop a CSV file or click to browse</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Columns: title (required), company, location, url, status, deadline, notes, source, recruiter_name, salary_range
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{fileName}</span>
                {" — "}
                <span className="font-medium text-foreground">{rows.length}</span> row{rows.length !== 1 ? "s" : ""} ready to import
                {skipped > 0 && (
                  <span className="ml-2 text-amber-600 dark:text-amber-400">
                    ({skipped} skipped — missing title)
                  </span>
                )}
              </span>
              <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground">
                Change file
              </button>
            </div>

            {rows.length === 0 ? (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                No valid rows found. Make sure your CSV has a &quot;title&quot; column.
              </div>
            ) : (
              <div className="rounded-md border overflow-auto max-h-60">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      {["Title", "Company", "Location", "Status", "Deadline"].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.slice(0, PREVIEW_LIMIT).map((row, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-medium">{row.title}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.company ?? "—"}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.location ?? "—"}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.status ?? "active"}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.deadline ?? "—"}</td>
                      </tr>
                    ))}
                    {rows.length > PREVIEW_LIMIT && (
                      <tr>
                        <td colSpan={5} className="px-3 py-2 text-center text-muted-foreground">
                          … and {rows.length - PREVIEW_LIMIT} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleClose(false)}>Cancel</Button>
          {step === "preview" && rows.length > 0 && (
            <Button onClick={handleImport} disabled={importing}>
              {importing ? "Importing…" : `Import ${rows.length} Job${rows.length !== 1 ? "s" : ""}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
