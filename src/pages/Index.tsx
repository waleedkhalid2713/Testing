import { useMemo, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeHero } from "@/components/home/HomeHero";
import { FeatureCardGrid } from "@/components/home/FeatureCardGrid";
import { FeatureDetailsDialog } from "@/components/home/FeatureDetailsDialog";
import { featureDetails, type FeatureKey } from "@/components/home/features";

const Index = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<FeatureKey>("forecast");

  const gridItems = useMemo(
    () =>
      (Object.keys(featureDetails) as FeatureKey[]).map((k) => {
        const d = featureDetails[k];
        const Icon = d.icon;
        return {
          k,
          title: d.title,
          description:
            k === "forecast"
              ? "Bias, key levels, invalidation, risk notes."
              : k === "calendar"
                ? "Impact filters + preparation notes."
                : k === "bootcamp"
                  ? "Cohort-based training for consistency."
                  : k === "risk"
                    ? "Rules to protect downside first."
                    : "Templates + education library.",
          icon: <Icon className="h-4 w-4" />,
        };
      }),
    [],
  );

  return (
    <div>
      <HomeHero />

      <FeatureCardGrid
        items={gridItems}
        onSelect={(k) => {
          setActive(k);
          setOpen(true);
        }}
      />

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

      <FeatureDetailsDialog open={open} onOpenChange={setOpen} active={active} />
    </div>
  );
};

export default Index;
