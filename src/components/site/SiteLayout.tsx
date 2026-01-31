import * as React from "react";
import { Outlet } from "react-router-dom";

import { SiteHeader } from "@/components/site/SiteHeader";
import { MarqueeTicker } from "@/components/site/MarqueeTicker";

export function SiteLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="pb-14">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="container py-10">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Epic Trader</p>
            <p className="text-sm text-muted-foreground">
              Education-first trading mentorship across Forex, Crypto, Stocks, Indices, and Commodities.
            </p>
          </div>
        </div>
      </footer>

      <MarqueeTicker />
    </div>
  );
}
