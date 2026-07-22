import * as React from "react";
import { Outlet } from "react-router-dom";

import { IntroModal } from "@/components/site/IntroModal";
import { SiteHeader } from "@/components/site/SiteHeader";
import { MarqueeTicker } from "@/components/site/MarqueeTicker";

const INTRO_DISMISSED_KEY = "epic-trader-intro-dismissed";

export function SiteLayout() {
  const [showIntro, setShowIntro] = React.useState(
    () => window.sessionStorage.getItem(INTRO_DISMISSED_KEY) !== "true",
  );

  const handleCloseIntro = () => {
    window.sessionStorage.setItem(INTRO_DISMISSED_KEY, "true");
    setShowIntro(false);
  };

  React.useEffect(() => {
    const visitsKey = "epic-trader-visits";
    const storedVisits = window.localStorage.getItem(visitsKey);
    const visits = storedVisits ? (JSON.parse(storedVisits) as Array<Record<string, string>>) : [];
    const userData = window.localStorage.getItem("epic-trader-users");
    const users = userData ? (JSON.parse(userData) as Array<Record<string, string>>) : [];
    const currentUser = users[0];
    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      country: currentUser?.country ?? "Unknown",
      age: currentUser?.age ?? "Unknown",
      profession: currentUser?.profession ?? "Unknown",
      page: window.location.pathname,
    };
    window.localStorage.setItem(visitsKey, JSON.stringify([entry, ...visits]));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <IntroModal isOpen={showIntro} onClose={handleCloseIntro} />
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
