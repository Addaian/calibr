"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import type { Contact } from "@/types/contacts";

interface ContactFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contact?: Contact | null;
  defaultJobId?: string | null;
  onSaved: (c: Contact) => void;
  onDeleted?: (id: string) => void;
}

function empty(contact?: Contact | null, jobId?: string | null) {
  return {
    name: contact?.name ?? "",
    email: contact?.email ?? "",
    phone: contact?.phone ?? "",
    company: contact?.company ?? "",
    role: contact?.role ?? "",
    linkedin_url: contact?.linkedin_url ?? "",
    last_contacted_at: contact?.last_contacted_at ?? "",
    notes: contact?.notes ?? "",
    job_posting_id: contact?.job_posting_id ?? jobId ?? null,
  };
}

export function ContactForm({ open, onOpenChange, contact, defaultJobId, onSaved, onDeleted }: ContactFormProps) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [f, setF] = useState(empty(contact, defaultJobId));
  const isEdit = !!contact;

  useEffect(() => {
    setF(empty(contact, defaultJobId));
  }, [contact, defaultJobId, open]);

  function set(key: string, value: string) {
    setF(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!f.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const payload = {
        name: f.name.trim(),
        email: f.email || null,
        phone: f.phone || null,
        company: f.company || null,
        role: f.role || null,
        linkedin_url: f.linkedin_url || null,
        last_contacted_at: f.last_contacted_at || null,
        notes: f.notes || null,
        job_posting_id: f.job_posting_id || null,
      };

      const res = await fetch(
        isEdit ? `/api/contacts/${contact.id}` : "/api/contacts",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error();
      const saved = await res.json();
      toast.success(isEdit ? "Contact updated" : "Contact added");
      onSaved(saved);
      onOpenChange(false);
    } catch {
      toast.error("Failed to save contact");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!contact || !confirm(`Delete ${contact.name}?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Contact deleted");
      onDeleted?.(contact.id);
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete contact");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Contact" : "Add Contact"}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Name <span className="text-destructive">*</span></Label>
            <Input value={f.name} onChange={e => set("name", e.target.value)} placeholder="Jane Smith" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Company</Label>
              <Input value={f.company} onChange={e => set("company", e.target.value)} placeholder="Acme Corp" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Their Role</Label>
              <Input value={f.role} onChange={e => set("role", e.target.value)} placeholder="Recruiter" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={f.email} onChange={e => set("email", e.target.value)} placeholder="jane@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input value={f.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 555 0100" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">LinkedIn URL</Label>
            <Input value={f.linkedin_url} onChange={e => set("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/…" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Last Contacted</Label>
            <Input type="date" value={f.last_contacted_at} onChange={e => set("last_contacted_at", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea
              value={f.notes}
              onChange={e => set("notes", e.target.value)}
              placeholder="Reached out via LinkedIn, referral from…"
              rows={3}
              className="resize-none text-sm"
            />
          </div>
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-row">
          {isEdit && (
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting || saving}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
