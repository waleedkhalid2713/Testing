# TradingView forecast upgrade

## Architecture and compatibility

The frontend is a Vite/React/TypeScript SPA. `DailyForecastAdmin` is protected by `RequireAdmin`; database RLS independently restricts writes through `is_admin()`. Supabase provides PostgreSQL, the public `forecast-images` bucket, authentication, and Edge Functions. Forecast reads remain gated by disclaimer acceptance.

The legacy workflow stores compressed JPEG pre-trade evidence in `trading_forecasts.image_path`, optional post-trade evidence in `result_image_path`, and Gemini extraction JSON in `ai_extraction`. The upgrade retains those columns and paths. Existing rows receive `source_type = screenshot`; no data migration or destructive rewrite is required.

## TradingView decision

No TradingView npm package was previously installed. The implementation uses TradingView's official, hosted Advanced Chart widget. TradingView documents widget configuration for symbol and interval, but the hosted widget is an iframe and does not provide the licensed Charting Library API to the host application. Consequently this implementation intentionally does not scrape the iframe, access drawings, claim drawing events, export screenshots, or serialize private chart state.

Only reproducible widget configuration (`provider`, application-selected symbol, exchange, timeframe, timestamp, and `containsDrawings: false`) is saved as `chart_metadata`. Visual evidence uses the existing supported image upload workflow. A future licensed TradingView Advanced Charts / Trading Platform integration can add official save/load or screenshot APIs if the license and datafeed permit them.

Official references:

- https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/
- https://www.tradingview.com/charting-library-docs/latest/saving_loading/
- https://www.tradingview.com/charting-library-docs/latest/ui_elements/drawings/drawings-api/

## Data changes

Migration `20260729000000_live_chart_forecasts.sql` makes pre-trade image evidence optional for live-chart records and adds only workflow-specific metadata: source, exchange, timeframe, TP3, rationale, expected P&L, result P&L, result P&L percent, result notes, and chart metadata. Existing status values remain `active`, `win`, and `loss`.

Evidence stays in `forecast-images`, organized under `pre-trade/` and `post-trade/` for new uploads. The old object paths and public access behavior remain valid.

## AI behavior

The existing `analyze-trade-image` function now supports both image extraction and structured note generation. Notes can include an optional compressed evidence image. Without an image, the prompt explicitly forbids claims of chart or drawing analysis. Failures remain non-blocking because both forecast and result notes are editable.

## Operations and rollback

Apply migrations in timestamp order, then deploy `analyze-trade-image` and the web application. To roll back the frontend, revert the upgrade commit; old records remain readable. The added nullable/defaulted database columns may safely remain. If database rollback is mandatory, first ensure no live-chart records exist, then remove the added columns and restore `image_path NOT NULL`. Do not restore that constraint while live-chart rows have null evidence.

## Post-implementation review

A follow-up audit found and corrected several gaps in the first implementation: optional numeric text could become `NaN`; screenshot evidence and live-chart configuration were enforced only in the browser; result-note generation selected pre-trade rather than post-trade evidence; the admin forecast filters had regressed; the chart had no slow-load recovery; and expected/result P&L labels were incomplete on the public view. Shared validation, matching database constraints, mode-specific AI errors, post-trade evidence selection, restored filtering, chart timeout handling, and expanded tests now cover these cases.
