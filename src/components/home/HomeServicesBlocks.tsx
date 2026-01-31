import { BarChart3, GraduationCap, ShieldCheck, Telescope } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/site/Reveal";

const items = [
  {
    title: "Daily Forecast",
    desc: "Bias, key levels, invalidation, and risk notes—built for execution.",
    icon: Telescope,
  },
  {
    title: "Economic Calendar Prep",
    desc: "Plan volatility windows and reduce surprise risk.",
    icon: BarChart3,
  },
  {
    title: "Risk Framework",
    desc: "Protect downside first with clear rules and sizing logic.",
    icon: ShieldCheck,
  },
  {
    title: "Bootcamp Mentorship",
    desc: "Cohort training that turns a process into a habit.",
    icon: GraduationCap,
  },
];

export function HomeServicesBlocks() {
  return (
    <section className="border-b">
      <div className="container py-14">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium tracking-wide text-muted-foreground">What you get</p>
            <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              A complete process—not a signal feed
            </h2>
            <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
              Built for discipline: preparation, execution, review, and risk control.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map((it, idx) => {
            const Icon = it.icon;
            return (
              <Reveal key={it.title} delayMs={80 + idx * 70}>
                <Card className="h-full hover-glow">
                  <CardHeader>
                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-background/30">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <CardTitle className="text-lg">{it.title}</CardTitle>
                    <CardDescription>{it.desc}</CardDescription>
                  </CardHeader>
                  <CardContent />
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
