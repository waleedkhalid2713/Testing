-- Records a user's acceptance of the forecast disclaimer.
alter table public.profiles
  add column if not exists forecast_disclaimer_accepted_at timestamptz;

create or replace function public.accept_forecast_disclaimer()
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  accepted_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'You must sign in to accept the forecast disclaimer.';
  end if;

  update public.profiles
  set forecast_disclaimer_accepted_at = coalesce(forecast_disclaimer_accepted_at, now())
  where id = auth.uid()
  returning forecast_disclaimer_accepted_at into accepted_at;

  if accepted_at is null then
    raise exception 'Your user profile could not be found.';
  end if;

  return accepted_at;
end;
$$;

grant execute on function public.accept_forecast_disclaimer() to authenticated;

create or replace function public.has_accepted_forecast_disclaimer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.forecast_disclaimer_accepted_at is not null
  );
$;

grant execute on function public.has_accepted_forecast_disclaimer() to authenticated;

-- Forecast records are available only after a signed-in user accepts the disclaimer.
drop policy if exists "Anyone can view published forecasts" on public.trading_forecasts;

create policy "Accepted users can view published forecasts"
on public.trading_forecasts
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.forecast_disclaimer_accepted_at is not null
  )
);