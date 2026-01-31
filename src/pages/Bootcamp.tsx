import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import heroImage from "@/assets/module-bootcamp.jpg";

const Bootcamp = () => {
  return (
    <div>
      <PageHero
        title="Student Bootcamp"
        subtitle="A cohort-based program built around preparation, disciplined execution, and risk-first decision making."
        imageSrc={heroImage}
        imageAlt="Trading mentor reviewing charts in a modern office"
      />

      <div className="container py-12">
        <section className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <Reveal>
              <Card className="hover-glow">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>What the program is designed to change.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  You’ll learn a repeatable process: preparation, execution, review, and risk control—across Forex, Crypto,
                  Stocks, Indices, and Commodities.
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Risk-first decision making</li>
                  <li>Key levels + invalidation logic</li>
                  <li>Review routines to reduce impulsive trading</li>
                </ul>
              </CardContent>
              </Card>
            </Reveal>

            <Reveal delayMs={120}>
              <Card className="hover-glow">
              <CardHeader>
                <CardTitle>Curriculum modules</CardTitle>
                <CardDescription>Sample structure (editable in admin later).</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                {[
                  "Market structure & bias",
                  "News & volatility planning",
                  "Entries, exits, invalidation",
                  "Position sizing & risk caps",
                  "Journaling & review",
                  "Rules-based execution",
                ].map((m) => (
                  <div key={m} className="rounded-md border bg-card/40 px-3 py-2">
                    {m}
                  </div>
                ))}
              </CardContent>
              </Card>
            </Reveal>
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <Reveal delayMs={200}>
              <Card className="hover-glow">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>Enrollment</CardTitle>
                  <Badge variant="secondary">Limited-time</Badge>
                </div>
                <CardDescription>Minimal discount UI (no strikethrough).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border bg-card/40 p-4">
                  <p className="text-sm text-muted-foreground">Current price</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight">$499</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button className="flex-1">Enroll now</Button>
                  <Button className="flex-1" variant="outline" asChild>
                    <a href="/contact">Apply / Book a Call</a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Educational content only. Not financial advice. Trading involves risk.
                </p>
              </CardContent>
              </Card>
            </Reveal>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default Bootcamp;
