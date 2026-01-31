import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { PageHero } from "@/components/site/PageHero";
import heroImage from "@/assets/module-resources.jpg";

const Resources = () => {
  return (
    <div>
      <PageHero
        title="Resources"
        subtitle="Templates, checklists, and educational material to build a repeatable process."
        imageSrc={heroImage}
        imageAlt="Trading resources and templates on a tidy desk"
      />

      <div className="container py-12">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Trading Journal Template", desc: "Track decisions, not feelings." },
            { title: "Risk Plan Checklist", desc: "Define risk before opportunity." },
            { title: "Weekly Review Framework", desc: "Iterate your rules with evidence." },
          ].map((r) => (
            <Card key={r.title} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">{r.title}</CardTitle>
                <CardDescription>{r.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" size="sm">
                  Coming soon
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Resources;
