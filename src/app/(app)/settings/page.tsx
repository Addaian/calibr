"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Star, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  ACCENT_KEY,
  setAccent,
  type AccentColor,
} from "@/components/accent-provider";

const COMPACT_MODE_KEY = "calibr:compact-mode";

const ACCENTS: { value: AccentColor; label: string; color: string }[] = [
  { value: "indigo", label: "Indigo", color: "bg-indigo-500" },
  { value: "blue", label: "Blue", color: "bg-blue-500" },
  { value: "violet", label: "Violet", color: "bg-violet-500" },
  { value: "green", label: "Green", color: "bg-green-500" },
  { value: "rose", label: "Rose", color: "bg-rose-500" },
  { value: "amber", label: "Amber", color: "bg-amber-500" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [compact, setCompact] = useState(false);
  const [accent, setAccentState] = useState<AccentColor>("indigo");

  useEffect(() => {
    setMounted(true);
    setCompact(localStorage.getItem(COMPACT_MODE_KEY) === "true");
    setAccentState(
      (localStorage.getItem(ACCENT_KEY) as AccentColor) || "indigo"
    );
  }, []);

  function handleCompactChange(checked: boolean) {
    setCompact(checked);
    localStorage.setItem(COMPACT_MODE_KEY, String(checked));
  }

  if (!mounted) {
    return (
      <div className="space-y-8">
        <h1 className="animate-header-in text-3xl font-bold tracking-tight">Settings</h1>
        <div className="max-w-2xl animate-pulse space-y-4 rounded-xl border p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="animate-header-in text-3xl font-bold tracking-tight">Settings</h1>

      <div className="max-w-2xl space-y-6">
        {/* Appearance */}
        <Card className="border-t-2 border-t-primary/30">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how Calibr looks on your device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                {(["light", "dark", "system"] as const).map((t) => (
                  <Button
                    key={t}
                    variant={theme === t ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      document.documentElement.classList.add("theme-transition");
                      setTheme(t);
                      setTimeout(() => document.documentElement.classList.remove("theme-transition"), 350);
                    }}
                    className="capitalize"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact-mode">Compact mode</Label>
                <p className="text-sm text-muted-foreground">
                  Reduce spacing for a denser layout.
                </p>
              </div>
              <Switch
                id="compact-mode"
                checked={compact}
                onCheckedChange={handleCompactChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Accent color</Label>
              <div className="flex gap-3">
                {ACCENTS.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    aria-label={a.label}
                    onClick={() => {
                      setAccent(a.value);
                      setAccentState(a.value);
                    }}
                    className={`h-7 w-7 rounded-full cursor-pointer ring-2 ring-offset-2 ring-offset-background transition-all ${a.color} ${
                      accent === a.value ? "ring-primary" : "ring-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live preview */}
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              See how your accent color looks across common UI elements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button size="sm">
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                Primary button
              </Button>
              <Button size="sm" variant="outline">Outline button</Button>
              <Button size="sm" variant="ghost">Ghost button</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                <Star className="h-3 w-3" /> Badge
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                <Check className="h-3 w-3" /> Active
              </span>
              <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                92% fit
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Zap className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Sample action item</p>
                <p className="text-xs text-muted-foreground">This is how cards look with your accent</p>
              </div>
              <span className="text-xs font-medium text-primary">View →</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
              <div className="h-full w-3/4 rounded-full bg-primary transition-all" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
