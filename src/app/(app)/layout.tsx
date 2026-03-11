export const dynamic = "force-dynamic";

import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 p-4 md:p-6">{children}</main>
      <Toaster />
    </div>
  );
}
