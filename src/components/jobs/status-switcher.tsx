"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { JobPosting } from "@/types/jobs";

export type Status = JobPosting["status"];

export const STATUSES: {
  value: Status;
  label: string;
  dot: string;
  pill: string;
  btn: string;
  btnSelected: string;
}[] = [
  {
    value: "active",
    label: "Saved",
    dot: "bg-zinc-400 dark:bg-zinc-500",
    pill: "bg-zinc-500/8 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-400",
    btn: "border-zinc-200/60 bg-zinc-500/5 text-zinc-600 hover:bg-zinc-500/10 dark:border-zinc-700/60 dark:bg-zinc-500/8 dark:text-zinc-400",
    btnSelected: "border-zinc-400/70 bg-zinc-500/14 text-zinc-800 dark:border-zinc-500/70 dark:bg-zinc-500/20 dark:text-zinc-200",
  },
  {
    value: "applying",
    label: "Applying",
    dot: "bg-sky-400 dark:bg-sky-500",
    pill: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
    btn: "border-sky-200/60 bg-sky-500/6 text-sky-700 hover:bg-sky-500/12 dark:border-sky-700/60 dark:bg-sky-500/8 dark:text-sky-400",
    btnSelected: "border-sky-400/70 bg-sky-500/16 text-sky-800 dark:border-sky-500/70 dark:bg-sky-500/22 dark:text-sky-300",
  },
  {
    value: "applied",
    label: "Applied",
    dot: "bg-blue-400 dark:bg-blue-500",
    pill: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    btn: "border-blue-200/60 bg-blue-500/6 text-blue-700 hover:bg-blue-500/12 dark:border-blue-700/60 dark:bg-blue-500/8 dark:text-blue-400",
    btnSelected: "border-blue-400/70 bg-blue-500/16 text-blue-800 dark:border-blue-500/70 dark:bg-blue-500/22 dark:text-blue-300",
  },
  {
    value: "screening",
    label: "Screening",
    dot: "bg-indigo-400 dark:bg-indigo-500",
    pill: "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
    btn: "border-indigo-200/60 bg-indigo-500/6 text-indigo-700 hover:bg-indigo-500/12 dark:border-indigo-700/60 dark:bg-indigo-500/8 dark:text-indigo-400",
    btnSelected: "border-indigo-400/70 bg-indigo-500/16 text-indigo-800 dark:border-indigo-500/70 dark:bg-indigo-500/22 dark:text-indigo-300",
  },
  {
    value: "interview",
    label: "Interviewing",
    dot: "bg-violet-400 dark:bg-violet-500",
    pill: "bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
    btn: "border-violet-200/60 bg-violet-500/6 text-violet-700 hover:bg-violet-500/12 dark:border-violet-700/60 dark:bg-violet-500/8 dark:text-violet-400",
    btnSelected: "border-violet-400/70 bg-violet-500/16 text-violet-800 dark:border-violet-500/70 dark:bg-violet-500/22 dark:text-violet-300",
  },
  {
    value: "assessment",
    label: "Assessment",
    dot: "bg-amber-400 dark:bg-amber-500",
    pill: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    btn: "border-amber-200/60 bg-amber-500/6 text-amber-700 hover:bg-amber-500/12 dark:border-amber-700/60 dark:bg-amber-500/8 dark:text-amber-400",
    btnSelected: "border-amber-400/70 bg-amber-500/16 text-amber-800 dark:border-amber-500/70 dark:bg-amber-500/22 dark:text-amber-300",
  },
  {
    value: "final_round",
    label: "Final Round",
    dot: "bg-orange-400 dark:bg-orange-500",
    pill: "bg-orange-500/10 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
    btn: "border-orange-200/60 bg-orange-500/6 text-orange-700 hover:bg-orange-500/12 dark:border-orange-700/60 dark:bg-orange-500/8 dark:text-orange-400",
    btnSelected: "border-orange-400/70 bg-orange-500/16 text-orange-800 dark:border-orange-500/70 dark:bg-orange-500/22 dark:text-orange-300",
  },
  {
    value: "offer",
    label: "Offer",
    dot: "bg-emerald-400 dark:bg-emerald-500",
    pill: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    btn: "border-emerald-200/60 bg-emerald-500/6 text-emerald-700 hover:bg-emerald-500/12 dark:border-emerald-700/60 dark:bg-emerald-500/8 dark:text-emerald-400",
    btnSelected: "border-emerald-400/70 bg-emerald-500/16 text-emerald-800 dark:border-emerald-500/70 dark:bg-emerald-500/22 dark:text-emerald-300",
  },
  {
    value: "negotiating",
    label: "Negotiating",
    dot: "bg-teal-400 dark:bg-teal-500",
    pill: "bg-teal-500/10 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400",
    btn: "border-teal-200/60 bg-teal-500/6 text-teal-700 hover:bg-teal-500/12 dark:border-teal-700/60 dark:bg-teal-500/8 dark:text-teal-400",
    btnSelected: "border-teal-400/70 bg-teal-500/16 text-teal-800 dark:border-teal-500/70 dark:bg-teal-500/22 dark:text-teal-300",
  },
  {
    value: "accepted",
    label: "Accepted",
    dot: "bg-green-400 dark:bg-green-500",
    pill: "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-400",
    btn: "border-green-200/60 bg-green-500/6 text-green-700 hover:bg-green-500/12 dark:border-green-700/60 dark:bg-green-500/8 dark:text-green-400",
    btnSelected: "border-green-400/70 bg-green-500/16 text-green-800 dark:border-green-500/70 dark:bg-green-500/22 dark:text-green-300",
  },
  {
    value: "rejected",
    label: "Rejected",
    dot: "bg-red-400 dark:bg-red-500",
    pill: "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
    btn: "border-red-200/60 bg-red-500/6 text-red-600 hover:bg-red-500/12 dark:border-red-700/60 dark:bg-red-500/8 dark:text-red-400",
    btnSelected: "border-red-400/70 bg-red-500/16 text-red-800 dark:border-red-500/70 dark:bg-red-500/22 dark:text-red-300",
  },
  {
    value: "withdrawn",
    label: "Withdrawn",
    dot: "bg-slate-400 dark:bg-slate-500",
    pill: "bg-slate-500/8 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400",
    btn: "border-slate-200/60 bg-slate-500/5 text-slate-600 hover:bg-slate-500/10 dark:border-slate-700/60 dark:bg-slate-500/8 dark:text-slate-400",
    btnSelected: "border-slate-400/70 bg-slate-500/14 text-slate-800 dark:border-slate-500/70 dark:bg-slate-500/20 dark:text-slate-200",
  },
  {
    value: "ghosted",
    label: "Ghosted",
    dot: "bg-zinc-300 dark:bg-zinc-600",
    pill: "bg-zinc-500/6 text-zinc-500 dark:bg-zinc-500/12 dark:text-zinc-500",
    btn: "border-zinc-200/50 bg-zinc-500/4 text-zinc-500 hover:bg-zinc-500/8 dark:border-zinc-700/50 dark:bg-zinc-500/6 dark:text-zinc-500",
    btnSelected: "border-zinc-400/60 bg-zinc-500/12 text-zinc-700 dark:border-zinc-500/60 dark:bg-zinc-500/18 dark:text-zinc-300",
  },
  {
    value: "declined",
    label: "Declined",
    dot: "bg-rose-400 dark:bg-rose-500",
    pill: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
    btn: "border-rose-200/60 bg-rose-500/6 text-rose-600 hover:bg-rose-500/12 dark:border-rose-700/60 dark:bg-rose-500/8 dark:text-rose-400",
    btnSelected: "border-rose-400/70 bg-rose-500/16 text-rose-800 dark:border-rose-500/70 dark:bg-rose-500/22 dark:text-rose-300",
  },
];

