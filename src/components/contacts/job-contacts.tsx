"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactCard } from "./contact-card";
import { ContactForm } from "./contact-form";
import type { Contact } from "@/types/contacts";

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface JobContactsProps {
  jobId: string;
}

export function JobContacts({ jobId }: JobContactsProps) {
  const { data: contacts, mutate } = useSWR<Contact[]>(`/api/contacts?job_id=${jobId}`, fetcher);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);

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

  const list = contacts ?? [];

  return (
    <div className="space-y-3">
      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Users className="h-6 w-6 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No contacts yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map(c => (
            <ContactCard key={c.id} contact={c} onClick={() => openEdit(c)} />
          ))}
        </div>
      )}

      <Button size="sm" variant="outline" onClick={openAdd}>
        <Plus className="h-3.5 w-3.5" />
        Add Contact
      </Button>

      <ContactForm
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={editing}
        defaultJobId={jobId}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
