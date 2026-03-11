export const dynamic = "force-dynamic";

import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-dot-pattern">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-72
        bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,oklch(0.55_0.15_260/0.06),transparent)]
        dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,oklch(0.55_0.15_260/0.08),transparent)]" />
      <Navbar />
      <main className="flex-1 p-4 md:p-6">{children}</main>
      <Toaster />
    </div>
  );
}
