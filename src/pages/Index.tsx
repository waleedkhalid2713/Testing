// Update this page (the content is just a fallback if you fail to update the page)

import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, GraduationCap, LineChart, Shield, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FeatureKey = "forecast" | "calendar" | "bootcamp" | "risk" | "resources";

const Index = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<FeatureKey>("forecast");

  const details = useMemo(
    () =>
      ({
        forecast: {
          title: "Daily Forecasts",
          description:
            "Structured market bias, key levels, and risk notes—designed for repeatable decision-making.",
          body:
            "Forecasts are educational and process-based: bias, levels, invalidation, and a clear risk-first mindset.",
        },
        calendar: {
          title: "Schedule News Forecast",
          description:
            "Economic calendar awareness with filters, impact tags, and preparation notes.",
          body:
            "Plan around volatility. Track upcoming events, see impact, and document how you’ll respond before price moves.",
        },
        bootcamp: {
          title: "Bootcamp Program",
          description:
            "Cohort-based training focused on structure, discipline, and risk management.",
          body:
            "A practical program with outcomes you can measure: better execution, fewer impulsive decisions, and consistent process.",
        },
        risk: {
          title: "Risk Management Framework",
          description:
            "Position sizing, invalidation logic, and rules that protect your downside.",
          body:
            "Risk is the product. You’ll learn to define risk first—then look for opportunity.",
        },
        resources: {
          title: "Resources",
          description:
            "Templates, guides, and educational materials for building a repeatable process.",
          body:
            "Downloadable tools (journals, checklists, plans) that help you think in systems—not signals.",
        },
      }) as const,
    [],
  );

  const FeatureCard = ({
    k,
    title,
    description,
    icon,
  }: {
    k: FeatureKey;
    title: string;
    description: string;
    icon: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={() => {
        setActive(k);
        setOpen(true);
      }}
      className="text-left"
    >
      <Card className="group overflow-hidden transition-transform hover:-translate-y-0.5">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          <img
            src="/placeholder.svg"
            alt={`${title} illustration`}
            loading="lazy"
            className="h-36 w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
          />
        </div>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card">
                {icon}
              </span>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </button>
  );

  return (
    <div>
      <header className="border-b">
        <div className="container py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
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
                  <a href="/bootcamp">Join Bootcamp</a>
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Markets we cover</CardTitle>
                  <CardDescription>Broad coverage, one consistent framework.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      "Forex",
                      "Crypto",
                      "Stocks",
                      "Indices",
                      "Commodities",
                      "Macro",
                    ].map((m) => (
                      <div
                        key={m}
                        className="rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground"
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </header>

      <section className="container py-12">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">What you’ll build</h2>
            <p className="mt-2 text-muted-foreground">Click a module to see what it includes.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            k="forecast"
            title="Daily Forecasts"
            description="Bias, key levels, invalidation, risk notes."
            icon={<LineChart className="h-4 w-4" />}
          />
          <FeatureCard
            k="calendar"
            title="Schedule News Forecast"
            description="Impact filters + preparation notes."
            icon={<CalendarDays className="h-4 w-4" />}
          />
          <FeatureCard
            k="bootcamp"
            title="Bootcamp Program"
            description="Cohort-based training for consistency."
            icon={<GraduationCap className="h-4 w-4" />}
          />
          <FeatureCard
            k="risk"
            title="Risk Management Framework"
            description="Rules to protect downside first."
            icon={<Shield className="h-4 w-4" />}
          />
          <FeatureCard
            k="resources"
            title="Resources"
            description="Templates + education library."
            icon={<Sparkles className="h-4 w-4" />}
          />
        </div>
      </section>

      <section className="border-t">
        <div className="container py-12">
          <Card>
            <CardHeader>
              <CardTitle>Risk disclaimer</CardTitle>
              <CardDescription>
                Educational content only. Not financial advice. Trading involves risk.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Past performance is not indicative of future results. You are responsible for your decisions and risk.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{details[active].title}</DialogTitle>
            <DialogDescription>{details[active].description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{details[active].body}</p>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <a href={active === "bootcamp" ? "/bootcamp" : "/resources"}>
                  Learn more
                </a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href="/contact">Book a Call</a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
