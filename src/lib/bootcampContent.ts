export type BootcampHero = {
  heading: string;
  subtitle: string;
  description: string;
  missionLabel: string;
  missionStatement: string;
};

export type BootcampRoadmapLevel = {
  id: string;
  levelNumber: string;
  title: string;
  subtitle: string;
  description: string;
  modules: string[];
};

export type BootcampDiscount = {
  enabled: boolean;
  percentage: number;
  title: string;
  expiresAt: string;
};

export type BootcampPlan = {
  id: string;
  title: string;
  coverage: string;
  description: string;
  originalPrice: number;
  discount: BootcampDiscount;
  whyChoose: string[];
  included: string[];
  buttonText: string;
  enrollmentOpen: boolean;
  closedText: string;
  showBatchInformation: boolean;
};

export type BootcampBatch = {
  openingDate: string;
  deadlineDate: string;
  startDate: string;
  discordNote: string;
};

export type BootcampFinalCta = {
  heading: string;
  text: string;
  buttonText: string;
};

export type BootcampContent = {
  hero: BootcampHero;
  roadmap: BootcampRoadmapLevel[];
  plans: BootcampPlan[];
  batch: BootcampBatch;
  finalCta: BootcampFinalCta;
};

export const DEFAULT_BOOTCAMP_CONTENT: BootcampContent = {
  hero: {
    heading: "Master Inner Circle Trading Concepts",
    subtitle:
      "Based on the Inner Circle Trader (ICT®) methodology developed by Michael J. Huddleston, the pioneer of Smart Money Concepts.",
    description:
      "A structured ICT mentorship program designed to teach institutional price delivery, liquidity concepts, market structure, and professional trade execution through practical learning and live mentorship.",
    missionLabel: "Our Mission",
    missionStatement:
      "Develop disciplined traders who understand institutional market behavior and execute with confidence, consistency, and precision.",
  },
  roadmap: [
    {
      id: "foundation",
      levelNumber: "01",
      title: "Foundation Level",
      subtitle: "Build Your Trading Foundation",
      description:
        "Develop the mindset and core ICT principles required to understand how institutional traders approach the market.",
      modules: ["Mindset Alignment", "Timeframe Alignment", "Order Flow", "Premium & Discount", "PD Arrays"],
    },
    {
      id: "intermediate",
      levelNumber: "02",
      title: "Intermediate Level",
      subtitle: "Understand Institutional Market Delivery",
      description: "Learn how institutions deliver price and identify high-probability opportunities.",
      modules: [
        "Algorithmic Price Delivery",
        "Advanced Market Structure",
        "Time & Price",
        "Liquidity Concepts",
        "Daily Profiles",
        "Weekly Profiles",
      ],
    },
    {
      id: "advanced",
      levelNumber: "03",
      title: "Advanced Level",
      subtitle: "Master Institutional Trading Concepts",
      description: "Study advanced institutional theories and refine execution.",
      modules: [
        "IPDA Ranges",
        "Quarterly Theory",
        "SMT Divergence – Crack in Correlation",
        "Dealing Ranges",
        "ICT Models",
        "Market Maker Model",
      ],
    },
    {
      id: "implementation",
      levelNumber: "04",
      title: "Implementation Level",
      subtitle: "Turn Knowledge Into Consistent Execution",
      description: "Transform trading knowledge into your own repeatable trading framework.",
      modules: [
        "Framework Development",
        "Personal Trading Model Creation",
        "Risk Management",
        "Trade Psychology",
        "Weekly Backtesting Sessions",
        "Live Market Tape Reading",
      ],
    },
  ],
  plans: [
    {
      id: "one-to-one-advanced",
      title: "One-on-One Mentorship",
      coverage: "Foundation → Advanced",
      description: "Personalized mentorship for traders who want structured progression and direct guidance.",
      originalPrice: 600,
      discount: { enabled: false, percentage: 0, title: "", expiresAt: "" },
      whyChoose: [
        "Personal mentor",
        "Flexible learning schedule",
        "Faster learning",
        "Direct support",
        "Personal progress tracking",
      ],
      included: [
        "Foundation",
        "Intermediate",
        "Advanced",
        "Personalized Learning Roadmap",
        "Course Materials",
        "Mentor Support",
      ],
      buttonText: "Enroll Now",
      enrollmentOpen: true,
      closedText: "Enrollment is currently closed.",
      showBatchInformation: false,
    },
    {
      id: "one-to-one-implementation",
      title: "One-on-One Mentorship",
      coverage: "Foundation → Implementation",
      description: "Complete mentorship from beginner to professional implementation.",
      originalPrice: 1500,
      discount: { enabled: false, percentage: 0, title: "", expiresAt: "" },
      whyChoose: [
        "Complete trading framework",
        "Personal trading model",
        "Weekly reviews",
        "Trade psychology",
        "Risk management",
        "Live mentoring",
      ],
      included: [
        "Foundation",
        "Intermediate",
        "Advanced",
        "Implementation",
        "Framework Development",
        "Risk Management",
        "Psychology",
        "Weekly Backtesting",
        "Live Market Tape Reading",
        "Mentor Support",
      ],
      buttonText: "Enroll Now",
      enrollmentOpen: true,
      closedText: "Enrollment is currently closed.",
      showBatchInformation: false,
    },
    {
      id: "batch-learning",
      title: "Batch Learning Program",
      coverage: "Foundation → Advanced",
      description: "Structured group learning through scheduled live sessions.",
      originalPrice: 400,
      discount: { enabled: false, percentage: 0, title: "", expiresAt: "" },
      whyChoose: [
        "Most affordable option",
        "Learn with a community",
        "Weekly live sessions",
        "Interactive discussions",
        "Homework reviews",
        "Session recordings",
      ],
      included: [
        "Foundation",
        "Intermediate",
        "Advanced",
        "Live Sessions",
        "Discord Community",
        "Weekly Q&A",
        "Homework Reviews",
        "Session Recordings",
      ],
      buttonText: "Enroll Now",
      enrollmentOpen: true,
      closedText: "Enrollment is currently closed.",
      showBatchInformation: true,
    },
  ],
  batch: {
    openingDate: "",
    deadlineDate: "",
    startDate: "",
    discordNote: "All live sessions are conducted through the official Epic Trader Discord server.",
  },
  finalCta: {
    heading: "Build a Structured Approach to ICT Trading",
    text: "Learn institutional market concepts through a clear roadmap, professional mentorship, and practical implementation.",
    buttonText: "Enroll Now",
  },
};

