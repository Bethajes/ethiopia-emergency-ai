import { Outlet } from "react-router-dom";

import { StatusIndicator } from "@/components/StatusIndicator";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  return (
    <div className="flex h-full min-h-screen bg-ops-950">
      <div className="flex min-w-0 flex-1 flex-col">
        <Header>
          <StatusIndicator />
        </Header>
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}