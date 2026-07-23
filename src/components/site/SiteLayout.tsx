import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";

import { IntroModal } from "@/components/site/IntroModal";
import { SiteHeader } from "@/components/site/SiteHeader";
import { MarqueeTicker } from "@/components/site/MarqueeTicker";
import { supabase } from "@/integrations/supabase/client";

const INTRO_DISMISSED_KEY = "epic-trader-intro-dismissed";

export function SiteLayout() {
  const location = useLocation();
  const isThemePreviewRoute = ["/contact", "/legal", "/forecast"].includes(location.pathname);
  const [showIntro, setShowIntro] = React.useState(
    () => window.sessionStorage.getItem(INTRO_DISMISSED_KEY) !== "true",
  );

  const handleCloseIntro = () => {
    window.sessionStorage.setItem(INTRO_DISMISSED_KEY, "true");
    setShowIntro(false);
  };

  React.useEffect(() => {
    const recordPageView = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return;
      }

      const region =
        typeof session.user.user_metadata.country === "string"
          ? session.user.user_metadata.country
          : "Unknown";

      await supabase.from("user_activity_events").insert({
        user_id: session.user.id,
        page: location.pathname,
        region,
      });
    };

    void recordPageView();
  }, [location.pathname]);

  React.useEffect(() => {
    const root = document.documentElement;

    if (isThemePreviewRoute) {
      root.dataset.theme = "refined-dark-preview";
    } else {
      delete root.dataset.theme;
    }

    return () => {
      delete root.dataset.theme;
    };
  }, [isThemePreviewRoute]);

  return (
    <div className={`min-h-screen bg-background text-foreground${isThemePreviewRoute ? " refined-dark-preview" : ""}`}>
      <IntroModal isOpen={showIntro} onClose={handleCloseIntro} />
      <SiteHeader />

      <main className="pb-14">
        <Outlet />
      </main>

      <footer className="site-footer border-t">
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
