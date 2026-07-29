import { resolveTradingViewSymbol } from "@/lib/tradeForecast";

// Deliberately limited to provider-qualified markets used by the site that have
// an unambiguous hosted-widget identifier. Unknown instruments stay unsupported.
export const FORECAST_TRADINGVIEW_SYMBOLS = {
  EURUSD: "OANDA:EURUSD",
  GBPUSD: "OANDA:GBPUSD",
  USDJPY: "OANDA:USDJPY",
  AUDUSD: "OANDA:AUDUSD",
  USDCAD: "OANDA:USDCAD",
  XAUUSD: "OANDA:XAUUSD",
  XAGUSD: "OANDA:XAGUSD",
  BTCUSDT: "BINANCE:BTCUSDT",
  ETHUSDT: "BINANCE:ETHUSDT",
  SOLUSDT: "BINANCE:SOLUSDT",
  XRPUSDT: "BINANCE:XRPUSDT",
} as const;

export type MappedForecastInstrument = keyof typeof FORECAST_TRADINGVIEW_SYMBOLS;

export function normalizeForecastInstrument(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

export function getForecastTradingViewSymbol(instrumentCode: string, storedSymbol?: string | null) {
  if (storedSymbol) {
    const resolved = resolveTradingViewSymbol(storedSymbol);
    if (resolved.ok) return resolved.symbol;
  }

  const normalized = normalizeForecastInstrument(instrumentCode) as MappedForecastInstrument;
  return FORECAST_TRADINGVIEW_SYMBOLS[normalized] ?? null;
}
