import { Quote } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const brands = ["Forex", "Crypto", "Stocks", "Indices", "Commodities", "Macro"];

const testimonials = [
  {
    title: "More disciplined execution",
    desc: "The framework forced me to define invalidation and sizing before entries. Less noise, more structure.",
    name: "Student, Cohort 1",
  },
  {
    title: "Planning reduced mistakes",
    desc: "Calendar prep helped me avoid the worst volatility windows and trade fewer, higher-quality setups.",
    name: "Student, Cohort 2",
  },
];

export function HomeSocialProof() {
  return (
    <section className="border-b">
      <div className="container py-14">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium tracking-wide text-muted-foreground">Trusted process</p>
            <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Built across real markets
            </h2>
            <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
              One repeatable routine across multiple instruments—no hype, just decision quality.
            </p>
          </div>
        </Reveal>

        <Reveal delayMs={120}>
          <div className="mt-10 rounded-2xl border bg-card/50 px-6 py-6 backdrop-blur">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {brands.map((b) => (
                <span
                  key={b}
                  className="rounded-full border bg-background/30 px-4 py-2 text-xs text-muted-foreground"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {testimonials.map((t, idx) => (
            <Reveal key={t.title} delayMs={160 + idx * 80}>
              <Card className="h-full hover-glow">
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-background/30">
                    <Quote className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{t.title}</CardTitle>
                  <CardDescription>{t.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
