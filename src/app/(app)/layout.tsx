export const dynamic = "force-dynamic";

import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
      <Toaster />
    </div>
  );
}
