export type TradeDirection = "long" | "short";

export type TradeMetrics = {
  risk: number;
  reward: number;
  riskPercent: number;
  rewardPercent: number;
  riskRewardRatio: number | null;
};

export type ForecastDraft = {
  direction: TradeDirection;
  entry: number;
  stop: number;
  targets: Array<number | null>;
  sourceType: "screenshot" | "live_chart";
  exchange: string;
  timeframe: string;
  hasPreTradeEvidence: boolean;
  expectedPnl: number | null;
  resultPnl: number | null;
  resultPnlPercent: number | null;
};

export function calculateTradeMetrics(entry: number, stop: number, target: number): TradeMetrics | null {
  if (![entry, stop, target].every(Number.isFinite) || entry <= 0 || stop <= 0 || target <= 0) return null;
  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  return {
    risk,
    reward,
    riskPercent: (risk / entry) * 100,
    rewardPercent: (reward / entry) * 100,
    riskRewardRatio: risk > 0 ? reward / risk : null,
  };
}

export function getTradeWarnings(direction: TradeDirection, entry: number, stop: number, targets: number[]) {
  if (![entry, stop, ...targets].every(Number.isFinite)) return [];
  const warnings: string[] = [];
  if (direction === "long" && stop >= entry) warnings.push("For a long setup, stop loss is normally below entry.");
  if (direction === "short" && stop <= entry) warnings.push("For a short setup, stop loss is normally above entry.");
  targets.forEach((target, index) => {
    if (direction === "long" && target <= entry) warnings.push(`Take profit ${index + 1} is normally above entry for a long setup.`);
    if (direction === "short" && target >= entry) warnings.push(`Take profit ${index + 1} is normally below entry for a short setup.`);
  });
  return warnings;
}

export function validateForecastDraft(draft: ForecastDraft) {
  const errors: string[] = [];
  const requiredPrices = [draft.entry, draft.stop, draft.targets[0]];
  const optionalNumbers = [...draft.targets.slice(1), draft.expectedPnl, draft.resultPnl, draft.resultPnlPercent];
  if (requiredPrices.some((value) => !Number.isFinite(value) || value! <= 0)) {
    errors.push("Enter positive, valid entry, stop-loss, and first take-profit prices.");
  }
  if (optionalNumbers.some((value) => value !== null && !Number.isFinite(value))) {
    errors.push("Optional take-profit and P&L values must be valid numbers when provided.");
  }
  if (draft.sourceType === "screenshot" && !draft.hasPreTradeEvidence) {
    errors.push("Screenshot forecasts require pre-trade evidence.");
  }
  if (draft.sourceType === "live_chart" && (!draft.exchange.trim() || !draft.timeframe.trim())) {
    errors.push("Live-chart forecasts require an exchange and timeframe.");
  }
  return errors;
}

export function tradingViewSymbol(exchange: string, symbol: string) {
  const cleanSymbol = symbol.replace(/\//g, "").replace(/-PERP$/i, "PERP").trim().toUpperCase();
  const cleanExchange = exchange.replace(/[^a-z0-9_-]/gi, "").toUpperCase();
  return cleanExchange ? `${cleanExchange}:${cleanSymbol}` : cleanSymbol;
}
