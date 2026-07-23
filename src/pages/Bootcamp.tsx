import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Brain, Building2, CircleCheck, GitBranch, Handshake, LineChart, MessageCircle, ShieldCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/module-bootcamp.jpg";
import {
  DEFAULT_BOOTCAMP_CONTENT,
  formatUsd,
  getDiscountedPrice,
  normalizeBootcampContent,
  type BootcampContent,
  type BootcampPlan,
} from "@/lib/bootcampContent";
import { supabase } from "@/integrations/supabase/client";

const formatDate = (value: string) => {
  if (!value) {
    return "To be announced";
  }

  const date = new Date(value + "T00:00:00");
  return Number.isNaN(date.getTime())
    ? "To be announced"
    : new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
};

const getEnrollmentPath = (plan: BootcampPlan) => {
  const searchParams = new URLSearchParams({
    category: "Bootcamp",
    subject: "Bootcamp enrollment: " + plan.title + " (" + plan.coverage + ")",
    enrollmentPlan: plan.id,
    plan: plan.title + " — " + plan.coverage,
  });

  return "/contact?" + searchParams.toString();
};

const learningBenefits = [
  { label: "Structured ICT Curriculum", Icon: BookOpen },
  { label: "Step-by-Step Learning Roadmap", Icon: GitBranch },
  { label: "Institutional Trading Concepts", Icon: Building2 },
  { label: "Practical Market Analysis", Icon: LineChart },
  { label: "Professional Risk Management", Icon: ShieldCheck },
  { label: "Trading Psychology", Icon: Brain },
  { label: "Live Discord Learning", Icon: MessageCircle },
  { label: "Continuous Mentorship & Support", Icon: Handshake },
];

const planHighlights: Record<string, string> = {
  "one-to-one-advanced": "Best for personal growth",
  "one-to-one-implementation": "Complete transformation",
  "batch-learning": "Most affordable",
};

