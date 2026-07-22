-- Optional evidence image uploaded by an admin after a forecast is closed.
alter table public.trading_forecasts
  add column if not exists result_image_path text;
