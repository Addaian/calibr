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

const navItems = [
  { label: "Jobs",          href: "/jobs",          icon: Briefcase },
  { label: "Compare",       href: "/jobs/compare",  icon: Trophy },
  { label: "Contacts",      href: "/contacts",      icon: Users },
  { label: "Templates",     href: "/templates",     icon: Mail },
  { label: "Blocks",        href: "/blocks",        icon: Blocks },
  { label: "Resumes",       href: "/resumes",       icon: FileText },
  { label: "Personal Info", href: "/personal-info", icon: User },
  { label: "Settings",      href: "/settings",      icon: Settings },
];

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

  function NavLink({ item }: { item: typeof navItems[number] }) {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        href={item.href}
        onClick={() => setMenuOpen(false)}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          isActive
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
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-6">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
        >
          Calibr<span className="text-primary">.</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
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
              {navItems.map(item => <NavLink key={item.href} item={item} />)}
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
