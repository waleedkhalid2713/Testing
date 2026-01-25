import * as React from "react";
import { ArrowRight } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { FeatureKey } from "@/components/home/features";

type FeatureCardGridItem = {
  k: FeatureKey;
  title: string;
  description: string;
  icon: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
};

export function FeatureCardGrid({
  items,
  onSelect,
}: {
  items: FeatureCardGridItem[];
  onSelect: (k: FeatureKey) => void;
}) {
  return (
    <section className="container py-12">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">What you’ll build</h2>
          <p className="mt-2 text-muted-foreground">Click a module to see what it includes.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <button
            key={it.k}
            type="button"
            onClick={() => onSelect(it.k)}
            className="text-left"
          >
            <Card className="group overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background" />
                <img
                  src={it.imageSrc}
                  alt={it.imageAlt}
                  loading="lazy"
                  className="h-36 w-full object-cover opacity-80 transition duration-300 group-hover:opacity-100 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-hero)" }} />
              </div>

              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border bg-card/60 backdrop-blur transition-transform duration-300 group-hover:rotate-2 group-hover:scale-105">
                      <span className="absolute -inset-6 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.25), transparent 60%)" }} />
                      <span className="relative">{it.icon}</span>
                    </span>
                    <CardTitle className="text-lg">{it.title}</CardTitle>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                </div>
                <CardDescription>{it.description}</CardDescription>
              </CardHeader>
            </Card>
          </button>
        ))}
      </div>
    </section>
  );
}
