import * as React from "react";

type PageHeroProps = {
  title: string;
  subtitle?: string;
  imageSrc: string;
  imageAlt: string;
  children?: React.ReactNode;
};

export function PageHero({ title, subtitle, imageSrc, imageAlt, children }: PageHeroProps) {
  return (
    <header className="page-hero relative overflow-hidden border-b">
      <div className="pointer-events-none absolute inset-0">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover object-center opacity-35"
          loading="eager"
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/35 to-background" />
      </div>

      <div className="container relative py-14 sm:py-16">
        <div className="max-w-3xl">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
          {subtitle ? <p className="mt-3 text-pretty text-base text-muted-foreground sm:text-lg">{subtitle}</p> : null}
          {children ? <div className="mt-6">{children}</div> : null}
        </div>
      </div>
    </header>
  );
}
