create table if not exists public.bootcamp_content (
  id text primary key default 'default',
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.bootcamp_content (id, content)
values ('default', '{}'::jsonb)
on conflict (id) do nothing;

create or replace function public.set_bootcamp_content_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bootcamp_content_updated_at on public.bootcamp_content;
create trigger bootcamp_content_updated_at
before update on public.bootcamp_content
for each row
execute function public.set_bootcamp_content_updated_at();

alter table public.bootcamp_content enable row level security;

drop policy if exists "Anyone can read bootcamp content" on public.bootcamp_content;
create policy "Anyone can read bootcamp content"
on public.bootcamp_content
for select
to anon, authenticated
using (true);

drop policy if exists "Admin can insert bootcamp content" on public.bootcamp_content;
create policy "Admin can insert bootcamp content"
on public.bootcamp_content
for insert
to authenticated
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'epictrader.support@gmail.com');

drop policy if exists "Admin can update bootcamp content" on public.bootcamp_content;
create policy "Admin can update bootcamp content"
on public.bootcamp_content
for update
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'epictrader.support@gmail.com')
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'epictrader.support@gmail.com');

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'bootcamp_content'
    ) then
    alter publication supabase_realtime add table public.bootcamp_content;
  end if;
end;
$$;
