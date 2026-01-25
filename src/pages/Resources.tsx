import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Resources = () => {
  return (
    <div className="container py-12">
      <header className="grid gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Resources</h1>
        <p className="max-w-2xl text-muted-foreground">
          Articles, templates, and educational material to build a repeatable process.
        </p>
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
  );
};

export default Resources;
