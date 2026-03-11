"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Blocks, Briefcase, FileText, Settings, LogOut, User,
  Trophy, Users, Mail, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const primaryNav = [
  { label: "Jobs",   href: "/jobs",   icon: Briefcase },
  { label: "Blocks", href: "/blocks", icon: Blocks },
];

const secondaryNav = [
  { label: "Compare",       href: "/jobs/compare",  icon: Trophy },
  { label: "Contacts",      href: "/contacts",      icon: Users },
  { label: "Templates",     href: "/templates",     icon: Mail },
  { label: "Resumes",       href: "/resumes",       icon: FileText },
  { label: "Personal Info", href: "/personal-info", icon: User },
  { label: "Settings",      href: "/settings",      icon: Settings },
];

const allNav = [...primaryNav, ...secondaryNav];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch {
      setSigningOut(false);
    }
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  function MobileNavLink({ item }: { item: typeof allNav[number] }) {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        onClick={() => setMenuOpen(false)}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          active
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        }`}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {item.label}
      </Link>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/50 bg-background/70 px-4 backdrop-blur-xl md:px-6">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity shrink-0"
        >
          Calibr<span className="text-primary">.</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-6">
          {/* Primary — Jobs & Blocks */}
          {primaryNav.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-all duration-150 hover:-translate-y-px ${
                  active
                    ? "text-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
                {active && <span className="absolute -bottom-px left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary" />}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="mx-1 h-4 w-px bg-border" />

          {/* Secondary */}
          {secondaryNav.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 hover:-translate-y-px ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
                {active && <span className="absolute -bottom-px left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-muted-foreground/50" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          {/* Desktop sign out */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex text-muted-foreground"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <LogOut className="h-3.5 w-3.5" />
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute top-14 left-0 right-0 border-b bg-background shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col p-3 gap-0.5">
              <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main</p>
              {primaryNav.map(item => <MobileNavLink key={item.href} item={item} />)}
              <p className="px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">More</p>
              {secondaryNav.map(item => <MobileNavLink key={item.href} item={item} />)}
              <div className="my-1 border-t" />
              <button
                onClick={() => { setMenuOpen(false); handleSignOut(); }}
                disabled={signingOut}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
