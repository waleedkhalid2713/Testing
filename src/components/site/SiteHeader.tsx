import * as React from "react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import brandLogo from "@/assets/epic-trader-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import type { Session } from "@supabase/supabase-js";

const linkBase =
  "site-nav-link relative text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground md:text-base";
const linkActive = "site-nav-link-active text-foreground md:text-foreground";

const getGreetingName = (session: Session | null) => {
  const metadata = session?.user.user_metadata;
  const metadataName = [metadata?.full_name, metadata?.name, metadata?.first_name].find(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );

  return metadataName?.trim() || session?.user.email?.split("@")[0] || "Dear User";
};

export function SiteHeader() {
  const [isSignedIn, setIsSignedIn] = React.useState(false);
  const [greetingName, setGreetingName] = React.useState("Dear User");
  const { isAdmin } = useAdmin();

  React.useEffect(() => {
    // Keep legacy localStorage flags for now (non-admin user flow), but prefer backend auth when available.
    const sync = (session: Session | null) => {
      const isAdminFlag = window.localStorage.getItem("epic-trader-admin") === "true";
      const isUserFlag = window.localStorage.getItem("epic-trader-user") === "true";
      setIsSignedIn(Boolean(session) || isAdminFlag || isUserFlag);
      setGreetingName(getGreetingName(session));
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      sync(session);
    });

    supabase.auth.getSession().then(({ data }) => {
      sync(data.session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = () => {
    window.localStorage.removeItem("epic-trader-admin");
    window.localStorage.removeItem("epic-trader-user");
    supabase.auth.signOut();
    setIsSignedIn(false);
    setGreetingName("Dear User");
  };

  return (
    <header className="site-header sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-wrap items-center gap-4 py-3 md:h-16 md:flex-nowrap md:py-0">
        {/* Left: Brand */}
        <div className="flex shrink-0 items-center">
          <NavLink
            to="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-wide md:text-base"
            aria-label="Epic Trader Home"
          >
            <img src={brandLogo} alt="Epic Trader" className="h-7 w-7" />
            <span>Epic Trader</span>
          </NavLink>
        </div>

        {/* Primary: Navigation */}
        <nav
          className="order-3 flex w-full flex-wrap items-center gap-4 sm:gap-6 md:order-none md:ml-6 md:w-auto"
          aria-label="Primary"
        >
          <NavLink to="/bootcamp" className={linkBase} activeClassName={linkActive}>
            Bootcamp
          </NavLink>
          <NavLink to="/forecast" className={linkBase} activeClassName={linkActive}>
            Forecasts
          </NavLink>
          <NavLink to="/about" className={linkBase} activeClassName={linkActive}>
            About
          </NavLink>
          <NavLink to="/resources" className={linkBase} activeClassName={linkActive}>
            Resources
          </NavLink>
          <NavLink to="/contact" className={linkBase} activeClassName={linkActive}>
            Contact
          </NavLink>
          <NavLink to="/legal" className={linkBase} activeClassName={linkActive}>
            Legal
          </NavLink>
        </nav>

        {/* Right: CTA */}
        <div className="ml-auto flex items-center justify-end gap-2">
          <p className="hidden max-w-44 truncate text-sm font-medium text-muted-foreground lg:block">
            {isSignedIn ? `Welcome, ${greetingName}` : "Dear User"}
          </p>
          {isSignedIn ? (
            <>
              {isAdmin ? (
                <Button asChild size="sm" variant="secondary" className="rounded-full px-5">
                  <a href="/admin-dashboard">Admin Dashboard</a>
                </Button>
              ) : null}
              <Button size="sm" variant="outline" className="rounded-full px-5" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="outline" className="rounded-full px-5">
                <a href="/auth">Sign In</a>
              </Button>
            </>
          )}
          <Button asChild size="sm" className="rounded-full px-5">
            <a href="/bootcamp">Join Bootcamp</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