export const STATUS_GROUPS: { label: string; statuses: Status[] }[] = [
  { label: "Tracking", statuses: ["active", "applying"] },
  { label: "Application", statuses: ["applied", "screening"] },
  { label: "Interviews", statuses: ["interview", "assessment", "final_round"] },
  { label: "Offer Stage", statuses: ["offer", "negotiating", "accepted"] },
  { label: "Closed", statuses: ["rejected", "withdrawn", "ghosted", "declined"] },
];

function getStatusMeta(status: Status) {
  return STATUSES.find((s) => s.value === status) ?? STATUSES[0];
}

interface StatusSwitcherProps {
  jobId: string;
  status: Status;
  statusDate: string | null;
  onUpdate?: (status: Status, statusDate: string | null) => void;
}

export function StatusSwitcher({ jobId, status, statusDate, onUpdate }: StatusSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Status>(status);
  const [date, setDate] = useState<string>(
    statusDate ?? new Date().toISOString().split("T")[0]
  );
  const [saving, setSaving] = useState(false);

  const current = getStatusMeta(status);

  async function handleSave() {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { status: selected };
      if (date) body.status_date = date;
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to update status");
      }
      onUpdate?.(selected, date || null);
      setOpen(false);
      toast.success("Status updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setSelected(status);
          setDate(statusDate ?? new Date().toISOString().split("T")[0]);
          setOpen(true);
        }}
        className={`group inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-150 hover:opacity-75 hover:scale-105 active:scale-95 ${current.pill}`}
      >
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${current.dot}`} />
        {current.label}
        <ChevronDown className="h-2.5 w-2.5 opacity-50 transition-transform duration-200 group-hover:translate-y-px" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Status buttons grouped */}
            <div className="space-y-3">
              {STATUS_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {group.statuses.map((val) => {
                      const s = getStatusMeta(val);
                      return (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setSelected(s.value)}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
                            selected === s.value ? s.btnSelected : s.btn
                          }`}
                        >
                          {s.label}
                          {selected === s.value && <Check className="h-3.5 w-3.5 shrink-0 animate-check-pop" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Date input */}
            <div className="space-y-1.5">
              <Label htmlFor="status-date" className="text-sm">Date</Label>
              <Input
                id="status-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
