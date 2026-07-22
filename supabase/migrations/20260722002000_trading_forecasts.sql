create table if not exists public.trading_instruments (
  id uuid primary key default gen_random_uuid(),
  market text not null check (char_length(market) <= 80),
  symbol text not null unique check (char_length(symbol) <= 80),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.trading_forecasts (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references public.trading_instruments(id) on delete restrict,
  direction text not null check (direction in ('long', 'short')),
  execution_price numeric not null check (execution_price > 0),
  stop_loss numeric not null check (stop_loss > 0),
  take_profit_1 numeric not null check (take_profit_1 > 0),
  take_profit_2 numeric check (take_profit_2 > 0),
  status text not null default 'active' check (status in ('active', 'win', 'loss')),
  trade_date date not null default current_date,
  notes text not null default '' check (char_length(notes) <= 2000),
  image_path text not null check (char_length(image_path) <= 500),
  ai_extraction jsonb,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trading_forecasts_published_at_idx
  on public.trading_forecasts (published_at desc);

create index if not exists trading_forecasts_instrument_id_idx
  on public.trading_forecasts (instrument_id);

alter table public.trading_instruments enable row level security;
alter table public.trading_forecasts enable row level security;

create policy "Anyone can view active trading instruments"
on public.trading_instruments
for select
to public
using (is_active or public.is_admin());

create policy "Admins can manage trading instruments"
on public.trading_instruments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Anyone can view published forecasts"
on public.trading_forecasts
for select
to public
using (true);

create policy "Admins can manage forecasts"
on public.trading_forecasts
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'forecast-images',
  'forecast-images',
  true,
  524288,
  array['image/jpeg']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Anyone can view forecast images"
on storage.objects
for select
to public
using (bucket_id = 'forecast-images');

create policy "Admins can upload forecast images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'forecast-images' and public.is_admin());

create policy "Admins can update forecast images"
on storage.objects
for update
to authenticated
using (bucket_id = 'forecast-images' and public.is_admin())
with check (bucket_id = 'forecast-images' and public.is_admin());

create policy "Admins can delete forecast images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'forecast-images' and public.is_admin());

insert into public.trading_instruments (market, symbol, display_order)
values
  ('Forex', 'EUR/USD', 10),
  ('Forex', 'GBP/USD', 20),
  ('Forex', 'USD/JPY', 30),
  ('Indices', 'NAS100', 40),
  ('Indices', 'US30', 50),
  ('Commodities', 'XAU/USD', 60),
  ('Commodities', 'XAG/USD', 70),
  ('Crypto', 'BTC/USDT', 80),
  ('Crypto', 'ETH/USDT', 90)
on conflict (symbol) do update
set
  market = excluded.market,
  display_order = excluded.display_order,
  is_active = true;
