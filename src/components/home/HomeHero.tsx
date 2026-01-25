import { ArrowRight } from "lucide-react";
import heroCover from "@/assets/forex-hero-cover.jpg";

import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <header className="relative overflow-hidden border-b">
      {/* Background image */}
      <div className="pointer-events-none absolute inset-0">
        <img
          src={heroCover}
          alt="Forex trader analyzing charts on multiple monitors"
          className="h-full w-full object-cover object-center opacity-60"
          loading="eager"
        />
        <div className="absolute inset-0 bg-background/50" />
        {/* Indigo gradient wash driven by design tokens */}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background" />
      </div>

      <div className="container relative py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary shadow-[0_0_0_6px_hsl(var(--primary)/0.15)]" />
              Process-first trading education
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Epic Trader — Learn to Trade with Structure, Discipline &amp; Risk Management
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
              Daily forecasts, economic calendar awareness, and bootcamps designed for real-world consistency.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href="/bootcamp">
                  Join Bootcamp <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="secondary">
                <a href="/resources">View Daily Forecast</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/contact">Book a Call</a>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl border bg-card/60 p-5 backdrop-blur">
              <p className="text-sm font-medium">Markets we cover</p>
              <p className="mt-1 text-sm text-muted-foreground">Broad coverage, one consistent framework.</p>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {["Forex", "Crypto", "Stocks", "Indices", "Commodities", "Macro"].map((m) => (
                  <div
                    key={m}
                    className="group rounded-lg border bg-background/30 px-3 py-2 text-sm text-muted-foreground backdrop-blur transition-colors hover:bg-background/45"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70 transition-transform group-hover:scale-125" />
                      {m}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
