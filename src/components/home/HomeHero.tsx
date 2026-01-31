import * as React from "react";

import heroCover from "@/assets/forex-hero-cover.jpg";
import heroClean from "@/assets/forex-hero-clean.jpg";
import heroClassic from "@/assets/forex-hero.jpg";

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

const slides = [
  {
    img: heroCover,
    alt: "Forex trader analyzing charts on multiple monitors",
  },
  {
    img: heroClean,
    alt: "Trader analyzing charts in a professional workspace",
  },
  {
    img: heroClassic,
    alt: "Forex chart analysis and market overview",
  },
];

export function HomeHero() {
  const [api, setApi] = React.useState<CarouselApi>();

  React.useEffect(() => {
    if (!api) return;
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => api.scrollNext(), 5500);
    return () => window.clearInterval(id);
  }, [api]);

  return (
    <header className="relative overflow-hidden border-b">
      <Carousel
        className="relative"
        opts={{ loop: true }}
        setApi={(next) => {
          setApi(next);
        }}
      >
        <CarouselContent>
          {slides.map((s) => (
            <CarouselItem key={s.img}>
              {/* Background image */}
              <div className="pointer-events-none absolute inset-0">
                <img
                  src={s.img}
                  alt={s.alt}
                  className="h-full w-full object-cover object-center opacity-55"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-background/55" />
                <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-hero)" }} />
                <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background" />
              </div>

              {/* Keep the cover visual, remove all overlay text */}
              <div className="container relative py-16 sm:py-20">
                <div className="mx-auto max-w-5xl">
                  <div className="h-[340px] sm:h-[420px]" aria-hidden="true" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </header>
  );
}
