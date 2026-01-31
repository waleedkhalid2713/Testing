import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import heroImage from "@/assets/module-risk.jpg";

const Legal = () => {
  return (
    <div>
      <PageHero
        title="Legal"
        subtitle="Educational content only. Not financial advice. Trading involves risk."
        imageSrc={heroImage}
        imageAlt="Risk planning checklist on a trading desk"
      />

      <div className="container py-12">
        <section className="grid gap-6">
          <Reveal>
            <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Disclaimer</CardTitle>
              <CardDescription>Trading involves risk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                All content is provided for educational purposes only and does not constitute financial advice.
              </p>
              <p>
                Past performance is not indicative of future results. You are responsible for your own trading decisions.
              </p>
            </CardContent>
            </Card>
          </Reveal>

          <Reveal delayMs={120}>
            <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
              <CardDescription>Placeholder.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Privacy policy content will be added in Phase 1.</CardContent>
            </Card>
          </Reveal>

          <Reveal delayMs={200}>
            <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Terms of Use</CardTitle>
              <CardDescription>Placeholder.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Terms of use content will be added in Phase 1.</CardContent>
            </Card>
          </Reveal>
        </section>
      </div>
    </div>
  );
};

export default Legal;
