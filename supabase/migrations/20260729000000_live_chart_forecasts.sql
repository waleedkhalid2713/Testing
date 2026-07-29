-- Adds optional live-chart metadata and separates forecast/result details while preserving legacy screenshots.
alter table public.trading_forecasts
  alter column image_path drop not null,
  add column if not exists source_type text not null default 'screenshot' check (source_type in ('screenshot', 'live_chart')),
  add column if not exists exchange text not null default '' check (char_length(exchange) <= 80),
  add column if not exists timeframe text not null default '' check (char_length(timeframe) <= 20),
  add column if not exists take_profit_3 numeric check (take_profit_3 > 0),
  add column if not exists rationale text not null default '' check (char_length(rationale) <= 3000),
  add column if not exists expected_pnl numeric,
  add column if not exists result_pnl numeric,
  add column if not exists result_pnl_percent numeric,
  add column if not exists result_notes text not null default '' check (char_length(result_notes) <= 3000),
  add column if not exists chart_metadata jsonb;

alter table public.trading_forecasts
  add constraint trading_forecasts_source_evidence_check
    check (source_type = 'live_chart' or image_path is not null),
  add constraint trading_forecasts_live_chart_config_check
    check (source_type = 'screenshot' or (char_length(trim(exchange)) > 0 and char_length(trim(timeframe)) > 0));

comment on column public.trading_forecasts.image_path is 'Optional pre-trade evidence path in forecast-images; legacy screenshot forecasts retain this value.';
comment on column public.trading_forecasts.result_image_path is 'Optional post-trade evidence path in forecast-images.';
comment on column public.trading_forecasts.chart_metadata is 'Supported widget configuration only; never claims to contain TradingView drawings or private chart state.';
