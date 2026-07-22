alter table public.trading_forecasts
  add column if not exists result_image_path text check (char_length(result_image_path) <= 500),
  add column if not exists result_ai_extraction jsonb,
  add column if not exists result_confirmed_at timestamptz;

create index if not exists trading_forecasts_result_confirmed_at_idx
  on public.trading_forecasts (result_confirmed_at desc);
