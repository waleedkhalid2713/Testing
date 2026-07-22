create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  incorporated_at timestamptz not null default now(),
  region text not null default 'Unknown'
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'epictrader.support@gmail.com';
$$;

grant execute on function public.is_admin() to authenticated;

create policy "Admins can view profiles"
on public.profiles
for select
to authenticated
using (public.is_admin());

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, incorporated_at, region)
  values (
    new.id,
    new.email,
    new.created_at,
    coalesce(new.raw_user_meta_data ->> 'country', 'Unknown')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    region = excluded.region;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();

insert into public.profiles (id, email, incorporated_at, region)
select
  id,
  email,
  created_at,
  coalesce(raw_user_meta_data ->> 'country', 'Unknown')
from auth.users
on conflict (id) do update
set
  email = excluded.email,
  region = excluded.region;
