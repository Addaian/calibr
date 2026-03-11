"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Plus, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactCard } from "@/components/contacts/contact-card";
import { ContactForm } from "@/components/contacts/contact-form";
import type { Contact } from "@/types/contacts";
import type { JobPosting } from "@/types/jobs";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ContactsPage() {
  const { data: contacts, mutate } = useSWR<Contact[]>("/api/contacts", fetcher);
  const { data: jobs } = useSWR<JobPosting[]>("/api/jobs", fetcher);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);

  const jobTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const j of jobs ?? []) map.set(j.id, `${j.title}${j.company ? ` · ${j.company}` : ""}`);
    return map;
  }, [jobs]);

  const filtered = useMemo(() => {
    if (!contacts) return [];
    const q = query.toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.role?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  }, [contacts, query]);

  function openAdd() { setEditing(null); setFormOpen(true); }
  function openEdit(c: Contact) { setEditing(c); setFormOpen(true); }

  function handleSaved(saved: Contact) {
    mutate(prev => {
      if (!prev) return [saved];
      const idx = prev.findIndex(c => c.id === saved.id);
      if (idx >= 0) return prev.map(c => c.id === saved.id ? saved : c);
      return [saved, ...prev];
    }, false);
  }

  function handleDeleted(id: string) {
    mutate(prev => prev?.filter(c => c.id !== id), false);
  }

  const isLoading = contacts === undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <Button onClick={openAdd}>
          <Plus className="size-4" />
          Add Contact
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search contacts…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-muted-foreground/20 bg-muted/10 py-16">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
              <Users className="h-6 w-6 text-primary/60" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-medium">{query ? "No contacts found" : "No contacts yet"}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {query ? "Try a different search term" : "Track recruiters, hiring managers, and connections"}
            </p>
          </div>
          {!query && (
            <Button onClick={openAdd}>
              <Plus className="size-4" />
              Add Your First Contact
            </Button>
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <div
              key={c.id}
              style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-300"
            >
              <ContactCard
                contact={c}
                jobTitle={c.job_posting_id ? jobTitleById.get(c.job_posting_id) : undefined}
                onClick={() => openEdit(c)}
              />
            </div>
          ))}
        </div>
      )}

      <ContactForm
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={editing}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
