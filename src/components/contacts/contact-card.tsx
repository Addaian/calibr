"use client";

import { Mail, Phone, Linkedin, Building2, Calendar } from "lucide-react";
import type { Contact } from "@/types/contacts";

interface ContactCardProps {
  contact: Contact;
  jobTitle?: string;
  onClick: () => void;
}

const BORDER_COLORS = ["border-l-blue-500","border-l-violet-500","border-l-amber-500","border-l-green-500","border-l-rose-500"];

export function ContactCard({ contact, jobTitle, onClick }: ContactCardProps) {
  const borderColor = BORDER_COLORS[contact.name.charCodeAt(0) % BORDER_COLORS.length];

  function fmtDate(d: string | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  }

  return (
    <button
      onClick={onClick}
      className={`hover-lift w-full rounded-xl border border-l-4 ${borderColor} bg-card p-4 text-left transition-colors space-y-2`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{contact.name}</p>
          {(contact.company || contact.role) && (
            <p className="text-sm text-muted-foreground">
              {[contact.role, contact.company].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        {contact.last_contacted_at && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Calendar className="h-3 w-3" />
            {fmtDate(contact.last_contacted_at)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {contact.email && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />{contact.email}
          </span>
        )}
        {contact.phone && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />{contact.phone}
          </span>
        )}
        {contact.linkedin_url && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Linkedin className="h-3 w-3" />LinkedIn
          </span>
        )}
        {jobTitle && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3" />{jobTitle}
          </span>
        )}
      </div>

      {contact.notes && (
        <p className="text-xs text-muted-foreground line-clamp-2">{contact.notes}</p>
      )}
    </button>
  );
}
