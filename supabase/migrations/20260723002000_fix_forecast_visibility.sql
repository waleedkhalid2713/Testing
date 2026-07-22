-- Fixes forecast visibility for accepted regular users.
-- The previous policy read the profiles table directly, which can be blocked by profile RLS.

drop policy if exists "Accepted users can view published forecasts" on public.trading_forecasts;

create policy "Accepted users can view published forecasts"
on public.trading_forecasts
for select
to authenticated
using (
  public.is_admin()
  or public.has_accepted_forecast_disclaimer()
);

drop policy if exists "Anyone can view active trading instruments" on public.trading_instruments;

create policy "Anyone can view active trading instruments"
on public.trading_instruments
for select
to anon, authenticated
using (is_active);
