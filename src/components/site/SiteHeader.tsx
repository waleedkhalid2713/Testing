import * as React from "react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/site/ThemeToggle";

const linkBase =
  "text-sm text-muted-foreground transition-colors hover:text-foreground";
const linkActive = "text-foreground";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <NavLink
            to="/"
            className="text-sm font-semibold tracking-wide"
            aria-label="Epic Trader Home"
          >
            Epic Trader
          </NavLink>
          <nav className="hidden items-center gap-5 md:flex" aria-label="Primary">
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
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <a href="/bootcamp">Join Bootcamp</a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
