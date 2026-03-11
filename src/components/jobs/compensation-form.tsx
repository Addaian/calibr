"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Compensation } from "@/types/jobs";

interface CompensationFormProps {
  jobId: string;
  initial: Compensation | null;
  onSave: (c: Compensation | null) => void;
}

function num(v: string): number | undefined {
  const n = parseFloat(v.replace(/,/g, ""));
  return isNaN(n) ? undefined : n;
}

function fmt(v: number | undefined): string {
  return v !== undefined ? String(v) : "";
}

function calcYear1(c: Partial<Compensation>): number | null {
  const base = c.base ?? 0;
  const sign = c.signing_bonus ?? 0;
  const rsus = c.rsus ?? 0;
  const vest = c.rsu_vest_years ?? 4;
  const relo = c.relocation ?? 0;
  if (!base) return null;
  return Math.round(base + sign + rsus / vest + relo);
}

function calcSteady(c: Partial<Compensation>): number | null {
  const base = c.base ?? 0;
  const rsus = c.rsus ?? 0;
  const vest = c.rsu_vest_years ?? 4;
  if (!base) return null;
  return Math.round(base + rsus / vest);
}

function fmtUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function CompensationForm({ jobId, initial, onSave }: CompensationFormProps) {
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    base: fmt(initial?.base),
    signing_bonus: fmt(initial?.signing_bonus),
    rsus: fmt(initial?.rsus),
    rsu_vest_years: fmt(initial?.rsu_vest_years ?? 4),
    relocation: fmt(initial?.relocation),
    other: initial?.other ?? "",
  });

  useEffect(() => {
    setF({
      base: fmt(initial?.base),
      signing_bonus: fmt(initial?.signing_bonus),
      rsus: fmt(initial?.rsus),
      rsu_vest_years: fmt(initial?.rsu_vest_years ?? 4),
      relocation: fmt(initial?.relocation),
      other: initial?.other ?? "",
    });
  }, [initial]);

  function set(key: string, value: string) {
    setF(prev => ({ ...prev, [key]: value }));
  }

  const preview: Partial<Compensation> = {
    base: num(f.base),
    signing_bonus: num(f.signing_bonus),
    rsus: num(f.rsus),
    rsu_vest_years: num(f.rsu_vest_years),
    relocation: num(f.relocation),
  };

  const year1 = calcYear1(preview);
  const steady = calcSteady(preview);

  async function handleSave() {
    setSaving(true);
    const comp: Compensation = {
      ...(preview.base !== undefined && { base: preview.base }),
      ...(preview.signing_bonus !== undefined && { signing_bonus: preview.signing_bonus }),
      ...(preview.rsus !== undefined && { rsus: preview.rsus }),
      ...(preview.rsu_vest_years !== undefined && { rsu_vest_years: preview.rsu_vest_years }),
      ...(preview.relocation !== undefined && { relocation: preview.relocation }),
      ...(f.other && { other: f.other }),
      currency: "USD",
    };
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compensation: comp }),
      });
      if (!res.ok) throw new Error();
      onSave(comp);
      toast.success("Compensation saved");
    } catch {
      toast.error("Failed to save compensation");
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compensation: null }),
      });
      if (!res.ok) throw new Error();
      onSave(null);
      setF({ base: "", signing_bonus: "", rsus: "", rsu_vest_years: "4", relocation: "", other: "" });
      toast.success("Compensation cleared");
    } catch {
      toast.error("Failed to clear compensation");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Base Salary / yr</Label>
          <Input
            placeholder="120000"
            value={f.base}
            onChange={e => set("base", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Signing Bonus</Label>
          <Input
            placeholder="30000"
            value={f.signing_bonus}
            onChange={e => set("signing_bonus", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Relocation</Label>
          <Input
            placeholder="10000"
            value={f.relocation}
            onChange={e => set("relocation", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">RSU Grant (total $)</Label>
          <Input
            placeholder="200000"
            value={f.rsus}
            onChange={e => set("rsus", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Vest Period (yrs)</Label>
          <Input
            type="number"
            min={1}
            max={10}
            placeholder="4"
            value={f.rsu_vest_years}
            onChange={e => set("rsu_vest_years", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Other Notes</Label>
        <Textarea
          placeholder="401k match, healthcare, bonus…"
          value={f.other}
          onChange={e => set("other", e.target.value)}
          rows={2}
          className="resize-none text-sm"
        />
      </div>

      {/* Live calculation preview */}
      {(year1 !== null || steady !== null) && (
        <div className="flex gap-4 rounded-md bg-muted/60 px-3 py-2 text-sm">
          {year1 !== null && (
            <span>
              <span className="text-xs text-muted-foreground">Year 1 </span>
              <span className="font-semibold">{fmtUSD(year1)}</span>
            </span>
          )}
          {steady !== null && (
            <span>
              <span className="text-xs text-muted-foreground">Steady state </span>
              <span className="font-semibold">{fmtUSD(steady)}</span>
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        {initial && (
          <Button size="sm" variant="ghost" onClick={handleClear} disabled={saving}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