const Bootcamp = () => {
  const [content, setContent] = useState<BootcampContent>(DEFAULT_BOOTCAMP_CONTENT);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      const { data } = await supabase
        .from("bootcamp_content")
        .select("content")
        .eq("id", "default")
        .maybeSingle();

      if (isMounted && data?.content) {
        setContent(normalizeBootcampContent(data.content));
      }
    };

    void loadContent();

    const channel = supabase
      .channel("bootcamp-content")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bootcamp_content", filter: "id=eq.default" },
        (payload) => {
          const nextContent =
            payload.new && typeof payload.new === "object"
              ? (payload.new as { content?: unknown }).content
              : undefined;

          if (nextContent) {
            setContent(normalizeBootcampContent(nextContent));
          }
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, []);


  return (
    <div className="relative isolate overflow-hidden bg-[#0B0F19]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_84%_5%,rgba(6,182,212,0.12),transparent_25rem),radial-gradient(circle_at_8%_32%,rgba(124,58,237,0.10),transparent_30rem),radial-gradient(circle_at_86%_72%,rgba(124,58,237,0.08),transparent_28rem),linear-gradient(180deg,#0B0F19_0%,#0B111B_45%,#0B0F19_100%)]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[22rem] -z-10 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent"
      />
      <section className="relative overflow-hidden border-b border-border bg-background/35">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        <div className="container relative py-14 sm:py-16 lg:py-20">
          <div className="max-w-5xl">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {content.hero.heading}
            </h1>
            <p className="mt-5 max-w-5xl text-xl leading-relaxed text-muted-foreground sm:text-2xl lg:text-3xl">
              {content.hero.subtitle}
            </p>
            <p className="mt-6 max-w-4xl text-sm leading-7 text-muted-foreground sm:text-base">
              {content.hero.description}
            </p>
            <div className="mt-8 max-w-4xl border-l-2 border-primary pl-5">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                {content.hero.missionLabel}
              </p>
              <p className="mt-2 text-base leading-7 text-foreground sm:text-lg">
                {content.hero.missionStatement}
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="container relative space-y-12 py-10 sm:space-y-14 sm:py-12">
        <section aria-labelledby="roadmap-heading">
          <div className="mb-5 max-w-2xl">
            <h2 id="roadmap-heading" className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Program Roadmap
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              A progression from foundational ICT knowledge to structured implementation.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {content.roadmap.map((level) => (
              <Card key={level.id} className="flex h-full flex-col">
                <CardHeader className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    Level {level.levelNumber}
                  </p>
                  <CardTitle className="text-xl">{level.title}</CardTitle>
                  <CardDescription>{level.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <p className="text-sm leading-6 text-muted-foreground">{level.description}</p>
                  <ul className="mt-5 space-y-2 border-t border-border pt-4 text-sm text-foreground">
                    {level.modules.map((module) => (
                      <li key={module} className="leading-5">
                        {module}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="pricing-heading">
          <div className="mb-6 text-center">
            <h2 id="pricing-heading" className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Choose Your Learning Plan
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Select the path that aligns with your goals and learning preferences.
            </p>
          </div>
          <div className="grid items-stretch gap-5 lg:grid-cols-3">
            {content.plans.map((plan) => {
              const discountedPrice = getDiscountedPrice(plan.originalPrice, plan.discount);
              const hasDiscount = plan.discount.enabled;
              const highlight = planHighlights[plan.id];

              return (
                <Card key={plan.id} className="flex h-full flex-col border-border/80 bg-card/90">
                  <CardHeader className="space-y-3 p-5 pb-3">
                    {highlight ? (
                      <p className="w-fit rounded-md bg-primary/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        {highlight}
                      </p>
                    ) : null}
                    <div>
                      <CardTitle className="text-xl">{plan.title}</CardTitle>
                      <CardDescription className="mt-1">{plan.coverage}</CardDescription>
                    </div>
                    <p className="min-h-[72px] text-sm leading-6 text-muted-foreground">{plan.description}</p>
                    <div className="pt-1">
                      <p className="text-3xl font-semibold tracking-tight text-foreground">
                        {formatUsd(plan.originalPrice)}
                      </p>
                      {hasDiscount ? (
                        <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-primary/10 px-3 py-2">
                          <span className="text-sm text-muted-foreground line-through">
                            {formatUsd(plan.originalPrice)}
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            Now {formatUsd(discountedPrice)}
                          </span>
                          {plan.discount.title ? (
                            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              {plan.discount.title}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      {hasDiscount && plan.discount.expiresAt ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Offer ends {formatDate(plan.discount.expiresAt)}
                        </p>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col space-y-5 p-5 pt-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Why Choose This Plan?</h3>
                      <ul className="mt-3 space-y-2 text-sm leading-5 text-muted-foreground">
                        {plan.whyChoose.map((item) => (
                          <li key={item} className="flex gap-2">
                            <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">What&apos;s Included</h3>
                      <ul className="mt-3 space-y-2 text-sm leading-5 text-muted-foreground">
                        {plan.included.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {plan.showBatchInformation ? (
                      <div className="space-y-3 rounded-md border border-border bg-background/30 p-3 text-sm">
                        <h3 className="font-semibold text-foreground">Batch Information</h3>
                        <dl className="space-y-2 text-muted-foreground">
                          <div className="flex justify-between gap-4">
                            <dt>Enrollment Opening</dt>
                            <dd className="text-right text-foreground">{formatDate(content.batch.openingDate)}</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt>Enrollment Deadline</dt>
                            <dd className="text-right text-foreground">{formatDate(content.batch.deadlineDate)}</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt>Batch Start Date</dt>
                            <dd className="text-right text-foreground">{formatDate(content.batch.startDate)}</dd>
                          </div>
                        </dl>
                        <p className="leading-5 text-muted-foreground">{content.batch.discordNote}</p>
                      </div>
                    ) : null}
                    <div className="mt-auto pt-1">
                      {plan.enrollmentOpen ? (
                        <Button className="w-full" asChild>
                          <Link to={getEnrollmentPath(plan)}>{plan.buttonText}</Link>
                        </Button>
                      ) : (
                        <>
                          <Button className="w-full" disabled>
                            {plan.buttonText}
                          </Button>
                          <p className="mt-2 text-center text-xs leading-5 text-muted-foreground">
                            {plan.closedText}
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="why-heading">
          <div className="mb-5 text-center">
            <h2 id="why-heading" className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Why Learn with Epic Trader?
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {learningBenefits.map(({ label, Icon }) => (
              <Card key={label} className="h-full border-0 bg-[#151E2E]/90 bg-[image:none] shadow-none">
                <CardContent className="flex min-h-24 flex-col items-center justify-center gap-2 p-2 text-center">
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                  <p className="text-xs font-medium leading-4 text-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-10">
            <section aria-labelledby="outcomes-heading">
              <h2 id="outcomes-heading" className="font-display text-2xl font-semibold text-foreground">
                What You Will Learn to Do
              </h2>
              <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {[
                  "Understand institutional market structure",
                  "Identify liquidity and high-probability opportunities",
                  "Read algorithmic price delivery",
                  "Develop your own trading framework",
                  "Execute trades with discipline and consistency",
                  "Manage risk like a professional",
                  "Improve emotional control",
                  "Review and improve trading performance",
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-5 text-muted-foreground">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="font-display text-2xl font-semibold text-foreground">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="mt-4 space-y-2">
                <AccordionItem value="experience" className="rounded-md border border-border bg-card px-3">
                  <AccordionTrigger className="py-2 text-sm">Do I need previous trading experience?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    No. The program starts with foundational concepts and progresses through structured implementation.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="classes" className="rounded-md border border-border bg-card px-3">
                  <AccordionTrigger className="py-2 text-sm">Where are live classes conducted?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    Live sessions are conducted through the official Epic Trader Discord server.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="recordings" className="rounded-md border border-border bg-card px-3">
                  <AccordionTrigger className="py-2 text-sm">Will recordings be available?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    Batch Learning Program members receive access to session recordings as included in their plan.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="batch" className="rounded-md border border-border bg-card px-3">
                  <AccordionTrigger className="py-2 text-sm">When does the next batch begin?</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    The latest enrollment and batch dates are shown in the Batch Learning Program information above.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card px-5 py-8 text-center shadow-card sm:px-8">
          <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">{content.finalCta.heading}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {content.finalCta.text}
          </p>
        </section>
      </main>
    </div>
  );
};

export default Bootcamp;