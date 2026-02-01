import * as React from "react";
import { Outlet } from "react-router-dom";

import { IntroModal } from "@/components/site/IntroModal";
import { SiteHeader } from "@/components/site/SiteHeader";
import { MarqueeTicker } from "@/components/site/MarqueeTicker";

export function SiteLayout() {
  const [showIntro, setShowIntro] = React.useState(false);

  React.useEffect(() => {
    const hasSeenIntro = window.localStorage.getItem("epic-trader-intro-seen");
    if (!hasSeenIntro) {
      setShowIntro(true);
    }
  }, []);

  const handleCloseIntro = () => {
    window.localStorage.setItem("epic-trader-intro-seen", "true");
    setShowIntro(false);
  };

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
