"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
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

const COMPACT_MODE_KEY = "calibr:compact-mode";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCompact(localStorage.getItem(COMPACT_MODE_KEY) === "true");
  }, []);

  function handleCompactChange(checked: boolean) {
    setCompact(checked);
    localStorage.setItem(COMPACT_MODE_KEY, String(checked));
  }

  if (!mounted) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
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
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <div className="max-w-2xl space-y-6">
        {/* Appearance */}
        <Card>
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
                    onClick={() => setTheme(t)}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
