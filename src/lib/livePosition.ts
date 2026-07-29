import type { TradeDirection } from "@/lib/tradeForecast";

export type LivePositionMovement = {
  percentage: number;
  status: "profit" | "loss" | "neutral";
};

// This calculation is provider-agnostic. It is intentionally not displayed
// until a verified external price adapter supplies currentPrice.
export function calculateLivePositionMovement(
  direction: TradeDirection,
  entryPrice: number,
  currentPrice: number,
): LivePositionMovement | null {
  if (![entryPrice, currentPrice].every(Number.isFinite) || entryPrice <= 0 || currentPrice <= 0) return null;
  const percentage = direction === "long"
    ? ((currentPrice - entryPrice) / entryPrice) * 100
    : ((entryPrice - currentPrice) / entryPrice) * 100;
  return {
    percentage,
    status: percentage > 0 ? "profit" : percentage < 0 ? "loss" : "neutral",
  };
}

export function formatPositionMovement(percentage: number) {
  return `${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}%`;
}
