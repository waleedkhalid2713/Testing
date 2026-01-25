import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Legal = () => {
  return (
    <div className="container py-12">
      <header className="grid gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Legal</h1>
        <p className="max-w-2xl text-muted-foreground">
          Educational content only. Not financial advice.
        </p>
      </header>

      <section className="mt-10 grid gap-6">
        <Card>
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

        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
            <CardDescription>Placeholder.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Privacy policy content will be added in Phase 1.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terms of Use</CardTitle>
            <CardDescription>Placeholder.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Terms of use content will be added in Phase 1.
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Legal;
