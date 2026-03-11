"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Clock, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InterviewForm } from "./interview-form";
import type { InterviewRound, RoundOutcome } from "@/types/interviews";
import { ROUND_TYPE_LABELS } from "@/types/interviews";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ─── Outcome styles ───────────────────────────────────────────────────────────

const OUTCOME_STYLES: Record<RoundOutcome, { dot: string; label: string }> = {
  pending:   { dot: "bg-muted-foreground/40 ring-2 ring-muted-foreground/20", label: "" },
  passed:    { dot: "bg-green-500 ring-2 ring-green-500/30",                  label: "Passed" },
  failed:    { dot: "bg-red-500 ring-2 ring-red-500/30",                      label: "Failed" },
  cancelled: { dot: "bg-zinc-400 ring-2 ring-zinc-400/30",                    label: "Cancelled" },
};

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

// ─── Single round node ────────────────────────────────────────────────────────

function RoundNode({
  round,
  isLast,
  onEdit,
  onDelete,
}: {
  round: InterviewRound;
  isLast: boolean;
  onEdit: (r: InterviewRound) => void;
  onDelete: (id: string) => void;
}) {
  const style = OUTCOME_STYLES[round.outcome];

  return (
    <div className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div className={`mt-1 h-3 w-3 shrink-0 rounded-full ${style.dot}`} />
        {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
      </div>

      {/* Card */}
      <div className={`mb-4 flex-1 rounded-lg border bg-card p-3 ${isLast ? "" : ""}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Round {round.round_number}
              </span>
              <span className="text-sm font-medium">{ROUND_TYPE_LABELS[round.round_type]}</span>
              {style.label && (
                <span className={`text-xs font-medium ${
                  round.outcome === "passed" ? "text-green-600 dark:text-green-400" :
                  round.outcome === "failed" ? "text-red-600 dark:text-red-400" :
                  "text-muted-foreground"
                }`}>
                  · {style.label}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              {round.scheduled_at && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {fmtDateTime(round.scheduled_at)}
                  {round.duration_minutes && ` · ${round.duration_minutes} min`}
                </span>
              )}
              {round.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {round.location}
                </span>
              )}
              {round.interviewer_name && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {round.interviewer_name}
                </span>
              )}
            </div>

            {round.notes && (
              <p className="mt-1.5 text-xs text-muted-foreground">{round.notes}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <Button variant="ghost" size="icon-xs" onClick={() => onEdit(round)}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={() => onDelete(round.id)}>
              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function InterviewTimeline({ jobId }: { jobId: string }) {
  const { data: rounds = [], mutate } = useSWR<InterviewRound[]>(
    `/api/interviews?job_id=${jobId}`,
    fetcher
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InterviewRound | null>(null);

  async function handleSave(data: Partial<InterviewRound>) {
    if (editing) {
      const res = await fetch(`/api/interviews/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { toast.error("Failed to update round"); return; }
      toast.success("Round updated");
    } else {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, job_posting_id: jobId }),
      });
      if (!res.ok) { toast.error("Failed to add round"); return; }
      toast.success("Round added");
    }
    mutate();
    setEditing(null);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/interviews/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed to delete round"); return; }
    toast.success("Round removed");
    mutate();
  }

  function openAdd() { setEditing(null); setFormOpen(true); }
  function openEdit(r: InterviewRound) { setEditing(r); setFormOpen(true); }

  return (
    <div className="space-y-3">
      {rounds.length === 0 ? (
        <p className="text-sm text-muted-foreground">No interview rounds tracked yet.</p>
      ) : (
        <div>
          {rounds.map((r, i) => (
            <RoundNode
              key={r.id}
              round={r}
              isLast={i === rounds.length - 1}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={openAdd}>
        <Plus className="h-3 w-3" />
        Add round
      </Button>

      <InterviewForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
        initial={editing}
        nextRoundNumber={rounds.length + 1}
      />
    </div>
  );
}
