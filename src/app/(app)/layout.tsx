export const dynamic = "force-dynamic";

import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { AccentProvider } from "@/components/accent-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col bg-dot-pattern">
        {/* Top radial glow */}
        <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-72
          bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,oklch(0.55_0.18_275/0.07),transparent)]
          dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,oklch(0.55_0.18_275/0.10),transparent)]" />
        {/* Left side orb */}
        <div className="pointer-events-none fixed -left-40 top-1/3 -z-10 h-[500px] w-[500px] rounded-full bg-primary/[0.03] blur-3xl dark:bg-primary/[0.06]" />
        {/* Right side orb */}
        <div className="pointer-events-none fixed -right-40 top-2/3 -z-10 h-[400px] w-[400px] rounded-full bg-primary/[0.04] blur-3xl dark:bg-primary/[0.07]" />
        <Navbar />
        <main className="flex-1 p-4 md:p-6">{children}</main>
        <KeyboardShortcuts />
        <AccentProvider />
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
