import * as React from "react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import brandLogo from "@/assets/epic-trader-logo.png";
import { supabase } from "@/integrations/supabase/client";

const linkBase =
  "text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground md:text-base";
const linkActive = "text-foreground md:text-foreground";

export function SiteHeader() {
  const [isSignedIn, setIsSignedIn] = React.useState(false);

  React.useEffect(() => {
    // Keep legacy localStorage flags for now (non-admin user flow), but prefer backend auth when available.
    const sync = (hasSession: boolean) => {
      const isAdminFlag = window.localStorage.getItem("epic-trader-admin") === "true";
      const isUserFlag = window.localStorage.getItem("epic-trader-user") === "true";
      setIsSignedIn(hasSession || isAdminFlag || isUserFlag);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      sync(Boolean(session));
    });

    supabase.auth.getSession().then(({ data }) => {
      sync(Boolean(data.session));
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = () => {
    window.localStorage.removeItem("epic-trader-admin");
    window.localStorage.removeItem("epic-trader-user");
    supabase.auth.signOut();
    setIsSignedIn(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          {isSignedIn ? (
            <Button size="sm" variant="outline" className="rounded-full px-5" onClick={handleSignOut}>
              Sign Out
            </Button>
          ) : (
            <>
              <Button asChild size="sm" variant="secondary" className="rounded-full px-5">
                <a href="/auth?mode=signup">Sign Up</a>
              </Button>
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
