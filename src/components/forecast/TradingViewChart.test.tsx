import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TradingViewChart } from "./TradingViewChart";

describe("TradingViewChart", () => {
  it("loads the confirmed complete symbol and enables native symbol search", () => {
    render(<TradingViewChart symbol="COMEX:GC1!" timeframe="60" />);
    const iframe = screen.getByTitle("TradingView chart for COMEX:GC1!");
    const url = new URL(iframe.getAttribute("src")!);
    expect(url.searchParams.get("symbol")).toBe("COMEX:GC1!");
    expect(url.searchParams.get("interval")).toBe("60");
    expect(url.searchParams.get("allow_symbol_change")).toBe("true");
  });

  it("changes only when the confirmed symbol prop changes", () => {
    const { rerender } = render(<TradingViewChart symbol="BINANCE:BTCUSDT" timeframe="D" />);
    expect(screen.getByTitle("TradingView chart for BINANCE:BTCUSDT")).toBeInTheDocument();
    rerender(<TradingViewChart symbol="NASDAQ:AAPL" timeframe="D" />);
    expect(screen.getByTitle("TradingView chart for NASDAQ:AAPL")).toBeInTheDocument();
  });

  it("explains that iframe search does not update application state", () => {
    render(<TradingViewChart symbol="OANDA:XAUUSD" timeframe="240" />);
    expect(screen.getByText(/then confirm the complete symbol in the TradingView Symbol field/i)).toBeInTheDocument();
    expect(screen.getByText(/TradingView validates market availability inside the chart/i)).toBeInTheDocument();
  });
});
