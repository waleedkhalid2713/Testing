import { ArrowRight } from "lucide-react";
import heroCover from "@/assets/forex-hero-cover.jpg";

import { Button } from "@/components/ui/button";
import moduleForecast from "@/assets/module-forecast-daily.jpg";
import moduleCalendar from "@/assets/module-calendar.jpg";
import moduleRisk from "@/assets/module-risk.jpg";

export function HomeHero() {
  return (
    <header className="relative overflow-hidden border-b">
      {/* Background image */}
      <div className="pointer-events-none absolute inset-0">
        <img
          src={heroCover}
          alt="Forex trader analyzing charts on multiple monitors"
          className="h-full w-full object-cover object-center opacity-55"
          loading="eager"
        />
        <div className="absolute inset-0 bg-background/55" />
        <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background" />
      </div>

      <div className="container relative py-16 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="inline-flex h-2 w-2 rounded-full bg-primary shadow-[0_0_0_6px_hsl(var(--primary)/0.15)]" />
            Process-first trading education
          </p>

          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Create your{" "}
            <span className="bg-gradient-to-r from-primary to-ring bg-clip-text text-transparent">Trading Edge</span>
            <br />
            with Epic Trader
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Daily forecasts, economic calendar awareness, and bootcamps designed for real-world consistency.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-full px-6">
              <a href="/bootcamp">
                Join Bootcamp <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="secondary" className="rounded-full px-6">
              <a href="/resources">View Daily Forecast</a>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6">
              <a href="/contact">Book a Call</a>
            </Button>
          </div>
        </div>

        {/* “Mockup” strip (Cyberbank-style) */}
        <div className="mx-auto mt-12 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border bg-card/60 backdrop-blur hover-glow">
            <div className="flex items-center justify-between border-b bg-background/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary/70" />
                <span className="h-2 w-2 rounded-full bg-ring/70" />
                <span className="h-2 w-2 rounded-full bg-muted" />
              </div>
              <p className="text-xs text-muted-foreground">Epic Trader Dashboard Preview</p>
              <div className="hidden sm:block" />
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-12 md:items-center">
              <div className="md:col-span-5">
                <p className="text-sm font-medium">A repeatable weekly routine</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Build bias, plan events, define invalidation, and protect downside first.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {["Forecast", "Calendar", "Risk"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full border bg-background/30 px-3 py-1 text-xs text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-7">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[{
                    src: moduleForecast,
                    alt: "Abstract candlestick waves and grid representing daily market forecasts",
                    label: "Daily Forecast",
                  },
                  {
                    src: moduleCalendar,
                    alt: "Abstract calendar blocks and chart line representing economic calendar planning",
                    label: "Calendar Prep",
                  },
                  {
                    src: moduleRisk,
                    alt: "Abstract shield outline representing risk management framework",
                    label: "Risk Rules",
                  }].map((c) => (
                    <div key={c.label} className="overflow-hidden rounded-xl border bg-background/20">
                      <img src={c.src} alt={c.alt} className="h-28 w-full object-cover" loading="lazy" />
                      <div className="px-3 py-2">
                        <p className="text-xs font-medium">{c.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
