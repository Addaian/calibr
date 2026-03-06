export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="md:hidden">
          <Topbar />
        </div>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      <Toaster />
    </div>
  );
}
