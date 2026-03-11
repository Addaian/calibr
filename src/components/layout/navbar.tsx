"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Blocks, Briefcase, FileText, Settings, LogOut, User, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Compare", href: "/jobs/compare", icon: Trophy },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Blocks", href: "/blocks", icon: Blocks },
  { label: "Resumes", href: "/resumes", icon: FileText },
  { label: "Personal Info", href: "/personal-info", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

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

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">Calibr<span className="text-primary">.</span></Link>

        <nav className="flex items-center gap-0.5">
          {navItems.map((item) => {
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
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={handleSignOut}
        disabled={signingOut}
      >
        <LogOut className="h-3.5 w-3.5" />
        {signingOut ? "Signing out…" : "Sign out"}
      </Button>
    </header>
  );
}
