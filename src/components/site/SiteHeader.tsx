import * as React from "react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import brandLogo from "@/assets/epic-trader-logo.png";

const linkBase =
  "text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground";
const linkActive = "text-foreground";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        {/* Left: Brand */}
        <div className="flex shrink-0 items-center">
          <NavLink
            to="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-wide"
            aria-label="Epic Trader Home"
          >
            <img src={brandLogo} alt="Epic Trader" className="h-7 w-7" />
            <span>Epic Trader</span>
          </NavLink>
        </div>

        {/* Center: Navigation */}
        <nav className="ml-6 hidden items-center gap-6 md:flex" aria-label="Primary">
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
          <Button asChild size="sm" className="rounded-full px-5">
            <a href="/bootcamp">Join Bootcamp</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
