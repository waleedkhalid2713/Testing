import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { PageHero } from "@/components/site/PageHero";
import heroImage from "@/assets/forex-hero-clean.jpg";

const About = () => {
  return (
    <div>
      <PageHero
        title="About"
        subtitle="Epic Trader teaches discipline and risk management—process-based, not profit-based."
        imageSrc={heroImage}
        imageAlt="Trader analyzing charts in a professional workspace"
      />

      <div className="container py-12">
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Teaching philosophy</CardTitle>
              <CardDescription>Structure beats hype.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                The goal is consistency: define risk, plan the session, execute a rule set, then review with honesty.
              </p>
              <p>
                We focus on decisions you control (risk, entries, exits, preparation)—not outcomes you can’t.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How Epic Trader teaches</CardTitle>
              <CardDescription>A repeatable weekly routine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ul className="list-disc space-y-2 pl-5">
                <li>Pre-market preparation + calendar awareness</li>
                <li>Simple, consistent framework across markets</li>
                <li>Post-session review + journaling</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default About;
