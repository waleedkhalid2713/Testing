import { describe, expect, it } from "vitest";
import { calculateTradeMetrics, getTradeWarnings, tradingViewSymbol, validateForecastDraft } from "./tradeForecast";

describe("trade forecast calculations", () => {
  it("calculates risk, reward, ratio and percentages", () => {
    expect(calculateTradeMetrics(100, 95, 115)).toEqual({ risk: 5, reward: 15, riskPercent: 5, rewardPercent: 15, riskRewardRatio: 3 });
  });
  it("returns warnings without blocking unusual long and short structures", () => {
    expect(getTradeWarnings("long", 100, 101, [99])).toHaveLength(2);
    expect(getTradeWarnings("short", 100, 99, [101])).toHaveLength(2);
  });
  it("formats an official widget symbol", () => expect(tradingViewSymbol("OANDA", "EUR/USD")).toBe("OANDA:EURUSD"));

  it("validates workflow requirements and optional numeric fields", () => {
    const valid = { direction: "long" as const, entry: 100, stop: 95, targets: [110, null], sourceType: "live_chart" as const, exchange: "OANDA", timeframe: "60", hasPreTradeEvidence: false, expectedPnl: null, resultPnl: null, resultPnlPercent: null };
    expect(validateForecastDraft(valid)).toEqual([]);
    expect(validateForecastDraft({ ...valid, sourceType: "screenshot", expectedPnl: Number.NaN })).toEqual([
      "Optional take-profit and P&L values must be valid numbers when provided.",
      "Screenshot forecasts require pre-trade evidence.",
    ]);
  });

  it("sanitizes exchange input before constructing a widget symbol", () => {
    expect(tradingViewSymbol(" OANDA<script> ", "eur/usd")).toBe("OANDASCRIPT:EURUSD");
  });
});