const cloneDefaults = () => JSON.parse(JSON.stringify(DEFAULT_BOOTCAMP_CONTENT)) as BootcampContent;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readString = (value: unknown, fallback: string) =>
  typeof value === "string" ? value : fallback;

const readLines = (value: unknown, fallback: string[]) =>
  Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value.map((item) => item.trim()).filter(Boolean)
    : fallback;

const readNumber = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const readBoolean = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

export const normalizeBootcampContent = (value: unknown): BootcampContent => {
  const fallback = cloneDefaults();
  if (!isRecord(value)) {
    return fallback;
  }

  const rawHero = isRecord(value.hero) ? value.hero : {};
  const hero: BootcampHero = {
    heading: readString(rawHero.heading, fallback.hero.heading),
    subtitle: readString(rawHero.subtitle, fallback.hero.subtitle),
    description: readString(rawHero.description, fallback.hero.description),
    missionLabel: readString(rawHero.missionLabel, fallback.hero.missionLabel),
    missionStatement: readString(rawHero.missionStatement, fallback.hero.missionStatement),
  };

  const roadmap = Array.isArray(value.roadmap) && value.roadmap.length === fallback.roadmap.length
    ? value.roadmap.map((item, index) => {
        const raw = isRecord(item) ? item : {};
        const defaultLevel = fallback.roadmap[index];
        return {
          id: defaultLevel.id,
          levelNumber: readString(raw.levelNumber, defaultLevel.levelNumber),
          title: readString(raw.title, defaultLevel.title),
          subtitle: readString(raw.subtitle, defaultLevel.subtitle),
          description: readString(raw.description, defaultLevel.description),
          modules: readLines(raw.modules, defaultLevel.modules),
        };
      })
    : fallback.roadmap;

  const plans = Array.isArray(value.plans) && value.plans.length === fallback.plans.length
    ? value.plans.map((item, index) => {
        const raw = isRecord(item) ? item : {};
        const rawDiscount = isRecord(raw.discount) ? raw.discount : {};
        const defaultPlan = fallback.plans[index];
        return {
          id: defaultPlan.id,
          title: readString(raw.title, defaultPlan.title),
          coverage: readString(raw.coverage, defaultPlan.coverage),
          description: readString(raw.description, defaultPlan.description),
          originalPrice: Math.max(0, readNumber(raw.originalPrice, defaultPlan.originalPrice)),
          discount: {
            enabled: readBoolean(rawDiscount.enabled, defaultPlan.discount.enabled),
            percentage: Math.min(100, Math.max(0, readNumber(rawDiscount.percentage, defaultPlan.discount.percentage))),
            title: readString(rawDiscount.title, defaultPlan.discount.title),
            expiresAt: readString(rawDiscount.expiresAt, defaultPlan.discount.expiresAt),
          },
          whyChoose: readLines(raw.whyChoose, defaultPlan.whyChoose),
          included: readLines(raw.included, defaultPlan.included),
          buttonText: readString(raw.buttonText, defaultPlan.buttonText),
          enrollmentOpen: readBoolean(raw.enrollmentOpen, defaultPlan.enrollmentOpen),
          closedText: readString(raw.closedText, defaultPlan.closedText),
          showBatchInformation: readBoolean(raw.showBatchInformation, defaultPlan.showBatchInformation),
        };
      })
    : fallback.plans;

  const rawBatch = isRecord(value.batch) ? value.batch : {};
  const batch: BootcampBatch = {
    openingDate: readString(rawBatch.openingDate, fallback.batch.openingDate),
    deadlineDate: readString(rawBatch.deadlineDate, fallback.batch.deadlineDate),
    startDate: readString(rawBatch.startDate, fallback.batch.startDate),
    discordNote: readString(rawBatch.discordNote, fallback.batch.discordNote),
  };

  const rawFinalCta = isRecord(value.finalCta) ? value.finalCta : {};
  const finalCta: BootcampFinalCta = {
    heading: readString(rawFinalCta.heading, fallback.finalCta.heading),
    text: readString(rawFinalCta.text, fallback.finalCta.text),
    buttonText: readString(rawFinalCta.buttonText, fallback.finalCta.buttonText),
  };

  return { hero, roadmap, plans, batch, finalCta };
};

export const getDiscountedPrice = (originalPrice: number, discount: BootcampDiscount) =>
  discount.enabled
    ? Math.max(0, originalPrice * (1 - Math.min(100, Math.max(0, discount.percentage)) / 100))
    : originalPrice;

export const linesToText = (lines: string[]) => lines.join("\n");

export const textToLines = (value: string) =>
  value.split("\n").map((item) => item.trim()).filter(Boolean);

export const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
