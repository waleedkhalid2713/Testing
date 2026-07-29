import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ForecastLiveMarketSection } from "./ForecastLiveMarketSection";

describe("ForecastLiveMarketSection", () => {
  it("does not mount a widget until requested and unmounts it when hidden", () => {
    render(<ForecastLiveMarketSection instrumentCode="EUR/USD" status="active" timeframe="60" />);
    expect(screen.queryByTitle(/TradingView chart/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View Live Chart" }));
    expect(screen.getByTitle("TradingView chart for OANDA:EURUSD")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hide Live Chart" }));
    expect(screen.queryByTitle(/TradingView chart/)).not.toBeInTheDocument();
  });

  it("uses the stored forecast symbol before the standard mapping", () => {
    render(<ForecastLiveMarketSection instrumentCode="EUR/USD" storedSymbol="FX:EURUSD" status="active" />);
    fireEvent.click(screen.getByRole("button", { name: "View Live Chart" }));
    expect(screen.getByTitle("TradingView chart for FX:EURUSD")).toBeInTheDocument();
  });

  it("shows a non-blocking fallback for unsupported instruments", () => {
    render(<ForecastLiveMarketSection instrumentCode="US30" status="active" />);
    expect(screen.getByText("Live chart is currently unavailable for this instrument.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "View Live Chart" })).not.toBeInTheDocument();
  });

  it("labels completed forecasts as the current market", () => {
    render(<ForecastLiveMarketSection instrumentCode="XAU/USD" status="win" />);
    expect(screen.getByText("Current Market Chart")).toBeInTheDocument();
    expect(screen.getByText(/not the market when this forecast closed/i)).toBeInTheDocument();
  });
});
