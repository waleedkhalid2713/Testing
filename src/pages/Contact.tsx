import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpRight,
  Clock3,
  Headphones,
  Languages,
  LoaderCircle,
  Mail,
  MessageSquareText,
  CalendarDays,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import heroImage from "@/assets/module-calendar.jpg";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  "General Inquiry",
  "Technical Support",
  "Bootcamp",
  "Account Issue",
  "Forecasts",
  "Partnership",
  "Feedback",
  "Other",
] as const;

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(100, "Name must be 100 characters or less."),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  subject: z.string().trim().min(3, "Enter a subject.").max(150, "Subject must be 150 characters or less."),
  category: z.enum(categories, { required_error: "Select a support category." }),
  message: z.string().trim().min(10, "Please provide at least 10 characters.").max(5000, "Message is too long."),
});

type ContactValues = z.infer<typeof contactSchema>;

const supportDetails = [
  { icon: Mail, label: "Email", value: "epictrader.support@gmail.com", href: "mailto:epictrader.support@gmail.com" },
  { icon: Clock3, label: "Response Time", value: "Within 24 Hours" },
  { icon: CalendarDays, label: "Business Hours", value: "Monday–Saturday · 9:00 AM – 6:00 PM (PKT)" },
  { icon: Headphones, label: "Support Type", value: "Email Support" },
  { icon: Languages, label: "Primary Language", value: "English" },
];

const faqItems = [
  {
    question: "How do I receive forecasts?",
    answer: "Create an account, verify your email, accept the educational disclaimer, then open Daily Forecasts from the navigation.",
  },
  {
    question: "How do I verify my email?",
    answer: "During sign-up, choose Send verification code. Enter the code received at your email address to finish creating your account.",
  },
  {
    question: "How do I join Bootcamp?",
    answer: "Open the Bootcamp page from the navigation and use the Join Bootcamp option to review the available enrolment steps.",
  },
  {
    question: "How do I reset my password?",
    answer: "Open Sign In, enter your email address, and select Forgot password. We will email you a secure reset link.",
  },
  {
    question: "How do I contact support?",
    answer: "Use the support form above or email epictrader.support@gmail.com. We aim to respond within 24 hours.",
  },
];

const Contact = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
    mode: "onBlur",
  });

  const selectedCategory = watch("category");

  const submitMessage = async (values: ContactValues) => {
    const { error } = await supabase.from("contact_messages").insert({
      name: values.name,
      email: values.email,
      subject: values.subject,
      category: values.category,
      message: values.message,
    });

    if (error) {
      toast.error("We could not send your message. Please try again or email support directly.");
      return;
    }

    reset();
    toast.success("Thank you! We've received your message and will respond within 24 hours.");
  };

  return (
    <div>
      <PageHero
        title="Support Center"
        subtitle="Get focused help with your Epic Trader account, forecasts, and learning journey."
        imageSrc={heroImage}
        imageAlt="Global market news and growth concept"
      />

      <div className="container py-12">
        <section className="grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Card className="relative overflow-hidden border-border/80 bg-card/75 hover-glow">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 size-56 rounded-full bg-primary/15 blur-3xl"
              />
              <CardHeader className="relative">
                <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <MessageSquareText className="size-5" />
                </div>
                <CardTitle>Send a support message</CardTitle>
                <CardDescription>
                  Share the details and the right Epic Trader team member will review your request.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <form className="space-y-5" onSubmit={handleSubmit(submitMessage)} noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="contact-name" className="text-sm font-medium">
                        Full Name
                      </label>
                      <Input
                        id="contact-name"
                        autoComplete="name"
                        placeholder="Your full name"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? "contact-name-error" : undefined}
                        {...register("name")}
                      />
                      {errors.name ? (
                        <p id="contact-name-error" className="text-sm text-destructive">
                          {errors.name.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="contact-email" className="text-sm font-medium">
                        Email Address
                      </label>
                      <Input
                        id="contact-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "contact-email-error" : undefined}
                        {...register("email")}
                      />
                      {errors.email ? (
                        <p id="contact-email-error" className="text-sm text-destructive">
                          {errors.email.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="contact-subject" className="text-sm font-medium">
                        Subject
                      </label>
                      <Input
                        id="contact-subject"
                        placeholder="How can we help?"
                        aria-invalid={Boolean(errors.subject)}
                        aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                        {...register("subject")}
                      />
                      {errors.subject ? (
                        <p id="contact-subject-error" className="text-sm text-destructive">
                          {errors.subject.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="contact-category" className="text-sm font-medium">
                        Category
                      </label>
                      <input type="hidden" {...register("category")} />
                      <Select
                        value={selectedCategory}
                        onValueChange={(value) =>
                          setValue("category", value as ContactValues["category"], {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger
                          id="contact-category"
                          aria-invalid={Boolean(errors.category)}
                          aria-describedby={errors.category ? "contact-category-error" : undefined}
                        >
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category ? (
                        <p id="contact-category-error" className="text-sm text-destructive">
                          {errors.category.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="contact-message"
                      className="min-h-36 resize-y"
                      placeholder="Tell us what happened, what you expected, and any relevant details."
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? "contact-message-error" : undefined}
                      {...register("message")}
                    />
                    {errors.message ? (
                      <p id="contact-message-error" className="text-sm text-destructive">
                        {errors.message.message}
                      </p>
                    ) : null}
                  </div>

                  <Button type="submit" className="w-full rounded-full sm:w-auto" disabled={isSubmitting}>
                    {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <MessageSquareText className="size-4" />}
                    {isSubmitting ? "Sending message…" : "Send support message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal className="lg:col-span-5" delayMs={120}>
            <Card className="h-full border-border/80 bg-card/75 hover-glow">
              <CardHeader>
                <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-accent/30 text-primary">
                  <Headphones className="size-5" />
                </div>
                <CardTitle>Support information</CardTitle>
                <CardDescription>Clear response expectations before you send a message.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="space-y-3">
                  {supportDetails.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex gap-3 rounded-xl border border-border/70 bg-background/30 p-3">
                      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      <div className="min-w-0">
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
                        <dd className="mt-1 break-words text-sm font-medium">
                          {href ? (
                            <a href={href} className="transition-colors hover:text-primary hover:underline">
                              {value}
                            </a>
                          ) : (
                            value
                          )}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full rounded-full"
                  onClick={() => toast.info("Strategy call booking will be available soon.")}
                >
                  Book a Strategy Call
                  <ArrowUpRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          </Reveal>
        </section>

        <Reveal className="mt-10" delayMs={180}>
          <section aria-labelledby="contact-faq-title" className="mx-auto max-w-4xl">
            <div className="mb-5 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Help desk</p>
              <h2 id="contact-faq-title" className="mt-2 font-display text-3xl font-semibold tracking-tight">
                Frequently asked questions
              </h2>
              <p className="mt-2 text-muted-foreground">Quick answers for common Epic Trader support requests.</p>
            </div>

            <Card className="border-border/80 bg-card/75">
              <CardContent className="px-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map(({ question, answer }, index) => (
                    <AccordionItem key={question} value={`contact-faq-${index}`}>
                      <AccordionTrigger className="text-left hover:no-underline">{question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>
        </Reveal>
      </div>
    </div>
  );
};

export default Contact;
