import { useMemo, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import heroImage from "@/assets/module-calendar.jpg";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Please add a short message"),
});

const Contact = () => {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const canSubmit = useMemo(
    () => values.name.trim() && values.email.trim() && values.message.trim(),
    [values],
  );

  return (
    <div>
      <PageHero
        title="Contact / Book a Call"
        subtitle="Send a message or book a call. We'll respond as soon as possible."
        imageSrc={heroImage}
        imageAlt="Global market news and growth concept"
      />

      <div className="container py-12">
        <section className="grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Message</CardTitle>
              <CardDescription>We’ll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm" htmlFor="name">
                  Name
                </label>
                <Input
                  id="name"
                  value={values.name}
                  onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                  placeholder="Your name"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  value={values.email}
                  onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                  placeholder="you@example.com"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm" htmlFor="message">
                  Message
                </label>
                <Textarea
                  id="message"
                  value={values.message}
                  onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                  placeholder="What would you like to work on?"
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {sent ? <p className="text-sm">Message sent (placeholder).</p> : null}
              <Button
                disabled={!canSubmit}
                onClick={() => {
                  setError(null);
                  const parsed = contactSchema.safeParse(values);
                  if (!parsed.success) {
                    setError(parsed.error.issues[0]?.message ?? "Please check your inputs");
                    return;
                  }
                  setSent(true);
                }}
              >
                Send
              </Button>
            </CardContent>
            </Card>
          </Reveal>

          <Reveal className="lg:col-span-5" delayMs={120}>
            <Card className="hover-glow">
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Embed a scheduling tool here (Calendly-like).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid place-items-center rounded-lg border bg-card/30 p-10 text-center">
                <p className="text-sm text-muted-foreground">Scheduling embed placeholder</p>
              </div>
            </CardContent>
            </Card>
          </Reveal>
        </section>
      </div>
    </div>
  );
};

export default Contact;
