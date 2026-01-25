import { CalendarDays, GraduationCap, LineChart, Shield, Sparkles } from "lucide-react";

export type FeatureKey = "forecast" | "calendar" | "bootcamp" | "risk" | "resources";

export const featureDetails: Record<
  FeatureKey,
  {
    title: string;
    description: string;
    body: string;
    icon: typeof LineChart;
  }
> = {
  forecast: {
    title: "Daily Forecasts",
    description: "Structured market bias, key levels, and risk notes—designed for repeatable decision-making.",
    body: "Forecasts are educational and process-based: bias, levels, invalidation, and a clear risk-first mindset.",
    icon: LineChart,
  },
  calendar: {
    title: "Schedule News Forecast",
    description: "Economic calendar awareness with filters, impact tags, and preparation notes.",
    body: "Plan around volatility. Track upcoming events, see impact, and document how you’ll respond before price moves.",
    icon: CalendarDays,
  },
  bootcamp: {
    title: "Bootcamp Program",
    description: "Cohort-based training focused on structure, discipline, and risk management.",
    body: "A practical program with outcomes you can measure: better execution, fewer impulsive decisions, and consistent process.",
    icon: GraduationCap,
  },
  risk: {
    title: "Risk Management Framework",
    description: "Position sizing, invalidation logic, and rules that protect your downside.",
    body: "Risk is the product. You’ll learn to define risk first—then look for opportunity.",
    icon: Shield,
  },
  resources: {
    title: "Resources",
    description: "Templates, guides, and educational materials for building a repeatable process.",
    body: "Downloadable tools (journals, checklists, plans) that help you think in systems—not signals.",
    icon: Sparkles,
  },
};
