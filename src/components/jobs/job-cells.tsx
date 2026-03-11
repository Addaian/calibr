"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

// ─── Inline text / textarea ───────────────────────────────────────────────────
interface InlineTextProps {
  value: string | null;
  onSave: (v: string | null) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}

export function InlineText({ value, onSave, placeholder = "—", multiline, className }: InlineTextProps) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value ?? "");

  useEffect(() => {
    if (!editing) setLocal(value ?? "");
  }, [value, editing]);

  function commit() {
    setEditing(false);
    const trimmed = local.trim();
    if (trimmed !== (value ?? "")) onSave(trimmed || null);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setEditing(false); setLocal(value ?? ""); }
    if (!multiline && e.key === "Enter") { e.preventDefault(); commit(); }
    if (multiline && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit(); }
  }

  const inputClass = "w-full rounded border border-primary/40 bg-background px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none";

  if (editing) {
    return multiline ? (
      <textarea
        autoFocus
        rows={2}
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        className={inputClass}
      />
    ) : (
      <input
        autoFocus
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        className={inputClass}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={`w-full truncate text-left text-xs hover:bg-muted/60 rounded px-1 -mx-1 ${value ? "text-foreground" : "text-muted-foreground/40"} ${className ?? ""}`}
    >
      {value || placeholder}
    </button>
  );
}

// ─── Inline date ──────────────────────────────────────────────────────────────
interface InlineDateProps {
  value: string | null;
  onSave: (v: string | null) => void;
  placeholder?: string;
  className?: string;
}

export function InlineDate({ value, onSave, placeholder = "—", className }: InlineDateProps) {
  const [editing, setEditing] = useState(false);

  const formatted = value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    : null;

  if (editing) {
    return (
      <input
        type="date"
        autoFocus
        defaultValue={value ?? ""}
        onBlur={e => { setEditing(false); onSave(e.target.value || null); }}
        onChange={e => { setEditing(false); onSave(e.target.value || null); }}
        className="w-full rounded border border-primary/40 bg-background px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={`w-full truncate text-left text-xs hover:bg-muted/60 rounded px-1 -mx-1 ${formatted ? "text-foreground" : "text-muted-foreground/40"} ${className ?? ""}`}
    >
      {formatted || placeholder}
    </button>
  );
}

// ─── Inline source select ─────────────────────────────────────────────────────
const SOURCE_OPTIONS = [
  "LinkedIn",
  "Indeed",
  "Glassdoor",
  "Company Website",
  "Referral",
  "Recruiter Outreach",
  "AngelList / Wellfound",
  "Handshake",
  "Twitter / X",
  "GitHub Jobs",
  "Other",
];

interface InlineSourceProps {
  value: string | null;
  onSave: (v: string | null) => void;
}

export function InlineSource({ value, onSave }: InlineSourceProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <select
        autoFocus
        defaultValue={value ?? ""}
        onBlur={e => { setEditing(false); onSave(e.target.value || null); }}
        onChange={e => { setEditing(false); onSave(e.target.value || null); }}
        className="w-full rounded border border-primary/40 bg-background px-1 py-0.5 text-xs focus:outline-none"
      >
        <option value="">—</option>
        {SOURCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={`w-full truncate text-left text-xs hover:bg-muted/60 rounded px-1 -mx-1 ${value ? "text-foreground" : "text-muted-foreground/40"}`}
    >
      {value || "—"}
    </button>
  );
}

// ─── Inline priority stars ────────────────────────────────────────────────────
interface InlinePriorityProps {
  value: 1 | 2 | 3 | null;
  onSave: (v: 1 | 2 | 3 | null) => void;
}

export function InlinePriority({ value, onSave }: InlinePriorityProps) {
  return (
    <div className="flex gap-0.5">
      {([1, 2, 3] as const).map(i => (
        <button
          key={i}
          onClick={() => onSave(value === i ? null : i)}
          className="rounded p-0.5 hover:scale-110 transition-transform"
          title={["Low", "Medium", "High"][i - 1]}
        >
          <Star
            className={`size-3.5 ${
              i <= (value ?? 0)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/25 hover:text-amber-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
