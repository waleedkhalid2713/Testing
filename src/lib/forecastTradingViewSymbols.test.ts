import { describe, expect, it } from "vitest";
import { FORECAST_TRADINGVIEW_SYMBOLS, getForecastTradingViewSymbol, normalizeForecastInstrument } from "./forecastTradingViewSymbols";

describe("forecast TradingView symbol mapping", () => {
  it("normalizes website instrument codes", () => {
    expect(normalizeForecastInstrument(" XAU/USD ")).toBe("XAUUSD");
    expect(normalizeForecastInstrument("btc-usdt")).toBe("BTCUSDT");
  });

  it("maps only centrally configured instruments", () => {
    expect(getForecastTradingViewSymbol("XAU/USD")).toBe("OANDA:XAUUSD");
    expect(getForecastTradingViewSymbol("EUR/USD")).toBe("OANDA:EURUSD");
    expect(getForecastTradingViewSymbol("BTC/USDT")).toBe("BINANCE:BTCUSDT");
    expect(getForecastTradingViewSymbol("US30")).toBeNull();
    expect(Object.keys(FORECAST_TRADINGVIEW_SYMBOLS)).not.toContain("NAS100");
  });

  it("prefers a valid forecast-specific stored symbol", () => {
    expect(getForecastTradingViewSymbol("US30", "CAPITALCOM:US30")).toBe("CAPITALCOM:US30");
  });

  it("falls back safely when a stored symbol is malformed", () => {
    expect(getForecastTradingViewSymbol("GBP/USD", "invalid")).toBe("OANDA:GBPUSD");
    expect(getForecastTradingViewSymbol("US30", "invalid")).toBeNull();
  });
});
