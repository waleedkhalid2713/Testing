-- Stores the administrator-confirmed complete hosted-widget identifier without rewriting legacy records.
alter table public.trading_forecasts
  add column if not exists tradingview_symbol text
    check (
      tradingview_symbol is null
      or (
        char_length(tradingview_symbol) between 3 and 120
        and tradingview_symbol ~ '^[A-Z0-9._-]+:[A-Za-z0-9._!/-]+$'
      )
    );

comment on column public.trading_forecasts.tradingview_symbol is
  'Administrator-confirmed complete EXCHANGE:INSTRUMENT identifier for the hosted TradingView widget; format validation does not prove market availability.';
