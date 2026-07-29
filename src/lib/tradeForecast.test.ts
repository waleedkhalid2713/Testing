import { describe, expect, it } from "vitest";
import {
  calculateTradeMetrics,
  getTradeWarnings,
  isSuspiciousLegacyTradingViewSymbol,
  resolveTradingViewSymbol,
  validateForecastDraft,
} from "./tradeForecast";

const validDraft = {
  direction: "long" as const,
  entry: 100,
  stop: 95,
  targets: [110, null],
  sourceType: "live_chart" as const,
  tradingViewSymbol: "COMEX:GC1!",
  loadedTradingViewSymbol: "COMEX:GC1!",
  timeframe: "60",
  hasPreTradeEvidence: false,
  expectedPnl: null,
  resultPnl: null,
  resultPnlPercent: null,
};

describe("trade forecast calculations", () => {
  it("calculates risk, reward, ratio and percentages", () => {
    expect(calculateTradeMetrics(100, 95, 115)).toEqual({ risk: 5, reward: 15, riskPercent: 5, rewardPercent: 15, riskRewardRatio: 3 });
  });

  it("returns warnings without blocking unusual long and short structures", () => {
    expect(getTradeWarnings("long", 100, 101, [99])).toHaveLength(2);
    expect(getTradeWarnings("short", 100, 99, [101])).toHaveLength(2);
  });

  it.each([
    ["BINANCE:BTCUSDT", "BINANCE:BTCUSDT"],
    ["OANDA:XAUUSD", "OANDA:XAUUSD"],
    ["COMEX:GC1!", "COMEX:GC1!"],
    ["NASDAQ:AAPL", "NASDAQ:AAPL"],
    ["  comex:GC1!  ", "COMEX:GC1!"],
    ["nasdaq:BRK.B", "NASDAQ:BRK.B"],
  ])("resolves complete symbol %s", (input, expected) => {
    const result = resolveTradingViewSymbol(input);
    expect(result.ok && result.symbol).toBe(expected);
  });

  it.each([
    ["GC1!", "TradingView Symbol must use the EXCHANGE:INSTRUMENT format."],
    [":GC1!", "TradingView Symbol requires a non-empty exchange."],
    ["COMEX:", "TradingView Symbol requires a non-empty instrument."],
    ["COMEX:GC 1!", "TradingView instrument contains unsupported characters."],
    ["COMEX:GC1!:EXTRA", "TradingView Symbol must contain exactly one colon."],
  ])("rejects malformed symbol %s", (input, expected) => {
    expect(resolveTradingViewSymbol(input)).toEqual({ ok: false, error: expected });
  });

  it("accepts a correctly formatted symbol without claiming TradingView availability", () => {
    expect(resolveTradingViewSymbol("UNKNOWN:NOTAREALMARKET")).toEqual({
      ok: true,
      symbol: "UNKNOWN:NOTAREALMARKET",
      exchange: "UNKNOWN",
      instrument: "NOTAREALMARKET",
    });
  });

  it("requires the edited symbol to be loaded without mutating other draft values", () => {
    const changed = { ...validDraft, tradingViewSymbol: "NASDAQ:AAPL" };
    expect(validateForecastDraft(changed)).toContain("Load the confirmed TradingView symbol before saving.");
    expect(changed.entry).toBe(100);
    expect(changed.targets).toEqual([110, null]);
    expect(validateForecastDraft({ ...changed, loadedTradingViewSymbol: "NASDAQ:AAPL" })).toEqual([]);
  });

  it("validates screenshot evidence and malformed optional numbers", () => {
    expect(validateForecastDraft({ ...validDraft, sourceType: "screenshot", expectedPnl: Number.NaN })).toEqual([
      "Optional take-profit and P&L values must be valid numbers when provided.",
      "Screenshot forecasts require pre-trade evidence.",
    ]);
  });

  it("flags a suspicious legacy futures and exchange combination", () => {
    expect(isSuspiciousLegacyTradingViewSymbol("OANDA:GC1!")).toBe(true);
    expect(isSuspiciousLegacyTradingViewSymbol("COMEX:GC1!")).toBe(false);
  });
});
