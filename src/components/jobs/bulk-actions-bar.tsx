"use client";

import { useState } from "react";
import { Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Status } from "@/components/jobs/status-switcher";

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "active",      label: "Active" },
  { value: "applying",    label: "Applying" },
  { value: "applied",     label: "Applied" },
  { value: "screening",   label: "Screening" },
  { value: "interview",   label: "Interview" },
  { value: "assessment",  label: "Assessment" },
  { value: "final_round", label: "Final Round" },
  { value: "offer",       label: "Offer" },
  { value: "negotiating", label: "Negotiating" },
  { value: "accepted",    label: "Accepted" },
  { value: "rejected",    label: "Rejected" },
  { value: "withdrawn",   label: "Withdrawn" },
  { value: "ghosted",     label: "Ghosted" },
  { value: "declined",    label: "Declined" },
];

interface BulkActionsBarProps {
  selectedIds: string[];
  onClear: () => void;
  onMutate: () => void;
}

export function BulkActionsBar({ selectedIds, onClear, onMutate }: BulkActionsBarProps) {
  const [busy, setBusy] = useState(false);
  const count = selectedIds.length;

  async function setStatus(status: Status) {
    setBusy(true);
    try {
      const res = await fetch("/api/jobs/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_status", ids: selectedIds, status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Updated ${count} job${count !== 1 ? "s" : ""}`);
      onMutate();
      onClear();
    } catch {
      toast.error("Failed to update jobs");
    } finally {
      setBusy(false);
    }
  }

  async function deleteSelected() {
    if (!confirm(`Delete ${count} job${count !== 1 ? "s" : ""}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/jobs/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", ids: selectedIds }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Deleted ${count} job${count !== 1 ? "s" : ""}`);
      onMutate();
      onClear();
    } catch {
      toast.error("Failed to delete jobs");
    } finally {
      setBusy(false);
    }
  }

  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-xl border bg-background/95 shadow-lg backdrop-blur px-4 py-2.5">
        <span className="text-sm font-medium">{count} selected</span>
        <div className="h-4 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" disabled={busy}>
              Set Status
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="max-h-72 overflow-y-auto">
            {STATUS_OPTIONS.map(opt => (
              <DropdownMenuItem key={opt.value} onSelect={() => setStatus(opt.value)}>
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" variant="destructive" disabled={busy} onClick={deleteSelected}>
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>

        <button
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
