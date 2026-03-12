"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SkillCategory {
  category: string;
  items: string[];
}

// ─── Tag chip input ───────────────────────────────────────────────────────────

function TagChipInput({
  items,
  onChange,
  placeholder = "Type and press Enter…",
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function commit() {
    const trimmed = input.trim().replace(/,+$/, "").trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && input === "" && items.length > 0) {
      onChange(items.slice(0, -1));
    }
  }

  function removeItem(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  return (
    <div
      className="flex min-h-10 flex-wrap gap-1.5 rounded-md border bg-background px-3 py-2 text-sm cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {items.map((item, i) => (
        <span
          key={i}
          className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
        >
          {item}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeItem(i); }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={items.length === 0 ? placeholder : ""}
        className="min-w-24 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PersonalInfoPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    summary: "",
  });
  const [skills, setSkills] = useState<SkillCategory[]>([]);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setForm({
            full_name: data.full_name ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            location: data.location ?? "",
            linkedin_url: data.linkedin_url ?? "",
            github_url: data.github_url ?? "",
            portfolio_url: data.portfolio_url ?? "",
            summary: data.summary ?? "",
          });
          setSkills(Array.isArray(data.skills) ? data.skills : []);
        }
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setFetching(false));
  }, []);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function addCategory() {
    setSkills((prev) => [...prev, { category: "", items: [] }]);
  }

  function removeCategory(i: number) {
    setSkills((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateCategoryName(i: number, value: string) {
    setSkills((prev) => prev.map((cat, idx) => idx === i ? { ...cat, category: value } : cat));
  }

  function updateCategoryItems(i: number, items: string[]) {
    setSkills((prev) => prev.map((cat, idx) => idx === i ? { ...cat, items } : cat));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, skills }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="space-y-8">
        <h1 className="animate-header-in text-3xl font-bold tracking-tight">Personal Information</h1>
        <div className="max-w-2xl animate-pulse space-y-4 rounded-xl border p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="animate-header-in text-3xl font-bold tracking-tight">Personal Information</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Your personal information used for generating resumes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={form.full_name}
                  onChange={set("full_name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={set("email")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={set("phone")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="San Francisco, CA"
                  value={form.location}
                  onChange={set("location")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/johndoe"
                  value={form.linkedin_url}
                  onChange={set("linkedin_url")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  type="url"
                  placeholder="https://github.com/johndoe"
                  value={form.github_url}
                  onChange={set("github_url")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio URL</Label>
              <Input
                id="portfolio"
                type="url"
                placeholder="https://johndoe.dev"
                value={form.portfolio_url}
                onChange={set("portfolio_url")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                placeholder="A brief overview of your professional background and career goals..."
                className="min-h-32"
                value={form.summary}
                onChange={set("summary")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills & Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Skills &amp; Interests</CardTitle>
            <CardDescription>
              Organized by category. These are automatically included in every tailored resume.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {skills.map((cat, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Category (e.g. Technical, Languages, Interests)"
                    value={cat.category}
                    onChange={(e) => updateCategoryName(i, e.target.value)}
                  />
                  <TagChipInput
                    items={cat.items}
                    onChange={(items) => updateCategoryItems(i, items)}
                    placeholder="Type a skill and press Enter…"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-1 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeCategory(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCategory}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add category
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
