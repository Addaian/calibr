"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { InterviewRound, RoundType, RoundOutcome } from "@/types/interviews";
import { ROUND_TYPE_LABELS, OUTCOME_LABELS } from "@/types/interviews";

interface InterviewFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<InterviewRound>) => Promise<void>;
  initial?: InterviewRound | null;
  nextRoundNumber?: number;
}

export function InterviewForm({ open, onClose, onSave, initial, nextRoundNumber = 1 }: InterviewFormProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    round_number: nextRoundNumber,
    round_type: "technical" as RoundType,
    scheduled_at: "",
    duration_minutes: "",
    location: "",
    interviewer_name: "",
    notes: "",
    outcome: "pending" as RoundOutcome,
  });

  useEffect(() => {
    if (initial) {
      setForm({
        round_number: initial.round_number,
        round_type: initial.round_type,
        scheduled_at: initial.scheduled_at
          ? new Date(initial.scheduled_at).toISOString().slice(0, 16)
          : "",
        duration_minutes: initial.duration_minutes?.toString() ?? "",
        location: initial.location ?? "",
        interviewer_name: initial.interviewer_name ?? "",
        notes: initial.notes ?? "",
        outcome: initial.outcome,
      });
    } else {
      setForm(f => ({ ...f, round_number: nextRoundNumber }));
    }
  }, [initial, nextRoundNumber, open]);

  function set(key: string, value: string | number) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        round_number: Number(form.round_number),
        round_type: form.round_type,
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
        location: form.location || null,
        interviewer_name: form.interviewer_name || null,
        notes: form.notes || null,
        outcome: form.outcome,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Round" : "Add Interview Round"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Round #</Label>
              <Input
                type="number"
                min={1}
                value={form.round_number}
                onChange={e => set("round_number", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.round_type} onValueChange={v => set("round_type", v)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(ROUND_TYPE_LABELS) as [RoundType, string][]).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={e => set("scheduled_at", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input
                type="number"
                min={1}
                placeholder="60"
                value={form.duration_minutes}
                onChange={e => set("duration_minutes", e.target.value)}
                className="h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Location / Platform</Label>
              <Input
                placeholder="Zoom, on-site…"
                value={form.location}
                onChange={e => set("location", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Interviewer</Label>
              <Input
                placeholder="Name"
                value={form.interviewer_name}
                onChange={e => set("interviewer_name", e.target.value)}
                className="h-8"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Outcome</Label>
            <Select value={form.outcome} onValueChange={v => set("outcome", v)}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(OUTCOME_LABELS) as [RoundOutcome, string][]).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              placeholder="Topics covered, feedback, prep notes…"
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : initial ? "Save changes" : "Add round"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
