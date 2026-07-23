import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_BOOTCAMP_CONTENT,
  formatUsd,
  getDiscountedPrice,
  linesToText,
  normalizeBootcampContent,
  textToLines,
  type BootcampBatch,
  type BootcampContent,
  type BootcampHero,
  type BootcampPlan,
  type BootcampRoadmapLevel,
} from "@/lib/bootcampContent";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

const updateItem = <T,>(items: T[], index: number, nextItem: T) =>
  items.map((item, itemIndex) => (itemIndex === index ? nextItem : item));

export function BootcampManagement() {
  const [content, setContent] = useState<BootcampContent>(DEFAULT_BOOTCAMP_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadContent = async () => {
      const { data, error: loadError } = await supabase
        .from("bootcamp_content")
        .select("content")
        .eq("id", "default")
        .maybeSingle();

      if (loadError) {
        setError("Bootcamp management needs its database migration before it can save.");
      } else {
        setContent(normalizeBootcampContent(data?.content));
      }

      setLoading(false);
    };

    void loadContent();
  }, []);

  const updateHero = (patch: Partial<BootcampHero>) =>
    setContent((current) => ({ ...current, hero: { ...current.hero, ...patch } }));

  const updateRoadmap = (index: number, patch: Partial<BootcampRoadmapLevel>) =>
    setContent((current) => ({
      ...current,
      roadmap: updateItem(current.roadmap, index, { ...current.roadmap[index], ...patch }),
    }));

  const updatePlan = (index: number, patch: Partial<BootcampPlan>) =>
    setContent((current) => ({
      ...current,
      plans: updateItem(current.plans, index, { ...current.plans[index], ...patch }),
    }));

  const updateBatch = (patch: Partial<BootcampBatch>) =>
    setContent((current) => ({ ...current, batch: { ...current.batch, ...patch } }));

  const saveContent = async () => {
    const normalized = normalizeBootcampContent(content);
    const hasInvalidDiscount = normalized.plans.some(
      (plan) => !Number.isFinite(plan.discount.percentage) || plan.discount.percentage < 0 || plan.discount.percentage > 100,
    );

    if (hasInvalidDiscount) {
      setError("Every discount percentage must be between 0 and 100.");
      return;
    }

    setSaving(true);
    setError("");

    const { error: saveError } = await supabase
      .from("bootcamp_content")
      .upsert({ id: "default", content: normalized as unknown as Json }, { onConflict: "id" });

    if (saveError) {
      setError(saveError.message);
      toast.error("Bootcamp content could not be saved.");
    } else {
      setContent(normalized);
      toast.success("Bootcamp content saved. The public page updates automatically.");
    }

    setSaving(false);
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading Bootcamp Management…</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bootcamp Management</CardTitle>
        <CardDescription>Manage public Bootcamp content, roadmap levels, pricing, discounts, and batch availability.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <section className="space-y-4 rounded-xl border p-4">
          <div>
            <h3 className="text-base font-semibold">Hero and Mission</h3>
            <p className="mt-1 text-sm text-muted-foreground">These values appear at the top of the public Bootcamp page.</p>
          </div>
          <label className="block space-y-2 text-sm font-medium">
            Heading
            <Input value={content.hero.heading} onChange={(event) => updateHero({ heading: event.target.value })} />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Subtitle
            <Textarea value={content.hero.subtitle} onChange={(event) => updateHero({ subtitle: event.target.value })} />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Description
            <Textarea value={content.hero.description} onChange={(event) => updateHero({ description: event.target.value })} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium">
              Mission Label
              <Input value={content.hero.missionLabel} onChange={(event) => updateHero({ missionLabel: event.target.value })} />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              Mission Statement
              <Textarea value={content.hero.missionStatement} onChange={(event) => updateHero({ missionStatement: event.target.value })} />
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border p-4">
          <div>
            <h3 className="text-base font-semibold">Program Roadmap</h3>
            <p className="mt-1 text-sm text-muted-foreground">Enter one module per line. Levels stay in their public learning order.</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {content.roadmap.map((level, index) => (
              <div key={level.id} className="space-y-3 rounded-lg border bg-background/40 p-4">
                <div className="grid grid-cols-[88px_1fr] gap-3">
                  <label className="space-y-2 text-sm font-medium">
                    Level Number
                    <Input value={level.levelNumber} onChange={(event) => updateRoadmap(index, { levelNumber: event.target.value })} />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    Title
                    <Input value={level.title} onChange={(event) => updateRoadmap(index, { title: event.target.value })} />
                  </label>
                </div>
                <label className="block space-y-2 text-sm font-medium">
                  Subtitle
                  <Input value={level.subtitle} onChange={(event) => updateRoadmap(index, { subtitle: event.target.value })} />
                </label>
                <label className="block space-y-2 text-sm font-medium">
                  Description
                  <Textarea value={level.description} onChange={(event) => updateRoadmap(index, { description: event.target.value })} />
                </label>
                <label className="block space-y-2 text-sm font-medium">
                  Modules
                  <Textarea
                    value={linesToText(level.modules)}
                    onChange={(event) => updateRoadmap(index, { modules: textToLines(event.target.value) })}
                  />
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-xl border p-4">
          <div>
            <h3 className="text-base font-semibold">Learning Plans and Discounts</h3>
            <p className="mt-1 text-sm text-muted-foreground">Discounted prices are calculated automatically. Enter list items one per line.</p>
          </div>
          {content.plans.map((plan, index) => {
            const discountedPrice = getDiscountedPrice(plan.originalPrice, plan.discount);

            return (
              <div key={plan.id} className="space-y-4 rounded-lg border bg-background/40 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium">
                    Plan Name
                    <Input value={plan.title} onChange={(event) => updatePlan(index, { title: event.target.value })} />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    Covered Levels
                    <Input value={plan.coverage} onChange={(event) => updatePlan(index, { coverage: event.target.value })} />
                  </label>
                </div>
                <label className="block space-y-2 text-sm font-medium">
                  Description
                  <Textarea value={plan.description} onChange={(event) => updatePlan(index, { description: event.target.value })} />
                </label>
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="space-y-2 text-sm font-medium">
                    Original Price (USD)
                    <Input
                      type="number"
                      min="0"
                      value={plan.originalPrice}
                      onChange={(event) => updatePlan(index, { originalPrice: Math.max(0, Number(event.target.value) || 0) })}
                    />
                  </label>
                  <label className="flex items-end justify-between gap-3 rounded-md border px-3 py-2 text-sm font-medium">
                    Discount Enabled
                    <Switch
                      checked={plan.discount.enabled}
                      onCheckedChange={(enabled) =>
                        updatePlan(index, { discount: { ...plan.discount, enabled } })
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    Discount Percentage
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={plan.discount.percentage}
                      disabled={!plan.discount.enabled}
                      onChange={(event) =>
                        updatePlan(index, {
                          discount: {
                            ...plan.discount,
                            percentage: Math.min(100, Math.max(0, Number(event.target.value) || 0)),
                          },
                        })
                      }
                    />
                  </label>
                </div>
                {plan.discount.enabled ? (
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="space-y-2 text-sm font-medium">
                      Promotion Title
                      <Input
                        value={plan.discount.title}
                        onChange={(event) =>
                          updatePlan(index, { discount: { ...plan.discount, title: event.target.value } })
                        }
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium">
                      Promotion Expiry
                      <Input
                        type="date"
                        value={plan.discount.expiresAt}
                        onChange={(event) =>
                          updatePlan(index, { discount: { ...plan.discount, expiresAt: event.target.value } })
                        }
                      />
                    </label>
                    <div className="rounded-md border px-3 py-2 text-sm">
                      <p className="text-muted-foreground">Calculated Discounted Price</p>
                      <p className="mt-1 font-semibold">{formatUsd(discountedPrice)}</p>
                    </div>
                  </div>
                ) : null}
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block space-y-2 text-sm font-medium">
                    Why Choose This Plan
                    <Textarea
                      value={linesToText(plan.whyChoose)}
                      onChange={(event) => updatePlan(index, { whyChoose: textToLines(event.target.value) })}
                    />
                  </label>
                  <label className="block space-y-2 text-sm font-medium">
                    What's Included
                    <Textarea
                      value={linesToText(plan.included)}
                      onChange={(event) => updatePlan(index, { included: textToLines(event.target.value) })}
                    />
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="space-y-2 text-sm font-medium">
                    Button Text
                    <Input value={plan.buttonText} onChange={(event) => updatePlan(index, { buttonText: event.target.value })} />
                  </label>
                  <label className="flex items-end justify-between gap-3 rounded-md border px-3 py-2 text-sm font-medium">
                    Enrollment Open
                    <Switch
                      checked={plan.enrollmentOpen}
                      onCheckedChange={(enrollmentOpen) => updatePlan(index, { enrollmentOpen })}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    Closed Enrollment Text
                    <Input value={plan.closedText} onChange={(event) => updatePlan(index, { closedText: event.target.value })} />
                  </label>
                </div>
              </div>
            );
          })}
        </section>

        <section className="space-y-4 rounded-xl border p-4">
          <div>
            <h3 className="text-base font-semibold">Batch Learning Information</h3>
            <p className="mt-1 text-sm text-muted-foreground">Shown only on the Batch Learning Program.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="space-y-2 text-sm font-medium">
              Enrollment Opening
              <Input type="date" value={content.batch.openingDate} onChange={(event) => updateBatch({ openingDate: event.target.value })} />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Enrollment Deadline
              <Input type="date" value={content.batch.deadlineDate} onChange={(event) => updateBatch({ deadlineDate: event.target.value })} />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Batch Start Date
              <Input type="date" value={content.batch.startDate} onChange={(event) => updateBatch({ startDate: event.target.value })} />
            </label>
          </div>
          <label className="block space-y-2 text-sm font-medium">
            Discord Note
            <Textarea value={content.batch.discordNote} onChange={(event) => updateBatch({ discordNote: event.target.value })} />
          </label>
        </section>

        <section className="space-y-4 rounded-xl border p-4">
          <div>
            <h3 className="text-base font-semibold">Final CTA</h3>
            <p className="mt-1 text-sm text-muted-foreground">This is the single public call to action beneath the FAQ.</p>
          </div>
          <label className="block space-y-2 text-sm font-medium">
            Heading
            <Input
              value={content.finalCta.heading}
              onChange={(event) => setContent((current) => ({ ...current, finalCta: { ...current.finalCta, heading: event.target.value } }))}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Text
            <Textarea
              value={content.finalCta.text}
              onChange={(event) => setContent((current) => ({ ...current, finalCta: { ...current.finalCta, text: event.target.value } }))}
            />
          </label>
          <label className="block max-w-sm space-y-2 text-sm font-medium">
            Button Text
            <Input
              value={content.finalCta.buttonText}
              onChange={(event) => setContent((current) => ({ ...current, finalCta: { ...current.finalCta, buttonText: event.target.value } }))}
            />
          </label>
        </section>

        <Button type="button" disabled={saving} onClick={() => void saveContent()}>
          {saving ? "Saving Bootcamp…" : "Save Bootcamp Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
